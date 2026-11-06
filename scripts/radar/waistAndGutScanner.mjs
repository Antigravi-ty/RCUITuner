import {
  GUT_SHARING_PROP_ACCESS_THRESHOLD,
  L1_STATE_SCHEMA_INTERFACES,
  RECIPE_PROPS_ERROR_THRESHOLD,
  RECIPE_PROPS_WARN_THRESHOLD,
  WAIST_ERROR_THRESHOLD,
  WAIST_WARN_THRESHOLD,
} from './constants.mjs';

export function countInterfaceFields(body) {
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.replace(/\/\/.*$/, '').trim())
    .filter((l) => l && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('*/'));

  let braceDepth = 0;
  let parenDepth = 0;
  let propCount = 0;
  let setterCount = 0;
  for (const line of lines) {
    if (braceDepth === 0 && parenDepth === 0) {
      const propMatch = line.match(/^([a-zA-Z0-9_$]+)\??\s*:/);
      if (propMatch) {
        propCount += 1;
        const propName = propMatch[1];
        if (/^(set[A-Z]|on[A-Z]|handle[A-Z])/.test(propName)) {
          setterCount += 1;
        }
      }
    }
    for (const ch of line) {
      if (ch === '{') braceDepth += 1;
      else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
      else if (ch === '(') parenDepth += 1;
      else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
    }
  }
  return { propCount, setterCount };
}

export function countTopLevelDestructuredFields(inner) {
  let depth = 0;
  let current = '';
  const fields = [];
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '{' || ch === '[' || ch === '(') depth += 1;
    else if (ch === '}' || ch === ']' || ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) {
      const cleaned = current.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (cleaned && !cleaned.startsWith('...')) fields.push(cleaned);
      current = '';
      continue;
    }
    current += ch;
  }
  const tail = current.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (tail && !tail.startsWith('...')) fields.push(tail);
  return fields.length;
}

export function analyzeWideWaist(content, relPath) {
  const isAtomicOrHudOrPanelContract =
    relPath.startsWith('src/ui-core/primitives/') ||
    relPath.startsWith('src/ui-core/compounds/') ||
    relPath.startsWith('src/ui-core/hud/') ||
    relPath.startsWith('src/ui-core/navigation/') ||
    /^src\/ui-core\/panels\/(user|dev)\/\w+FloatingWindow\.tsx$/.test(relPath);

  const isTopLevelRecipeFile = /^src\/ui-core\/recipes\/Layer[1-5]\w+Recipe\.tsx$/.test(relPath);

  const findings = [];
  const reportedNames = new Set();

  const interfaceRegex =
    /(?:export\s+)?interface\s+(\w*(?:Props|Params|Refs|Slice|Options))\s*(?:extends\s+[^{]+)?\{([\s\S]*?)\n\}/g;
  let match;
  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const body = match[2];

    if (L1_STATE_SCHEMA_INTERFACES.has(interfaceName)) {
      continue;
    }

    const { propCount, setterCount } = countInterfaceFields(body);
    const isLayerRecipeProps = /^Layer[1-5]\w+RecipeProps$/.test(interfaceName);

    if (isLayerRecipeProps) {
      if (propCount >= RECIPE_PROPS_WARN_THRESHOLD) {
        reportedNames.add(interfaceName);
        findings.push({
          file: relPath,
          interfaceName,
          propCount,
          setterCount,
          kind: 'recipe-props',
          severity: propCount >= RECIPE_PROPS_ERROR_THRESHOLD ? 'error' : 'warn',
        });
      }
      continue;
    }

    if (isAtomicOrHudOrPanelContract && interfaceName.endsWith('Props')) {
      continue;
    }

    if (propCount >= WAIST_WARN_THRESHOLD) {
      reportedNames.add(interfaceName);
      findings.push({
        file: relPath,
        interfaceName,
        propCount,
        setterCount,
        kind: 'interface',
        severity: propCount >= WAIST_ERROR_THRESHOLD ? 'error' : 'warn',
      });
    }
  }

  if (!isAtomicOrHudOrPanelContract && !isTopLevelRecipeFile) {
    const fnHeaderRegex =
      /(?:(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*(?:<[^>]*>)?\s*\(\s*\{|(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*(?::\s*[^=]+)?=\s*(?:React\.(?:memo|forwardRef)\s*\(\s*)*\s*(?:async\s*)?\(\s*\{)/g;

    while ((match = fnHeaderRegex.exec(content)) !== null) {
      const fnName = match[1] || match[2];
      if (!fnName || reportedNames.has(`${fnName}Props`) || reportedNames.has(`${fnName}Params`)) {
        continue;
      }
      const openBraceIdx = match.index + match[0].length - 1;
      let depth = 0;
      let closeBraceIdx = -1;
      for (let i = openBraceIdx; i < content.length; i++) {
        if (content[i] === '{') depth += 1;
        else if (content[i] === '}') {
          depth -= 1;
          if (depth === 0) {
            closeBraceIdx = i;
            break;
          }
        }
      }
      if (closeBraceIdx === -1) continue;
      const inner = content.slice(openBraceIdx + 1, closeBraceIdx);
      const fieldCount = countTopLevelDestructuredFields(inner);
      if (fieldCount >= WAIST_WARN_THRESHOLD) {
        findings.push({
          file: relPath,
          interfaceName: `${fnName}({...})`,
          propCount: fieldCount,
          setterCount: 0,
          kind: 'inline-param',
          severity: fieldCount >= WAIST_ERROR_THRESHOLD ? 'error' : 'warn',
        });
      }
    }
  }

  return findings;
}

export function analyzeGutSharingFunctions(content, relPath) {
  const findings = [];

  if (!relPath.startsWith('src/ui-core/stores/slices/')) {
    const setGetRegex =
      /(?:export\s+)?(?:function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=)\s*(?:<[^>]*>)?\s*\(\s*set\s*(?::[^,)]+)?,\s*get\b/g;
    let sgMatch;
    while ((sgMatch = setGetRegex.exec(content)) !== null) {
      const fnName = sgMatch[1] || sgMatch[2] || 'anonymous';
      findings.push({
        file: relPath,
        fnName,
        paramName: 'set, get',
        accessedCount: 2,
        sampleProps: ['set', 'get'],
        reason: 'Store `(set, get)` closure passed to external helper (gut-sharing split).',
      });
    }
  }

  if (relPath === 'src/ui-core/config/pacingControllerEvaluator.ts') {
    return findings;
  }

  const fnRegex =
    /(?:export\s+)?function\s+([a-zA-Z0-9_$]+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\{/g;
  let match;
  while ((match = fnRegex.exec(content)) !== null) {
    const fnName = match[1];
    if (/^[A-Z]/.test(fnName)) continue;

    const paramsRaw = match[2];
    const paramNames = paramsRaw
      .split(',')
      .map((p) => p.trim().match(/^([a-zA-Z0-9_$]+)\s*(?:\?|:|=|$)/)?.[1])
      .filter(Boolean);

    if (paramNames.length === 0) continue;

    const bodyStartIdx = match.index + match[0].length - 1;
    let depth = 0;
    let bodyEndIdx = content.length;
    for (let i = bodyStartIdx; i < content.length; i++) {
      if (content[i] === '{') depth += 1;
      else if (content[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          bodyEndIdx = i;
          break;
        }
      }
    }
    const body = content.slice(bodyStartIdx, bodyEndIdx);

    for (const paramName of paramNames) {
      if (
        ['e', 'event', 'ctx', 'canvas', 'doc', 'win', 'window', 'document', 'math', 'console'].includes(
          paramName
        )
      ) {
        continue;
      }

      const propRegex = new RegExp(`\\b${paramName}\\.([a-zA-Z0-9_$]+)`, 'g');
      const accessedProps = new Set();
      let pMatch;
      while ((pMatch = propRegex.exec(body)) !== null) {
        accessedProps.add(pMatch[1]);
      }

      if (accessedProps.size < GUT_SHARING_PROP_ACCESS_THRESHOLD) {
        continue;
      }

      const mutRegex = new RegExp(
        `\\b${paramName}\\.([a-zA-Z0-9_$]+)(?:\\.[a-zA-Z0-9_$]+)*\\s*(?:(?<![=!<>])=(?!=)|\\+=|-=|\\*=)`,
        'g'
      );
      const mutatedProps = new Set();
      while ((pMatch = mutRegex.exec(body)) !== null) {
        mutatedProps.add(pMatch[1]);
      }

      const isHostOrRefsParam =
        /^(ctrl|controller|host|instance|owner|self|refs|domRefs)$/i.test(paramName);

      if (isHostOrRefsParam || mutatedProps.size >= 2) {
        findings.push({
          file: relPath,
          fnName,
          paramName,
          accessedCount: accessedProps.size,
          mutatedCount: mutatedProps.size,
          sampleProps: Array.from(accessedProps).slice(0, 8),
        });
      }
    }
  }

  return findings;
}
