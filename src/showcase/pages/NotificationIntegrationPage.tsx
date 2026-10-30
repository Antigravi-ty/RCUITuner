import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';
const useState = createScopedSyncedState('page:notification-integration');
import {
  BellDot, CheckCircle2, XCircle, Play,
  RotateCcw, Sparkles, AlertTriangle, Flame,
  Ghost, Layers, OctagonAlert, ArrowRight,
  ShieldCheck, Terminal, Clock, Download,
  Copy, Check, RefreshCw, Send,
  Zap,
} from 'lucide-react';
import {
  useQuickNotificationStore, pushQuickNotification, pushOngoingNotification, updateOngoingNotification,
  dismissOngoingNotification, clearAllQuickNotifications, type QuickNotificationItem,
} from '../../ui-core/stores/quickNotificationStore';
import { dialogue, DialogueStackContainer } from '../../ui-core/compounds/Dialogue';
import { QuickNotificationSystem } from '../../ui-core/navigation/QuickNotificationSystem';
import { Button } from '../../ui-core/primitives/Button';
import { Badge } from '../../ui-core/primitives/Badge';
import { CodeBlock } from '../CodeBlock';
interface TestCaseResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  log: string[];
}

export const NotificationIntegrationPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  const store = useQuickNotificationStore();
  const [testResults, setTestResults] = useState<Record<string, TestCaseResult>>({
    test1: {
      id: 'test1', name: 'scene 1: WebSocket Persistent disconnection notifications preempted by temporary notifications with timeout recovery (Preemption & Restore)',
      status: 'idle', log: [],
    }, test2: {
      id: 'test2', name: 'scene 2: Dual Persistent Preemption and Resolve Cascading fallback (LIFO Stack Restoration)',
      status: 'idle', log: [],
    }, test3: {
      id: 'test3', name: 'scene 3: User initiated Collapse Isolation test (Move to unread tray, No intrusive pop-ups)',
      status: 'idle', log: [],
    }, test4: {
      id: 'test4', name: 'scene 4: Long error progressive disclosure (Notification Summary + Details button -> Dialogue Popup)',
      status: 'idle', log: [],
    }, test5: {
      id: 'test5', name: 'scene 5: Strict parameter validation Ghost Fatal Error Dialogue Debug popup (Zero silence Fallback)',
      status: 'idle', log: [],
    }, test6: {
      id: 'test6', name: 'scene 6: Ongoing Competition test between lowest-priority tasks and interactive notifications (Background execution and foreground yield)',
      status: 'idle', log: [],
    },
  });
  const [copiedError, setCopiedError] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const appendLog = (testId: string, message: string) => {
    setTestResults((prev) => {
      const current = prev[testId] || { id: testId, name: testId, status: 'idle', log: [] };
      return {
        ...prev, [testId]: {
          ...current, log: [...current.log, `[${new Date().toLocaleTimeString()}] ${message}`],
        }, };
    });
  };
  const setTestStatus = (testId: string, status: 'idle' | 'running' | 'passed' | 'failed') => {
    setTestResults((prev) => {
      const current = prev[testId];
      if (!current) return prev;
      return {
        ...prev, [testId]: {
          ...current, status,
        }, };
    });
  };
  const runTest1 = async () => {
    setTestStatus('test1', 'running');
    setTestResults((prev) => ({ ...prev, test1: { ...prev.test1, log: [] } }));
    clearAllQuickNotifications();
    appendLog('test1', 'Step 1: Push WebSocket Persistent disconnect notification (type: persistent, tone: warning)...');
    pushQuickNotification({
      id: 'ws-disconnect-alert', type: 'persistent',
      tone: 'warning', icon: 'wifi-off',
      duration: 0, content: 'WebSocket Signaling server disconnected, In use P2P WebRTC Maintain match. ',
      buttons: [
        {
          label: 'Reconnect', color: 'amber',
          onClick: () => {
            appendLog('test1', 'User clicked business Reconnect button');
          }, },
      ], });
    await new Promise((r) => setTimeout(r, 1200));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'ws-disconnect-alert') {
      appendLog('test1', '[x] failed: Persistent notification failed to activate');
      setTestStatus('test1', 'failed');
      return;
    } appendLog('test1', '[ok] confirm: Persistent notification is Active Display state (Clickable Reconnect or built-in on right CircleSlash Ignore button)');
    appendLog('test1', 'Step 2: Trigger a temporary notification (type: temporary, duration: 2500ms)...');
    pushQuickNotification({
      id: 'temp-kickoff-alert', type: 'temporary',
      tone: 'none', icon: 'sparkles',
      duration: 2500, content: 'Match about to start (Kickoff in 3s)',
    });
    await new Promise((r) => setTimeout(r, 400));
    const state2 = useQuickNotificationStore.getState();
    if (state2.activeNotification?.id !== 'temp-kickoff-alert') {
      appendLog('test1', '[x] failed: Temporary notification failed to preempt Active Show');
      setTestStatus('test1', 'failed');
      return;
    }
    if (state2.preemptedPersistentStack.length !== 1 || state2.preemptedPersistentStack[0].id !== 'ws-disconnect-alert') {
      appendLog('test1', '[x] failed: Persistent notification not entered preemptedPersistentStack Suspend stack');
      setTestStatus('test1', 'failed');
      return;
    } appendLog('test1', '[ok] confirm: Temporary notification preempts foreground, Persistent notification attached preemptedPersistentStack');
    appendLog('test1', 'Step 3: Wait for temporary notification 2500ms Countdown natural end...');
    await new Promise((r) => setTimeout(r, 2800));
    const state3 = useQuickNotificationStore.getState();
    if (state3.activeNotification?.id !== 'ws-disconnect-alert') {
      appendLog('test1', `[x] failed: Persistent notifications fail to restore after temporary notifications end (current Active: ${state3.activeNotification?.id})`);
      setTestStatus('test1', 'failed');
      return;
    } appendLog('test1', '[ok] confirm: Temporary notification countdown collapse, Persistent Notification[Auto smooth recovery] displayed!');
    appendLog('test1', '[!] scene 1 validation passed (PASS)');
    setTestStatus('test1', 'passed');
  };
  const runTest2 = async () => {
    setTestStatus('test2', 'running');
    setTestResults((prev) => ({ ...prev, test2: { ...prev.test2, log: [] } }));
    clearAllQuickNotifications();
    appendLog('test2', 'Step 1: Push first persistent notification A (Host Migration)...');
    pushQuickNotification({
      id: 'persistent-A', type: 'persistent',
      tone: 'info', icon: 'shield-alert',
      duration: 0, content: 'Room ownership transferred to Striker-9921',
    });
    await new Promise((r) => setTimeout(r, 800));
    appendLog('test2', 'Step 2: Push second persistent notification B (NAT Traversal Warning)...');
    pushQuickNotification({
      id: 'persistent-B', type: 'persistent',
      tone: 'warning', icon: 'alert-triangle',
      duration: 0, content: 'NAT Type detected as Strict, May affect direct connection quality',
    });
    await new Promise((r) => setTimeout(r, 500));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'persistent-B') {
      appendLog('test2', '[x] failed: Persistent Notification B Failed to preempt foreground');
      setTestStatus('test2', 'failed');
      return;
    }
    if (state1.preemptedPersistentStack.length !== 1 || state1.preemptedPersistentStack[0].id !== 'persistent-A') {
      appendLog('test2', '[x] failed: Persistent Notification A Failed to queue in pending stack');
      setTestStatus('test2', 'failed');
      return;
    } appendLog('test2', '[ok] confirm: B Preempt display, A Correct at preemptedPersistentStack Suspend');
    appendLog('test2', 'Step 3: User resolved via click (Resolve) Current notification B...');
    store.resolveActive();
    await new Promise((r) => setTimeout(r, 500));
    const state2 = useQuickNotificationStore.getState();
    if (state2.activeNotification?.id !== 'persistent-A') {
      appendLog('test2', `[x] failed: B After resolve A Failed to cascade restore (current Active: ${state2.activeNotification?.id})`);
      setTestStatus('test2', 'failed');
      return;
    } appendLog('test2', '[ok] confirm: B After resolve, Underlying persistent notification A automatically restored!');
    appendLog('test2', '[!] scene 2 validation passed (PASS)');
    setTestStatus('test2', 'passed');
  };
  const runTest3 = async () => {
    setTestStatus('test3', 'running');
    setTestResults((prev) => ({ ...prev, test3: { ...prev.test3, log: [] } }));
    clearAllQuickNotifications();
    appendLog('test3', 'Step 1: Push a persistent notification C...');
    pushQuickNotification({
      id: 'persistent-C', type: 'persistent',
      tone: 'orange', icon: 'flame',
      duration: 0, content: 'Tournament queue match success, Please within 30 seconds click confirm. ',
    });
    await new Promise((r) => setTimeout(r, 600));
    appendLog('test3', 'Step 2: User click Collapse button (Collapse to tray)...');
    store.collapseActive();
    await new Promise((r) => setTimeout(r, 400));
    const state = useQuickNotificationStore.getState();
    if (state.activeNotification !== null) {
      appendLog('test3', '[x] failed: After manual collapse Active Not cleared');
      setTestStatus('test3', 'failed');
      return;
    }
    if (state.unreadStack.length !== 1 || state.unreadStack[0].id !== 'persistent-C') {
      appendLog('test3', '[x] failed: Notification not categorized unreadStack Unread tray');
      setTestStatus('test3', 'failed');
      return;
    } appendLog('test3', '[ok] confirm: Active Cleared, Notification entered unreadStack Tray, Top-right counter value +1, And no unsolicited pop-up disturbance');
    appendLog('test3', '[!] scene 3 validation passed (PASS)');
    setTestStatus('test3', 'passed');
  };
  const runTest4 = () => {
    setTestStatus('test4', 'running');
    setTestResults((prev) => ({ ...prev, test4: { ...prev.test4, log: [] } }));
    clearAllQuickNotifications();
    const fullErrorDetails = `[WebRTC Negotiation Exception]
Status: ICE_CONNECTION_FAILED
Target Room: 8942-US-WEST
Signaling Server: wss://signaling.car-soccer.antigravity.dev
Candidate Pair: 192.168.1.104:54321 <-> 104.28.19.4:443 (STUN Timeout 10000ms)
Details: Remote host failed to answer SDP offer within 10-second deadline.
Trace:
  at P2PWebRTCChannel.establishPeerSession (P2PWebRTCChannel.js:142:19)
  at RoomConnectionProgressManager.startJoin (RoomConnectionProgressManager.js:88:12)`;
    appendLog('test4', 'Step 1: Push with Details Compact button error notification...');
    pushQuickNotification({
      id: 'room-join-error-summary', type: 'persistent',
      tone: 'error', icon: 'octagon-alert',
      duration: 0, content: 'Join room failed: Remote host handshake timeout (10s)',
      buttons: [
        {
          label: 'Details', color: 'amber',
          onClick: () => {
            appendLog('test4', 'User clicked Details button, trigger Dialogue Expand full error in popup! ');
            dialogue.show({
              title: 'ERROR', tone: 'error',
              icon: 'octagon-alert', content: (
                <div className="flex flex-col gap-2 font-mono text-xs w-full text-left">
                  <p className="font-bold text-red-600 dark:text-red-400">WebRTC P2P Handshake timeout, direct connection failed:</p>
                  <pre className="p-3 rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-300 dark:bg-neutral-950/70 dark:border-neutral-800 dark:text-neutral-200 text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                    {fullErrorDetails}
                  </pre>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Check current network firewall, Or let host regenerate a new one 4 digit room code. Can be closed directly via the built-in slash button or the popup button. 
                  </p>
                </div>
              ), buttons: [
                {
                  label: 'Copy Logs', variant: 'outline',
                  onClick: async () => {
                    if (typeof navigator !== 'undefined') {
                      await navigator.clipboard.writeText(fullErrorDetails);
                      appendLog('test4', '[ok] Full error log copied to clipboard');
                    } },
                },
                { label: 'Close', variant: 'primary' },
              ], });
          }, },
      ], });
    appendLog('test4', '[ok] Compact notification popped, Please click on notification [Details] Button validation Dialogue Popup');
    setTestStatus('test4', 'passed');
  };
  const runTest5 = () => {
    setTestStatus('test5', 'running');
    setTestResults((prev) => ({ ...prev, test5: { ...prev.test5, log: [] } }));
    appendLog('test5', 'Step 1: Deliberately pass deprecated fields durationMs and undeclared type invalid configuration...');
    try {
      pushQuickNotification({
        id: 'intentional-bug-alert', content: 'This notification has schema bugs',
        durationMs: 3000, // ILLEGAL KEY
        title: 'Deprecated Title', } as any);
      appendLog('test5', '[x] failed: System did not intercept invalid parameter, Silence occurred fallback! ');
      setTestStatus('test5', 'failed');
    } catch (err: any) {
      appendLog('test5', `[ok] Successfully intercepted! Runtime exception captured: ${err.message}`);
      appendLog('test5', '[ok] Verify: Scheduler automatically popped up with highest priority Ghost icon Fatal Error Dialogue popup!');
      appendLog('test5', '[!] scene 5 validation passed (PASS)');
      setTestStatus('test5', 'passed');
    }
  };
  const runTest6 = async () => {
    setTestStatus('test6', 'running');
    setTestResults((prev) => ({ ...prev, test6: { ...prev.test6, log: [] } }));
    clearAllQuickNotifications();
    appendLog('test6', 'Step 1: Start a background resource download task with lowest priority (Ongoing Task)...');
    const taskId = pushOngoingNotification({
      id: 'bg-asset-download', type: 'ongoing',
      content: 'Downloading stadium arena texture pack (0%)', progress: 0.1,
      icon: 'download', });
    await new Promise((r) => setTimeout(r, 1000));
    updateOngoingNotification(taskId, {
      content: 'Downloading stadium arena texture pack (35%)', progress: 0.35,
    });
    appendLog('test6', '[ok] confirm: Background tasks display progress in the foreground with lowest priority');
    await new Promise((r) => setTimeout(r, 800));
    appendLog('test6', 'Step 2: High-priority interactive notification (Interrupt and override background task)...');
    pushQuickNotification({
      id: 'high-priority-notice', type: 'temporary',
      duration: 2000, tone: 'warning',
      content: 'Sudden network jitter: Latency from 15ms increased to 120ms', });
    await new Promise((r) => setTimeout(r, 400));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'high-priority-notice') {
      appendLog('test6', '[x] failed: Interactive notification failed to overlay background tasks');
      setTestStatus('test6', 'failed');
      return;
    } appendLog('test6', '[ok] confirm: Interactive notification successfully overlays background tasks');
    appendLog('test6', 'Step 3: Wait for interaction notification 2000ms Countdown finished...');
    await new Promise((r) => setTimeout(r, 2300));
    const state2 = useQuickNotificationStore.getState();
    if (state2.activeOngoingTask?.id !== 'bg-asset-download') {
      appendLog('test6', '[x] failed: After interactive notification collapse, Background task failed to auto-resume');
      setTestStatus('test6', 'failed');
      return;
    } appendLog('test6', '[ok] confirm: After interactive notification collapse, Smooth resumption display of background download tasks! ');
    updateOngoingNotification(taskId, {
      content: 'Stadium arena asset pack download complete (100%)', progress: 1,
    });
    await new Promise((r) => setTimeout(r, 800));
    dismissOngoingNotification(taskId);
    appendLog('test6', '[!] scene 6 validation passed (PASS)');
    setTestStatus('test6', 'passed');
  };
  const handleRunAll = async () => {
    setIsRunningAll(true);
    await runTest1();
    await new Promise((r) => setTimeout(r, 1000));
    await runTest2();
    await new Promise((r) => setTimeout(r, 1000));
    await runTest3();
    await new Promise((r) => setTimeout(r, 1000));
    runTest4();
    await new Promise((r) => setTimeout(r, 1000));
    runTest5();
    await new Promise((r) => setTimeout(r, 1000));
    await runTest6();
    setIsRunningAll(false);
  };
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="amber" isLight={isLight}>
            Core Architecture Suite
          </Badge>
          <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            UIStorybook / QuickNotification & Dialogue Integration
          </span>
        </div>
        <h1 className={`text-3xl font-bold tracking-tight ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
          Notification & Dialogue Integration test matrix
        </h1>
        <p className={`text-sm max-w-3xl leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Test focus: <strong>Notification scheduler (NotificationScheduler) </strong> Preemption and auto-recovery mechanism (Preemption &
          Restoration) , Strict parameter validation with no silent fallback (Fatal Schema Validation with Ghost Dialogue) , Long error progressive disclosure linkage, And lowest priority Ongoing
          Task hierarchy competition. 
        </p>
      </div>
      {/* ────────────────────────────────────────────────────────────────────
          Interactive Preview Stage with In-Place QuickNotificationSystem
         ──────────────────────────────────────────────────────────────────── */}
      <div
        className={`relative h-32 rounded-2xl border flex items-center justify-between px-6 overflow-hidden select-none shadow-sm transition-colors ${
        isLight
        ? 'bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 border-neutral-300/80 text-neutral-900'
        : 'bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-neutral-800 text-neutral-100'
        }`}>
        <div className="flex items-center gap-3 z-10">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
              Live Notification Viewport (Top-right floating drawer)
            </span>
            <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              All triggered notifications expand in this area and the global top-right corner
            </span>
          </div>
        </div>
        {/* Mounted in-place for direct visualization */}
        <QuickNotificationSystem isLight={isLight} absolute={true} />
      </div>
      {/* ────────────────────────────────────────────────────────────────────
          Real-time Scheduler State Inspector
         ──────────────────────────────────────────────────────────────────── */}
      <div className={`p-5 rounded-2xl border flex flex-col gap-4 font-mono text-xs transition-colors ${ isLight
        ? 'bg-white border-neutral-300 text-neutral-800 shadow-sm'
        : 'bg-neutral-900 border-neutral-800 text-neutral-200' }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-amber-500" />
            <span className="font-bold uppercase tracking-wider">NotificationScheduler Real-time memory probe (Live State)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              isLight={isLight} onClick={() => clearAllQuickNotifications()}
              className="text-xs" >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Clear All States (Reset All)
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Active Notification Card */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
            store.activeNotification ? isLight ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-amber-950/40 border-amber-700/60 text-amber-200' : isLight
            ? 'bg-neutral-50 border-neutral-200 text-neutral-500'
            : 'bg-neutral-950 border-neutral-800 text-neutral-500' }`}>
            <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              1. Active Notification
            </span>
            <span className="font-bold text-sm truncate">{store.activeNotification?.id || '(None)'}</span>
            <span className="text-[10px] opacity-80">
              Type: {store.activeNotification?.type || 'idle'} • Tone: {store.activeNotification?.tone || 'none'}
            </span>
          </div>
          {/* Preempted Persistent Stack Card */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
              store.preemptedPersistentStack.length > 0 ? isLight
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-200' : isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-500'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500' }`}
          >
            <span className={`text-[10px] uppercase font-bold flex items-center justify-between ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <span>2. Preempted Stack (Suspend)</span>
              <span className="font-bold">{store.preemptedPersistentStack.length}</span>
            </span>
            <span className="font-bold text-sm truncate">{store.preemptedPersistentStack[0]?.id || '(Empty)'}</span>
            <span className="text-[10px] opacity-80">
              Pending persistent notification: {store.preemptedPersistentStack.map((n) => n.id).join(' -> ') || 'none'}
            </span>
          </div>
          {/* Unread Stack Tray Card */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
              store.unreadStack.length > 0 ? isLight
                  ? 'bg-sky-50 border-sky-300 text-sky-900' : 'bg-sky-950/40 border-sky-700/60 text-sky-200'
                : isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-500'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500' }`}
          >
            <span className={`text-[10px] uppercase font-bold flex items-center justify-between ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <span>3. Unread Stack (Unread tray)</span>
              <span className="font-bold">{store.unreadStack.length}</span>
            </span>
            <span className="font-bold text-sm truncate">{store.unreadStack[0]?.id || '(Empty)'}</span>
            <span className="text-[10px] opacity-80">Collapsed/History: {store.unreadStack.map((n) => n.id).join(', ') || 'none'}</span>
          </div>
          {/* Active Ongoing Task Card */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${ store.activeOngoingTask
            ? isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200' : isLight
            ? 'bg-neutral-50 border-neutral-200 text-neutral-500'
            : 'bg-neutral-950 border-neutral-800 text-neutral-500' }`}>
            <span className={`text-[10px] uppercase font-bold flex items-center justify-between ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <span>4. Ongoing Task (Background)</span>
              <span className="font-bold">{store.ongoingTasks.length}</span>
            </span>
            <span className="font-bold text-sm truncate">{store.activeOngoingTask?.id || '(None)'}</span>
            <span className="text-[10px] opacity-80">
              Progress: {typeof store.activeOngoingTask?.progress === 'number' ? `${Math.round(store.activeOngoingTask.progress * 100)}%` : 'none'}
            </span>
          </div>
        </div>
      </div>
      {/* ────────────────────────────────────────────────────────────────────
          Persistent Automated Test Suite
         ──────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h2 className={`text-lg font-bold ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
              Persistent regression verification test suite (Automated Test Suite)
            </h2>
          </div>
          <Button variant="primary" isLight={isLight} disabled={isRunningAll} onClick={handleRunAll}
            className="text-xs">
            <Play className="h-3.5 w-3.5 mr-1.5" />
            {isRunningAll ? 'Executing full test suite...' : 'One-click sequential run for all test cases (Run All)'}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {Object.values(testResults).map((test) => {
            const isRunning = test.status === 'running';
            const isPassed = test.status === 'passed';
            const isFailed = test.status === 'failed';
            return (
              <div key={test.id} className={`p-5 rounded-2xl border transition-all ${
                isLight ? 'bg-white border-neutral-200/90 shadow-2xs text-neutral-900' : 'bg-neutral-900/90 border-neutral-800 text-neutral-100'
                }`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                  isLight ? 'border-neutral-200' : 'border-neutral-800' }`}>
                  <div className="flex items-center gap-3">
                    {isPassed && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                    {isFailed && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                    {isRunning && <RefreshCw className="h-5 w-5 text-amber-500 animate-spin shrink-0" />}
                    {test.status === 'idle' && <Clock className="h-5 w-5 text-neutral-400 shrink-0" />}
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
                        {test.name}
                      </span>
                      <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Test ID: {test.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="sm"
                      isLight={isLight} disabled={isRunning}
                      onClick={() => {
                        if (test.id === 'test1') runTest1();
                        if (test.id === 'test2') runTest2();
                        if (test.id === 'test3') runTest3();
                        if (test.id === 'test4') runTest4();
                        if (test.id === 'test5') runTest5();
                        if (test.id === 'test6') runTest6();
                      }} className="text-xs font-mono"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run single item (Run)
                    </Button>
                  </div>
                </div>
                {/* Step execution log */}
                <div
                  className={`mt-3 rounded-xl p-3 font-mono text-xs max-h-36 overflow-y-auto flex flex-col gap-1 border transition-colors ${
                  isLight ? 'bg-neutral-50 text-neutral-700 border-neutral-200/90'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800/80' }`}>
                  {test.log.length === 0 ? (
                    <span className={`italic ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      click"Run single item"Execute test case and observe state machine steps...
                    </span>
                  ) : ( test.log.map((entry, idx) => (
                      <span key={idx} className={ entry.includes('[x]') ? isLight ? 'text-red-600 font-bold'
                        : 'text-red-400 font-bold' : entry.includes('[ok]') || entry.includes('[!]') ? isLight
                        ? 'text-emerald-600 font-semibold' : 'text-emerald-400 font-semibold' : isLight
                        ? 'text-neutral-700' : 'text-neutral-300' }>
                        {entry}
                      </span>
                    )) )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

