/**
 * Motion tokens — durations + easing curves.
 *
 * Duration semantics:
 *   instant — micro-interactions (hover state colour swap)
 *   fast    — small property changes (button press, focus ring)
 *   base    — most enter/exit transitions (popover, accordion)
 *   slow    — page-level transitions (route change content fade)
 *   slower  — emphasis transitions (sheet open, hero animation)
 *
 * Easing semantics:
 *   standard   — neutral curve, suits most UI (Material "standard")
 *   decelerate — content arriving on screen
 *   accelerate — content leaving the screen
 *   emphasized — high-energy moments (sheet open, drawer slide)
 *   spring     — playful overshoot (counter, badge pop)
 */

export const duration = {
  instant: '50ms',
  fast:    '120ms',
  base:    '180ms',
  slow:    '260ms',
  slower:  '400ms',
} as const;

export const easing = {
  linear:     'linear',
  standard:   'cubic-bezier(0.2, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0, 1)',
  accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
