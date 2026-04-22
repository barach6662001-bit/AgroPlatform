import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    // Single source of truth: CSS custom properties from styles/tokens.css.
    // This removes the historical mismatch between AntD-rendered surfaces
    // and custom CSS-var surfaces.
    colorBgBase:          'var(--bg-page)',
    colorBgContainer:     'var(--bg-surface)',
    colorBgElevated:      'var(--bg-elevated)',
    colorBgLayout:        'var(--bg-page)',
    colorBgSpotlight:     'var(--bg-elevated)',
    colorBorder:          'var(--border)',
    colorBorderSecondary: 'var(--border-hover)',
    colorTextBase:        'var(--text-primary)',
    colorText:            'var(--text-primary)',
    colorTextSecondary:   'var(--text-secondary)',
    colorTextTertiary:    'var(--text-tertiary)',
    colorTextQuaternary:  'var(--text-disabled)',
    colorPrimary:         '#22C55E',
    colorSuccess:         '#22C55E',
    colorError:           '#EF4444',
    colorWarning:         '#F59E0B',
    colorInfo:            '#3B82F6',
    colorLink:            '#22C55E',
    colorLinkHover:       '#16A34A',
    borderRadius:         8,
    borderRadiusLG:       12,
    borderRadiusSM:       6,
    fontFamily:           "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize:             13,
    fontSizeLG:           15,
    lineHeight:           1.5,
    controlHeight:        36,
    controlHeightLG:      40,
    boxShadow:            'none',
    boxShadowSecondary:   'none',
    wireframe:            false,
  },
  components: {
    Layout: {
      siderBg:      '#101010',
      headerBg:     '#101010',
      bodyBg:       '#0a0a0a',
      triggerBg:    '#1c1c1c',
      triggerColor: '#a1a1a1',
    },
    Menu: {
      darkItemBg:            '#101010',
      darkSubMenuItemBg:     '#101010',
      darkItemSelectedBg:    'rgba(34, 197, 94, 0.08)',
      darkItemHoverBg:       '#1c1c1c',
      darkItemColor:         'rgba(255, 255, 255, 0.55)',
      darkItemSelectedColor: '#22C55E',
      darkItemHoverColor:    'rgba(255, 255, 255, 0.85)',
      itemBorderRadius:      8,
      itemHeight:            36,
      itemMarginInline:      8,
    },
    Card: {
      colorBgContainer:     '#101010',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
      borderRadiusLG:       12,
      paddingLG:            20,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   'transparent',
      headerBg:           'rgba(255, 255, 255, 0.02)',
      headerColor:        'rgba(255, 255, 255, 0.38)',
      headerSortActiveBg: 'rgba(255, 255, 255, 0.04)',
      rowHoverBg:         'rgba(255, 255, 255, 0.03)',
      borderColor:        'rgba(255, 255, 255, 0.08)',
      colorText:          'rgba(255, 255, 255, 0.85)',
      colorTextHeading:   'rgba(255, 255, 255, 0.4)',
    },
    Button: {
      colorPrimary:            '#22C55E',
      colorPrimaryHover:       '#16A34A',
      colorPrimaryActive:      '#15803d',
      primaryShadow:           'none',
      primaryColor:            '#000000',
      borderRadius:            8,
      borderRadiusSM:          6,
      defaultBg:               'rgba(255, 255, 255, 0.06)',
      defaultColor:            'rgba(255, 255, 255, 0.8)',
      defaultBorderColor:      'rgba(255, 255, 255, 0.14)',
      defaultHoverBg:          'rgba(255, 255, 255, 0.08)',
      defaultHoverColor:       'rgba(255, 255, 255, 0.92)',
      defaultHoverBorderColor: 'rgba(255, 255, 255, 0.2)',
    },
    Input: {
      colorBgContainer:     '#161616',
      colorBorder:          'rgba(255, 255, 255, 0.14)',
      colorText:            'rgba(255, 255, 255, 0.92)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.35)',
      hoverBorderColor:     'rgba(255, 255, 255, 0.2)',
      activeBorderColor:    '#22C55E',
      activeShadow:         '0 0 0 3px rgba(34, 197, 94, 0.1)',
    },
    Select: {
      colorBgContainer:     '#161616',
      colorBorder:          'rgba(255, 255, 255, 0.14)',
      colorText:            'rgba(255, 255, 255, 0.94)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.38)',
      optionSelectedBg:     'rgba(34, 197, 94, 0.08)',
      optionActiveBg:       '#1c1c1c',
      colorBgElevated:      '#101010',
    },
    Modal: {
      colorBgElevated: '#101010',
      colorBorder:     'rgba(255, 255, 255, 0.08)',
      titleColor:      'rgba(255, 255, 255, 0.94)',
    },
    Drawer: {
      colorBgElevated: '#101010',
    },
    Dropdown: {
      colorBgElevated:    '#101010',
      colorText:          'rgba(255, 255, 255, 0.85)',
      controlItemBgHover: '#1c1c1c',
    },
    Tooltip: {
      colorBgSpotlight:    '#1c1c1c',
      colorTextLightSolid: 'rgba(255, 255, 255, 0.94)',
    },
    Pagination: {
      colorBgContainer: '#161616',
      colorText:        'rgba(255, 255, 255, 0.55)',
      itemActiveBg:     'rgba(34, 197, 94, 0.08)',
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize:   11,
    },
    Badge: {
      colorBgContainer: '#101010',
    },
    Tag: {
      defaultBg:    '#1c1c1c',
      defaultColor: 'rgba(255, 255, 255, 0.55)',
    },
    Divider: {
      colorSplit: 'rgba(255, 255, 255, 0.08)',
    },
    Spin: {
      colorPrimary: '#22C55E',
    },
    Progress: {
      colorSuccess: '#22C55E',
    },
    Alert: {
      colorSuccessBg:     'rgba(34, 197, 94, 0.08)',
      colorSuccessBorder: 'rgba(34, 197, 94, 0.2)',
      colorErrorBg:       'rgba(239, 68, 68, 0.08)',
      colorErrorBorder:   'rgba(239, 68, 68, 0.2)',
      colorWarningBg:     'rgba(245, 158, 11, 0.08)',
      colorWarningBorder: 'rgba(245, 158, 11, 0.2)',
      colorInfoBg:        'rgba(59, 130, 246, 0.08)',
      colorInfoBorder:    'rgba(59, 130, 246, 0.2)',
    },
    DatePicker: {
      colorBgContainer:     '#161616',
      colorBorder:          'rgba(255, 255, 255, 0.14)',
      colorText:            'rgba(255, 255, 255, 0.94)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.38)',
      colorBgElevated:      '#101010',
    },
    Form: {
      labelColor:    'rgba(255, 255, 255, 0.6)',
      labelFontSize: 12,
    },
    Typography: {
      colorText:           'rgba(255, 255, 255, 0.94)',
      colorTextSecondary:  'rgba(255, 255, 255, 0.58)',
      colorTextDisabled:   'rgba(255, 255, 255, 0.38)',
      colorLink:           '#22C55E',
      titleMarginBottom:   '0.5em',
    },
    Result: {
      colorTextDescription: 'rgba(255, 255, 255, 0.55)',
    },
    Empty: {
      colorTextDisabled: 'rgba(255, 255, 255, 0.35)',
    },
    Notification: {
      colorBgElevated: '#101010',
      colorText:       'rgba(255, 255, 255, 0.94)',
    },
    Message: {
      colorBgElevated: '#101010',
      colorText:       'rgba(255, 255, 255, 0.94)',
    },
  },
  algorithm: theme.darkAlgorithm,
};

export const CHART_COLORS = [
  '#22C55E', // green — primary
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#A855F7', // purple
  '#14B8A6', // teal
  '#F97316', // orange
  '#EC4899', // pink
  '#0EA5E9', // sky
];
