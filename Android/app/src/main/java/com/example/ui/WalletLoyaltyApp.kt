package com.example.ui

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.local.CampaignEntity
import com.example.data.local.LoyaltyCardEntity
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletLoyaltyApp(
    viewModel: LoyaltyViewModel = viewModel()
) {
    val state by viewModel.uiState.collectAsState()

    LoyaltyTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            if (state.isLoggedIn) "محفظة الولاء" else "QR Loyalty",
                            fontWeight = FontWeight.Bold
                        )
                    },
                    actions = {
                        if (state.isLoggedIn) {
                            Text(
                                text = "${state.pointsBalance} ⭐",
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(end = 12.dp)
                            )
                            TextButton(onClick = { viewModel.logout() }) {
                                Text("تسجيل خروج", color = RedAccent)
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        titleContentColor = MaterialTheme.colorScheme.onPrimary
                    )
                )
            }
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(MaterialTheme.colorScheme.background)
            ) {
                when {
                    !state.isLoggedIn -> LoginScreen(viewModel)
                    state.isLoading && state.campaigns.isEmpty() ->
                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = Gold)
                        }
                    else -> WalletContent(state, viewModel)
                }

                state.error?.let { error ->
                    Snackbar(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(16.dp),
                        action = {
                            TextButton(onClick = { viewModel.clearError() }) {
                                Text("حسناً")
                            }
                        }
                    ) {
                        Text(error)
                    }
                }
            }
        }
    }
}

@Composable
private fun LoginScreen(viewModel: LoyaltyViewModel) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isRegister by remember { mutableStateOf(false) }
    val state by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (isRegister) "إنشاء حساب جديد" else "تسجيل الدخول",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = Gold
        )

        Spacer(Modifier.height(8.dp))

        Text(
            text = if (isRegister) "انضم إلى برنامج الولاء" else "مرحباً بعودتك",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.secondary
        )

        Spacer(Modifier.height(40.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("البريد الإلكتروني") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(Modifier.height(16.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("كلمة المرور") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(Modifier.height(24.dp))

        Button(
            onClick = {
                if (isRegister) viewModel.register(email, password)
                else viewModel.login(email, password)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            enabled = email.isNotBlank() && password.isNotBlank() && !state.isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = Gold),
            shape = RoundedCornerShape(12.dp)
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    if (isRegister) "إنشاء حساب" else "تسجيل الدخول",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        TextButton(onClick = { isRegister = !isRegister }) {
            Text(
                if (isRegister) "لديك حساب؟ سجل دخول" else "ليس لديك حساب؟ إنشاء حساب",
                color = GoldDark
            )
        }
    }
}

@Composable
private fun WalletContent(
    state: LoyaltyUiState,
    viewModel: LoyaltyViewModel
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        if (state.loyaltyCards.isNotEmpty()) {
            item {
                Text(
                    "بطاقات الولاء",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
            items(state.loyaltyCards) { card ->
                val campaign = state.campaigns.find { it.id == card.campaignId }
                if (campaign != null) {
                    LoyaltyCardItem(
                        card = card,
                        campaign = campaign,
                        onRedeem = { viewModel.redeemCoupon(card.campaignId) }
                    )
                }
            }
        }

        if (state.redeemResult != null) {
            item {
                RedeemResultCard(
                    result = state.redeemResult!!,
                    onDismiss = { viewModel.clearRedeemResult() }
                )
            }
        }

        item {
            Spacer(Modifier.height(8.dp))
            Text(
                "العروض المتاحة",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
        }

        items(state.campaigns) { campaign ->
            CampaignCard(
                campaign = campaign,
                onClaim = { viewModel.claimCoupon(campaign.id) }
            )
        }
    }
}

@Composable
private fun LoyaltyCardItem(
    card: LoyaltyCardEntity,
    campaign: CampaignEntity,
    onRedeem: () -> Unit
) {
    val campaignColor = try {
        Color(android.graphics.Color.parseColor(campaign.colorHex))
    } catch (_: Exception) {
        Gold
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = campaignColor.copy(alpha = 0.15f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = campaign.merchantName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = campaign.couponTitle,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
                Text(
                    text = "${card.points} نقطة",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = campaignColor
                )
            }

            Spacer(Modifier.height(12.dp))

            StampsRow(
                stampsCount = card.stampsCount,
                maxStamps = card.maxStamps,
                color = campaignColor
            )

            Spacer(Modifier.height(12.dp))

            Button(
                onClick = onRedeem,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = campaignColor),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("استرداد", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun StampsRow(
    stampsCount: Int,
    maxStamps: Int,
    color: Color = Gold
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        for (i in 1..maxStamps) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(
                        if (i <= stampsCount) color else color.copy(alpha = 0.2f)
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (i <= stampsCount) {
                    Text("✓", color = Color.White, fontWeight = FontWeight.Bold)
                } else {
                    Text("$i", color = color.copy(alpha = 0.5f))
                }
            }
        }
        Spacer(Modifier.weight(1f))
        Text(
            "$stampsCount / $maxStamps",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.secondary
        )
    }
}

@Composable
private fun CampaignCard(
    campaign: CampaignEntity,
    onClaim: () -> Unit
) {
    val campaignColor = try {
        Color(android.graphics.Color.parseColor(campaign.colorHex))
    } catch (_: Exception) {
        Gold
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = campaign.merchantName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = campaign.couponTitle,
                        style = MaterialTheme.typography.bodyLarge,
                        color = campaignColor
                    )
                }
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(campaignColor.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = campaign.discountCode.take(3),
                        fontWeight = FontWeight.Bold,
                        color = campaignColor
                    )
                }
            }

            if (!campaign.couponDescription.isNullOrBlank()) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = campaign.couponDescription,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.secondary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = campaign.startDate,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.secondary
                )
                OutlinedButton(
                    onClick = onClaim,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = campaignColor),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("احصل على الكوبون", fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@Composable
private fun RedeemResultCard(
    result: RedeemResult,
    onDismiss: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (result.triggeredReward) GreenReward.copy(alpha = 0.15f)
            else Gold.copy(alpha = 0.15f)
        )
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                if (result.triggeredReward) "🎉 مكافأة!" else "تم الاسترداد ✅",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(8.dp))
            Text("الطوابع: ${result.stampsCount} / ${result.maxStamps}")
            Text("النقاط: ${result.points}")
            if (result.triggeredReward) {
                Spacer(Modifier.height(4.dp))
                Text(
                    "لقد حصلت على مكافأة 250 نقطة إضافية!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = GreenReward,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center
                )
            }
            Spacer(Modifier.height(12.dp))
            TextButton(onClick = onDismiss) {
                Text("حسناً", color = Gold)
            }
        }
    }
}
