package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.remote.ApiClient
import com.example.data.repository.LoyaltyRepository
import com.example.data.sync.SyncWorker
import com.example.ui.LoyaltyViewModel
import com.example.ui.LoyaltyViewModelFactory
import com.example.ui.WalletLoyaltyApp
import com.example.ui.theme.WalletLoyaltyTheme

class MainActivity : ComponentActivity() {

    private lateinit var repository: LoyaltyRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        repository = LoyaltyRepository(applicationContext)

        ApiClient.init(applicationContext)

        SyncWorker.schedulePeriodicSync(applicationContext)

        setContent {
            WalletLoyaltyTheme(darkTheme = true) {
                val viewModel: LoyaltyViewModel = viewModel(
                    factory = LoyaltyViewModelFactory(repository)
                )
                WalletLoyaltyApp(viewModel = viewModel)
            }
        }
    }
}
