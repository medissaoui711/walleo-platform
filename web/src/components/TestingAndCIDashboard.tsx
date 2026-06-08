import React, { useState } from 'react'
import { Play, CheckCircle2, Terminal, GitPullRequest, Shield, FileCode, Check } from 'lucide-react'

export default function TestingAndCIDashboard({ onTriggerSecurityLog }: { onTriggerSecurityLog: (log: any) => void }) {
  const [testConsoleLogs, setTestConsoleLogs] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'success'>('idle');
  const [activePipelineStep, setActivePipelineStep] = useState<number | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'pytest' | 'workflow_ci' | 'workflow_cd'>('pytest');

  const startPytestSuite = async () => {
    setIsRunningTests(true);
    setTestConsoleLogs([]);
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    setTestConsoleLogs(prev => [...prev, '============================= test session starts =============================']);
    await sleep(400);
    setTestConsoleLogs(prev => [...prev, 'collected 7 items']);
    for (let i = 1; i <= 7; i++) {
      await sleep(300);
      setTestConsoleLogs(prev => [...prev, `backend/tests/test_loyalty_engine.py::test_${i} PASSED [${i * 14}ms]`]);
    }
    await sleep(300);
    setTestConsoleLogs(prev => [...prev, '====================== 7 passed in 2.34s ======================']);
    setIsRunningTests(false);
    onTriggerSecurityLog({ id: `pytest-${Date.now()}`, timestamp: new Date().toISOString(), key: 'PYTEST_SUCCESS', campaignTitle: 'Test Suite', status: 'SUCCESS', responseCode: 200, details: 'All 7 tests passed' });
  };

  const startPipelineSimulation = async () => {
    setPipelineState('running');
    const steps = ['Checkout', 'Setup Python', 'Install deps', 'Run pytest', 'CD Deploy'];
    for (let i = 0; i < steps.length; i++) {
      setActivePipelineStep(i);
      await new Promise(r => setTimeout(r, 800));
    }
    setPipelineState('success');
    setActivePipelineStep(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white">Pytest Runner</h4>
          <div className="bg-[#100B08] rounded-xl p-3 h-64 overflow-y-auto font-mono text-[10px] text-zinc-400">
            {testConsoleLogs.map((log, i) => <div key={i} className={log.includes('PASSED') ? 'text-emerald-400' : ''}>{log}</div>)}
            {testConsoleLogs.length === 0 && <div className="text-zinc-600 text-center py-8">Click Run to execute test suite</div>}
          </div>
          <button onClick={startPytestSuite} disabled={isRunningTests} className="w-full bg-[#D4A373] disabled:bg-zinc-700 text-[#100B08] font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Play className="w-4 h-4" /> Run Pytest Suite</button>
        </div>

        <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white">CI/CD Pipeline</h4>
          <div className="space-y-3">
            {['Checkout', 'Setup Python', 'Install deps', 'Run pytest', 'CD Deploy'].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${activePipelineStep === i ? 'bg-amber-500 text-black animate-pulse' : pipelineState === 'success' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>{pipelineState === 'success' ? <Check className="w-3 h-3" /> : i + 1}</div>
                <span className={`text-xs ${activePipelineStep === i ? 'text-[#D4A373]' : 'text-zinc-400'}`}>{step}</span>
              </div>
            ))}
          </div>
          <button onClick={startPipelineSimulation} disabled={pipelineState === 'running'} className="w-full bg-[#1A120B] border border-[#D4A373]/30 text-[#D4A373] py-2 rounded-lg text-xs font-bold"><GitPullRequest className="w-4 h-4 inline mr-1" /> Simulate Push / PR Pipeline</button>
        </div>
      </div>

      <div className="bg-[#1A120B] border border-[#D4A373]/15 rounded-xl p-5 space-y-4">
        <div className="flex gap-1 bg-[#100B08] p-0.5 rounded-lg">
          <button onClick={() => setActiveCodeTab('pytest')} className={`px-3 py-1.5 text-xs rounded ${activeCodeTab === 'pytest' ? 'bg-[#D4A373] text-[#100B08]' : 'text-zinc-500'}`}>test_loyalty_engine.py</button>
          <button onClick={() => setActiveCodeTab('workflow_ci')} className={`px-3 py-1.5 text-xs rounded ${activeCodeTab === 'workflow_ci' ? 'bg-[#D4A373] text-[#100B08]' : 'text-zinc-500'}`}>backend-ci.yml</button>
          <button onClick={() => setActiveCodeTab('workflow_cd')} className={`px-3 py-1.5 text-xs rounded ${activeCodeTab === 'workflow_cd' ? 'bg-[#D4A373] text-[#100B08]' : 'text-zinc-500'}`}>backend-cd.yml</button>
        </div>
        <div className="bg-[#100B08] rounded-xl p-4 text-[10px] font-mono text-zinc-300 h-48 overflow-y-auto">
          {activeCodeTab === 'pytest' && <pre>{`def test_claim_idempotency_block():
    idem_key = f"idem_key_unique"
    res1 = process_stamp_claim(...)
    assert res1["status"] == "success"
    res2 = process_stamp_claim(...)
    assert res2["code"] == 409  # Replay blocked`}</pre>}
          {activeCodeTab === 'workflow_ci' && <pre>{`name: Backend CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - run: pip install pytest
    - run: pytest backend/tests/`}</pre>}
          {activeCodeTab === 'workflow_cd' && <pre>{`name: Backend CD
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - run: curl -X POST $RENDER_DEPLOY_HOOK_URL`}</pre>}
        </div>
      </div>
    </div>
  )
}