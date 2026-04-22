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
      siderBg:      'var(--bg-surface)',
      headerBg:     'var(--bg-surface)',
      bodyBg:       'var(--bg-page)',
      triggerBg:    'var(--bg-hover)',
      triggerColor: 'var(--text-secondary)',
    },
    Menu: {
      darkItemBg:            'var(--bg-surface)',
      darkSubMenuItemBg:     'var(--bg-surface)',
      darkItemSelectedBg:    'var(--brand-muted)',
      darkItemHoverBg:       'var(--bg-hover)',
      darkItemColor:         'var(--text-secondary)',
      darkItemSelectedColor: 'var(--brand)',
      darkItemHoverColor:    'var(--text-primary)',
      itemBorderRadius:      8,
      itemHeight:            36,
      itemMarginInline:      8,
    },
    Card: {
      colorBgContainer:     'var(--bg-surface)',
      colorBorderSecondary: 'var(--border)',
      borderRadiusLG:       12,
      paddingLG:            20,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   'transparent',
      headerBg:           'rgba(255, 255, 255, 0.02)',
      headerColor:        'var(--text-tertiary)',
      headerSortActiveBg: 'rgba(255, 255, 255, 0.04)',
      rowHoverBg:         'rgba(255, 255, 255, 0.03)',
      borderColor:        'var(--border)',
      colorText:          'var(--text-primary)',
      colorTextHeading:   'var(--text-tertiary)',
    },
    Button: {
      colorPrimary:            'var(--brand)',
      colorPrimaryHover:       'var(--brand-hover)',
      colorPrimaryActive:      '#15803d',
      primaryShadow:           'none',
      primaryColor:            '#000000',
      borderRadius:            8,
      borderRadiusSM:          6,
      defaultBg:               'rgba(255, 255, 255, 0.06)',
      defaultColor:            'var(--text-primary)',
      defaultBorderColor:      'var(--border-hover)',
      defaultHoverBg:          'rgba(255, 255, 255, 0.08)',
      defaultHoverColor:       'var(--text-primary)',
      defaultHoverBorderColor: 'var(--border-strong)',
    },
    Input: {
      colorBgContainer:     'var(--bg-elevated)',
      colorBorder:          'var(--border-hover)',
      colorText:            'var(--text-primary)',
      colorTextPlaceholder: 'var(--text-tertiary)',
      hoverBorderColor:     'var(--border-strong)',
      activeBorderColor:    'var(--brand)',
      activeShadow:         '0 0 0 3px var(--brand-glow)',
    },
    Select: {
      colorBgContainer:     'var(--bg-elevated)',
      colorBorder:          'var(--border-hover)',
      colorText:            'var(--text-primary)',
      colorTextPlaceholder: 'var(--text-tertiary)',
      optionSelectedBg:     'var(--brand-muted)',
      optionActiveBg:       'var(--bg-hover)',
      colorBgElevated:      'var(--bg-surface)',
    },
    Modal: {
      colorBgElevated: 'var(--bg-surface)',
      colorBorder:     'var(--border)',
      titleColor:      'var(--text-primary)',
    },
    Drawer: {
      colorBgElevated: 'var(--bg-surface)',
    },
    Dropdown: {
      colorBgElevated:    'var(--bg-surface)',
      colorText:          'var(--text-primary)',
      controlItemBgHover: 'var(--bg-hover)',
    },
    Tooltip: {
      colorBgSpotlight:    'var(--bg-hover)',
      colorTextLightSolid: 'var(--text-primary)',
    },
    Pagination: {
      colorBgContainer: 'var(--bg-elevated)',
      colorText:        'var(--text-secondary)',
      itemActiveBg:     'var(--brand-muted)',
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize:   11,
    },
    Badge: {
      colorBgContainer: 'var(--bg-surface)',
    },
    Tag: {
      defaultBg:    'var(--bg-hover)',
      defaultColor: 'var(--text-secondary)',
    },
    Divider: {
      colorSplit: 'var(--border)',
    },
    Spin: {
      colorPrimary: 'var(--brand)',
    },
    Progress: {
      colorSuccess: 'var(--brand)',
    },
    Alert: {
      colorSuccessBg:     'var(--success-bg)',
      colorSuccessBorder: 'var(--brand-border)',
      colorErrorBg:       'var(--error-bg)',
      colorErrorBorder:   'rgba(239, 68, 68, 0.2)',
      colorWarningBg:     'var(--warning-bg)',
      colorWarningBorder: 'rgba(245, 158, 11, 0.2)',
      colorInfoBg:        'var(--info-bg)',
      colorInfoBorder:    'rgba(59, 130, 246, 0.2)',
    },
    DatePicker: {
      colorBgContainer:     'var(--bg-elevated)',
      colorBorder:          'var(--border-hover)',
      colorText:            'var(--text-primary)',
      colorTextPlaceholder: 'var(--text-tertiary)',
      colorBgElevated:      'var(--bg-surface)',
    },
    Form: {
      labelColor:    'var(--text-secondary)',
      labelFontSize: 12,
    },
    Typography: {
      colorText:           'var(--text-primary)',
      colorTextSecondary:  'var(--text-secondary)',
      colorTextDisabled:   'var(--text-tertiary)',
      colorLink:           'var(--brand)',
      titleMarginBottom:   '0.5em',
    },
    Result: {
      colorTextDescription: 'var(--text-secondary)',
    },
    Empty: {
      colorTextDisabled: 'var(--text-tertiary)',
    },
    Notification: {
      colorBgElevated: 'var(--bg-surface)',
      colorText:       'var(--text-primary)',
    },
    Message: {
      colorBgElevated: 'var(--bg-surface)',
      colorText:       'var(--text-primary)',
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
