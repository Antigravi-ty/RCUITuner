import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:charts-curves');
import { Activity, Zap, Spline, MoveVertical, CheckCircle2, XCircle, Plus, Flame, Gauge, Wifi, } from 'lucide-react';
import { TelemetryRingBuffer } from '../../ui-core/charts/telemetryRingBuffer';
import { TelemetrySparklineChart } from '../../ui-core/charts/TelemetrySparklineChart';
import { EventImpulseScatterChart, CollisionImpulseEvent } from '../../ui-core/charts/EventImpulseScatterChart';
import { CubicBezierCurveEditor, CubicBezierValue } from '../../ui-core/charts/CubicBezierCurveEditor';
import { ParametricTrajectoryChart } from '../../ui-core/charts/ParametricTrajectoryChart';
import { PacingOscilloscopeChart } from '../../ui-core/charts/PacingOscilloscopeChart';
import { GoalBarrier2DEditor } from '../../ui-core/charts/GoalBarrier2DEditor';
import { MultiTrackReplayTimeline } from '../../ui-core/charts/MultiTrackReplayTimeline';
import { SliderControl } from '../../ui-core/primitives/SliderControl';
import { Badge } from '../../ui-core/primitives/Badge';
import { Button } from '../../ui-core/primitives/Button';
import { CodeBlock } from '../CodeBlock';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';

const CHARTS_JUMP_ITEMS: JumpDirectoryItem[] = [
  { id: 'chart-5b-1-sparkline', code: '5B.1', name: 'TelemetrySparklineChart', label: '120Hz Zero-allocation Oscilloscope', badge: 'RingBuffer' },
  { id: 'chart-5b-2-scatter', code: '5B.2', name: 'EventImpulseScatterChart', label: 'Physics impulse scatter plot', badge: 'SVG' },
  { id: 'chart-5b-3-bezier', code: '5B.3', name: 'CubicBezierCurveEditor', label: 'Cubic Bezier curve', badge: 'SVG Drag' },
  { id: 'chart-5b-4-trajectory', code: '5B.4', name: 'ParametricTrajectoryChart', label: 'Parametric physical extreme trajectory', badge: 'dy/du=0' },
  { id: 'chart-5b-5-pacing', code: '5B.5', name: 'PacingOscilloscopeChart', label: 'Three-channel clock pacing oscilloscope', badge: '120Hz Canvas' },
  { id: 'chart-5b-6-barrier', code: '5B.6', name: 'GoalBarrier2DEditor', label: 'Goal boolean mask editor', badge: '2D Quad' },
  { id: 'chart-5b-7-timeline', code: '5B.7', name: 'MultiTrackReplayTimeline', label: 'Three-track synchronized playback timeline', badge: '120Hz Ref' },
];

export const ChartsAndCurvesPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  // 1. Pure 120Hz RingBuffer Stream (Legacy React State array mode removed)
  const [telemetryPreset, setTelemetryPreset] = useState<'frame-time' | 'network-rtt'>('frame-time');

  // Pre-allocated Float32Array RingBuffer (240 samples = 2.0s window at 120Hz)
  const frameRingBufferRef = useRef<TelemetryRingBuffer | null>(null);
  if (!frameRingBufferRef.current) {
    const initial: number[] = [];
    for (let i = 0; i < 240; i++) {
      const spike = i % 79 === 0 ? 11.8 : i % 53 === 0 ? 9.4 : 0;
      initial.push(spike || Number((5.2 + Math.sin(i * 0.14) * 1.1 + (i % 7) * 0.12).toFixed(2)));
    }
    frameRingBufferRef.current = new TelemetryRingBuffer(240, initial);
  }

  // Live proof metrics updated via DOM refs (so the counter itself never triggers React re-renders)
  const reactRenderCountRef = useRef<number>(0);
  reactRenderCountRef.current += 1;
  const sampleRateReadoutRef = useRef<HTMLSpanElement | null>(null);
  const reactRenderReadoutRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const isNetRtt = telemetryPreset === 'network-rtt';
    let rafId = 0;
    let samplePhase = 0;
    let samplesThisWindow = 0;
    let lastTime = performance.now();
    let lastSecMark = lastTime;
    let accumulatorMs = 0;
    let lastRenderSnap = reactRenderCountRef.current;
    const stepMs = 1000 / 120; // 8.333ms nominal 120Hz physics/network tick

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      // Clamp delta to 34ms max so tab-switch or OS hiccup never triggers a catch-up spiral
      const dt = Math.min(34, Math.max(0, now - lastTime));
      lastTime = now;
      accumulatorMs += dt;

      let steps = 0;
      while (accumulatorMs >= stepMs && steps < 4) {
        accumulatorMs -= stepMs;
        steps++;
        samplePhase += 1;
        samplesThisWindow += 1;

        const wave = Math.sin(samplePhase * 0.09) * (isNetRtt ? 3.2 : 0.95);
        const jitter = (Math.random() - 0.48) * (isNetRtt ? 2.4 : 1.1);
        const occasionalSpike =
          Math.random() < 0.022
            ? isNetRtt
              ? 28.5 + Math.random() * 14.0
              : 9.2 + Math.random() * 5.2
            : 0;
        const base = isNetRtt ? 16.5 : 5.3;
        const floor = isNetRtt ? 10.0 : 3.1;
        const ceil = isNetRtt ? 23.5 : 8.0;
        const val = occasionalSpike || Math.max(floor, Math.min(ceil, base + wave + jitter));

        frameRingBufferRef.current!.push(val);
      }

      if (now - lastSecMark >= 600) {
        const elapsedSec = (now - lastSecMark) / 1000;
        const hz = Math.round(samplesThisWindow / elapsedSec);
        const rendersDelta = reactRenderCountRef.current - lastRenderSnap;
        const rendersPerSec = Math.round(rendersDelta / elapsedSec);

        if (sampleRateReadoutRef.current) {
          sampleRateReadoutRef.current.textContent = `${hz} Hz`;
        }
        if (reactRenderReadoutRef.current) {
          reactRenderReadoutRef.current.textContent = `${rendersPerSec} / sec`;
        }
        samplesThisWindow = 0;
        lastSecMark = now;
        lastRenderSnap = reactRenderCountRef.current;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [telemetryPreset]);

  const injectFrameSpike = () => {
    const isNetRtt = telemetryPreset === 'network-rtt';
    const spikes = isNetRtt ? [31.4, 42.8, 36.2, 27.9] : [14.8, 18.4, 15.2, 11.9];
    frameRingBufferRef.current!.pushBatch(spikes);
  };

  // 2. Collision Impulse Scatter Events State
  const [threshold, setThreshold] = useState<number>(650);
  const [events, setEvents] = useState<CollisionImpulseEvent[]>([
    { id: 'ev-1', ageSec: 4.4, value: 420, type: 'car-world' },
    { id: 'ev-2', ageSec: 3.9, value: 1180, type: 'car-ball' },
    { id: 'ev-3', ageSec: 3.4, value: 290, type: 'car-ball' },
    { id: 'ev-4', ageSec: 2.8, value: 1940, type: 'goalpost' },
    { id: 'ev-5', ageSec: 2.3, value: 810, type: 'car-ball' },
    { id: 'ev-6', ageSec: 1.8, value: 520, type: 'car-world' },
    { id: 'ev-7', ageSec: 1.2, value: 1560, type: 'car-ball' },
    { id: 'ev-8', ageSec: 0.6, value: 2210, type: 'goalpost' },
    { id: 'ev-9', ageSec: 0.2, value: 930, type: 'car-ball' },
  ]);

  const emitCollisionBurst = () => {
    const types: Array<'car-ball' | 'car-world' | 'goalpost'> = ['car-ball', 'car-world', 'goalpost'];
    setEvents((prev) => {
      const aged = prev
        .map((e) => ({ ...e, ageSec: Number((e.ageSec + 0.45).toFixed(2)) }))
        .filter((e) => e.ageSec <= 5.0);
      const newEvent: CollisionImpulseEvent = {
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ageSec: 0.08,
        value: Math.round(250 + Math.random() * 2150),
        type: types[Math.floor(Math.random() * types.length)],
      };
      return [...aged, newEvent];
    });
  };

  // 3. Cubic Bezier & Parametric Orb Trajectory State
  const [orbBezier, setOrbBezier] = useState<CubicBezierValue>({
    p1x: 0.0,
    p1y: -1.15,
    p2x: 0.0,
    p2y: 1.0,
  });
  const [orbDurationMs, setOrbDurationMs] = useState<number>(200);
  const [orbDropDistance, setOrbDropDistance] = useState<number>(175);

  const [glowBezier, setGlowBezier] = useState<CubicBezierValue>({
    p1x: 0.2,
    p1y: 0.8,
    p2x: 0.25,
    p2y: 1.0,
  });

  const isNetPreset = telemetryPreset === 'network-rtt';

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge size="sm" variant="amber" isLight={isLight}>
            Clarity #1 · Performance #2 · Aesthetics #3
          </Badge>
          <Badge size="sm" variant="neutral" isLight={isLight}>
            120Hz Float32 RingBuffer · Zero Heap Allocation · Cached Skia Gradient
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Charts & Curves High-performance clear chart and curve system</h1>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Targeting <code className="font-mono text-amber-500">RocketCompanion</code> 120Hz Zero-coupling reinforcement for physical frame timing and network telemetry. Remove legacy low-frequency React State Array-driven, Full adoption of pre-allocation <code className="font-mono text-emerald-500">TelemetryRingBuffer (Float32Array)</code> + Cached <code className="font-mono">CanvasGradient</code>, Achieved during long-term continuous operation<strong>0 React Repaints, 0 Heap memory and Skia Native shader allocation, Prevent periodic GC Frame drop</strong>. 
        </p>
      </div>

      {/* Top Jump Directory */}
      <PageJumpDirectory title="5B · High-Clarity Telemetry chart and curve quick jump directory (Charts Jump Index)"
        subtitle="Click to quickly locate to specified chart component, Click the copy icon on the right to copy the standardized reference code" items={CHARTS_JUMP_ITEMS} isLight={isLight} />

      {/* Diagnostic Comparison: Why RLCleanWASM's raw charts needed standardization */}
      <div className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-4 text-xs ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
          isLight ? 'bg-red-50/60 border-red-200' : 'bg-red-950/30 border-red-800/60' }`}>
          <div className="flex items-center gap-2 font-bold text-red-500">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>Original chart and periodicity GC Root cause of stutter</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-[11px] opacity-90">
            <li>
              <strong>Create per frame <code className="font-mono">createLinearGradient</code> Trigger C++ Skia Memory accumulation</strong>: 120Hz Per minute generation 7200 Native shader objects, Run 2~3 Trigger after minutes V8 Major GC and GPU Cache centralized reclamation causes severe lag. 
            </li>
            <li>
              <strong>Per Frame <code className="font-mono">.subarray()</code> with full sorting</strong>: 120Hz Create every frame TypedArray Wrap header and copy sort 240 float numbers. 
            </li>
            <li>
              <strong>Unconditional modification DOM <code className="font-mono">.className</code></strong>: causes browser CSS Engine triggers every frame Recalculate Style. 
            </li>
            <li>
              <strong><code className="font-mono">setInterval(8.33)</code> and VSync Conflict</strong>: Timer drift and callback queue backlog in background. 
            </li>
          </ul>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
          isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/30 border-emerald-800/60' }`}>
          <div className="flex items-center gap-2 font-bold text-emerald-500">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>UIStorybook 120Hz Zero-allocation steady-state architecture</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-[11px] opacity-90">
            <li>
              <strong>Shader and context resident cache (<code className="font-mono">CanvasRenderCache</code>)</strong>: <code className="font-mono">CanvasGradient</code> Global reuse with dashed arrays, Per Frame 0 Native object allocation. 
            </li>
            <li>
              <strong>O(1) Circular index direct read (<code className="font-mono">getAt(i)</code>) + 12Hz Downsampled quantile sort</strong>: 120Hz Waveform read directly via circular offset, P50/P95/P99 Quantile per 10 In-place frame insertion sort once. 
            </li>
            <li>
              <strong>Dirty-Checked DOM Text update</strong>: Write only when the formatted string or alert boolean actually changes DOM, 0 Redundant style recalculation. 
            </li>
            <li>
              <strong>Single VSync <code className="font-mono">requestAnimationFrame</code> Stepper</strong>: With 34ms Step clamp protection, Never backlog during long idle. 
            </li>
          </ul>
        </div>
      </div>

      {/* Chart 1: TelemetrySparklineChart (Pure 120Hz RingBuffer Stream) */}
      <div id="chart-5b-1-sparkline" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">1. 120Hz Zero-allocation telemetry oscilloscope (TelemetrySparklineChart · Float32 RingBuffer)</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={<Flame className="h-3.5 w-3.5 text-rose-500" />}
              onClick={injectFrameSpike}
            >
              Injection spike (Inject Spike)
            </Button>
          </div>
        </div>

        {/* Live 120Hz Channel Control Bar + Zero-Rerender Telemetry Proof */}
        <div
          className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
          : 'bg-neutral-950/70 border-neutral-800 text-neutral-200' }`}>
          {/* Left: Telemetry Channel Preset */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-neutral-400 mr-1">Telemetry data source:</span>
            <button
              type="button"
              onClick={() => setTelemetryPreset('frame-time')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                telemetryPreset === 'frame-time'
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold'
                  : isLight
                  ? 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <Gauge className="h-3 w-3" />
              <span>120Hz Frame Time (8.33ms Budget)</span>
            </button>
            <button
              type="button"
              onClick={() => setTelemetryPreset('network-rtt')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                telemetryPreset === 'network-rtt'
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold'
                  : isLight
                  ? 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <Wifi className="h-3 w-3" />
              <span>120Hz Network RTT & Jitter (24.0ms Gate)</span>
            </button>
          </div>

          {/* Right: Live Proof Readouts */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-neutral-400">Sample rate:</span>
              <span ref={sampleRateReadoutRef} className="font-bold text-sky-400 tabular-nums">120 Hz</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-neutral-400">React Re-renders:</span>
              <span ref={reactRenderReadoutRef} className="font-bold text-emerald-400 tabular-nums">0 / sec</span>
            </div>
          </div>
        </div>

        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Hover over the chart to move the crosshair and inspect time and budget variance frame by frame; Click Top-right <strong>Freeze</strong> Freeze at any time 120Hz Waveform: 
        </p>

        <TelemetrySparklineChart
          ringBuffer={frameRingBufferRef.current!}
          title={
            isNetPreset
              ? '120Hz Network RTT & Sub-Tick Jitter Telemetry'
              : '120Hz Frame Time & Budget Telemetry'
          }
          budgetMs={isNetPreset ? 24.0 : 8.33}
          refreshHz={120}
          unit="ms"
          showFpsReadout={!isNetPreset}
          isLight={isLight}
          phases={
            isNetPreset
              ? undefined
              : [
                  { phase: 'sim', avgMs: 1.42, share: 0.26 },
                  { phase: 'scene', avgMs: 1.68, share: 0.31 },
                  { phase: 'camera', avgMs: 0.34, share: 0.06 },
                  { phase: 'prep', avgMs: 0.58, share: 0.11 },
                  { phase: 'bloom', avgMs: 0.89, share: 0.16 },
                  { phase: 'final', avgMs: 0.52, share: 0.10 },
                ]
          }
        />
      </div>

      {/* Chart 2: EventImpulseScatterChart */}
      <div id="chart-5b-2-scatter" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">2. Physical collision impulse scatter plot and audio threshold tracking chart (EventImpulseScatterChart)</span>
          </div>
          <Button size="sm" variant="secondary" isLight={isLight}
            icon={<Plus className="h-3.5 w-3.5 text-amber-500" />} onClick={emitCollisionBurst} >
            Trigger random physics collision (Emit Collision) </Button> </div>
            <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Use vertical pulse bar (Lollipop Stem) + Circular scatter plot, Clearly distinguish above audio threshold (Highlight stroke) Muted when below threshold (Translucent gray) collision events. Automatic snapping and locking when mouse nears scatter points:  </p>
            <EventImpulseScatterChart events={events} threshold={threshold} onThresholdChange={setThreshold}
            onClear={() => setEvents([])} isLight={isLight} /> </div>
            {/* Chart 3 & 4: CubicBezierCurveEditor + ParametricTrajectoryChart */} <div id="chart-5b-3-bezier"
            className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
            isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`} >
            <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2"> <Spline className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">
            3 & 4. Interactive cubic Bezier curves and parametric physical trajectory extreme value analysis (CubicBezierCurveEditor & ParametricTrajectoryChart) </span> </div>
            <Badge size="sm" variant="amber" isLight={isLight}> Direct drag control points + Center positive/negative bidirectional slider linkage </Badge> </div>
            <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Left image supports direct SVG Drag on canvas <code className="font-mono text-amber-500">P1</code> and <code className="font-mono text-pink-500">P2</code> Handle (Or click preset button) , Real-time derivative analysis of right chart <code className="font-mono">dy/du = 0</code> Calculate the upward peak jump when picking up a large speed ball (<code className="font-mono">Peak Lift +uu</code>) and peak time. Bottom control bar uses center-outward bidirectional fill <code className="font-mono">variation="centered"</code> Adjust positive/negative control point coordinates: 
            </p> <div id="chart-5b-4-trajectory" className="scroll-mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CubicBezierCurveEditor title="Orb Collect Easing (Drag P1 / P2)" p1x={orbBezier.p1x}
            p1y={orbBezier.p1y} p2x={orbBezier.p2x} p2y={orbBezier.p2y} onChange={setOrbBezier} isLight={isLight} />

          <ParametricTrajectoryChart
            title="Big Boost Orb Vertical Trajectory"
            p1x={orbBezier.p1x}
            p1y={orbBezier.p1y}
            p2x={orbBezier.p2x}
            p2y={orbBezier.p2y}
            durationMs={orbDurationMs}
            dropDistance={orbDropDistance}
            isLight={isLight}
          />
        </div>

        {/* Centered Bipolar Sliders controlling P1.Y, P2.Y, Duration, Drop Distance */}
        <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
          <SliderControl label="Orb P1.Y (Negative = Upward Leap)" value={orbBezier.p1y} min={-4.0} max={3.0}
            step={0.05} origin={0} variation="centered" showSign={true} colorScheme="amber"
            negativeColorScheme="sky" editable={true}
            onChange={(val) => setOrbBezier((prev) => ({ ...prev, p1y: val }))} isLight={isLight} />

          <SliderControl label="Orb P2.Y (Terminal Plunge Tangent)" value={orbBezier.p2y} min={-4.0} max={3.0}
            step={0.05} origin={0} variation="centered" showSign={true} colorScheme="amber"
            negativeColorScheme="sky" editable={true}
            onChange={(val) => setOrbBezier((prev) => ({ ...prev, p2y: val }))} isLight={isLight} />

          <SliderControl label="Collect Duration" value={orbDurationMs} min={50} max={800} step={10} unit="ms"
            colorScheme="neutral" editable={true} onChange={setOrbDurationMs} isLight={isLight} />

          <SliderControl label="Drop Distance" value={orbDropDistance} min={20} max={300} step={5} unit="uu"
            colorScheme="neutral" editable={true} onChange={setOrbDropDistance} isLight={isLight} />
        </div>

        {/* Second Simultaneous Instance Proof (No SVG Gradient ID Collision) */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
              <MoveVertical className="h-3.5 w-3.5 text-emerald-500" />
              <span>Multi-instance co-existence verification (via <code className="font-mono text-emerald-500">useId()</code> Isolation SVG Gradient ID, No color bleeding) : </span>
            </span>
          </div>
          <CubicBezierCurveEditor
            title="Second Coexisting Curve Instance (Hologram Glow Dissolve)"
            p1x={glowBezier.p1x}
            p1y={glowBezier.p1y}
            p2x={glowBezier.p2x}
            p2y={glowBezier.p2y}
            onChange={setGlowBezier}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Chart 5: PacingOscilloscopeChart (3-Pane Synchronized 120Hz Clock-Pacing & Deadband Corridor) */}
      <div id="chart-5b-5-pacing" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">
              5. Three-channel synchronized clock pacing and buffer dead-zone oscilloscope (PacingOscilloscopeChart · Pre-Allocated PacingRingBuffer)
            </span>
          </div>
          <Badge size="sm" variant="amber" isLight={isLight}>
            Float32Array + Uint8Array · 0 React Re-render
          </Badge>
        </div>
        <PacingOscilloscopeChart isLight={isLight} />
      </div>

      {/* Chart 6: GoalBarrier2DEditor (2D Boolean Goal Mouth Mask Canvas Editor) */}
      <div id="chart-5b-6-barrier" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Spline className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">6. Goal boolean mask 2D Geometry editor (GoalBarrier2DEditor · 1792 × 644 UU Orthogonal snap decomposition)</span>
          </div>
          <Badge size="sm" variant="neutral" isLight={isLight}>
            New / Add / Subtract / Clear · Disjoint Quad Decomposition
          </Badge>
        </div>
        <GoalBarrier2DEditor isLight={isLight} />
      </div>

      {/* Chart 7: MultiTrackReplayTimeline (3-Track Synchronized Replay Scrubber) */}
      <div id="chart-5b-7-timeline" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">7. Three-track synchronized playback and input signal timeline (MultiTrackReplayTimeline · 120Hz Playhead Ref)</span>
          </div>
          <Badge size="sm" variant="amber" isLight={isLight}>
            Track A Input · Track B Incidents · Track C Signals
          </Badge>
        </div>
        <MultiTrackReplayTimeline isLight={isLight} />
      </div>

      {/* Agent Code Recipe */}
      <CodeBlock
        isLight={isLight}
        title="Agent High-performance clear chart calling recipe (120Hz RingBuffer & Charts Recipe)"
        code={`import {
  TelemetryRingBuffer, TelemetrySparklineChart, EventImpulseScatterChart, CubicBezierCurveEditor,
  ParametricTrajectoryChart, PacingOscilloscopeChart, GoalBarrier2DEditor, MultiTrackReplayTimeline,
} from '@/ui-core/charts/TelemetrySparklineChart';

// 1. 120Hz Zero-allocation mode: In physics/Write directly to network loop Float32Array RingBuffer
const rttRingBuffer = new TelemetryRingBuffer(240);
// Per Frame (120Hz) Invoke, 0 GC, 0 React setState: 
rttRingBuffer.push(latestSampleMs);

<TelemetrySparklineChart
  ringBuffer={rttRingBuffer}
  budgetMs={8.33}
  refreshHz={120}
  phases={cpuPhases}
  isLight={isLight}
/>`}
      />
    </div>
  );
};
