package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.WalleoApplication
import com.example.data.repository.LoyaltyRepository

class LoyaltyViewModelFactory(
    private val repository: LoyaltyRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(LoyaltyViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return LoyaltyViewModel(WalleoApplication(), repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
