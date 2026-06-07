package com.example.data.remote

import com.example.data.local.Campaign
import com.example.data.local.LoyaltyCard
import com.example.data.local.UserCoupon
import retrofit2.http.*

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val email: String, val password: String)
data class TokenResponse(val access_token: String, val token_type: String)
data class ClaimRequest(val campaign_id: Int)
data class ClaimResponse(val success: Boolean, val coupon: UserCoupon)
data class RedeemRequest(val campaign_id: Int, val coupon_code: String)
data class RedeemResponse(val success: Boolean, val loyalty_card: LoyaltyCard)
data class GeofenceCheckRequest(val latitude: Double, val longitude: Double, val campaign_id: Int)
data class GeofenceCheckResponse(val within_geofence: Boolean, val campaign_name: String, val campaign_name_ar: String)

interface ApiService {

    @GET("api/v1/campaigns")
    suspend fun getCampaigns(
        @Header("Authorization") token: String
    ): List<Campaign>

    @POST("api/v1/coupons/claim")
    suspend fun claimCoupon(
        @Header("Authorization") token: String,
        @Body request: ClaimRequest
    ): ClaimResponse

    @POST("api/v1/coupons/redeem")
    suspend fun redeemCoupon(
        @Header("Authorization") token: String,
        @Body request: RedeemRequest
    ): RedeemResponse

    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): TokenResponse

    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): TokenResponse

    @POST("api/v1/geofencing/check")
    suspend fun checkGeofence(
        @Header("Authorization") token: String,
        @Body request: GeofenceCheckRequest
    ): GeofenceCheckResponse
}
