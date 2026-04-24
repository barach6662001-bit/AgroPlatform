/**
 * Spacing scale on a 4 px base grid.
 *
 * Numeric keys map to multiples of 4: e.g. `space-2` = 8 px, `space-6` = 24 px.
 * The half-step values (`0_5`, `1_5`) cover icon padding and tight inline gaps.
 */

export const spacing = {
  '0':   '0',
  'px':  '1px',
  '0_5': '2px',
  '1':   '4px',
  '1_5': '6px',
  '2':   '8px',
  '3':   '12px',
  '4':   '16px',
  '5':   '20px',
  '6':   '24px',
  '7':   '28px',
  '8':   '32px',
  '10':  '40px',
  '12':  '48px',
  '14':  '56px',
  '16':  '64px',
  '20':  '80px',
  '24':  '96px',
} as const;

export type SpacingKey = keyof typeof spacing;
