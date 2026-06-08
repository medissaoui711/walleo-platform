// App.tsx
import React, { useState } from 'react'
import { Shield, Terminal } from 'lucide-react'
import { DatabaseState } from './types'
import { INITIAL_CAMPAIGNS, INITIAL_COUPONS } from './mockData'
import DashboardView from './components/DashboardView'
import AndroidSimulatorView from './components/AndroidSimulatorView'
import BackendSimulatorDashboard from './components/BackendSimulatorDashboard'
import AndroidArchitectureDashboard from './components/AndroidArchitectureDashboard'
import DevOpsDashboard from './components/DevOpsDashboard'
import TestingAndCIDashboard from './components/TestingAndCIDashboard'

interface SecurityLog {
  id: string;
  timestamp: string;
  key: string;
  campaignTitle: string;
  status: 'SUCCESS' | 'FRAUD_BLOCKED';
  responseCode: number;
  details: string;
}

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'merchant_portal' | 'pillar_two_engine' | 'pillar_three_engine' | 'pillar_four_engine' | 'pillar_five_engine'>('merchant_portal');
  
  const [totpToken, setTotpToken] = useState(() => generateNewTotpToken());
  const [previousTotpToken, setPreviousTotpToken] = useState('');
  const [totpTimeLeft, setTotpTimeLeft] = useState(30);

  function generateNewTotpToken() {
    const chars = 'ABCDEF0123456789';
    let p1 = '', p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += chars[Math.floor(Math.random() * chars.length)];
      p2 += chars[Math.floor(Math.random() * chars.length)];
    }
    return `WLOX-TOTP-${p1}-${p2}`;
  }

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTotpTimeLeft(prev => {
        if (prev <= 1) {
          setTotpToken(current => {
            setPreviousTotpToken(current);
            return generateNewTotpToken();
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [dbState, setDbState] = useState<DatabaseState>({
    campaigns: INITIAL_CAMPAIGNS,
    scans: [],
    coupons: INITIAL_COUPONS,
    support_tickets: [{
      id: 1,
      subject: 'Database schema confirmation',
      message: 'Can you verify the indexes on the idempotency_key field?',
      status: 'open',
      created_at: '2026-06-08T12:00:00Z'
    }]
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([{
    id: 'init-log-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    key: 'idem_INIT_MOCK_882',
    campaignTitle: 'Walleo Coffee Stamp Card',
    status: 'SUCCESS',
    responseCode: 201,
    details: 'Initial system boot. Token accepted.'
  }]);

  const [activeConsoleTab, setActiveConsoleTab] = useState<'security_radar' | 'fastapi_code' | 'sql_console'>('security_radar');

  const handleNewSecurityLog = (newLog: SecurityLog) => {
    setSecurityLogs(prev => [newLog, ...prev]);
  };

  const getStatusColor = (status: 'SUCCESS' | 'FRAUD_BLOCKED') => {
    if (status === 'SUCCESS') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse';
  };

  return (
    <div className="min-h-screen bg-[#0C0806] text-[#F3EFE0] font-sans flex flex-col h-screen overflow-hidden">
      <header className="bg-[#100B08] border-b border-[#D4A373]/20 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-[#D4A373]" />
          <div>
            <h1 className="text-base font-extrabold tracking-tight">WALLEO DEVELOPER HUB</h1>
            <p className="text-[10px] text-[#A5A19E]">Secure Backend-to-Client End-To-End Simulation Center</p>
          </div>
        </div>

        <div className="flex gap-1 bg-[#0C0806] p-0.5 rounded-lg border border-[#D4A373]/20">
          <button onClick={() => setActiveWorkspaceTab('merchant_portal')} className={`px-3 py-1.5 text-xs rounded-md font-bold ${activeWorkspaceTab === 'merchant_portal' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>☕ R1: Merchant Portal</button>
          <button onClick={() => setActiveWorkspaceTab('pillar_two_engine')} className={`px-3 py-1.5 text-xs rounded-md font-bold ${activeWorkspaceTab === 'pillar_two_engine' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>⚡ R2: Rate-Limit</button>
          <button onClick={() => setActiveWorkspaceTab('pillar_three_engine')} className={`px-3 py-1.5 text-xs rounded-md font-bold ${activeWorkspaceTab === 'pillar_three_engine' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>📱 R3: Android Sync</button>
          <button onClick={() => setActiveWorkspaceTab('pillar_four_engine')} className={`px-3 py-1.5 text-xs rounded-md font-bold ${activeWorkspaceTab === 'pillar_four_engine' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>📊 R4: DevOps & Grafana</button>
          <button onClick={() => setActiveWorkspaceTab('pillar_five_engine')} className={`px-3 py-1.5 text-xs rounded-md font-bold ${activeWorkspaceTab === 'pillar_five_engine' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>🧪 R5: Tests & CI/CD</button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-1.5 items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">Secure Postgres Active</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden min-w-0">
        <section className="flex-1 border-r border-[#D4A373]/10 flex flex-col min-w-0 bg-[#0C0806]">
          <div className="flex-1 overflow-hidden">
            {activeWorkspaceTab === 'merchant_portal' ? (
              <DashboardView dbState={dbState} setDbState={setDbState} totpToken={totpToken} previousTotpToken={previousTotpToken} totpTimeLeft={totpTimeLeft} />
            ) : activeWorkspaceTab === 'pillar_two_engine' ? (
              <div className="flex-1 h-full overflow-y-auto p-6"><BackendSimulatorDashboard onTriggerSecurityLog={handleNewSecurityLog} /></div>
            ) : activeWorkspaceTab === 'pillar_three_engine' ? (
              <div className="flex-1 h-full overflow-y-auto p-6"><AndroidArchitectureDashboard dbState={dbState} setDbState={setDbState} onTriggerSecurityLog={handleNewSecurityLog} /></div>
            ) : activeWorkspaceTab === 'pillar_four_engine' ? (
              <div className="flex-1 h-full overflow-y-auto p-6"><DevOpsDashboard onTriggerSecurityLog={handleNewSecurityLog} /></div>
            ) : (
              <div className="flex-1 h-full overflow-y-auto p-6"><TestingAndCIDashboard onTriggerSecurityLog={handleNewSecurityLog} /></div>
            )}
          </div>

          <div className="h-64 border-t border-[#D4A373]/10 bg-[#100B08] flex flex-col font-mono">
            <div className="flex justify-between items-center bg-[#1A120B] px-4 py-2 border-b border-[#D4A373]/15">
              <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-[#D4A373]" /><span className="text-xs font-black">SECURITY RADAR</span></div>
              <div className="flex gap-1 bg-[#100B08] p-0.5 rounded border border-[#D4A373]/10">
                <button onClick={() => setActiveConsoleTab('security_radar')} className={`px-3 py-1 text-[10px] rounded font-semibold ${activeConsoleTab === 'security_radar' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>📡 Radar ({securityLogs.length})</button>
                <button onClick={() => setActiveConsoleTab('fastapi_code')} className={`px-3 py-1 text-[10px] rounded font-semibold ${activeConsoleTab === 'fastapi_code' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>🐍 FastAPI Code</button>
                <button onClick={() => setActiveConsoleTab('sql_console')} className={`px-3 py-1 text-[10px] rounded font-semibold ${activeConsoleTab === 'sql_console' ? 'bg-[#D4A373] text-[#100B08]' : 'text-[#A5A19E]'}`}>🗄️ SQL Schema</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono bg-[#0C0806]">
              {activeConsoleTab === 'security_radar' && securityLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#100B08] rounded border border-[#D4A373]/10 mb-2">
                  <div className="flex justify-between">
                    <span className={`px-2 py-0.5 text-[9px] rounded border ${getStatusColor(log.status)}`}>{log.status === 'SUCCESS' ? 'SUCCESS' : 'BLOCKED'}</span>
                    <span className="text-[10px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-[#A5A19E] mt-1">{log.details}</p>
                  <div className="text-[9px] text-zinc-500 mt-1">Key: {log.key}</div>
                </div>
              ))}
              {activeConsoleTab === 'fastapi_code' && <pre className="text-[10px]">{`@router.post("/scan-coupon")
def validate_stamp(payload: StampScanPayload, db: Session):
    if not verify_totp(payload.totp_token):
        raise HTTPException(403, "Expired QR")
    if db.query(IdempotencyLog).filter_by(key=payload.idem_key).first():
        raise HTTPException(409, "Duplicate")
    # ... commit stamp`}</pre>}
              {activeConsoleTab === 'sql_console' && <pre className="text-[10px]">{`CREATE TABLE idempotency_logs (
    id SERIAL PRIMARY KEY,
    key VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);`}</pre>}
            </div>
          </div>
        </section>

        <section className="w-[340px] bg-[#100B08] border-l border-[#D4A373]/15 flex flex-col shrink-0 overflow-y-auto">
          <AndroidSimulatorView dbState={dbState} setDbState={setDbState} onSecurityLog={handleNewSecurityLog} totpToken={totpToken} previousTotpToken={previousTotpToken} totpTimeLeft={totpTimeLeft} />
        </section>
      </main>
    </div>
  )
}