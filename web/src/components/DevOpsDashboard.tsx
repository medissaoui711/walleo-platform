import React, { useState, useEffect } from 'react'
import { Activity, Database, AlertTriangle, CheckCircle2, Cpu, TrendingUp, Clock, Flame, Gauge, Terminal } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DevOpsDashboard({ onTriggerSecurityLog }: { onTriggerSecurityLog: (log: any) => void }) {
  const [cpuUsage, setCpuUsage] = useState(14);
  const [qps, setQps] = useState(8);
  const [avgLatency, setAvgLatency] = useState(1.8);
  const [activeConnections, setActiveConnections] = useState(6);
  const [isSimulationActive, setIsSimulationActive] = useState<string | null>(null);
  const [alerts, setAlerts] = useState([{ id: 'alt-disk', name: 'PostgreSQLDiskSpaceWarning', severity: 'warning', message: 'Disk usage exceeds 78%', active: true }]);
  const [prometheusLogs, setPrometheusLogs] = useState<string[]>([`[Prometheus] Initializing scrape targets...`]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    const data = [];
    for (let i = 20; i >= 0; i--) data.push({ time: new Date(Date.now() - i * 5000).toLocaleTimeString(), qps: Math.floor(Math.random() * 6) + 5, latency: 1.5, cpu: 12 });
    setTimeSeriesData(data);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSeriesData(prev => {
        const nextData = [...prev.slice(1)];
        nextData.push({ time: new Date().toLocaleTimeString(), qps: isSimulationActive === 'load_storm' ? Math.floor(Math.random() * 40) + 140 : qps, latency: isSimulationActive === 'slow_query' ? 740 : avgLatency, cpu: isSimulationActive === 'load_storm' ? 88 : cpuUsage });
        return nextData;
      });
      if (Math.random() > 0.7) setPrometheusLogs(prev => [`[Scraper] QPS=${qps}, latency=${avgLatency}ms`, ...prev.slice(0, 40)]);
    }, 4000);
    return () => clearInterval(timer);
  }, [isSimulationActive, qps, avgLatency]);

  const handleStartSimulation = (mode: 'load_storm' | 'conn_leak' | 'slow_query') => {
    setIsSimulationActive(mode);
    if (mode === 'load_storm') { setCpuUsage(88); setQps(164); setAvgLatency(5.4); setAlerts(prev => [{ id: 'alt-storm', name: 'PostgresQPSAnomaly', severity: 'warning', message: 'Throughput exceeded threshold', active: true }, ...prev]); }
    if (mode === 'conn_leak') { setActiveConnections(48); setAlerts(prev => [{ id: 'alt-conn', name: 'ConnectionPoolExhausted', severity: 'critical', message: 'Pool capacity exceeded', active: true }, ...prev]); }
    if (mode === 'slow_query') { setAvgLatency(740.2); setCpuUsage(56); setAlerts(prev => [{ id: 'alt-slow', name: 'SlowQueryReport', severity: 'warning', message: 'Unindexed scan detected', active: true }, ...prev]); }
    onTriggerSecurityLog({ id: `sim-${Date.now()}`, timestamp: new Date().toISOString(), key: `SIM_${mode}`, campaignTitle: 'DevOps', status: 'SUCCESS', responseCode: 200, details: `Simulation ${mode} triggered` });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1A120B] border border-[#D4A373]/20 rounded-xl p-5">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#F3EFE0]">DevOps & Telemetry Dashboard</h3>
          <div className="flex gap-2">
            <button onClick={() => handleStartSimulation('load_storm')} className="bg-amber-500/10 text-[#D4A373] text-[10px] px-2 py-1 rounded"><Flame className="w-3 h-3 inline" /> Load Storm</button>
            <button onClick={() => handleStartSimulation('conn_leak')} className="bg-red-500/10 text-red-400 text-[10px] px-2 py-1 rounded"><AlertTriangle className="w-3 h-3 inline" /> Pool Leak</button>
            <button onClick={() => handleStartSimulation('slow_query')} className="bg-[#100B08] text-zinc-400 text-[10px] px-2 py-1 rounded"><Clock className="w-3 h-3 inline" /> Slow Query</button>
            {isSimulationActive && <button onClick={() => { setIsSimulationActive(null); setCpuUsage(13); setQps(6); setAvgLatency(1.6); setActiveConnections(6); }} className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-1 rounded"><CheckCircle2 className="w-3 h-3 inline" /> Reset</button>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A120B] p-4 rounded-xl"><span className="text-[10px] text-zinc-500">QPS</span><div className="text-xl font-mono font-bold">{qps}</div></div>
        <div className="bg-[#1A120B] p-4 rounded-xl"><span className="text-[10px] text-zinc-500">Latency</span><div className={`text-xl font-mono font-bold ${avgLatency > 100 ? 'text-red-500' : 'text-emerald-500'}`}>{avgLatency} ms</div></div>
        <div className="bg-[#1A120B] p-4 rounded-xl"><span className="text-[10px] text-zinc-500">CPU</span><div className={`text-xl font-mono font-bold ${cpuUsage > 80 ? 'text-red-500' : 'text-white'}`}>{cpuUsage}%</div></div>
        <div className="bg-[#1A120B] p-4 rounded-xl"><span className="text-[10px] text-zinc-500">Connections</span><div className={`text-xl font-mono font-bold ${activeConnections > 40 ? 'text-red-500' : 'text-[#D4A373]'}`}>{activeConnections}/50</div></div>
      </div>

      <div className="bg-[#1A120B] rounded-xl p-5">
        <h4 className="text-sm font-bold mb-3">Live Telemetry</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timeSeriesData}>
            <CartesianGrid stroke="#221710" />
            <XAxis dataKey="time" stroke="#52525b" fontSize={9} />
            <YAxis stroke="#52525b" fontSize={9} />
            <Tooltip contentStyle={{ backgroundColor: '#100B08', borderColor: '#D4A373' }} />
            <Area type="monotone" dataKey="qps" stroke="#D4A373" fill="#D4A373" fillOpacity={0.2} />
            <Area type="monotone" dataKey="cpu" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1A120B] rounded-xl p-5">
          <h4 className="text-xs font-bold text-[#D4A373] mb-3">Alerts ({alerts.filter(a => a.active).length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">{alerts.filter(a => a.active).map(alert => (<div key={alert.id} className="p-2 rounded bg-red-500/5 border border-red-500/20"><div className="flex justify-between"><span className="text-red-400 text-[10px]">{alert.name}</span><span className="text-[9px] text-zinc-500">{alert.severity}</span></div><p className="text-[10px] text-zinc-400">{alert.message}</p></div>))}</div>
        </div>
        <div className="bg-[#1A120B] rounded-xl p-5">
          <h4 className="text-xs font-bold text-[#D4A373] mb-3">Prometheus Logs</h4>
          <div className="bg-[#100B08] p-3 rounded-lg text-[10px] font-mono h-32 overflow-y-auto space-y-1">{prometheusLogs.map((log, i) => <div key={i} className="text-zinc-400">{log}</div>)}</div>
        </div>
      </div>
    </div>
  )
}