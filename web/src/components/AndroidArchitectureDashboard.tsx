import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Database, Lock, Unlock, RefreshCw, CheckCircle2, FileCode, Layers, Shield, Eye, EyeOff } from 'lucide-react'

interface AndroidArchitectureDashboardProps {
  onTriggerSecurityLog: (log: any) => void;
  dbState: any;
  setDbState: React.Dispatch<React.SetStateAction<any>>;
}

export default function AndroidArchitectureDashboard({ onTriggerSecurityLog, dbState, setDbState }: AndroidArchitectureDashboardProps) {
  const [isClientOnline, setIsClientOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [simulateNetworkFlakiness, setSimulateNetworkFlakiness] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [jwtToken, setJwtToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  const [storageType, setStorageType] = useState<'standard' | 'encrypted'>('encrypted');
  const [showRawToken, setShowRawToken] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'sync_worker' | 'encrypted_prefs' | 'clean_arch_structure'>('sync_worker');

  const handleOfflineScan = (campaignId: number) => {
    const campaign = dbState.campaigns.find((c: any) => c.id === campaignId) || dbState.campaigns[0];
    const mockIdempotencyKey = `idem_OFFLINE_${Math.random().toString(16).substring(2, 8)}`;
    setOfflineQueue(prev => [...prev, { id: `queue-${Date.now()}`, campaignId, campaignTitle: campaign.title, idempotencyKey: mockIdempotencyKey, timestamp: new Date().toISOString(), status: 'pending', retryCount: 0 }]);
    setSyncLogs(prev => [`[Room DB] Offline scan stored: ${mockIdempotencyKey}`, ...prev]);
    onTriggerSecurityLog({ id: `off-${Date.now()}`, timestamp: new Date().toISOString(), key: mockIdempotencyKey, campaignTitle: campaign.title, status: 'SUCCESS', responseCode: 200, details: `Stored offline in Room cache` });
  };

  const triggerSyncWorker = async () => {
    if (offlineQueue.length === 0) { setSyncLogs(prev => [`[SyncWorker] Queue empty`, ...prev]); return; }
    if (!isClientOnline) { setSyncLogs(prev => [`[SyncWorker] Device offline`, ...prev]); return; }
    setIsSyncing(true);
    for (let i = 0; i < offlineQueue.length; i++) {
      const item = offlineQueue[i];
      if (item.status === 'success') continue;
      if (simulateNetworkFlakiness && item.retryCount === 0) {
        setOfflineQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'failed', retryCount: 1 } : q));
        setSyncLogs(prev => [`[Network] Failed to send ${item.idempotencyKey}, retrying...`, ...prev]);
        await new Promise(r => setTimeout(r, 1000));
      }
      setOfflineQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'success' } : q));
      setSyncLogs(prev => [`[SyncWorker] ✅ ${item.idempotencyKey} synced successfully`, ...prev]);
      setDbState((prev: any) => {
        const updatedCoupons = prev.coupons.map((coupon: any) => {
          if (coupon.campaign_id === item.campaignId) {
            const nextStamps = coupon.stamps_collected + 1;
            return { ...coupon, stamps_collected: nextStamps >= coupon.stamps_required ? 0 : nextStamps, is_reward_unlocked: nextStamps >= coupon.stamps_required };
          }
          return coupon;
        });
        return { ...prev, coupons: updatedCoupons };
      });
    }
    setIsSyncing(false);
    setOfflineQueue([]);
  };

  const getEncryptedString = (raw: string) => `AES256_SIV_Encrypted_${btoa(raw).substring(0, 15)}...`;

  return (
    <div className="space-y-6">
      <div className="bg-[#1A120B] border border-[#D4A373]/20 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F3EFE0]">Android Sync Engine & Security</h3>
          <div className="flex gap-2">
            <button onClick={() => setIsClientOnline(true)} className={`px-2.5 py-1 text-[10px] rounded ${isClientOnline ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}><Wifi className="w-3 h-3 inline" /> Online</button>
            <button onClick={() => setIsClientOnline(false)} className={`px-2.5 py-1 text-[10px] rounded ${!isClientOnline ? 'bg-amber-500/15 text-[#D4A373]' : 'text-zinc-500'}`}><WifiOff className="w-3 h-3 inline" /> Offline</button>
          </div>
        </div>
        <div className="mt-4 bg-[#100B08] p-4 rounded-xl">
          <div className="flex justify-between text-xs"><span>Pending Queue:</span><span className="font-bold text-cyan-400">{offlineQueue.filter(q => q.status === 'pending').length} stamps</span></div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => handleOfflineScan(1)} className="bg-[#1A120B] border border-[#D4A373]/25 text-[#D4A373] text-xs py-2 rounded">Scan offline (Card 1)</button>
            <button onClick={() => handleOfflineScan(2)} className="bg-[#1A120B] border border-[#D4A373]/25 text-[#D4A373] text-xs py-2 rounded">Scan offline (Card 2)</button>
          </div>
          <label className="flex items-center gap-2 mt-3 text-[10px] text-zinc-400"><input type="checkbox" checked={simulateNetworkFlakiness} onChange={(e) => setSimulateNetworkFlakiness(e.target.checked)} className="rounded" /> Simulate unstable network</label>
          <button onClick={triggerSyncWorker} disabled={isSyncing || offlineQueue.length === 0} className="w-full mt-3 bg-[#D4A373] disabled:bg-zinc-800 text-[#100B08] font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1"><RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Run SyncWorker</button>
          <div className="bg-[#0C0806] p-3 rounded-lg mt-3 text-[10px] font-mono h-28 overflow-y-auto space-y-1">{syncLogs.map((log, i) => <div key={i} className={log.includes('✅') ? 'text-emerald-400' : 'text-zinc-400'}>{log}</div>)}</div>
        </div>
      </div>

      <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-white">Encrypted Preferences (Jetpack Security)</h4>
        <div className="bg-[#100B08] p-4 rounded-xl space-y-3">
          <div className="flex bg-[#1A120B] border border-[#D4A373]/20 rounded-lg p-1 items-center justify-between">
            <input type={showRawToken ? 'text' : 'password'} value={jwtToken} onChange={(e) => setJwtToken(e.target.value)} className="bg-transparent text-xs font-mono text-[#D4A373] flex-1 px-2" />
            <button onClick={() => setShowRawToken(!showRawToken)}>{showRawToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStorageType('standard')} className={`flex-1 py-1 text-xs rounded ${storageType === 'standard' ? 'border-red-500 text-red-400' : 'border-zinc-800 text-zinc-400'}`}><Unlock className="w-3 h-3 inline" /> Standard</button>
            <button onClick={() => setStorageType('encrypted')} className={`flex-1 py-1 text-xs rounded ${storageType === 'encrypted' ? 'border-emerald-500 text-emerald-400' : 'border-zinc-800 text-zinc-400'}`}><Lock className="w-3 h-3 inline" /> Encrypted</button>
          </div>
          <pre className="text-[10px] text-zinc-400 bg-[#0C0806] p-3 rounded-xl">{`<string name="access_token">${storageType === 'encrypted' ? getEncryptedString(jwtToken) : jwtToken.substring(0, 36)}...</string>`}</pre>
        </div>
      </div>

      <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 space-y-4">
        <div className="flex gap-1 bg-[#100B08] p-0.5 rounded-lg">
          <button onClick={() => setActiveCodeTab('sync_worker')} className={`px-3 py-1.5 text-xs rounded ${activeCodeTab === 'sync_worker' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>SyncWorker.kt</button>
          <button onClick={() => setActiveCodeTab('encrypted_prefs')} className={`px-3 py-1.5 text-xs rounded ${activeCodeTab === 'encrypted_prefs' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>EncryptedPrefs.kt</button>
          <button onClick={() => setActiveCodeTab('clean_arch_structure')} className={`px-3 py-1.5 text-xs rounded ${activeCodeTab === 'clean_arch_structure' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>Directory Layout</button>
        </div>
        <div className="bg-[#100B08] rounded-xl border border-[#D4A373]/10 overflow-hidden text-xs">
          {activeCodeTab === 'sync_worker' && <pre className="p-4 text-zinc-300 text-[10px]">{`class SyncWorker(...) : CoroutineWorker() {
    override suspend fun doWork(): Result {
        val pendingScans = scanDao.getUnsyncedScans()
        for (scan in pendingScans) {
            apiService.syncCouponStamp(scan.idempotencyKey, scan.campaignId)
            scanDao.markAsSynced(scan.idempotencyKey)
        }
        return Result.success()
    }
}`}</pre>}
          {activeCodeTab === 'encrypted_prefs' && <pre className="p-4 text-zinc-300 text-[10px]">{`class EncryptedPreferencesManager(context: Context) {
    private val masterKey = MasterKey.Builder(context).setKeyScheme(AES256_GCM).build()
    private val sharedPrefs = EncryptedSharedPreferences.create(context, "secure_prefs", masterKey, AES256_SIV, AES256_GCM)
    fun saveAuthToken(token: String) = sharedPrefs.edit().putString("token", token).apply()
    fun getAuthToken(): String? = sharedPrefs.getString("token", null)
}`}</pre>}
          {activeCodeTab === 'clean_arch_structure' && <pre className="p-4 text-zinc-300 text-[10px]">{`app/
├── domain/          # Use Cases (pure Kotlin)
├── data/            # Repository, Room, Retrofit
├── presentation/    # ViewModels, Compose UI`}</pre>}
        </div>
      </div>
    </div>
  )
}