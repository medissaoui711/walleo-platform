package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val CoffeeGold = Color(0xFFD4A373)
val AmberGold = Color(0xFFFFB300)
val DarkBrown = Color(0xFF4A3225)
val EspressoBlack = Color(0xFF1A120B)
val SoftGrey = Color(0xFFA5A19E)
val ObsidianDark = Color(0xFF100B08)
val GlassWhite = Color(0x1BFFFFFF)

private val DarkColorScheme = darkColorScheme(
    primary = CoffeeGold,
    secondary = DarkBrown,
    background = ObsidianDark,
    surface = ObsidianDark,
    onPrimary = EspressoBlack,
    onSecondary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = CoffeeGold,
    secondary = AmberGold,
    background = Color(0xFFF5F5F5),
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = EspressoBlack,
    onSurface = EspressoBlack
)

@Composable
fun WalletLoyaltyTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
