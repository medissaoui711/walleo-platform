package com.example.data.repository

import android.content.Context
import com.example.data.local.AppDatabase
import com.example.data.local.Campaign
import com.example.data.local.GeofenceLog
import com.example.data.local.LoyaltyCard
import com.example.data.local.UserCoupon
import com.example.data.remote.ApiClient
import com.example.data.remote.ClaimRequest
import com.example.data.remote.GeofenceCheckRequest
import com.example.data.remote.LoginRequest
import com.example.data.remote.RedeemRequest
import com.example.data.remote.RegisterRequest
import com.example.utils.AppError
import com.example.utils.safeApiCall
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull

class LoyaltyRepository(private val context: Context) {

    private val database = AppDatabase.getDatabase(context)
    private val apiService = ApiClient.apiService

    // ─── Local Operations ───────────────────────────────────────────────────

    fun getCampaigns(): Flow<List<Campaign>> = database.loyaltyDao().getCampaigns()
    fun getUserCoupons(): Flow<List<UserCoupon>> = database.loyaltyDao().getUserCoupons()
    fun getLoyaltyCards(): Flow<List<LoyaltyCard>> = database.loyaltyDao().getLoyaltyCards()
    fun getGeofenceLogs(): Flow<List<GeofenceLog>> = database.loyaltyDao().getGeofenceLogs()

    suspend fun getCampaignById(id: Int): Campaign? = database.loyaltyDao().getCampaignById(id)

    suspend fun insertCampaign(campaign: Campaign) {
        database.loyaltyDao().insertCampaign(campaign.copy(syncStatus = "PENDING"))
        database.loyaltyDao().insertLoyaltyCard(
            LoyaltyCard(campaignId = campaign.id, stampsCount = 0, maxStamps = 5, points = 0)
        )
    }

    suspend fun updateCampaign(campaign: Campaign) {
        database.loyaltyDao().updateCampaign(campaign.copy(syncStatus = "PENDING"))
    }

    suspend fun deleteCampaign(campaignId: Int) {
        database.loyaltyDao().deleteCampaignById(campaignId)
    }

    suspend fun scanAndClaim(campaignId: Int): Boolean {
        val activeCoupon = database.loyaltyDao().getActiveCoupon(campaignId)
        if (activeCoupon == null) {
            val campaign = database.loyaltyDao().getCampaignById(campaignId)
            val code = campaign?.discountCode ?: "COUPON_${(100..999).random()}"
            database.loyaltyDao().insertUserCoupon(
                UserCoupon(campaignId = campaignId, couponCode = code, status = "scanned")
            )
            return true
        }
        return false
    }

    suspend fun addToWallet(campaignId: Int) {
        val activeCoupon = database.loyaltyDao().getActiveCoupon(campaignId)
        if (activeCoupon == null) {
            val campaign = database.loyaltyDao().getCampaignById(campaignId)
            val code = campaign?.discountCode ?: "COUPON_VAL"
            database.loyaltyDao().insertUserCoupon(
                UserCoupon(campaignId = campaignId, couponCode = code, status = "added_to_wallet")
            )
        } else {
            database.loyaltyDao().updateUserCouponStatus(campaignId, "added_to_wallet")
        }
    }

    suspend fun redeemCoupon(campaignId: Int) {
        database.loyaltyDao().updateUserCouponStatus(campaignId, "redeemed")
        val card = database.loyaltyDao().getLoyaltyCardByCampaign(campaignId)
            ?: LoyaltyCard(campaignId = campaignId, stampsCount = 0, maxStamps = 5, points = 0)

        val nextStamps = card.stampsCount + 1
        val isReward = nextStamps >= card.maxStamps
        val updatedStamps = if (isReward) 0 else nextStamps
        val updatedPoints = card.points + 100 + if (isReward) 250 else 0

        database.loyaltyDao().insertLoyaltyCard(
            card.copy(stampsCount = updatedStamps, points = updatedPoints)
        )
    }

    suspend fun logGeofenceTrigger(campaignId: Int, merchantName: String, msg: String, msgAr: String) {
        database.loyaltyDao().insertGeofenceLog(
            GeofenceLog(
                campaignId = campaignId,
                merchantName = merchantName,
                message = msg,
                messageAr = msgAr
            )
        )
    }

    suspend fun clearAllData() {
        database.loyaltyDao().clearCampaigns()
        database.loyaltyDao().clearUserCoupons()
        database.loyaltyDao().clearLoyaltyCards()
        database.loyaltyDao().clearGeofenceLogs()
    }

    suspend fun populateDefaultsIfNeeded() {
        val campaigns = database.loyaltyDao().getCampaigns().firstOrNull()
        if (campaigns.isNullOrEmpty()) {
            val defaultCampaigns = listOf(
                Campaign(
                    merchantName = "Brew Haven Coffee",
                    merchantNameAr = "مقهى ملاذ القهوة",
                    couponTitle = "25% OFF Cold Brew",
                    couponTitleAr = "خصم ٢٥٪ على الكولد برو",
                    couponDescription = "Valid for single use",
                    couponDescriptionAr = "صالح للاستخدام الفردي",
                    discountCode = "BREW_WARRIOR",
                    latitude = 180f,
                    longitude = 160f,
                    geofenceRadius = 100f,
                    colorHex = "#795548"
                ),
                Campaign(
                    merchantName = "Golden Crema Coffee",
                    merchantNameAr = "مقهى الكريمة الذهبية",
                    couponTitle = "Buy 1 Get 1 Latte",
                    couponTitleAr = "اشترِ واحصل على الآخر مجاناً",
                    couponDescription = "Treat a friend today",
                    couponDescriptionAr = "دلّل صديقك اليوم",
                    discountCode = "CREMA_DOUBLE",
                    latitude = 360f,
                    longitude = 180f,
                    geofenceRadius = 120f,
                    colorHex = "#D4AF37"
                ),
                Campaign(
                    merchantName = "Glitch Cyber Café",
                    merchantNameAr = "مقهى جليتش الإلكتروني",
                    couponTitle = "Free Cronut with V60",
                    couponTitleAr = "كرونات فستق مجاني",
                    couponDescription = "Valid from midnight to 6 AM",
                    couponDescriptionAr = "صالح من منتصف الليل وحتى ٦ صباحاً",
                    discountCode = "GLITCH_CTRL",
                    latitude = 140f,
                    longitude = 360f,
                    geofenceRadius = 90f,
                    colorHex = "#00E5FF"
                )
            )
            defaultCampaigns.forEach { campaign ->
                val id = database.loyaltyDao().insertCampaign(campaign).toInt()
                database.loyaltyDao().insertLoyaltyCard(
                    LoyaltyCard(campaignId = id, stampsCount = 0, maxStamps = 5, points = 0)
                )
            }
        }
    }

    // ─── Cloud Operations with Error Handling ───────────────────────────────

    suspend fun syncCampaignsFromCloud(token: String): Pair<Boolean, AppError?> {
        return safeApiCall(context, { apiService.getCampaigns("Bearer $token") }) { campaigns ->
            database.loyaltyDao().clearCampaigns()
            campaigns.forEach { campaign ->
                database.loyaltyDao().insertCampaign(campaign)
            }
            return true to null
        } ?: (false to null)
    }

    suspend fun cloudClaim(token: String, campaignId: Int): Pair<Boolean, AppError?> {
        return safeApiCall(context, {
            apiService.claimCoupon("Bearer $token", ClaimRequest(campaignId))
        }) { response ->
            if (response.success) {
                database.loyaltyDao().insertUserCoupon(response.coupon)
                return true to null
            }
            false to null
        } ?: (false to null)
    }

    suspend fun cloudRedeem(token: String, campaignId: Int, couponCode: String): Pair<LoyaltyCard?, AppError?> {
        return safeApiCall(context, {
            apiService.redeemCoupon("Bearer $token", RedeemRequest(campaignId, couponCode))
        }) { response ->
            if (response.success) {
                database.loyaltyDao().updateLoyaltyCard(
                    campaignId,
                    response.loyalty_card.stampsCount,
                    response.loyalty_card.points
                )
                return response.loyalty_card to null
            }
            null to null
        } ?: (null to null)
    }

    suspend fun loginUser(email: String, password: String): Pair<String?, AppError?> {
        return safeApiCall(context, {
            apiService.login(LoginRequest(email, password))
        }) { response ->
            val token = response.access_token
            ApiClient.setAuthToken(token)
            saveToken(token)
            return token to null
        } ?: (null to null)
    }

    suspend fun registerUser(email: String, password: String): Pair<String?, AppError?> {
        return safeApiCall(context, {
            apiService.register(RegisterRequest(email, password))
        }) { response ->
            val token = response.access_token
            ApiClient.setAuthToken(token)
            saveToken(token)
            return token to null
        } ?: (null to null)
    }

    suspend fun checkGeofence(token: String, latitude: Double, longitude: Double, campaignId: Int): Pair<Boolean, AppError?> {
        return safeApiCall(context, {
            apiService.checkGeofence("Bearer $token",
                GeofenceCheckRequest(latitude, longitude, campaignId))
        }) { response ->
            return response.within_geofence to null
        } ?: (false to null)
    }

    private fun saveToken(token: String) {
        val prefs = context.getSharedPreferences("auth", Context.MODE_PRIVATE)
        prefs.edit().putString("jwt_token", token).apply()
    }

    fun getToken(): String? {
        val prefs = context.getSharedPreferences("auth", Context.MODE_PRIVATE)
        return prefs.getString("jwt_token", null)
    }

    suspend fun clearToken() {
        val prefs = context.getSharedPreferences("auth", Context.MODE_PRIVATE)
        prefs.edit().remove("jwt_token").apply()
        ApiClient.setAuthToken(null)
    }
}
