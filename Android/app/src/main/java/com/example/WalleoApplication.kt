package com.example

import android.app.Application
import com.example.data.sync.SyncWorker

class WalleoApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        SyncWorker.schedulePeriodicSync(applicationContext)
    }
}
