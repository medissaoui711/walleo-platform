package com.example

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.data.local.AppDatabase
import com.example.data.local.Campaign
import com.example.data.local.LoyaltyCard
import com.example.data.local.UserCoupon
import com.example.data.repository.LoyaltyRepository
import com.example.ui.LoyaltyViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner

@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(MockitoJUnitRunner::class)
class LoyaltyViewModelTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var repository: LoyaltyRepository

    @Mock
    private lateinit var database: AppDatabase

    private lateinit var viewModel: LoyaltyViewModel
    private val testDispatcher = StandardTestDispatcher()

    private val mockCampaigns = listOf(
        Campaign(
            id = 1,
            merchantName = "Test Cafe",
            merchantNameAr = "مقهى تجريبي",
            couponTitle = "Free Coffee",
            couponTitleAr = "قهوة مجانية",
            couponDescription = "Get one free coffee",
            couponDescriptionAr = "احصل على قهوة مجانية",
            discountCode = "TEST123",
            latitude = 180f,
            longitude = 160f,
            geofenceRadius = 100f,
            colorHex = "#D4A373"
        )
    )

    private val mockLoyaltyCards = listOf(
        LoyaltyCard(
            id = 1,
            campaignId = 1,
            stampsCount = 3,
            maxStamps = 5,
            points = 300
        )
    )

    private val mockUserCoupons = listOf(
        UserCoupon(
            id = 1,
            campaignId = 1,
            couponCode = "COUPON_1_12345",
            status = "added_to_wallet"
        )
    )

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)

        `when`(repository.getCampaigns()).thenReturn(flowOf(mockCampaigns))
        `when`(repository.getLoyaltyCards()).thenReturn(flowOf(mockLoyaltyCards))
        `when`(repository.getUserCoupons()).thenReturn(flowOf(mockUserCoupons))
        `when`(repository.getGeofenceLogs()).thenReturn(flowOf(emptyList()))

        viewModel = LoyaltyViewModel(com.example.WalleoApplication(), repository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun testViewModelInitialization() = runTest {
        advanceUntilIdle()

        assertEquals(mockCampaigns.size, viewModel.campaigns.value.size)
        assertEquals(mockLoyaltyCards.size, viewModel.loyaltyCards.value.size)
        assertEquals(mockUserCoupons.size, viewModel.userCoupons.value.size)
    }

    @Test
    fun testCampaignsFlow() = runTest {
        advanceUntilIdle()

        val campaigns = viewModel.campaigns.value
        assertNotNull(campaigns)
        assertEquals("Test Cafe", campaigns[0].merchantName)
        assertEquals("Free Coffee", campaigns[0].couponTitle)
    }

    @Test
    fun testLoyaltyCardsFlow() = runTest {
        advanceUntilIdle()

        val cards = viewModel.loyaltyCards.value
        assertNotNull(cards)
        assertEquals(3, cards[0].stampsCount)
        assertEquals(300, cards[0].points)
    }

    @Test
    fun testMerchantScansCalculation() = runTest {
        advanceUntilIdle()

        val scans = viewModel.merchantScans.value
        assertEquals(1, scans)
    }

    @Test
    fun testMerchantConversionRate() = runTest {
        advanceUntilIdle()

        val rate = viewModel.merchantConversionRate.value
        // 0 redeemed out of 1 coupon = 0%
        assertEquals(0, rate)
    }

    @Test
    fun testMerchantExpectedRevenue() = runTest {
        advanceUntilIdle()

        val revenue = viewModel.merchantExpectedRevenue.value
        // 0 redeemed * 35 = 0
        assertEquals(0, revenue)
    }

    @Test
    fun testAddToWallet() = runTest {
        advanceUntilIdle()

        viewModel.addCouponToWallet(1)

        verify(repository).addToWallet(1)
    }

    @Test
    fun testRedeemCoupon() = runTest {
        advanceUntilIdle()

        viewModel.redeemWalletCoupon(1)

        verify(repository).redeemCoupon(1)
    }

    @Test
    fun testUpdateUserPosition() = runTest {
        advanceUntilIdle()

        viewModel.updateUserPosition(200f, 200f)

        assertEquals(200f, viewModel.userLatitude)
        assertEquals(200f, viewModel.userLongitude)
    }

    @Test
    fun testCreateMerchantCampaign() = runTest {
        advanceUntilIdle()

        viewModel.createMerchantCampaign(
            name = "New Cafe",
            nameAr = "مقهى جديد",
            title = "Special Offer",
            titleAr = "عرض خاص",
            desc = "Get 50% off",
            descAr = "خصم ٥٠٪",
            code = "NEW123",
            radius = 150f,
            color = "#FF0000"
        )

        verify(repository).insertCampaign(any(Campaign::class.java))
    }

    @Test
    fun testDeleteMerchantCampaign() = runTest {
        advanceUntilIdle()

        viewModel.deleteMerchantCampaign(1, "Test Campaign")

        verify(repository).deleteCampaign(1)
    }

    @Test
    fun testOnboardMerchant() {
        viewModel.onboardMerchant("My Store", "Cafe")

        assertTrue(viewModel.isMerchantOnboarded)
        assertEquals("My Store", viewModel.merchantStoreName)
        assertEquals("Cafe", viewModel.merchantStoreType)
        assertTrue(viewModel.merchantId.startsWith("MID-"))
    }

    @Test
    fun testCompleteSetup() {
        val template = CampaignTemplate(
            titleEn = "Free Coffee",
            titleAr = "قهوة مجانية",
            descEn = "Get free coffee",
            descAr = "احصل على قهوة مجانية",
            code = "FREE123",
            color = "#D4A373"
        )

        viewModel.completeSetup("Pro", template)

        assertTrue(viewModel.isMerchantSetupComplete)
        assertEquals("Pro", viewModel.merchantSelectedPlan)
        assertEquals(template, viewModel.merchantSelectedTemplate)
    }

    @Test
    fun testResetSimulation() = runTest {
        advanceUntilIdle()

        viewModel.resetSimulation()

        verify(repository).clearAllData()
        assertEquals(250f, viewModel.userLatitude)
        assertEquals(250f, viewModel.userLongitude)
        assertNull(viewModel.nearCampaign)
    }

    @Test
    fun testGeofenceProximityDetection() = runTest {
        advanceUntilIdle()

        viewModel.updateUserPosition(200f, 170f)

        assertNotNull(viewModel.nearCampaign)
    }

    @Test
    fun testActivityLogs() {
        viewModel.merchantActivityLogs.clear()

        viewModel.onboardMerchant("Test Store", "Cafe")
        viewModel.completeSetup("Basic", CampaignTemplate(
            titleEn = "Test",
            titleAr = "اختبار",
            descEn = "Test",
            descAr = "اختبار",
            code = "TEST",
            color = "#000"
        ))

        assertTrue(viewModel.merchantActivityLogs.isNotEmpty())
    }
}
