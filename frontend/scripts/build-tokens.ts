/**
 * Token generator — TS → CSS.
 *
 * Reads `src/design-system/tokens/index.ts` and emits
 * `src/styles/tokens.css` with:
 *   • theme-independent vars under `:root`
 *   • dark theme semantics under `:root` (default) and `[data-theme="dark"]`
 *   • light theme semantics under `[data-theme="light"]`
 *
 * Run:  `npm run build:tokens`
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  tokens,
  themeTokens,
  semanticDark,
  semanticLight,
  fontScale,
  cropColors,
} from '../src/design-system/tokens/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '../src/styles/tokens.css');

mkdirSync(dirname(outPath), { recursive: true });

type CssVar = readonly [name: string, value: string, comment?: string];

const sectionHeader = (label: string): string =>
  `\n  /* ── ${label} ─────────────────────────────────────────────────── */\n`;

const renderVar = ([name, value]: CssVar): string => `  --${name}: ${value};`;

const renderBlock = (selector: string, sections: Array<[string, CssVar[]]>): string => {
  const body = sections
    .filter(([, vars]) => vars.length > 0)
    .map(([label, vars]) => sectionHeader(label) + vars.map(renderVar).join('\n'))
    .join('\n');
  return `${selector} {${body}\n}\n`;
};

// ─── Theme-independent token blocks ────────────────────────────────────────

const spacingVars: CssVar[] = Object.entries(tokens.spacing).map(
  ([k, v]) => [`space-${k.replace('_', '-')}`, v] as const
);

const radiusVars: CssVar[] = Object.entries(tokens.radius).map(
  ([k, v]) => [`radius-${k}`, v] as const
);

const fontFamilyVars: CssVar[] = [
  ['font-sans',    tokens.fontFamilies.sans],
  ['font-mono',    tokens.fontFamilies.mono],
  ['font-tabular', tokens.fontFamilies.tabular],
];

const fontWeightVars: CssVar[] = Object.entries(tokens.fontWeights).map(
  ([k, v]) => [`font-weight-${k}`, String(v)] as const
);

const fontScaleVars: CssVar[] = Object.entries(fontScale).flatMap(([k, step]) => {
  const out: CssVar[] = [
    [`font-size-${k}`,   step.size],
    [`line-height-${k}`, String(step.lineHeight)],
  ];
  if (step.weight)        out.push([`font-weight-${k}-step`, String(step.weight)]);
  if (step.letterSpacing) out.push([`letter-spacing-${k}`,   step.letterSpacing]);
  return out;
});

const letterSpacingVars: CssVar[] = Object.entries(tokens.letterSpacing).map(
  ([k, v]) => [`tracking-${k}`, v] as const
);

const motionVars: CssVar[] = [
  ...Object.entries(tokens.duration).map(([k, v]) => [`duration-${k}`, v] as const),
  ...Object.entries(tokens.easing).map(([k, v]) => [`easing-${k}`, v] as const),
];

const zIndexVars: CssVar[] = Object.entries(tokens.zIndex).map(
  ([k, v]) => [`z-${k}`, String(v)] as const
);

const breakpointVars: CssVar[] = Object.entries(tokens.breakpoints).map(
  ([k, v]) => [`bp-${k}`, v] as const
);

const cropVars: CssVar[] = Object.entries(cropColors).map(
  ([k, v]) => [`crop-${k}`, v] as const
);

const glowVars: CssVar[] = Object.entries(tokens.glow).map(
  ([k, v]) => [`glow-${k}`, v] as const
);

// ─── Theme-aware semantic blocks ───────────────────────────────────────────

const buildSemantic = (theme: typeof semanticDark | typeof semanticLight): CssVar[] =>
  Object.entries(theme).map(([k, v]) => [k, v] as const);

const buildElevation = (
  theme: typeof themeTokens.dark.elevation | typeof themeTokens.light.elevation
): CssVar[] =>
  Object.entries(theme).map(([level, value]) => [`shadow-${level}`, value] as const);

// ─── Legacy aliases (preserve every var name from the previous tokens.css) ──

const legacyAliases: CssVar[] = [
  ['bg-app',              'var(--bg-page)'],
  ['bg-overlay',          'var(--bg-hover)'],
  ['bg-subtle',           'var(--bg-elevated)'],
  ['bg-base',             'var(--bg-page)'],
  ['color-page-bg',       'var(--bg-page)'],
  ['color-card-bg',       'var(--bg-surface)'],
  ['color-elevated-bg',   'var(--bg-elevated)'],
  ['color-input-bg',      'var(--bg-elevated)'],
  ['color-hover-bg',      'var(--bg-hover)'],
  ['color-primary',       'var(--brand)'],
  ['color-primary-hover', 'var(--brand-hover)'],
  ['border-default',      'var(--border)'],
  ['shadow-sm',           'var(--shadow-1)'],
  ['shadow-md',           'var(--shadow-2)'],
  ['shadow-lg',           'var(--shadow-4)'],
  ['shadow-card',         'var(--shadow-2)'],
  ['shadow-glow',         'var(--glow-brand)'],
  ['transition-fast',     'var(--duration-fast) var(--easing-standard)'],
  ['transition-base',     'var(--duration-base) var(--easing-standard)'],
  ['transition-slow',     'var(--duration-slow) var(--easing-standard)'],
];

// ─── Render the file ───────────────────────────────────────────────────────

const banner = `/*
 * AUTO-GENERATED — DO NOT EDIT
 *
 * Source of truth: src/design-system/tokens/*.ts
 * Generator:       scripts/build-tokens.ts
 * Re-generate:     npm run build:tokens
 *
 * This file is committed (not ignored) so HMR/SSR pick it up immediately.
 * Always regenerate after editing the TS sources, or CI will fail the diff.
 */

`;

const rootBlock = renderBlock(':root', [
  ['Spacing scale (4 px grid)',  spacingVars],
  ['Radius',                     radiusVars],
  ['Typography — families',      fontFamilyVars],
  ['Typography — weights',       fontWeightVars],
  ['Typography — fluid scale',   fontScaleVars],
  ['Typography — tracking',      letterSpacingVars],
  ['Motion',                     motionVars],
  ['Breakpoints (informational)', breakpointVars],
  ['Z-index',                    zIndexVars],
  ['Crop palette',               cropVars],
  ['Glow effects',               glowVars],
  ['Theme — dark (default)',     buildSemantic(semanticDark)],
  ['Elevation — dark (default)', buildElevation(themeTokens.dark.elevation)],
  ['Legacy aliases — DO NOT use in new code', legacyAliases],
]);

const darkBlock = renderBlock(`[data-theme='dark']`, [
  ['Theme — dark (explicit)',     buildSemantic(semanticDark)],
  ['Elevation — dark (explicit)', buildElevation(themeTokens.dark.elevation)],
]);

const lightBlock = renderBlock(`[data-theme='light']`, [
  ['Theme — light',     buildSemantic(semanticLight)],
  ['Elevation — light', buildElevation(themeTokens.light.elevation)],
]);

const css = banner + rootBlock + '\n' + darkBlock + '\n' + lightBlock;

writeFileSync(outPath, css, 'utf8');

const lineCount = css.split('\n').length;
console.log(`✓ tokens.css regenerated (${lineCount} lines) → ${outPath}`);
