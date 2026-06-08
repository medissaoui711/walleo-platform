import React, { useState } from 'react'
import { Smartphone, Wifi, WifiOff, MapPin, QrCode, Award, Bell, RefreshCw, Gift, CheckCircle, Clock, Sparkles, Shield, AlertTriangle, Database, Cpu } from 'lucide-react'

interface AndroidSimulatorProps {
  dbState: any;
  setDbState: React.Dispatch<React.SetStateAction<any>>;
  onSecurityLog: (log: any) => void;
  totpToken: string;
  previousTotpToken: string;
  totpTimeLeft: number;
}

export default function AndroidSimulatorView({ dbState, setDbState, onSecurityLog, totpToken, previousTotpToken, totpTimeLeft }: AndroidSimulatorProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(dbState.campaigns[0]?.id || 1);
  const [scannedKeysHistory, setScannedKeysHistory] = useState<string[]>([]);
  const [currentIdempotencyKey, setCurrentIdempotencyKey] = useState(() => `idem_${Math.random().toString(36).substring(2, 10)}`);
  const [lastScanResult, setLastScanResult] = useState<{ status: 'success' | 'fraud' | null; message: string; code: number }>({ status: null, message: '', code: 200 });
  const [notification, setNotification] = useState<{ show: boolean; title: string; body: string }>({ show: false, title: '', body: '' });
  const [cameraActive, setCameraActive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  const handleSimulatedScan = (campaignId: number, useStaleKey: boolean = false, tokenState: 'valid' | 'expired' | 'counterfeit' = 'valid') => {
    setCameraActive(true);
    setTimeout(() => {
      setCameraActive(false);
      const targetCamp = dbState.campaigns.find((c: any) => c.id === campaignId);
      if (!targetCamp) return;

      let scannedToken = totpToken;
      if (tokenState === 'expired') scannedToken = previousTotpToken || 'EXPIRED';
      else if (tokenState === 'counterfeit') scannedToken = 'FAKE_TOKEN';

      if (tokenState === 'expired' || tokenState === 'counterfeit') {
        setLastScanResult({ status: 'fraud', message: `HTTP 403: ${tokenState === 'expired' ? 'Token expired' : 'Invalid signature'}`, code: 403 });
        onSecurityLog({ id: `sec-${Date.now()}`, timestamp: new Date().toISOString(), key: scannedToken, campaignTitle: targetCamp.title, status: 'FRAUD_BLOCKED', responseCode: 403, details: 'Security violation' });
        return;
      }

      const sentKey = useStaleKey && scannedKeysHistory.length > 0 ? scannedKeysHistory[scannedKeysHistory.length - 1] : currentIdempotencyKey;
      if (scannedKeysHistory.includes(sentKey)) {
        setLastScanResult({ status: 'fraud', message: 'HTTP 409: Duplicate transaction', code: 409 });
        onSecurityLog({ id: `sec-${Date.now()}`, timestamp: new Date().toISOString(), key: sentKey, campaignTitle: targetCamp.title, status: 'FRAUD_BLOCKED', responseCode: 409, details: 'Idempotency key replay blocked' });
        return;
      }

      setScannedKeysHistory(prev => [...prev, sentKey]);
      setCurrentIdempotencyKey(`idem_${Math.random().toString(36).substring(2, 10)}`);
      setLastScanResult({ status: 'success', message: 'HTTP 201: Stamp added!', code: 201 });

      const updatedCoupons = dbState.coupons.map((coupon: any) => {
        if (coupon.campaign_id === campaignId) {
          const nextStamps = coupon.stamps_collected + 1;
          const isUnlocked = nextStamps >= coupon.stamps_required;
          if (isUnlocked) setNotification({ show: true, title: 'Reward Unlocked!', body: coupon.reward_description });
          setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
          return { ...coupon, stamps_collected: isUnlocked ? 0 : nextStamps, is_reward_unlocked: isUnlocked };
        }
        return coupon;
      });
      setDbState((prev: any) => ({ ...prev, coupons: updatedCoupons, scans: [...prev.scans, { id: Date.now(), campaign_id: campaignId, campaign_title: targetCamp.title, customer_id: 'WLO-6825-99', timestamp: new Date().toISOString(), stamps_incremented: 1, status: 'synced' }] }));
      onSecurityLog({ id: `sec-${Date.now()}`, timestamp: new Date().toISOString(), key: sentKey, campaignTitle: targetCamp.title, status: 'SUCCESS', responseCode: 201, details: 'Stamp added successfully' });
    }, 1100);
  };

  return (
    <div className="flex flex-col items-center p-4 h-full">
      <div className="w-full max-w-[320px] mb-4">
        <select value={selectedCampaignId} onChange={(e) => setSelectedCampaignId(Number(e.target.value))} className="w-full bg-[#1A120B] border border-[#D4A373]/25 rounded text-xs p-2 text-[#D4A373]">
          {dbState.campaigns.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div className="relative w-[310px] h-[610px] bg-[#0c0806] rounded-[36px] p-3.5 border-4 border-[#2c1d15]">
        <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-[#0c0806] rounded-full"></div>
        <div className="flex-1 bg-[#100B08] rounded-[24px] overflow-hidden flex flex-col relative pt-4">
          <div className="flex justify-between px-4 py-1 text-[10px] text-[#A5A19E]"><span>12:53</span><div className="flex gap-1"><Wifi className="w-3 h-3" />5G</div></div>

          {notification.show && (<div className="absolute top-8 left-2 right-2 bg-[#1A120B] border-2 border-[#D4A373] rounded-xl p-3 z-50 animate-bounce"><Bell className="w-4 h-4 inline text-[#D4A373]" /> {notification.title}: {notification.body}</div>)}

          {cameraActive ? (
            <div className="flex-1 bg-zinc-950 rounded-2xl flex flex-col items-center justify-center"><QrCode className="w-16 h-16 text-[#D4A373] animate-pulse" /><div className="text-xs text-[#D4A373] mt-2">Scanning...</div></div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="bg-[#1A120B] p-2.5 rounded-xl">
                <div className="flex justify-between"><span className="text-[10px] text-zinc-500">IDEM KEY:</span><button onClick={() => setCurrentIdempotencyKey(`idem_${Math.random().toString(36).substring(2, 10)}`)}><RefreshCw className="w-3 h-3 text-[#D4A373]" /></button></div>
                <div className="bg-[#100B08] p-1.5 rounded text-[10px] text-emerald-400 font-mono">{currentIdempotencyKey}</div>
                {lastScanResult.status && (<div className={`mt-2 p-2 rounded text-[10px] ${lastScanResult.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>HTTP {lastScanResult.code}: {lastScanResult.message}</div>)}
              </div>

              <div className="space-y-2.5">
                {dbState.coupons.map((coupon: any) => {
                  const campaign = dbState.campaigns.find((c: any) => c.id === coupon.campaign_id);
                  if (!campaign) return null;
                  return (
                    <div key={coupon.id} className="bg-[#1A120B] rounded-xl p-2.5 space-y-2">
                      <div className="flex justify-between"><span className="text-xs font-bold">{campaign.title}</span><Award className="w-3 h-3 text-[#D4A373]" /></div>
                      <div className="flex justify-between items-center bg-[#100B08] p-1.5 rounded-lg">
                        <div className="flex gap-1">{Array.from({ length: coupon.stamps_required }).map((_, i) => (<div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${i < coupon.stamps_collected ? 'bg-[#D4A373] text-black' : 'bg-[#1A120B] border border-[#D4A373]/20'}`}>{i < coupon.stamps_collected ? '☕' : i + 1}</div>))}</div>
                        <span className="text-[10px] font-bold">{coupon.stamps_collected}/{coupon.stamps_required}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleSimulatedScan(coupon.campaign_id, false, 'valid')} className="bg-emerald-600 text-white text-[10px] py-1 rounded">1. Valid QR Scan</button>
                        <button onClick={() => handleSimulatedScan(coupon.campaign_id, false, 'expired')} className="bg-[#1A120B] text-yellow-500 border border-yellow-500/30 text-[9px] py-1 rounded">2. Expired Token (403)</button>
                        <button onClick={() => handleSimulatedScan(coupon.campaign_id, false, 'counterfeit')} className="bg-[#1A120B] text-red-400 border border-red-500/30 text-[9px] py-1 rounded">3. Counterfeit Token (403)</button>
                        <button onClick={() => handleSimulatedScan(coupon.campaign_id, true, 'valid')} disabled={scannedKeysHistory.length === 0} className="bg-zinc-900 text-zinc-400 text-[9px] py-1 rounded disabled:opacity-50">4. Replay Attack (409)</button>
                      </div>
                      {coupon.is_reward_unlocked && (<button onClick={() => { setDbState((prev: any) => ({ ...prev, coupons: prev.coupons.map((c: any) => c.id === coupon.id ? { ...c, is_reward_unlocked: false } : c) })); }} className="w-full bg-emerald-500 text-white text-[9px] py-1 rounded"><Gift className="w-3 h-3 inline" /> Claim Reward</button>)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="h-6 flex items-center justify-center"><div className="w-24 h-1 bg-[#A5A19E]/40 rounded-full"></div></div>
        </div>
      </div>
    </div>
  )
}