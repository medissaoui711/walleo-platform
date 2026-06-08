import React, { useState, useEffect } from 'react'
import {
  Zap,
  Flame,
  Activity,
  AlertOctagon,
  ShieldAlert,
  Sliders,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Cpu,
  RefreshCw,
  Server
} from 'lucide-react'

interface BackendSimulatorDashboardProps {
  onTriggerSecurityLog: (log: any) => void;
}

export default function BackendSimulatorDashboard({ onTriggerSecurityLog }: BackendSimulatorDashboardProps) {
  const [stampRequestsCount, setStampRequestsCount] = useState(0);
  const [cooloffSeconds, setCooloffSeconds] = useState(0);
  const [rateLimitLogs, setRateLimitLogs] = useState<string[]>([]);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);
  const [simType, setSimType] = useState<'sync' | 'async'>('async');
  const [activeConnections, setActiveConnections] = useState(0);
  const [processedRequests, setProcessedRequests] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [sentryLogs, setSentryLogs] = useState<any[]>([
    {
      id: "sentry-err-a92c",
      error: "SQLAlchemy.exc.OperationalError: (psycopg2.OperationalError) FATAL: remaining connection slots are reserved",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      file: "app/db/session.py:18",
      breadcrumbs: ["12:12:40 GET /api/v1/merchant/stats (200 OK)", "12:13:02 POST /api/v1/merchant/scan-coupon -> DB lock warning"],
      traceback: "Traceback (most recent call last):\n  File \"app/core/middleware.py\", line 42, in call_next\n    response = await call_next(request)\n  File \"app/db/session.py\", line 18, in get_db\n    session = SessionLocal()\nOperationalError: connection slots exhausted.",
      resolved: false
    }
  ]);

  useEffect(() => {
    if (cooloffSeconds > 0) {
      const timer = setTimeout(() => setCooloffSeconds(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (stampRequestsCount > 0) {
      const decay = setTimeout(() => setStampRequestsCount(prev => Math.max(0, prev - 1)), 5000);
      return () => clearTimeout(decay);
    }
  }, [cooloffSeconds, stampRequestsCount]);

  const handleRateLimitedRequest = (action: 'claim' | 'redeem') => {
    if (cooloffSeconds > 0) {
      setRateLimitLogs(prev => [`[${new Date().toLocaleTimeString()}] ⛔ HTTP 429: Rate limit active! Wait ${cooloffSeconds}s`, ...prev]);
      return;
    }
    const nextCount = stampRequestsCount + 1;
    setStampRequestsCount(nextCount);
    if (nextCount > 3) {
      setCooloffSeconds(30);
      setRateLimitLogs(prev => [`[${new Date().toLocaleTimeString()}] 🚨 RATE LIMIT TRIGGERED: HTTP 429 on /api/v1/coupons/${action}`, ...prev]);
      onTriggerSecurityLog({ id: `rate-block-${Date.now()}`, timestamp: new Date().toISOString(), key: 'RATE_LIMITER_429', campaignTitle: `ROUTE: /${action}`, status: 'FRAUD_BLOCKED', responseCode: 429, details: `RateLimit exceeded! 3 requests/minute limit breached.` });
    } else {
      setRateLimitLogs(prev => [`[${new Date().toLocaleTimeString()}] ✅ HTTP 200: /${action} allowed (${nextCount}/3)`, ...prev]);
    }
  };

  const runLoadSimulation = () => {
    setIsSimulatingLoad(true);
    setProcessedRequests(0);
    let intervalTime = simType === 'sync' ? 80 : 15;
    let poolMax = simType === 'sync' ? 10 : 80;
    let completed = 0;
    const timer = setInterval(() => {
      completed += 4;
      if (completed >= 100) { clearInterval(timer); setIsSimulatingLoad(false); setActiveConnections(0); setAverageResponseTime(simType === 'sync' ? 1420 : 84); }
      setProcessedRequests(completed);
      setActiveConnections(Math.min(poolMax, 100 - completed + 2));
    }, intervalTime);
  };

  const throwSimulatedException = () => {
    const errors = ["ValueError: Cryptographic validation of QR code signature failed.", "PostgreSQL Connection Pool Timeout", "SQLAlchemy.exc.IntegrityError: duplicate key violates unique constraint 'u_idx_idem_key'"];
    const targetErr = errors[Math.floor(Math.random() * errors.length)];
    const newErrId = `sentry-err-${Math.random().toString(16).substring(2, 6)}`;
    setSentryLogs(prev => [{ id: newErrId, error: targetErr, timestamp: new Date().toISOString(), file: "app/api/endpoints/coupons.py:84", breadcrumbs: ["12:50:01 Route /claim called", "12:50:02 Parsing coupon transaction"], traceback: `Traceback:\n${targetErr}`, resolved: false }, ...prev]);
    onTriggerSecurityLog({ id: `sentry-dispatch-${Date.now()}`, timestamp: new Date().toISOString(), key: 'SENTRY_CAPTURE_ERROR', campaignTitle: 'SYSTEM PANIC EVENT', status: 'FRAUD_BLOCKED', responseCode: 500, details: `Sentry notification: ${targetErr.substring(0, 60)}...` });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Server className="w-5 h-5 text-[#D4A373]" /><h3 className="text-sm font-bold text-[#F3EFE0]">FastAPI Async Connection Pool</h3></div>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${simType === 'async' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{simType === 'async' ? 'Async/Await Enabled' : 'Sync Blocking Pool'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-[#100B08] p-3 rounded-lg">
            <div><p className="text-zinc-500 text-[10px]">Active DB Sessions</p><p className="text-lg font-bold text-[#D4A373]">{activeConnections} / 100</p></div>
            <div><p className="text-zinc-500 text-[10px]">Processed scans</p><p className="text-lg font-bold text-cyan-400">{processedRequests} %</p></div>
            <div><p className="text-zinc-500 text-[10px]">Avg Response SLA</p><p className="text-lg font-bold text-emerald-400">{averageResponseTime > 0 ? `${averageResponseTime} ms` : '-- ms'}</p></div>
            <div><p className="text-zinc-500 text-[10px]">CPU Status</p><p className={`text-lg font-bold ${activeConnections > 40 && simType === 'sync' ? 'text-red-500' : 'text-emerald-400'}`}>{activeConnections > 40 && simType === 'sync' ? '92% LOCK' : '12% SAFE'}</p></div>
          </div>
          {isSimulatingLoad && (<div className="space-y-1"><div className="flex justify-between text-[10px]"><span>SIMULATING 100 PARALLEL CLICKS...</span><span>{processedRequests}%</span></div><div className="w-full bg-[#100B08] rounded-full h-2"><div className={`h-full transition-all ${simType === 'async' ? 'bg-emerald-400' : 'bg-red-500'}`} style={{ width: `${processedRequests}%` }}></div></div></div>)}
          <div className="flex items-center gap-3">
            <div className="flex bg-[#100B08] p-1 rounded-lg">
              <button onClick={() => setSimType('async')} className={`px-3 py-1 text-xs rounded ${simType === 'async' ? 'bg-[#D4A373] text-[#100B08]' : 'text-zinc-400'}`}>Async Workers</button>
              <button onClick={() => setSimType('sync')} className={`px-3 py-1 text-xs rounded ${simType === 'sync' ? 'bg-red-500/20 text-red-400' : 'text-zinc-400'}`}>Sync ThreadPool</button>
            </div>
            <button onClick={runLoadSimulation} disabled={isSimulatingLoad} className="flex-1 bg-[#D4A373] disabled:bg-zinc-800 text-[#100B08] font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1"><Play className="w-4 h-4" /> Simulate 100 Scans Load</button>
          </div>
        </div>

        <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Sliders className="w-5 h-5 text-[#D4A373]" /><h3 className="text-sm font-bold text-[#F3EFE0]">Rate Limiter Sandbox</h3></div>
            {cooloffSeconds > 0 ? <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 animate-pulse">RATE_LIMIT_COOLDOWN: {cooloffSeconds}s</span> : <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">LIMIT: 3 attempts/window</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleRateLimitedRequest('claim')} className="bg-[#100B08] hover:bg-[#1A120B] border border-[#D4A373]/30 text-[#D4A373] py-2 px-3 rounded-lg text-xs font-bold">POST /claim</button>
            <button onClick={() => handleRateLimitedRequest('redeem')} className="bg-[#100B08] hover:bg-[#1A120B] border border-[#D4A373]/30 text-[#D4A373] py-2 px-3 rounded-lg text-xs font-bold">POST /redeem</button>
          </div>
          <div className="bg-[#100B08] p-3 rounded-lg text-[10px] font-mono h-24 overflow-y-auto space-y-1">
            {rateLimitLogs.length === 0 ? <span className="text-zinc-600">Click endpoints to test rate limiting</span> : rateLimitLogs.map((log, i) => <div key={i} className={log.includes('🚨') || log.includes('⛔') ? 'text-red-400' : 'text-zinc-300'}>{log}</div>)}
          </div>
        </div>
      </div>

      <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertOctagon className="w-5 h-5 text-red-500" /><div><h3 className="text-sm font-bold text-[#F3EFE0]">Sentry Telemetry Error Capture</h3></div></div>
          <button onClick={throwSimulatedException} className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Flame className="w-4 h-4" /> Throw Exception</button>
        </div>
        <div className="bg-[#100B08] rounded-xl border border-[#D4A373]/10 overflow-hidden text-xs font-mono">
          <div className="grid grid-cols-12 bg-[#1A120B] px-4 py-2 text-[10px] text-zinc-500">
            <span className="col-span-3">Exception</span><span className="col-span-3">File</span><span className="col-span-4">Error</span><span className="col-span-2 text-right">Status</span>
          </div>
          <div className="divide-y divide-zinc-900 max-h-56 overflow-y-auto">
            {sentryLogs.map((log) => (<div key={log.id} className="grid grid-cols-12 px-4 py-3 items-center"><div className="col-span-3 text-red-400 truncate">{log.id}</div><div className="col-span-3 text-zinc-400 truncate">{log.file}</div><div className="col-span-4 text-zinc-500 truncate">{log.error.substring(0, 50)}...</div><div className="col-span-2 text-right"><span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px]">UNRESOLVED</span></div></div>))}
          </div>
        </div>
      </div>
    </div>
  )
}