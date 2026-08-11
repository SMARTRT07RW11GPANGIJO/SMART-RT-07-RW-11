import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Bot,
  Zap,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Play,
  RefreshCw,
  Copy,
  Terminal,
  Database,
  Users,
  Search,
  KeyRound,
  FileCheck,
  Send,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';
import { getAllAITools } from '../ai/AIToolRegistry';
import { ToolExecutor } from '../ai/ToolExecutor';
import { AutomationEngine } from '../automation/AutomationEngine';
import { NotificationQueueService } from '../automation/NotificationQueueService';
import { runComprehensiveSecurityTestSuite } from '../services/securityTestRunnerService';
import { AIToolDefinition, ToolExecutionResult, NotificationQueueItem, ScheduledWorkflowRule } from '../types/aiTools';
import { UserRole } from '../types/rt';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  userName?: string;
}

export function AIToolsAutomationModal({ isOpen, onClose, currentRole, userName = 'Pengurus RT' }: Props) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'executor' | 'automation' | 'queue' | 'security' | 'gas'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Tool Executor Testing State
  const [testToolId, setTestToolId] = useState<string>('getMyProfile');
  const [testArgs, setTestArgs] = useState<string>('{}');
  const [testConfirmed, setTestConfirmed] = useState<boolean>(false);
  const [executorResult, setExecutorResult] = useState<ToolExecutionResult | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);

  // Automation Engine State
  const [eventType, setEventType] = useState<string>('LETTER_APPROVED');
  const [recordId, setRecordId] = useState<string>('SRT-2026-0089');
  const [automationLog, setAutomationLog] = useState<string[]>([]);
  const [triggeringAutomation, setTriggeringAutomation] = useState<boolean>(false);
  const [scheduledRules, setScheduledRules] = useState<ScheduledWorkflowRule[]>([]);

  // Queue Monitor State
  const [queueItems, setQueueItems] = useState<NotificationQueueItem[]>([]);
  const [processingQueue, setProcessingQueue] = useState<boolean>(false);

  // Security Test State
  const [securityReport, setSecurityReport] = useState<any>(null);
  const [runningTests, setRunningTests] = useState<boolean>(false);

  // Load Initial Data
  useEffect(() => {
    if (isOpen) {
      refreshQueue();
      setScheduledRules(AutomationEngine.getScheduledRules());
    }
  }, [isOpen]);

  const refreshQueue = () => {
    setQueueItems(NotificationQueueService.getQueueItems());
  };

  if (!isOpen) return null;

  const toolsList = getAllAITools();

  const filteredTools = toolsList.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handle Tool Executor Run
  const handleRunTool = async () => {
    setExecuting(true);
    setExecutorResult(null);

    try {
      let parsedArgs = {};
      if (testArgs.trim()) {
        parsedArgs = JSON.parse(testArgs);
      }

      const res = await ToolExecutor.executeTool(testToolId, parsedArgs, {
        session: {
          sessionId: `TEST-SESS-${Date.now()}`,
          userId: 'WRG-001',
          residentId: 'WRG-001',
          role: currentRole,
          userName: userName,
          isValidSession: true
        },
        confirmed: testConfirmed,
        userPrompt: 'Test Execution from AI Tools Dashboard'
      });

      setExecutorResult(res);
    } catch (e: any) {
      setExecutorResult({
        success: false,
        status: 'ERROR',
        toolId: testToolId,
        error: `Input arguments JSON tidak valid: ${e.message}`
      });
    } finally {
      setExecuting(false);
    }
  };

  // Handle Trigger Automation Event
  const handleTriggerAutomation = async () => {
    setTriggeringAutomation(true);
    setAutomationLog([]);

    const res = await AutomationEngine.triggerEvent(eventType as any, recordId, userName, {
      nama_pemohon: 'Ahmad Subagyo',
      jenis_surat: 'Surat Pengantar KTP',
      nomor_surat: '07/RT07/VIII/2026',
      no_hp: '081234567890',
      kategori: 'Kebersihan',
      judul: 'Penataan Sampah Organik',
      isi: 'Himbauan pemilahan sampah organik dan anorganik.',
      broadcastWA: true
    });

    setAutomationLog(res.workflowStepsExecuted);
    setTriggeringAutomation(false);
    refreshQueue();
  };

  // Handle Process Queue
  const handleProcessQueue = async () => {
    setProcessingQueue(true);
    await NotificationQueueService.processNotificationQueue();
    refreshQueue();
    setProcessingQueue(false);
  };

  // Handle Security Suite Run
  const handleRunSecuritySuite = () => {
    setRunningTests(true);
    setTimeout(() => {
      const rep = runComprehensiveSecurityTestSuite(currentRole, userName);
      setSecurityReport(rep);
      setRunningTests(false);
    }, 400);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">LOW</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">TAHAP 8I — AI Tools & Automation Engine</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Tool Registry Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Eksekusi Terkontrol via Tool Registry, Risk Engine, Confirmation Intercept & Queue Notifikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 overflow-x-auto">
          {[
            { id: 'catalog', label: '1. AI Tool Catalog (20)', icon: Layers },
            { id: 'executor', label: '2. Tool Executor Tester', icon: Play },
            { id: 'automation', label: '3. Automation Workflows', icon: Zap },
            { id: 'queue', label: '4. Notification Queue', icon: Bell },
            { id: 'security', label: '5. 20 Security Tests', icon: ShieldCheck },
            { id: 'gas', label: '6. GAS Code (8I)', icon: CodeIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama tool atau deskripsi..."
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {['ALL', 'READ', 'TRANSACTION', 'DOCUMENT', 'COMMUNICATION', 'ADMIN'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.toolId}
                    className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-blue-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{tool.toolId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {tool.category}
                          </span>
                        </div>
                        {getRiskBadge(tool.riskLevel)}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{tool.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Permission:</span> {tool.permission}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Konfirmasi:</span>{' '}
                        {tool.confirmationRequired ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">Wajib</span>
                        ) : (
                          'Otomatis'
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Roles:</span> {tool.allowedRoles.join(', ')}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Rate Limit:</span> {tool.rateLimit}/m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EXECUTOR TESTER */}
          {activeTab === 'executor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-500" /> Form Uji Eksekusi Tool
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Registered Tool</label>
                  <select
                    value={testToolId}
                    onChange={(e) => setTestToolId(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  >
                    {toolsList.map((t) => (
                      <option key={t.toolId} value={t.toolId}>
                        [{t.category}] {t.toolId} ({t.riskLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Input Arguments (JSON Format)
                  </label>
                  <textarea
                    rows={4}
                    value={testArgs}
                    onChange={(e) => setTestArgs(e.target.value)}
                    placeholder='{"jenisSurat": "Surat Pengantar KTP", "keperluan": "Pembuatan KTP Baru"}'
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    *Self Data Protection: Jika tool membutuhkan ownership, sistem akan memaksa residentId milik sesi terautentikasi!
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="chkConfirm"
                    checked={testConfirmed}
                    onChange={(e) => setTestConfirmed(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="chkConfirm" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Konfirmasi Manusia Diberikan (`confirmed = true`)
                  </label>
                </div>

                <button
                  onClick={handleRunTool}
                  disabled={executing}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Eksekusi via ToolExecutor Engine
                </button>
              </div>

              {/* Result Viewer */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" /> Hasil Eksekusi & Intercept
                </h3>

                {executorResult ? (
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto space-y-3 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-amber-400">STATUS: {executorResult.status}</span>
                      <span className="text-[10px] text-slate-400">Tool: {executorResult.toolId}</span>
                    </div>

                    {executorResult.status === 'CONFIRMATION_REQUIRED' && (
                      <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-300 space-y-2">
                        <div className="font-bold flex items-center gap-2 text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-400" /> Konfirmasi Diperlukan (Human Intercept)
                        </div>
                        <p className="text-[11px]">{executorResult.confirmationPrompt?.description}</p>
                        <div className="bg-black/40 p-2 rounded text-[10px] text-amber-200">
                          Payload: {JSON.stringify(executorResult.confirmationPrompt?.payload)}
                        </div>
                      </div>
                    )}

                    {executorResult.error && (
                      <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-red-300">
                        Error: {executorResult.error}
                      </div>
                    )}

                    {executorResult.data && (
                      <div>
                        <div className="text-emerald-400 font-bold mb-1">Sanitized Output Data:</div>
                        <pre className="text-[11px] text-emerald-200 bg-black/40 p-3 rounded">
                          {JSON.stringify(executorResult.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                    Pilih tool di sebelah kiri dan klik "Eksekusi via ToolExecutor Engine" untuk menguji alur otorisasi dan konfirmasi.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUTOMATION WORKFLOWS */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Event-Driven Automation Trigger
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="LETTER_APPROVED">LETTER_APPROVED</option>
                      <option value="COMPLAINT_CREATED">COMPLAINT_CREATED</option>
                      <option value="PAYMENT_RECORDED">PAYMENT_RECORDED</option>
                      <option value="ANNOUNCEMENT_CREATED">ANNOUNCEMENT_CREATED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Record ID</label>
                    <input
                      type="text"
                      value={recordId}
                      onChange={(e) => setRecordId(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleTriggerAutomation}
                      disabled={triggeringAutomation}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
                    >
                      {triggeringAutomation ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Picu Event Workflow
                    </button>
                  </div>
                </div>

                {automationLog.length > 0 && (
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-1.5 border border-slate-800">
                    <div className="text-amber-400 font-bold mb-2">Workflow Execution Log:</div>
                    {automationLog.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduled Rules Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-500" /> Scheduled Automation Rules
                </h3>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        <th className="p-3">Nama Workflow</th>
                        <th className="p-3">Jadwal</th>
                        <th className="p-3">Target Roles</th>
                        <th className="p-3">Terakhir Jalan</th>
                        <th className="p-3">Jadwal Berikutnya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {scheduledRules.map((rule) => (
                        <tr key={rule.ruleId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{rule.name}</td>
                          <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{rule.schedule}</td>
                          <td className="p-3">{rule.targetRoles.join(', ')}</td>
                          <td className="p-3 text-slate-500">{rule.lastRun || '-'}</td>
                          <td className="p-3 text-emerald-600 font-medium">{rule.nextRun}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUEUE MONITOR */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-500" /> Outbound Notification Queue ({queueItems.length})
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleProcessQueue}
                    disabled={processingQueue}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${processingQueue ? 'animate-spin' : ''}`} />
                    Proses Queue (Retry Engine)
                  </button>
                  <button
                    onClick={() => {
                      NotificationQueueService.clearQueue();
                      refreshQueue();
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200"
                  >
                    Bersihkan Queue
                  </button>
                </div>
              </div>

              {queueItems.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                  Tidak ada antrean notifikasi aktif saat ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {queueItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{item.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'SENT'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : item.status === 'FAILED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Rec: {item.recipient} ({item.channel})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{item.message}</p>
                      </div>

                      <div className="text-right text-[10px] text-slate-400 space-y-1 whitespace-nowrap">
                        <div>Attempts: {item.attempts}/{item.maxAttempts}</div>
                        <div>Sch: {item.scheduledAt.slice(11, 19)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: 20 SECURITY TESTS */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Suite Uji Keamanan Tahap 8I (20 Skenario)</h3>
                  <p className="text-xs text-slate-500">
                    Memverifikasi Otorisasi, Self Data Protection, Anti Injection & Multi-layer Security
                  </p>
                </div>
                <button
                  onClick={handleRunSecuritySuite}
                  disabled={runningTests}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-2"
                >
                  {runningTests ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Jalankan 20 Uji Keamanan
                </button>
              </div>

              {securityReport && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-xs text-slate-500">Score Keamanan</div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{securityReport.securityScore}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-xs text-slate-500">Total Pengujian</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{securityReport.totalTests}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-xs text-slate-500">Lulus (PASS)</div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{securityReport.passedCount}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-xs text-slate-500">Gagal (FAIL)</div>
                      <div className="text-xl font-bold text-red-600 dark:text-red-400">{securityReport.failedCount}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                    {securityReport.gateMessage}
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {securityReport.logs
                      .filter((l: any) => l.testId.startsWith('SEC-8I'))
                      .map((log: any) => (
                        <div
                          key={log.testId}
                          className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{log.testId}</span>
                              <span className="font-semibold text-slate-900 dark:text-white">{log.testName}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{log.notes}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {log.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: GAS CODE */}
          {activeTab === 'gas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" /> Google Apps Script Backend (8I)
                </h3>
              </div>

              <p className="text-xs text-slate-500">
                Kode Google Apps Script di bawah ini mencerminkan logika Tool Registry, ToolExecutor, Automation Engine, dan Queue Notifikasi untuk deployment di ScriptProperties.
              </p>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
                <pre>
{`/**
 * SMART RT 07 RW 11 PERUM GPA NGIJO - TAHAP 8I
 * Google Apps Script - ToolExecutor & Automation Engine
 */

function executeGAS_AITool(toolId, args, context) {
  var registry = getGAS_AIToolRegistry();
  var tool = registry[toolId];
  if (!tool) {
    return { success: false, error: "Tool not found in registry" };
  }
  
  // 1. Authorize Role & Permission
  if (tool.allowedRoles.indexOf(context.role) === -1) {
    return { success: false, error: "Role " + context.role + " strictly prohibited" };
  }
  
  // 2. Self Data Protection override
  if (tool.requiresOwnership) {
    args.residentId = context.residentId || context.userId;
  }
  
  // 3. Human Confirmation Check
  if (tool.confirmationRequired && !context.confirmed) {
    return {
      status: 'CONFIRMATION_REQUIRED',
      toolId: toolId,
      riskLevel: tool.riskLevel,
      payload: args
    };
  }
  
  // 4. Execute via DAL
  return executeDALFunction(toolId, args, context);
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeIcon(props: any) {
  return <Terminal {...props} />;
}
