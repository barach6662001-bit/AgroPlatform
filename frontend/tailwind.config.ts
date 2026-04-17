/**
 * AgroPlatform Tailwind config — v1.0
 * Paired with src/styles/tokens.css
 * Drop at frontend root as tailwind.config.ts
 */
import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './index.html',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Semantic bg
        bg: {
          base:     'hsl(var(--color-bg-base) / <alpha-value>)',
          subtle:   'hsl(var(--color-bg-subtle) / <alpha-value>)',
          muted:    'hsl(var(--color-bg-muted) / <alpha-value>)',
          elevated: 'hsl(var(--color-bg-elevated) / <alpha-value>)',
          inverse:  'hsl(var(--color-bg-inverse) / <alpha-value>)',
        },
        // Semantic text
        fg: {
          primary:   'hsl(var(--color-text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--color-text-secondary) / <alpha-value>)',
          tertiary:  'hsl(var(--color-text-tertiary) / <alpha-value>)',
          disabled:  'hsl(var(--color-text-disabled) / <alpha-value>)',
          inverse:   'hsl(var(--color-text-inverse) / <alpha-value>)',
        },
        // Brand accent
        accent: {
          subtle:  'hsl(var(--color-accent-subtle) / <alpha-value>)',
          muted:   'hsl(var(--color-accent-muted) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-accent-default) / <alpha-value>)',
          solid:   'hsl(var(--color-accent-solid) / <alpha-value>)',
          strong:  'hsl(var(--color-accent-strong) / <alpha-value>)',
          fg:      'hsl(var(--color-accent-fg) / <alpha-value>)',
        },
        success: {
          subtle: 'hsl(var(--color-success-subtle) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-success-solid) / <alpha-value>)',
          fg:     'hsl(var(--color-success-fg) / <alpha-value>)',
        },
        warning: {
          subtle: 'hsl(var(--color-warning-subtle) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-warning-solid) / <alpha-value>)',
          fg:     'hsl(var(--color-warning-fg) / <alpha-value>)',
        },
        danger: {
          subtle: 'hsl(var(--color-danger-subtle) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-danger-solid) / <alpha-value>)',
          fg:     'hsl(var(--color-danger-fg) / <alpha-value>)',
        },
        info: {
          subtle: 'hsl(var(--color-info-subtle) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-info-solid) / <alpha-value>)',
          fg:     'hsl(var(--color-info-fg) / <alpha-value>)',
        },
        // Borders
        border: {
          subtle:  'hsl(var(--color-border-subtle) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-border-default) / <alpha-value>)',
          strong:  'hsl(var(--color-border-strong) / <alpha-value>)',
        },
        // shadcn aliases (DO NOT REMOVE — components depend on these)
        background:  'hsl(var(--background) / <alpha-value>)',
        foreground:  'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT:    'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        input: 'hsl(var(--input) / <alpha-value>)',
        ring:  'hsl(var(--ring) / <alpha-value>)',
        // Chart palette
        chart: {
          1: 'hsl(var(--chart-1) / <alpha-value>)',
          2: 'hsl(var(--chart-2) / <alpha-value>)',
          3: 'hsl(var(--chart-3) / <alpha-value>)',
          4: 'hsl(var(--chart-4) / <alpha-value>)',
          5: 'hsl(var(--chart-5) / <alpha-value>)',
          6: 'hsl(var(--chart-6) / <alpha-value>)',
          7: 'hsl(var(--chart-7) / <alpha-value>)',
          8: 'hsl(var(--chart-8) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm:      'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md:      'var(--radius-md)',
        lg:      'var(--radius-lg)',
        pill:    'var(--radius-pill)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        '2xs': ['var(--text-2xs)', { lineHeight: 'var(--leading-tight)' }],
        xs:   ['var(--text-xs)',  { lineHeight: 'var(--leading-tight)' }],
        sm:   ['var(--text-sm)',  { lineHeight: 'var(--leading-tight)' }],
        base: ['var(--text-base)',{ lineHeight: 'var(--leading-normal)' }],
        md:   ['var(--text-md)',  { lineHeight: 'var(--leading-normal)' }],
        lg:   ['var(--text-lg)',  { lineHeight: 'var(--leading-normal)' }],
        xl:   ['var(--text-xl)',  { lineHeight: 'var(--leading-normal)' }],
        '2xl':['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl':['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl':['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
      },
      boxShadow: {
        flat:     'var(--shadow-flat)',
        elevated: 'var(--shadow-elevated)',
        overlay:  'var(--shadow-overlay)',
      },
      transitionDuration: {
        fast:   'var(--motion-fast)',
        normal: 'var(--motion-normal)',
        slow:   'var(--motion-slow)',
      },
      transitionTimingFunction: {
        out: 'var(--motion-ease)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 150ms var(--motion-ease)',
        'accordion-up':   'accordion-up 150ms var(--motion-ease)',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
};

export default config;
