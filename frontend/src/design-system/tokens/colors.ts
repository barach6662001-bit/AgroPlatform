/**
 * Color primitives + theme-aware semantic tokens.
 *
 * Architecture:
 *   palette        → raw colors (immutable, never used directly in CSS)
 *   semanticDark   → semantic tokens (dark theme values)
 *   semanticLight  → semantic tokens (light theme values)
 *   cropColors     → domain-specific palette (theme-independent)
 *
 * Keys map 1:1 to CSS variable names (without `--` prefix).
 */

export const palette = {
  green:  { 400: '#22C55E', 500: '#16A34A', 600: '#15803D', 700: '#14532D' },
  red:    { 400: '#F87171', 500: '#EF4444', 600: '#DC2626' },
  amber:  { 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706' },
  blue:   { 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB' },
  purple: { 400: '#C084FC', 500: '#A855F7', 600: '#9333EA' },
  teal:   { 500: '#14B8A6' },
  sky:    { 500: '#0EA5E9' },
  orange: { 500: '#F97316' },
  pink:   { 500: '#EC4899' },
  indigo: { 500: '#6366F1' },
  navy:   { 950: '#060B14', 900: '#0a0a0a', 850: '#101010', 800: '#161616', 700: '#1c1c1c' },
  slate:  { 50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E5E5', 400: '#94A3B8' },
} as const;

/** Domain palette for crop visualisation (same in both themes). */
export const cropColors = {
  wheat:     palette.amber[400],
  sunflower: palette.orange[500],
  corn:      palette.green[400],
  rapeseed:  palette.purple[500],
  barley:    palette.sky[500],
  soy:       palette.teal[500],
  fallow:    palette.slate[400],
} as const;

/** Recharts / data-viz palette ordered for max contrast. */
export const chartColors = [
  palette.green[400],
  palette.blue[500],
  palette.amber[500],
  palette.purple[500],
  palette.teal[500],
  palette.orange[500],
  palette.pink[500],
  palette.sky[500],
] as const;

/**
 * Semantic tokens — dark theme.
 * Keys are CSS-var names verbatim.
 */
export const semanticDark = {
  // Brand
  'brand':         palette.green[400],
  'brand-hover':   palette.green[500],
  'brand-active':  palette.green[600],
  'brand-glow':    'rgba(34, 197, 94, 0.15)',
  'brand-muted':   'rgba(34, 197, 94, 0.08)',
  'brand-border':  'rgba(34, 197, 94, 0.20)',

  // Surfaces
  'bg-page':      palette.navy[900],
  'bg-surface':   palette.navy[850],
  'bg-elevated':  palette.navy[800],
  'bg-hover':     palette.navy[700],

  // Card decorations
  'card-bg':       'rgba(255, 255, 255, 0.03)',
  'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',

  // Text
  'text-primary':   'rgba(255, 255, 255, 0.94)',
  'text-secondary': 'rgba(255, 255, 255, 0.58)',
  'text-tertiary':  'rgba(255, 255, 255, 0.38)',
  'text-disabled':  'rgba(255, 255, 255, 0.20)',
  'text-inverse':   '#0a0a0a',

  // Borders
  'border':         'rgba(255, 255, 255, 0.08)',
  'border-hover':   'rgba(255, 255, 255, 0.14)',
  'border-strong':  'rgba(255, 255, 255, 0.22)',
  'border-focus':   palette.green[400],

  // Status (foreground)
  'success': palette.green[400],
  'warning': palette.amber[500],
  'error':   palette.red[500],
  'info':    palette.blue[500],
  'neutral': palette.indigo[500],

  // Status (muted backgrounds for inline emphasis)
  'success-bg': 'rgba(34, 197, 94, 0.08)',
  'warning-bg': 'rgba(245, 158, 11, 0.08)',
  'error-bg':   'rgba(239, 68, 68, 0.08)',
  'info-bg':    'rgba(59, 130, 246, 0.08)',

  // Accent aliases (kept for analytics screens)
  'accent-revenue': palette.green[400],
  'accent-cost':    palette.red[500],
  'accent-info':    palette.blue[500],
  'accent-warning': palette.amber[500],
  'accent-premium': palette.purple[500],

  // Focus ring (for non-input elements)
  'focus-ring':       '0 0 0 3px rgba(34, 197, 94, 0.35)',
  'focus-ring-error': '0 0 0 3px rgba(239, 68, 68, 0.35)',

  // Selection
  'selection-bg': 'rgba(34, 197, 94, 0.25)',
} as const;

/**
 * Semantic tokens — light theme.
 * Same shape as semanticDark; values inverted for light surfaces.
 */
export const semanticLight: Record<keyof typeof semanticDark, string> = {
  // Brand (slightly darker on light to preserve contrast)
  'brand':         palette.green[500],
  'brand-hover':   palette.green[600],
  'brand-active':  palette.green[700],
  'brand-glow':    'rgba(22, 163, 74, 0.18)',
  'brand-muted':   'rgba(22, 163, 74, 0.10)',
  'brand-border':  'rgba(22, 163, 74, 0.25)',

  // Surfaces
  'bg-page':      palette.slate[50],
  'bg-surface':   '#ffffff',
  'bg-elevated':  '#ffffff',
  'bg-hover':     palette.slate[100],

  // Card decorations
  'card-bg':       '#ffffff',
  'card-gradient': 'linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%)',

  // Text
  'text-primary':   'rgba(15, 23, 42, 0.92)',
  'text-secondary': 'rgba(15, 23, 42, 0.62)',
  'text-tertiary':  'rgba(15, 23, 42, 0.42)',
  'text-disabled':  'rgba(15, 23, 42, 0.24)',
  'text-inverse':   '#ffffff',

  // Borders
  'border':         'rgba(15, 23, 42, 0.08)',
  'border-hover':   'rgba(15, 23, 42, 0.14)',
  'border-strong':  'rgba(15, 23, 42, 0.22)',
  'border-focus':   palette.green[500],

  // Status
  'success': palette.green[500],
  'warning': palette.amber[600],
  'error':   palette.red[600],
  'info':    palette.blue[600],
  'neutral': palette.indigo[500],

  // Status (muted backgrounds)
  'success-bg': 'rgba(22, 163, 74, 0.10)',
  'warning-bg': 'rgba(217, 119, 6, 0.10)',
  'error-bg':   'rgba(220, 38, 38, 0.10)',
  'info-bg':    'rgba(37, 99, 235, 0.10)',

  // Accent aliases
  'accent-revenue': palette.green[500],
  'accent-cost':    palette.red[600],
  'accent-info':    palette.blue[600],
  'accent-warning': palette.amber[600],
  'accent-premium': palette.purple[600],

  // Focus ring
  'focus-ring':       '0 0 0 3px rgba(22, 163, 74, 0.30)',
  'focus-ring-error': '0 0 0 3px rgba(220, 38, 38, 0.25)',

  // Selection
  'selection-bg': 'rgba(22, 163, 74, 0.18)',
};

export type SemanticTokenKey = keyof typeof semanticDark;
