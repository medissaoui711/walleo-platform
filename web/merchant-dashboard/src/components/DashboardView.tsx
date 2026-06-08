import React, { useState } from 'react'
import {
  TrendingUp,
  Tag,
  QrCode,
  Award,
  Trash2,
  Plus,
  Play,
  Square,
  AlertCircle,
  Briefcase,
  CheckCircle,
  HelpCircle,
  Send,
  Sparkles
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { Campaign, DatabaseState } from '../types'

interface DashboardViewProps {
  dbState: DatabaseState;
  setDbState: React.Dispatch<React.SetStateAction<DatabaseState>>;
  totpToken: string;
  previousTotpToken: string;
  totpTimeLeft: number;
}

export default function DashboardView({ 
  dbState, 
  setDbState,
  totpToken,
  previousTotpToken,
  totpTimeLeft 
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'analytics' | 'support' | 'settings' | 'terminal'>('dashboard');

  // Campaign Form State
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignTitleAr, setNewCampaignTitleAr] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');
  const [newCampaignDescAr, setNewCampaignDescAr] = useState('');
  const [newCampaignReward, setNewCampaignReward] = useState('');
  const [newCampaignRewardAr, setNewCampaignRewardAr] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Settings State
  const [merchantName, setMerchantName] = useState('Walleo Coffee Co.');
  const [merchantNameAr, setMerchantNameAr] = useState('قهوة واليو');
  const [merchantEmail, setMerchantEmail] = useState('contact@walleo.sa');
  const [geofenceRadius, setGeofenceRadius] = useState(150);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Calculate dynamic stats
  const activeCampaignsCount = dbState.campaigns.filter(c => c.status === 'active').length;
  const totalScans = dbState.scans.length + dbState.campaigns.reduce((sum, c) => sum + c.scans_count, 0);
  const rewardsClaimedTotal = dbState.coupons.filter(c => c.is_reward_unlocked).length + dbState.campaigns.reduce((sum, c) => sum + c.rewards_claimed, 0);
  const expectedRevenueSR = activeCampaignsCount * 12500 + totalScans * 15;

  // Activity chart data derived
  const dateMap: { [key: string]: { scans: number; points: number } } = {
    '06/02': { scans: 45, points: 225 },
    '06/03': { scans: 72, points: 360 },
    '06/04': { scans: 61, points: 305 },
    '06/05': { scans: 95, points: 475 },
    '06/06': { scans: 110, points: 550 },
    '06/07': { scans: 125, points: 625 },
    '06/08': { scans: 140, points: 700 },
  };

  dbState.scans.forEach(scan => {
    const dateStr = scan.timestamp.substring(5, 10).replace('-', '/');
    if (dateMap[dateStr]) {
      dateMap[dateStr].scans += 1;
      dateMap[dateStr].points += 50;
    } else {
      dateMap[dateStr] = { scans: 1, points: 50 };
    }
  });

  const chartData = Object.entries(dateMap).map(([date, val]) => ({
    date,
    scans: val.scans,
    points: val.points
  })).sort((a, b) => a.date.localeCompare(b.date));

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle || !newCampaignReward) return;

    const newProg: Campaign = {
      id: dbState.campaigns.length + 1,
      title: newCampaignTitle,
      title_ar: newCampaignTitleAr || newCampaignTitle,
      description: newCampaignDesc,
      description_ar: newCampaignDescAr || newCampaignDesc,
      stamps_required: 5,
      reward_description: newCampaignReward,
      reward_description_ar: newCampaignRewardAr || newCampaignReward,
      scans_count: 0,
      rewards_claimed: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setDbState(prev => ({
      ...prev,
      campaigns: [...prev.campaigns, newProg],
      coupons: [
        ...prev.coupons,
        {
          id: `wc-user-${Date.now()}`,
          campaign_id: newProg.id,
          merchant_name: merchantName,
          merchant_logo: '☕',
          stamps_collected: 0,
          stamps_required: 5,
          is_reward_unlocked: false,
          reward_description: newProg.reward_description,
        }
      ]
    }));

    setNewCampaignTitle('');
    setNewCampaignTitleAr('');
    setNewCampaignDesc('');
    setNewCampaignDescAr('');
    setNewCampaignReward('');
    setNewCampaignRewardAr('');
    setIsCreating(false);
  };

  const handleToggleCampaignStatus = (id: number) => {
    setDbState(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      )
    }));
  };

  const handleDeleteCampaign = (id: number) => {
    setDbState(prev => ({
      ...prev,
      campaigns: prev.campaigns.filter(c => c.id !== id),
      coupons: prev.coupons.filter(c => c.campaign_id !== id)
    }));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setDbState(prev => ({
      ...prev,
      support_tickets: [
        ...prev.support_tickets,
        {
          id: prev.support_tickets.length + 1,
          subject: ticketSubject,
          message: ticketMessage,
          status: 'open',
          created_at: new Date().toISOString()
        }
      ]
    }));

    setTicketSubject('');
    setTicketMessage('');
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-[#100B08] text-[#F3EFE0] overflow-hidden" id="dashboard_root">
      {/* Merchant Title & Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#D4A373]/20 px-6 py-4 bg-[#1A120B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#D4A373] to-[#A27B5C] flex items-center justify-center shadow-lg text-[#100B08] font-bold text-xl font-mono">
            W
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#F3EFE0] tracking-tight">{merchantName}</h1>
            <p className="text-xs text-[#D4A373] font-mono font-semibold">{merchantNameAr}</p>
          </div>
        </div>

        <div className="flex bg-[#100B08] rounded-lg p-1 border border-[#D4A373]/10">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#D4A373] text-[#100B08] shadow'
                : 'text-[#A5A19E] hover:text-[#F3EFE0]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-[#D4A373] text-[#100B08] shadow'
                : 'text-[#A5A19E] hover:text-[#F3EFE0]'
            }`}
          >
            Campaigns ({dbState.campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#D4A373] text-[#100B08] shadow'
                : 'text-[#A5A19E] hover:text-[#F3EFE0]'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'bg-[#D4A373] text-[#100B08] shadow'
                : 'text-[#A5A19E] hover:text-[#F3EFE0]'
            }`}
          >
            Support
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#D4A373] text-[#100B08] shadow'
                : 'text-[#A5A19E] hover:text-[#F3EFE0]'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-[#D4A373] text-[#100B08] shadow'
                : 'text-[#A5A19E] hover:text-[#F3EFE0]'
            }`}
          >
            📟 POS Terminal (TOTP)
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#A5A19E] font-medium uppercase tracking-wider">Active Campaigns</p>
                  <p className="text-2xl font-bold font-mono text-[#D4A373] mt-1">{activeCampaignsCount}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">Live in store</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#D4A373]/10 flex items-center justify-center text-[#D4A373]">
                  <Tag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#A5A19E] font-medium uppercase tracking-wider">Total Stamp Scans</p>
                  <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{totalScans}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">+12% from yesterday</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                  <QrCode className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#A5A19E] font-medium uppercase tracking-wider">Rewards Claimed</p>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{rewardsClaimedTotal}</p>
                  <p className="text-[10px] text-[#A5A19E] mt-1">8.5% claim rate</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#A5A19E] font-medium uppercase tracking-wider">Expected Revenue</p>
                  <p className="text-2xl font-bold font-mono text-amber-500 mt-1">
                    {expectedRevenueSR.toLocaleString()} <span className="text-xs">SR</span>
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-1">Estimated conversion rate</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#F3EFE0]">Scanner Stamping & Loyalty Activity</h3>
                  <p className="text-xs text-[#A5A19E]">Weekly scanning statistics sync (Updated live from Mobile app simulation)</p>
                </div>
                <div className="flex gap-2 text-[10px] font-mono text-[#D4A373] bg-[#100B08] px-3 py-1 rounded border border-[#D4A373]/10">
                  <span>● Scans</span>
                  <span className="text-emerald-400">● Points Earned</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="#3E2723/20" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#A5A19E" fontSize={11} tickLine={false} />
                    <YAxis stroke="#A5A19E" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A120B', borderColor: '#D4A373', color: '#F3EFE0' }} />
                    <Line type="monotone" dataKey="scans" stroke="#D4A373" strokeWidth={2} name="Scans" activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="points" stroke="#4CAF50" strokeWidth={2} name="Points" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-bold text-[#F3EFE0] mb-3">Live Scanning Feed (Auto-sync)</h3>
              {dbState.scans.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#A5A19E]">
                  No stamps collected in this session yet. Launch the Android Simulator on the right, toggle a QR scan to capture live feeds!
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {dbState.scans.slice().reverse().map((scan) => (
                    <div key={scan.id} className="flex justify-between items-center text-xs bg-[#100B08] p-3 rounded-lg border border-[#D4A373]/5">
                      <div className="flex items-center gap-3">
                        <span className="p-1 px-2 text-[10px] font-bold font-mono rounded bg-emerald-500/10 text-emerald-400">
                          SCANNED
                        </span>
                        <div>
                          <p className="font-semibold text-[#F3EFE0]">{scan.campaign_title}</p>
                          <p className="text-[10px] text-[#A5A19E]">Customer ID: <span className="font-mono">{scan.customer_id}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[#D4A373] font-bold font-mono">+{scan.stamps_incremented} Stamp</span>
                        <p className="text-[9px] text-[#A5A19E]">{new Date(scan.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Campaigns Manager */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F3EFE0]">Loyalty Campaigns</h3>
                <p className="text-xs text-[#A5A19E]">Create and manage multi-merchant QR stamp loyalty incentives.</p>
              </div>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center gap-1.5 bg-[#D4A373] text-[#100B08] hover:bg-[#D4A373]/80 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none"
              >
                <Plus className="w-4 h-4" />
                {isCreating ? 'View Active' : 'Create Campaign'}
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreateCampaign} className="bg-[#1A120B] border border-[#D4A373]/25 rounded-xl p-5 space-y-4 shadow-lg">
                <div className="border-b border-[#D4A373]/10 pb-2">
                  <h4 className="text-xs font-bold text-[#D4A373] uppercase tracking-wider">New Loyalty Campaign</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#A5A19E] mb-1 font-medium">Campaign Title (English)</label>
                    <input type="text" required value={newCampaignTitle} onChange={e => setNewCampaignTitle(e.target.value)} placeholder="e.g. Walleo Latte Card" className="w-full bg-[#100B08] border border-[#D4A373]/20 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#D4A373] focus:outline-none text-[#F3EFE0]" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A5A19E] mb-1 font-medium">Campaign Title (Arabic)</label>
                    <input type="text" required value={newCampaignTitleAr} onChange={e => setNewCampaignTitleAr(e.target.value)} placeholder="مثال: بطاقة ولاء لاتيه واليو" className="w-full bg-[#100B08] text-right border border-[#D4A373]/20 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#D4A373] focus:outline-none text-[#F3EFE0]" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A5A19E] mb-1 font-medium">Reward unlocked (English)</label>
                    <input type="text" required value={newCampaignReward} onChange={e => setNewCampaignReward(e.target.value)} placeholder="e.g. Free Spanish Latte Cup" className="w-full bg-[#100B08] border border-[#D4A373]/20 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#D4A373] focus:outline-none text-[#F3EFE0]" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A5A19E] mb-1 font-medium">Reward unlocked (Arabic)</label>
                    <input type="text" required value={newCampaignRewardAr} onChange={e => setNewCampaignRewardAr(e.target.value)} placeholder="مثال: كوب لاتيه إسباني مجاني" className="w-full bg-[#100B08] text-right border border-[#D4A373]/20 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#D4A373] focus:outline-none text-[#F3EFE0]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-[#A5A19E] mb-1 font-medium">Description (English)</label>
                    <textarea value={newCampaignDesc} onChange={e => setNewCampaignDesc(e.target.value)} rows={2} className="w-full bg-[#100B08] border border-[#D4A373]/20 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#D4A373] focus:outline-none text-[#F3EFE0]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-[#A5A19E] mb-1 font-medium">Description (Arabic)</label>
                    <textarea value={newCampaignDescAr} onChange={e => setNewCampaignDescAr(e.target.value)} rows={2} className="w-full bg-[#100B08] text-right border border-[#D4A373]/20 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#D4A373] focus:outline-none text-[#F3EFE0]" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsCreating(false)} className="border border-[#D4A373]/20 text-[#A5A19E] hover:text-[#F3EFE0] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="bg-[#D4A373] text-[#100B08] hover:bg-[#D4A373]/90 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer">Deploy Campaign</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbState.campaigns.map((prog) => (
                <div key={prog.id} className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 space-y-4 shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${prog.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                        {prog.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                      <span className="text-[10px] font-mono text-[#A5A19E]">{prog.stamps_required} Stamp Loop</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#F3EFE0]">{prog.title}</h4>
                      <p className="text-[11px] text-[#D4A373] font-mono">{prog.title_ar}</p>
                      <p className="text-xs text-[#A5A19E] line-clamp-2 mt-1">{prog.description}</p>
                      <p className="text-[11px] text-[#A5A19E]/80 text-right mt-1 font-sans">{prog.description_ar}</p>
                    </div>
                    <div className="bg-[#100B08] border border-[#D4A373]/10 p-3 rounded-lg mt-3 text-xs flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-[#A5A19E] uppercase tracking-wide">Incentive Reward</p>
                        <p className="font-semibold text-[#D4A373]">{prog.reward_description}</p>
                        <p className="text-[10px] text-[#A5A19E]">{prog.reward_description_ar}</p>
                      </div>
                      <Award className="w-5 h-5 text-[#D4A373]" />
                    </div>
                  </div>
                  <div className="border-t border-[#D4A373]/10 pt-4 mt-2 flex items-center justify-between">
                    <div className="flex gap-4 text-center">
                      <div><p className="text-[9px] text-[#A5A19E] uppercase font-mono">Scans</p><p className="text-xs font-bold text-cyan-400">{prog.scans_count}</p></div>
                      <div><p className="text-[9px] text-[#A5A19E] uppercase font-mono">Redeemed</p><p className="text-xs font-bold text-emerald-400">{prog.rewards_claimed}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleCampaignStatus(prog.id)} className={`p-1.5 rounded-lg border transition-all cursor-pointer ${prog.status === 'active' ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'}`}>
                        {prog.status === 'active' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDeleteCampaign(prog.id)} className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Analytics (مختصر) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#F3EFE0]">Detailed Loyalty Metrics</h3>
              <p className="text-xs text-[#A5A19E]">Examine scan distribution and reward claims over time.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md space-y-2">
                <h4 className="text-xs font-bold text-[#D4A373] uppercase tracking-wider">Scans Performance by Campaign</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height={224}>
                    <BarChart data={dbState.campaigns}>
                      <CartesianGrid stroke="#3E2723/20" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="title" stroke="#A5A19E" fontSize={9} tickLine={false} />
                      <YAxis stroke="#A5A19E" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A120B', borderColor: '#D4A373' }} />
                      <Legend />
                      <Bar dataKey="scans_count" fill="#D4A373" name="Loyalty Scans" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="rewards_claimed" fill="#4CAF50" name="Rewards Claimed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Customer Retention Model</h4>
                  <p className="text-xs text-[#A5A19E]">Walleo QR platform tracks customer loops by stamps state:</p>
                </div>
                <div className="space-y-3 my-4">
                  <div><div className="flex justify-between text-xs mb-1"><span>Loyalty Card Engaged (1+ Stamps)</span><span className="font-mono text-[#D4A373]">82%</span></div><div className="w-full bg-[#100B08] rounded-full h-1.5 overflow-hidden"><div className="h-full bg-[#D4A373]" style={{ width: '82%' }}></div></div></div>
                  <div><div className="flex justify-between text-xs mb-1"><span>Loyalty Cards Active (3+ Stamps)</span><span className="font-mono text-cyan-400">54%</span></div><div className="w-full bg-[#100B08] rounded-full h-1.5 overflow-hidden"><div className="h-full bg-cyan-400" style={{ width: '54%' }}></div></div></div>
                  <div><div className="flex justify-between text-xs mb-1"><span>Loyals Redeeming Bonuses (5 Stamps)</span><span className="font-mono text-emerald-400">28%</span></div><div className="w-full bg-[#100B08] rounded-full h-1.5 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: '28%' }}></div></div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Support (مختصر) */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div><h3 className="text-base font-bold text-[#F3EFE0]">Support Tickets</h3><p className="text-xs text-[#A5A19E]">Issue queries to Walleo core platform engineers.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md">
                <h4 className="text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-4">Submit Technical Inquiry</h4>
                {ticketSuccess && (<div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-lg flex items-center gap-2 mb-4"><CheckCircle className="w-4 h-4 text-emerald-400" /><p className="text-xs text-emerald-400">Ticket submitted!</p></div>)}
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <input type="text" required value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} placeholder="Subject" className="w-full bg-[#100B08] border border-[#D4A373]/20 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#D4A373] focus:outline-none text-[#F3EFE0]" />
                  <textarea required value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} rows={4} placeholder="Details..." className="w-full bg-[#100B08] border border-[#D4A373]/20 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#D4A373] focus:outline-none text-[#F3EFE0]" />
                  <button type="submit" className="w-full flex items-center justify-center gap-1.5 bg-[#D4A373] text-[#100B08] hover:bg-[#D4A373]/85 p-2 rounded-lg text-xs font-bold cursor-pointer"><Send className="w-3.5 h-3.5" /> Send Ticket</button>
                </form>
              </div>
              <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md">
                <h4 className="text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-3">Active Inquiries ({dbState.support_tickets.length})</h4>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {dbState.support_tickets.map(ticket => (<div key={ticket.id} className="bg-[#100B08] p-3 rounded-lg"><div className="flex justify-between"><span className="font-bold text-xs">{ticket.subject}</span><span className="px-2 py-0.5 text-[9px] rounded bg-amber-500/10 text-amber-400">open</span></div><p className="text-xs text-[#A5A19E] mt-1">{ticket.message}</p></div>))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 shadow-md space-y-5">
            <div><h3 className="text-sm font-bold text-[#F3EFE0]">Campaign & Geofence Coordinates Setup</h3><p className="text-xs text-[#A5A19E]">Verify multi-merchant proximity setups.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={merchantName} onChange={e => setMerchantName(e.target.value)} className="w-full bg-[#100B08] border border-[#D4A373]/20 rounded-lg p-2 text-xs text-[#F3EFE0]" placeholder="Store Name EN" />
              <input type="text" value={merchantNameAr} onChange={e => setMerchantNameAr(e.target.value)} className="w-full bg-[#100B08] text-right border border-[#D4A373]/20 rounded-lg p-2 text-xs text-[#F3EFE0]" placeholder="Store Name AR" />
              <input type="email" value={merchantEmail} onChange={e => setMerchantEmail(e.target.value)} className="w-full bg-[#100B08] border border-[#D4A373]/20 rounded-lg p-2 text-xs text-[#F3EFE0]" placeholder="Email" />
              <input type="number" value={geofenceRadius} onChange={e => setGeofenceRadius(Number(e.target.value))} className="w-full bg-[#100B08] border border-[#D4A373]/20 rounded-lg p-2 text-xs text-[#F3EFE0]" placeholder="Geofence Radius (m)" />
            </div>
            <div className="flex items-center justify-between border-t border-[#D4A373]/10 pt-4">
              <div><span className="text-xs font-bold text-[#F3EFE0]">Automated Offline Sync Caching</span><span className="text-[11px] text-[#A5A19E] block">Attempts auto sync every 15 seconds</span></div>
              <button onClick={() => setAutoSyncEnabled(!autoSyncEnabled)} className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${autoSyncEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>{autoSyncEnabled ? 'ACTIVE' : 'DEACTIVATED'}</button>
            </div>
          </div>
        )}

        {/* Tab 6: POS Terminal TOTP */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div className="bg-[#1A120B] border border-[#D4A373]/20 rounded-xl p-6 shadow-lg max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <span className="bg-[#D4A373]/10 text-[#D4A373] px-3 py-1 rounded-full text-[10px] font-mono uppercase">WALLEO SECURE DYNAMIC POS LEDGER</span>
                <h3 className="text-xl font-black text-white mt-2">جهاز النقاط الديناميكي (TOTP)</h3>
              </div>
              <div className="bg-[#100B08] border border-[#D4A373]/15 rounded-xl p-8 max-w-sm mx-auto text-center">
                <div className="relative p-4 bg-[#F3EFE0] rounded-xl">
                  <div className="w-44 h-44 bg-[#100B08] rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-6 gap-0.5">
                      {[...Array(36)].map((_, i) => (<div key={i} className={`w-2 h-2 ${Math.random() > 0.7 ? 'bg-[#100B08]' : 'bg-[#D4A373]'}`}></div>))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs"><span>TIME-WINDOW VALIDITY:</span><span className={`font-mono font-bold ${totpTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-[#D4A373]'}`}>{totpTimeLeft}s remaining</span></div>
                  <div className="w-full h-1 bg-[#1A120B] rounded-full mt-2"><div className={`h-full transition-all ${totpTimeLeft <= 5 ? 'bg-red-500' : 'bg-[#D4A373]'}`} style={{ width: `${(totpTimeLeft / 30) * 100}%` }}></div></div>
                </div>
                <div className="mt-4 text-left font-mono text-[10px] bg-[#1A120B] p-3 rounded-lg">
                  <div className="flex justify-between"><span>TOTP Token:</span><span className="text-emerald-400">{totpToken}</span></div>
                  <div className="flex justify-between mt-1"><span>Previous:</span><span className="text-zinc-400">{previousTotpToken || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}