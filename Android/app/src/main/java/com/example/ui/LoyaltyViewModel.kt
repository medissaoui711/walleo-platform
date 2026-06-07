package com.example.ui

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.Campaign
import com.example.data.local.CampaignTemplate
import com.example.data.local.GeofenceLog
import com.example.data.local.LoyaltyCard
import com.example.data.local.UserCoupon
import com.example.data.repository.LoyaltyRepository
import com.example.data.sync.SyncWorker
import com.example.service.NotificationService
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class LoyaltyViewModel(
    application: Application,
    private val repository: LoyaltyRepository
) : AndroidViewModel(application) {

    val context = application.applicationContext

    val campaigns: StateFlow<List<Campaign>>
    val userCoupons: StateFlow<List<UserCoupon>>
    val loyaltyCards: StateFlow<List<LoyaltyCard>>
    val geofenceLogs: StateFlow<List<GeofenceLog>>

    val merchantScans: StateFlow<Int>
    val merchantConversionRate: StateFlow<Int>
    val merchantExpectedRevenue: StateFlow<Int>

    var isMerchantOnboarded by mutableStateOf(false)
    var isMerchantSetupComplete by mutableStateOf(false)
    var merchantStoreName by mutableStateOf("")
    var merchantStoreType by mutableStateOf("")
    var merchantId by mutableStateOf("")
    var merchantSelectedPlan by mutableStateOf("")
    var merchantSelectedTemplate by mutableStateOf<CampaignTemplate?>(null)
    val merchantActivityLogs = mutableStateListOf<String>()

    var userLatitude by mutableStateOf(250f)
    var userLongitude by mutableStateOf(250f)
    var scannedCampaign by mutableStateOf<Campaign?>(null)
    var showScanSuccessDialog by mutableStateOf(false)
    var nearCampaign by mutableStateOf<Campaign?>(null)

    private val notifiedCampaignIds = mutableSetOf<Int>()

    enum class SyncState { CONNECTED, SYNCING, OFFLINE }
    private val _syncState = MutableStateFlow(SyncState.CONNECTED)
    val syncState: StateFlow<SyncState> = _syncState.asStateFlow()

    init {
        campaigns = repository.getCampaigns().stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        userCoupons = repository.getUserCoupons().stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        loyaltyCards = repository.getLoyaltyCards().stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        geofenceLogs = repository.getGeofenceLogs().stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )

        merchantScans = userCoupons.map { it.size }.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), 0
        )
        merchantConversionRate = userCoupons.map { coupons ->
            if (coupons.isEmpty()) 0 else {
                val redeemed = coupons.count { it.status == "redeemed" }
                (redeemed.toFloat() / coupons.size.toFloat() * 100).toInt()
            }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

        merchantExpectedRevenue = userCoupons.map { coupons ->
            val redeemed = coupons.count { it.status == "redeemed" }
            redeemed * 35
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

        viewModelScope.launch {
            repository.populateDefaultsIfNeeded()
        }
    }

    fun syncCampaignsWithCloud() {
        viewModelScope.launch {
            _syncState.value = SyncState.SYNCING
            val token = repository.getToken()
            if (token != null) {
                val (success, _) = repository.syncCampaignsFromCloud(token)
                _syncState.value = if (success) SyncState.CONNECTED else SyncState.OFFLINE
                if (success) merchantActivityLogs.add("Cloud Sync Successful")
            } else {
                _syncState.value = SyncState.OFFLINE
            }
        }
    }

    fun onboardMerchant(name: String, type: String) {
        merchantStoreName = name
        merchantStoreType = type
        merchantId = "MID-${(1000..9999).random()}"
        isMerchantOnboarded = true
        merchantActivityLogs.add("Merchant onboarding completed: $name")
    }

    fun completeSetup(plan: String, template: CampaignTemplate) {
        merchantSelectedPlan = plan
        merchantSelectedTemplate = template
        isMerchantSetupComplete = true
        merchantActivityLogs.add("Subscribed to plan: $plan")
        merchantActivityLogs.add("Selected template: ${template.titleEn}")
    }

    fun simulateQRScan(qrContent: String) {
        viewModelScope.launch {
            val matchingCampaign = campaigns.value.find { it.discountCode == qrContent }
            if (matchingCampaign != null) {
                val claimed = repository.scanAndClaim(matchingCampaign.id)
                scannedCampaign = matchingCampaign
                showScanSuccessDialog = true
            }
        }
    }

    fun addCouponToWallet(campaignId: Int) {
        viewModelScope.launch {
            repository.addToWallet(campaignId)
            showScanSuccessDialog = false
            scannedCampaign = null
            merchantActivityLogs.add("Coupon added to wallet for campaign $campaignId")
        }
    }

    fun redeemWalletCoupon(campaignId: Int) {
        viewModelScope.launch {
            repository.redeemCoupon(campaignId)
            merchantActivityLogs.add("Coupon redeemed for campaign $campaignId")
            SyncWorker.triggerImmediateSync(context)
        }
    }

    fun updateUserPosition(x: Float, y: Float) {
        userLatitude = x
        userLongitude = y
        checkGeofencing(x, y)
    }

    private fun checkGeofencing(x: Float, y: Float) {
        val activeCampaigns = campaigns.value
        var currentlyNear: Campaign? = null

        for (camp in activeCampaigns) {
            val dist = Math.hypot(
                (x - camp.latitude).toDouble(),
                (y - camp.longitude).toDouble()
            ).toFloat()
            if (dist <= camp.geofenceRadius) {
                currentlyNear = camp
                break
            }
        }

        nearCampaign = currentlyNear

        if (currentlyNear != null) {
            val userCoupon = userCoupons.value.find { it.campaignId == currentlyNear.id }
            val hasActiveCouponInWallet = userCoupon != null && userCoupon.status == "added_to_wallet"

            if (hasActiveCouponInWallet && !notifiedCampaignIds.contains(currentlyNear.id)) {
                NotificationService.showProximityNotification(
                    context, currentlyNear.id.toString()
                )
                notifiedCampaignIds.add(currentlyNear.id)
                viewModelScope.launch {
                    repository.logGeofenceTrigger(
                        campaignId = currentlyNear.id,
                        merchantName = currentlyNear.merchantName,
                        msg = "Alert: You are near ${currentlyNear.merchantName}!",
                        msgAr = "تنبيه: أنت بالقرب من ${currentlyNear.merchantNameAr}!"
                    )
                }
            }
        } else {
            if (notifiedCampaignIds.isNotEmpty()) {
                var farFromAll = true
                for (campId in notifiedCampaignIds) {
                    val camp = activeCampaigns.find { it.id == campId }
                    if (camp != null) {
                        val dist = Math.hypot(
                            (x - camp.latitude).toDouble(),
                            (y - camp.longitude).toDouble()
                        ).toFloat()
                        if (dist <= camp.geofenceRadius + 20f) {
                            farFromAll = false
                        }
                    }
                }
                if (farFromAll) {
                    notifiedCampaignIds.clear()
                }
            }
        }
    }

    fun createMerchantCampaign(
        name: String, nameAr: String, title: String, titleAr: String,
        desc: String, descAr: String, code: String, radius: Float = 120f,
        color: String = "#795548", startDate: String = "", endDate: String = ""
    ) {
        viewModelScope.launch {
            val randomX = (100..400).random().toFloat()
            val randomY = (100..400).random().toFloat()
            val newCamp = Campaign(
                merchantName = name,
                merchantNameAr = nameAr,
                couponTitle = title,
                couponTitleAr = titleAr,
                couponDescription = desc,
                couponDescriptionAr = descAr,
                discountCode = code,
                latitude = randomX,
                longitude = randomY,
                geofenceRadius = radius,
                colorHex = color,
                startDate = startDate,
                endDate = endDate
            )
            repository.insertCampaign(newCamp)
            merchantActivityLogs.add("Launched Campaign: $titleAr")
            syncCampaignsWithCloud()
        }
    }

    fun updateMerchantCampaign(campaign: Campaign) {
        viewModelScope.launch {
            repository.updateCampaign(campaign)
            merchantActivityLogs.add("Modified Campaign ID ${campaign.id}")
            syncCampaignsWithCloud()
        }
    }

    fun deleteMerchantCampaign(campaignId: Int, titleAr: String) {
        viewModelScope.launch {
            repository.deleteCampaign(campaignId)
            merchantActivityLogs.add("Removed Campaign ID $campaignId: $titleAr")
            if (nearCampaign?.id == campaignId) nearCampaign = null
            syncCampaignsWithCloud()
        }
    }

    fun resetSimulation() {
        viewModelScope.launch {
            repository.clearAllData()
            notifiedCampaignIds.clear()
            userLatitude = 250f
            userLongitude = 250f
            nearCampaign = null
        }
    }

    // ─── Cloud Functions with Error Handling ────────────────────────────────

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    fun syncWithCloud() {
        viewModelScope.launch {
            _isLoading.value = true
            _syncState.value = SyncState.SYNCING

            val token = repository.getToken()
            if (token != null) {
                val (success, error) = repository.syncCampaignsFromCloud(token)
                _syncState.value = if (success) SyncState.CONNECTED else SyncState.OFFLINE
                if (success) {
                    merchantActivityLogs.add("Cloud Sync Successful: Campaigns updated")
                } else {
                    error?.let { _errorMessage.value = it.userMessage }
                }
            } else {
                _syncState.value = SyncState.OFFLINE
                _errorMessage.value = "Please login to sync data"
            }

            _isLoading.value = false
        }
    }

    suspend fun cloudLogin(email: String, password: String): Boolean {
        _isLoading.value = true
        _errorMessage.value = null

        val (token, error) = repository.loginUser(email, password)

        _isLoading.value = false

        if (token != null) {
            syncWithCloud()
            return true
        } else {
            _errorMessage.value = error?.userMessage ?: "Login failed"
            return false
        }
    }

    suspend fun cloudRegister(email: String, password: String): Boolean {
        if (password.length < 8) {
            _errorMessage.value = "Password must be at least 8 characters"
            return false
        }

        _isLoading.value = true
        _errorMessage.value = null

        val (token, error) = repository.registerUser(email, password)

        _isLoading.value = false

        if (token != null) {
            syncWithCloud()
            return true
        } else {
            _errorMessage.value = error?.userMessage ?: "Registration failed"
            return false
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.clearToken()
            _syncState.value = SyncState.OFFLINE
            merchantActivityLogs.clear()
            clearError()
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }
}
