import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const SRC_DIR = path.join(ROOT_DIR, 'src');

export const LINE_WARN_THRESHOLD = 550;
export const LINE_ERROR_THRESHOLD = 600;

export const BYTE_WARN_THRESHOLD = 22 * 1024; // 22 KB warn
export const BYTE_ERROR_THRESHOLD = 32 * 1024; // 32 KB hard cap

export const MIN_FRAGMENT_LINE_THRESHOLD = 65;

export const SINGLE_LINE_CHAR_WARN_THRESHOLD = 240;

export const WAIST_WARN_THRESHOLD = 12;
export const WAIST_ERROR_THRESHOLD = 16;

export const RECIPE_PROPS_WARN_THRESHOLD = 18;
export const RECIPE_PROPS_ERROR_THRESHOLD = 21; // > 20 flat props is an error

export const GUT_SHARING_PROP_ACCESS_THRESHOLD = 8;

export const ROOT_ENTRY_FILES = new Set([
  'src/main.tsx',
  'src/ui-core/index.ts',
  'src/ui-core/hud/InGameHUD.tsx',
]);

export const FORBIDDEN_UI_CORE_PATHS = new Set([
  'src/ui-core/layout/VStack.tsx',
  'src/ui-core/layout/HStack.tsx',
  'src/ui-core/layout/GridStack.tsx',
  'src/ui-core/compounds/MenuItem.tsx',
  'src/ui-core/compounds/PeerRosterCard.tsx',
  'src/ui-core/compounds/tuner/ColorSwatchInput.tsx',
  'src/ui-core/compounds/tuner/UVTransformControl.tsx',
  'src/ui-core/loading/LoadingScreen.tsx',
  'src/ui-core/loading/DualProgressBar.tsx',
  'src/ui-core/loading/types.ts',
  'src/ui-core/panels/FloatingWindowToolbar.tsx',
  'src/ui-core/primitives/SectionErrorBoundary.tsx',
  'src/ui-core/recipes/Layer1ContextGroupedSelector.tsx',
  'src/ui-core/recipes/recipeStateMatrixSpecs.ts',
  'src/ui-core/stores/livePreviewStore.ts',
  'src/ui-core/stores/themeStore.ts',
  'src/ui-core/viewport/GameViewport.tsx',
]);

export const L1_STATE_SCHEMA_INTERFACES = new Set([
  'ClockPacingParams',
  'PacingControllerParams',
  'MainMenuStyleParams',
  'PlayCardStyleParams',
]);

/**
 * 9-Layer Unidirectional Hierarchy for RCUITuner + RCUIModule (`src/ui-core`)
 * Lower rank cannot import from higher rank.
 */
export const LAYER_RULES = [
  { prefix: 'src/ui-core/tokens/', rank: 1, name: 'L1:Tokens' },
  { prefix: 'src/ui-core/config/', rank: 1, name: 'L1:Config' },
  { prefix: 'src/ui-core/stores/', rank: 1, name: 'L1:Stores' },
  { prefix: 'src/ui-core/utils/', rank: 1, name: 'L1:Utils' },
  { prefix: 'src/ui-core/manifest/surfaceRegistry.ts', rank: 6, name: 'L6:SurfaceRegistry' },
  { prefix: 'src/ui-core/manifest/floatingSurfaceRegistry.ts', rank: 6, name: 'L6:SurfaceRegistry' },
  { prefix: 'src/ui-core/manifest/', rank: 1, name: 'L1:Manifest' },
  { prefix: 'src/ui-core/primitives/', rank: 2, name: 'L2:Primitives' },
  { prefix: 'src/ui-core/layout/', rank: 2, name: 'L2:Layout' },
  { prefix: 'src/ui-core/compounds/', rank: 3, name: 'L3:Compounds' },
  { prefix: 'src/ui-core/charts/', rank: 3, name: 'L3:Charts' },
  { prefix: 'src/ui-core/viewport/', rank: 4, name: 'L4:Viewport' },
  { prefix: 'src/ui-core/hud/', rank: 5, name: 'L5:HUD' },
  { prefix: 'src/ui-core/recipes/', rank: 6, name: 'L6:Recipes' },
  { prefix: 'src/ui-core/panels/', rank: 6, name: 'L6:Panels' },
  { prefix: 'src/ui-core/navigation/', rank: 7, name: 'L7:Navigation' },
  { prefix: 'src/ui-core/index.ts', rank: 7, name: 'L7:UICoreBarrel' },
  { prefix: 'src/showcase/', rank: 8, name: 'L8:Showcase' },
  { prefix: 'src/', rank: 9, name: 'L9:AppRoot' },
];

export const ARBITRARY_SPLIT_FILENAME_RE =
  /(Part[1-9]|Half[1-9]|Chunk[1-9]|Split[1-9]|Section[1-9]$|Tab[1-9]$|Helper[1-9]|PlaybackStepper)/i;

export const FRAGMENT_EXEMPT_FILENAME_RE =
  /(Types|Tokens|Config|Constants|Presets|Specs|Snapshot|Scope|Context|index|main)\.(ts|tsx)$/i;
