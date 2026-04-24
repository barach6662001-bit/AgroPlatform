/**
 * Elevation system — layered shadows.
 *
 * Each level combines:
 *   • a hairline border (1 px inset-style stroke)         — defines the edge
 *   • a soft ambient shadow                                — defines the volume
 *   • on higher levels, a sharper key shadow              — defines the lift
 *
 * Levels:
 *   0  flush / no elevation
 *   1  subtle hover state, inputs
 *   2  cards, panels
 *   3  popovers, dropdowns
 *   4  modals, sheets
 *   5  toasts, command palette (top of the stack)
 */

export const elevationDark = {
  0: 'none',
  1: '0 1px 2px rgba(0, 0, 0, 0.30)',
  2: '0 0 0 1px rgba(255, 255, 255, 0.06), 0 4px 16px rgba(0, 0, 0, 0.40)',
  3: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 24px rgba(0, 0, 0, 0.45)',
  4: '0 0 0 1px rgba(255, 255, 255, 0.10), 0 16px 48px rgba(0, 0, 0, 0.50)',
  5: '0 0 0 1px rgba(255, 255, 255, 0.12), 0 24px 80px rgba(0, 0, 0, 0.55)',
} as const;

export const elevationLight = {
  0: 'none',
  1: '0 1px 2px rgba(15, 23, 42, 0.06)',
  2: '0 1px 3px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.06)',
  3: '0 2px 6px rgba(15, 23, 42, 0.07), 0 8px 24px rgba(15, 23, 42, 0.08)',
  4: '0 4px 12px rgba(15, 23, 42, 0.09), 0 16px 48px rgba(15, 23, 42, 0.10)',
  5: '0 6px 20px rgba(15, 23, 42, 0.12), 0 24px 80px rgba(15, 23, 42, 0.14)',
} as const;

export const glow = {
  brand: '0 0 20px rgba(34, 197, 94, 0.15)',
} as const;

export type ElevationLevel = keyof typeof elevationDark;
