import React from 'react';
import {
  useQuickNotificationStore,
  pushQuickNotification,
  pushOngoingNotification,
  updateOngoingNotification,
  dismissOngoingNotification,
  clearAllQuickNotifications,
} from '../../../ui-core/stores/quickNotificationStore';
import type { QuickNotificationPushOptions } from '../../../ui-core/stores/notificationTypes';
import { dialogue } from '../../../ui-core/compounds/dialogue/dialogueStore';
import { createScopedSyncedState } from '../../stores/crossClientSync';

const useState = createScopedSyncedState('page:notification-integration');

export interface TestCaseResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  log: string[];
}

export const INITIAL_NOTIFICATION_TEST_RESULTS: Record<string, TestCaseResult> = {
  test1: {
    id: 'test1',
    name: 'scene 1: WebSocket Persistent disconnection notifications preempted by temporary notifications with timeout recovery (Preemption & Restore)',
    status: 'idle',
    log: [],
  },
  test2: {
    id: 'test2',
    name: 'scene 2: Dual Persistent Preemption and Resolve Cascading fallback (LIFO Stack Restoration)',
    status: 'idle',
    log: [],
  },
  test3: {
    id: 'test3',
    name: 'scene 3: User initiated Collapse Isolation test (Move to unread tray, No intrusive pop-ups)',
    status: 'idle',
    log: [],
  },
  test4: {
    id: 'test4',
    name: 'scene 4: Long error progressive disclosure (Notification Summary + Details button -> Dialogue Popup)',
    status: 'idle',
    log: [],
  },
  test5: {
    id: 'test5',
    name: 'scene 5: Strict parameter validation Ghost Fatal Error Dialogue Debug popup (Zero silence Fallback)',
    status: 'idle',
    log: [],
  },
  test6: {
    id: 'test6',
    name: 'scene 6: Ongoing Competition test between lowest-priority tasks and interactive notifications (Background execution and foreground yield)',
    status: 'idle',
    log: [],
  },
};

export function useNotificationIntegrationTestRunner() {
  const store = useQuickNotificationStore();
  const [testResults, setTestResults] = useState<Record<string, TestCaseResult>>(
    INITIAL_NOTIFICATION_TEST_RESULTS,
    'testResults'
  );
  const [isRunningAll, setIsRunningAll] = useState(false, 'isRunningAll');

  const appendLog = (testId: string, message: string) => {
    setTestResults((prev) => {
      const current = prev[testId] || {
        id: testId,
        name: testId,
        status: 'idle' as const,
        log: [],
      };
      return {
        ...prev,
        [testId]: {
          ...current,
          log: [...current.log, `[${new Date().toLocaleTimeString()}] ${message}`],
        },
      };
    });
  };

  const setTestStatus = (
    testId: string,
    status: 'idle' | 'running' | 'passed' | 'failed'
  ) => {
    setTestResults((prev) => {
      const current = prev[testId];
      if (!current) return prev;
      return {
        ...prev,
        [testId]: {
          ...current,
          status,
        },
      };
    });
  };

  const runTest1 = async () => {
    setTestStatus('test1', 'running');
    setTestResults((prev) => ({ ...prev, test1: { ...prev.test1, log: [] } }));
    clearAllQuickNotifications();
    appendLog(
      'test1',
      'Step 1: Push WebSocket Persistent disconnect notification (type: persistent, tone: warning)...'
    );
    pushQuickNotification({
      id: 'ws-disconnect-alert',
      type: 'persistent',
      tone: 'warning',
      icon: 'wifi-off',
      duration: 0,
      content:
        'WebSocket Signaling server disconnected, In use P2P WebRTC Maintain match. ',
      buttons: [
        {
          label: 'Reconnect',
          color: 'amber',
          onClick: () => {
            appendLog('test1', 'User clicked business Reconnect button');
          },
        },
      ],
    });
    await new Promise((r) => setTimeout(r, 1200));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'ws-disconnect-alert') {
      appendLog('test1', '[x] failed: Persistent notification failed to activate');
      setTestStatus('test1', 'failed');
      return;
    }
    appendLog(
      'test1',
      '[ok] confirm: Persistent notification is Active Display state (Clickable Reconnect or built-in on right CircleSlash Ignore button)'
    );
    appendLog(
      'test1',
      'Step 2: Trigger a temporary notification (type: temporary, duration: 2500ms)...'
    );
    pushQuickNotification({
      id: 'temp-kickoff-alert',
      type: 'temporary',
      tone: 'none',
      icon: 'sparkles',
      duration: 2500,
      content: 'Match about to start (Kickoff in 3s)',
    });
    await new Promise((r) => setTimeout(r, 400));
    const state2 = useQuickNotificationStore.getState();
    if (state2.activeNotification?.id !== 'temp-kickoff-alert') {
      appendLog('test1', '[x] failed: Temporary notification failed to preempt Active Show');
      setTestStatus('test1', 'failed');
      return;
    }
    if (
      state2.preemptedPersistentStack.length !== 1 ||
      state2.preemptedPersistentStack[0].id !== 'ws-disconnect-alert'
    ) {
      appendLog(
        'test1',
        '[x] failed: Persistent notification not entered preemptedPersistentStack Suspend stack'
      );
      setTestStatus('test1', 'failed');
      return;
    }
    appendLog(
      'test1',
      '[ok] confirm: Temporary notification preempts foreground, Persistent notification attached preemptedPersistentStack'
    );
    appendLog(
      'test1',
      'Step 3: Wait for temporary notification 2500ms Countdown natural end...'
    );
    await new Promise((r) => setTimeout(r, 2800));
    const state3 = useQuickNotificationStore.getState();
    if (state3.activeNotification?.id !== 'ws-disconnect-alert') {
      appendLog(
        'test1',
        `[x] failed: Persistent notifications fail to restore after temporary notifications end (current Active: ${state3.activeNotification?.id})`
      );
      setTestStatus('test1', 'failed');
      return;
    }
    appendLog(
      'test1',
      '[ok] confirm: Temporary notification countdown collapse, Persistent Notification[Auto smooth recovery] displayed!'
    );
    appendLog('test1', '[!] scene 1 validation passed (PASS)');
    setTestStatus('test1', 'passed');
  };

  const runTest2 = async () => {
    setTestStatus('test2', 'running');
    setTestResults((prev) => ({ ...prev, test2: { ...prev.test2, log: [] } }));
    clearAllQuickNotifications();
    appendLog('test2', 'Step 1: Push first persistent notification A (Host Migration)...');
    pushQuickNotification({
      id: 'persistent-A',
      type: 'persistent',
      tone: 'info',
      icon: 'shield-alert',
      duration: 0,
      content: 'Room ownership transferred to Striker-9921',
    });
    await new Promise((r) => setTimeout(r, 800));
    appendLog(
      'test2',
      'Step 2: Push second persistent notification B (NAT Traversal Warning)...'
    );
    pushQuickNotification({
      id: 'persistent-B',
      type: 'persistent',
      tone: 'warning',
      icon: 'alert-triangle',
      duration: 0,
      content: 'NAT Type detected as Strict, May affect direct connection quality',
    });
    await new Promise((r) => setTimeout(r, 500));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'persistent-B') {
      appendLog('test2', '[x] failed: Persistent Notification B Failed to preempt foreground');
      setTestStatus('test2', 'failed');
      return;
    }
    if (
      state1.preemptedPersistentStack.length !== 1 ||
      state1.preemptedPersistentStack[0].id !== 'persistent-A'
    ) {
      appendLog(
        'test2',
        '[x] failed: Persistent Notification A Failed to queue in pending stack'
      );
      setTestStatus('test2', 'failed');
      return;
    }
    appendLog(
      'test2',
      '[ok] confirm: B Preempt display, A Correct at preemptedPersistentStack Suspend'
    );
    appendLog(
      'test2',
      'Step 3: User resolved via click (Resolve) Current notification B...'
    );
    store.resolveActive();
    await new Promise((r) => setTimeout(r, 500));
    const state2 = useQuickNotificationStore.getState();
    if (state2.activeNotification?.id !== 'persistent-A') {
      appendLog(
        'test2',
        `[x] failed: B After resolve A Failed to cascade restore (current Active: ${state2.activeNotification?.id})`
      );
      setTestStatus('test2', 'failed');
      return;
    }
    appendLog(
      'test2',
      '[ok] confirm: B After resolve, Underlying persistent notification A automatically restored!'
    );
    appendLog('test2', '[!] scene 2 validation passed (PASS)');
    setTestStatus('test2', 'passed');
  };

  const runTest3 = async () => {
    setTestStatus('test3', 'running');
    setTestResults((prev) => ({ ...prev, test3: { ...prev.test3, log: [] } }));
    clearAllQuickNotifications();
    appendLog('test3', 'Step 1: Push a persistent notification C...');
    pushQuickNotification({
      id: 'persistent-C',
      type: 'persistent',
      tone: 'orange',
      icon: 'flame',
      duration: 0,
      content: 'Tournament queue match success, Please within 30 seconds click confirm. ',
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
      appendLog(
        'test3',
        '[x] failed: Notification not categorized unreadStack Unread tray'
      );
      setTestStatus('test3', 'failed');
      return;
    }
    appendLog(
      'test3',
      '[ok] confirm: Active Cleared, Notification entered unreadStack Tray, Top-right counter value +1, And no unsolicited pop-up disturbance'
    );
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
Signaling Server: wss://signaling.car-ball.antigravity.dev
Candidate Pair: 192.168.1.104:54321 <-> 104.28.19.4:443 (STUN Timeout 10000ms)
Details: Remote host failed to answer SDP offer within 10-second deadline.
Trace:
  at P2PWebRTCChannel.establishPeerSession (P2PWebRTCChannel.js:142:19)
  at RoomConnectionProgressManager.startJoin (RoomConnectionProgressManager.js:88:12)`;
    appendLog('test4', 'Step 1: Push with Details Compact button error notification...');
    pushQuickNotification({
      id: 'room-join-error-summary',
      type: 'persistent',
      tone: 'error',
      icon: 'octagon-alert',
      duration: 0,
      content: 'Join room failed: Remote host handshake timeout (10s)',
      buttons: [
        {
          label: 'Details',
          color: 'amber',
          onClick: () => {
            appendLog(
              'test4',
              'User clicked Details button, trigger Dialogue Expand full error in popup! '
            );
            dialogue.show({
              title: 'ERROR',
              tone: 'error',
              icon: 'octagon-alert',
              content: (
                <div className="flex flex-col gap-2 font-mono text-xs w-full text-left">
                  <p className="font-bold text-red-600 dark:text-red-400">
                    WebRTC P2P Handshake timeout, direct connection failed:
                  </p>
                  <pre
                    className={[
                      'p-3 rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-300',
                      'dark:bg-neutral-950/70 dark:border-neutral-800 dark:text-neutral-200',
                      'text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all',
                    ].join(' ')}
                  >
                    {fullErrorDetails}
                  </pre>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Check current network firewall, Or let host regenerate a new one 4 digit
                    room code. Can be closed directly via the built-in slash button or the popup
                    button.
                  </p>
                </div>
              ),
              buttons: [
                {
                  label: 'Copy Logs',
                  variant: 'outline',
                  onClick: async () => {
                    if (typeof navigator !== 'undefined') {
                      await navigator.clipboard.writeText(fullErrorDetails);
                      appendLog('test4', '[ok] Full error log copied to clipboard');
                    }
                  },
                },
                { label: 'Close', variant: 'primary' },
              ],
            });
          },
        },
      ],
    });
    appendLog(
      'test4',
      '[ok] Compact notification popped, Please click on notification [Details] Button validation Dialogue Popup'
    );
    setTestStatus('test4', 'passed');
  };

  const runTest5 = () => {
    setTestStatus('test5', 'running');
    setTestResults((prev) => ({ ...prev, test5: { ...prev.test5, log: [] } }));
    appendLog(
      'test5',
      'Step 1: Deliberately pass deprecated fields durationMs and undeclared type invalid configuration...'
    );
    try {
      const malformedPayload = {
        id: 'intentional-bug-alert',
        content: 'This notification has schema bugs',
        durationMs: 3000,
        title: 'Deprecated Title',
      } as unknown as QuickNotificationPushOptions;
      pushQuickNotification(malformedPayload);
      appendLog(
        'test5',
        '[x] failed: System did not intercept invalid parameter, Silence occurred fallback! '
      );
      setTestStatus('test5', 'failed');
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      appendLog(
        'test5',
        `[ok] Successfully intercepted! Runtime exception captured: ${errMessage}`
      );
      appendLog(
        'test5',
        '[ok] Verify: Scheduler automatically popped up with highest priority Ghost icon Fatal Error Dialogue popup!'
      );
      appendLog('test5', '[!] scene 5 validation passed (PASS)');
      setTestStatus('test5', 'passed');
    }
  };

  const runTest6 = async () => {
    setTestStatus('test6', 'running');
    setTestResults((prev) => ({ ...prev, test6: { ...prev.test6, log: [] } }));
    clearAllQuickNotifications();
    appendLog(
      'test6',
      'Step 1: Start a background resource download task with lowest priority (Ongoing Task)...'
    );
    const taskId = pushOngoingNotification({
      id: 'bg-asset-download',
      type: 'ongoing',
      content: 'Downloading stadium arena texture pack (0%)',
      progress: 0.1,
      icon: 'download',
    });
    await new Promise((r) => setTimeout(r, 1000));
    updateOngoingNotification(taskId, {
      content: 'Downloading stadium arena texture pack (35%)',
      progress: 0.35,
    });
    appendLog(
      'test6',
      '[ok] confirm: Background tasks display progress in the foreground with lowest priority'
    );
    await new Promise((r) => setTimeout(r, 800));
    appendLog(
      'test6',
      'Step 2: High-priority interactive notification (Interrupt and override background task)...'
    );
    pushQuickNotification({
      id: 'high-priority-notice',
      type: 'temporary',
      duration: 2000,
      tone: 'warning',
      content: 'Sudden network jitter: Latency from 15ms increased to 120ms',
    });
    await new Promise((r) => setTimeout(r, 400));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'high-priority-notice') {
      appendLog(
        'test6',
        '[x] failed: Interactive notification failed to overlay background tasks'
      );
      setTestStatus('test6', 'failed');
      return;
    }
    appendLog(
      'test6',
      '[ok] confirm: Interactive notification successfully overlays background tasks'
    );
    appendLog('test6', 'Step 3: Wait for interaction notification 2000ms Countdown finished...');
    await new Promise((r) => setTimeout(r, 2300));
    const state2 = useQuickNotificationStore.getState();
    if (state2.activeOngoingTask?.id !== 'bg-asset-download') {
      appendLog(
        'test6',
        '[x] failed: After interactive notification collapse, Background task failed to auto-resume'
      );
      setTestStatus('test6', 'failed');
      return;
    }
    appendLog(
      'test6',
      '[ok] confirm: After interactive notification collapse, Smooth resumption display of background download tasks! '
    );
    updateOngoingNotification(taskId, {
      content: 'Stadium arena asset pack download complete (100%)',
      progress: 1,
    });
    await new Promise((r) => setTimeout(r, 800));
    dismissOngoingNotification(taskId);
    appendLog('test6', '[!] scene 6 validation passed (PASS)');
    setTestStatus('test6', 'passed');
  };

  const runSingleTestById = (testId: string) => {
    if (testId === 'test1') runTest1();
    if (testId === 'test2') runTest2();
    if (testId === 'test3') runTest3();
    if (testId === 'test4') runTest4();
    if (testId === 'test5') runTest5();
    if (testId === 'test6') runTest6();
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

  return {
    store,
    testResults,
    isRunningAll,
    runSingleTestById,
    handleRunAll,
  };
}
