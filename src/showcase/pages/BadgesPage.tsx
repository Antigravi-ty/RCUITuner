import React, { useEffect } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { Tag, Gamepad2, Keyboard as KeyboardIcon, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

const useState = createScopedSyncedState('page:badges');
import { Badge } from '../../ui-core/primitives/Badge';
import { KeycapBadge } from '../../ui-core/primitives/KeycapBadge';
import { Button } from '../../ui-core/primitives/Button';
import { HStack } from '../../ui-core/layout/HStack';
import { VStack } from '../../ui-core/layout/VStack';
import { CodeBlock } from '../CodeBlock';

export const BadgesPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Listen to physical keyboard events for interactive tester
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      setActiveKey(e.key.toUpperCase());
    };
    const handleUp = () => {
      setActiveKey(null);
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  const keys = ['ESC', 'TAB', 'W', 'A', 'S', 'D', 'SPACE', 'ENTER', 'SHIFT', 'CTRL', 'F4'];
  const padKeys = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'START'];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Badge & Keycap Badges and Keycaps</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Standardized atomic controls for status badges and shortcut keys. Standardize Two States (rounded rectangle / capsule Capsule) , Three size modifiers (Small / Medium / Large) , Completely remove redundant drop shadows, Clear contrast against gray background. 
        </p>
      </div>

      {/* 1. Status Badges & Shapes */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Tag className="h-4 w-4 text-amber-500" />
          <span>1. Status Badge (Status Badge) Contrast with State</span>
        </div>

        {/* Shape 1: Rounded Rectangle (Default) */}
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
            Form A: rounded rectangle Rounded Rectangle (default recommendation, General Scenarios)
          </span>
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="default" shape="rounded" isLight={isLight}>DEFAULT</Badge>
            <Badge variant="primary" shape="rounded" isLight={isLight} dot>ACTIVE</Badge>
            <Badge variant="success" shape="rounded" isLight={isLight} dot>ONLINE 120 FPS</Badge>
            <Badge variant="warning" shape="rounded" isLight={isLight} icon={<AlertTriangle className="h-3 w-3" />}>HIGH PING</Badge>
            <Badge variant="danger" shape="rounded" isLight={isLight} dot>DISCONNECTED</Badge>
            <Badge variant="outline" shape="rounded" isLight={isLight}>v2.4.0-WASM</Badge>
          </div>
        </div>

        {/* Shape 2: Capsule / Pill */}
        <div className="flex flex-col gap-2 mt-2">
          <span className={`text-xs font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
            Form B: Capsule Style Capsule / Pill (Used for compact indicators and counters)
          </span>
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="default" shape="pill" isLight={isLight}>DEFAULT</Badge>
            <Badge variant="primary" shape="pill" isLight={isLight} dot>ACTIVE</Badge>
            <Badge variant="success" shape="pill" isLight={isLight} dot>READY</Badge>
            <Badge variant="danger" shape="pill" isLight={isLight}>RANK 1</Badge>
            <Badge variant="outline" shape="pill" isLight={isLight}>STAGE 2</Badge>
          </div>
        </div>

        {/* Size Modifiers */}
        <HStack gap="md" align="center" className="mt-2 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800">
          <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Dimensions (Modifiers): </span>
          <Badge size="sm" variant="primary" isLight={isLight}>Small (sm)</Badge>
          <Badge size="md" variant="primary" isLight={isLight}>Medium (md)</Badge>
          <Badge size="lg" variant="primary" isLight={isLight}>Large (lg)</Badge>
        </HStack>
      </div>

      {/* 2. Keycaps Showcase */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <KeyboardIcon className="h-4 w-4 text-indigo-500" />
          <span>2. Keyboard Key Badge (KeycapBadge - Flat / No Heavy Bottom Shadow)</span>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Discard abrupt bottom 3D sunken shadows, Flat, clean, and refined badge design. Clear contrast between background color and gray base, Support real-time tap highlight: 
        </p>

        <HStack
          gap="sm"
          wrap
          className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-900/90 border-neutral-700/80'
          }`}
        >
          {keys.map((k) => (
            <KeycapBadge
              key={k}
              shortcut={k}
              size="md"
              isLight={isLight}
              pressed={activeKey === k}
            />
          ))}
        </HStack>

        <HStack gap="md" align="center" className="mt-1">
          <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Size Modifier: </span>
          <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
          <KeycapBadge shortcut="TAB" size="md" isLight={isLight} />
          <KeycapBadge shortcut="TAB" size="lg" isLight={isLight} />
        </HStack>
      </div>

      {/* 3. Gamepad Badges */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Gamepad2 className="h-4 w-4 text-emerald-500" />
          <span>3. Controller button badge (KeycapBadge - Gamepad)</span>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Match Xbox / PlayStation Controller color specification, No Thick Bottom Shadow, Clear and Distinct: 
        </p>

        <HStack
          gap="sm"
          wrap
          className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-900/90 border-neutral-700/80'
          }`}
        >
          {padKeys.map((pk) => (
            <KeycapBadge
              key={pk}
              shortcut={pk}
              kind="gamepad"
              size="md"
              isLight={isLight}
            />
          ))}
        </HStack>
      </div>

      {/* 4. Button with Keycap Integration */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <span className="font-bold text-sm">4. Button internal shortcut badge linkage (Button with Keycap Slot)</span>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Button auto-embeds flat style KeycapBadge, Farewell to abrupt shadows, Smooth and clean visual hierarchy: 
        </p>
        <HStack gap="md" wrap>
          <Button variant="primary" shortcut="ESC" isLight={isLight}>
            Resume Game
          </Button>
          <Button variant="secondary" shortcut="ENTER" isLight={isLight}>
            Confirm Selection
          </Button>
          <Button variant="outline" shortcut="TAB" isLight={isLight}>
            Scoreboard
          </Button>
          <Button variant="danger" shortcut="F4" isLight={isLight}>
            Forfeit Match
          </Button>
        </HStack>
      </div>

      {/* Code Snippet for AI Agents */}
      <CodeBlock
        isLight={isLight}
        title="Agent code recipe (Badge & Keycap Recipe)"
        code={`import { Badge } from '@/ui-core/primitives/Badge';
import { KeycapBadge } from '@/ui-core/primitives/KeycapBadge';
import { Button } from '@/ui-core/primitives/Button';

// 1. Status Badge: rounded rectangle (default) With Capsule Style
<Badge variant="success" dot isLight={isLight}>ONLINE</Badge>
<Badge variant="primary" shape="pill" isLight={isLight}>CAPSULE</Badge>

// 2. Physical Keyboard Key (No Bottom Shadow, Clear and Flat) 
<KeycapBadge shortcut="ESC" size="sm" isLight={isLight} />
<KeycapBadge shortcut="SPACE" size="md" isLight={isLight} />

// 3. Gamepad controller buttons
<KeycapBadge shortcut="RT" kind="gamepad" size="sm" isLight={isLight} />

// 4. Button shortcut slot integration
<Button variant="primary" shortcut="ESC" isLight={isLight}>
  Resume Match
</Button>`}
      />
    </div>
  );
};
