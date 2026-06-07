package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "campaigns")
data class Campaign(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val merchantName: String,
    val merchantNameAr: String,
    val couponTitle: String,
    val couponTitleAr: String,
    val couponDescription: String,
    val couponDescriptionAr: String,
    val discountCode: String,
    val latitude: Float,
    val longitude: Float,
    val geofenceRadius: Float,
    val colorHex: String,
    val pointsPerRedeem: Int = 1,
    val startDate: String = "",
    val endDate: String = "",
    val syncStatus: String = "SYNCED"
)

@Entity(tableName = "user_coupons")
data class UserCoupon(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val campaignId: Int,
    val couponCode: String,
    val status: String,
    val scannedAt: Date = Date(),
    val redeemedAt: Date? = null
)

@Entity(tableName = "loyalty_cards")
data class LoyaltyCard(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val campaignId: Int,
    val stampsCount: Int,
    val maxStamps: Int,
    val points: Int
)

@Entity(tableName = "geofence_logs")
data class GeofenceLog(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val campaignId: Int,
    val merchantName: String,
    val message: String,
    val messageAr: String,
    val timestamp: Long = System.currentTimeMillis()
)

data class CampaignTemplate(
    val titleEn: String,
    val titleAr: String,
    val descriptionEn: String,
    val descriptionAr: String,
    val discountCode: String,
    val colorHex: String
)
