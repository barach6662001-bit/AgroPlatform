import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorBgBase:          '#0B1220',
    colorBgContainer:     '#111827',
    colorBgElevated:      '#1a2332',
    colorBgLayout:        '#0B1220',
    colorBgSpotlight:     '#1a2332',
    colorBorder:          '#1f2d42',
    colorBorderSecondary: '#172034',
    colorTextBase:        '#E5E7EB',
    colorText:            '#E5E7EB',
    colorTextSecondary:   '#94A3B8',
    colorTextTertiary:    '#64748B',
    colorTextQuaternary:  '#475569',
    colorPrimary:         '#22C55E',
    colorSuccess:         '#22C55E',
    colorError:           '#EF4444',
    colorWarning:         '#F59E0B',
    colorInfo:            '#3B82F6',
    colorLink:            '#60A5FA',
    colorLinkHover:       '#93C5FD',
    borderRadius:         8,
    borderRadiusLG:       16,
    borderRadiusSM:       6,
    fontFamily:           "'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize:             14,
    fontSizeLG:           16,
    lineHeight:           1.5714,
    controlHeight:        36,
    controlHeightLG:      44,
    boxShadow:            '0 2px 12px rgba(0, 0, 0, 0.45)',
    boxShadowSecondary:   '0 4px 24px rgba(0, 0, 0, 0.55)',
  },
  components: {
    Layout: {
      siderBg:      '#0B1220',
      headerBg:     '#0f1b2d',
      bodyBg:       '#0B1220',
      triggerBg:    '#172034',
      triggerColor: '#94A3B8',
    },
    Menu: {
      darkItemBg:            '#0B1220',
      darkSubMenuItemBg:     '#0B1220',
      darkItemSelectedBg:    '#172034',
      darkItemHoverBg:       '#111827',
      darkItemColor:         '#94A3B8',
      darkItemSelectedColor: '#22C55E',
      darkItemHoverColor:    '#E5E7EB',
      itemBorderRadius:      8,
    },
    Card: {
      colorBgContainer:     '#111827',
      colorBorderSecondary: '#1f2d42',
      borderRadiusLG:       16,
      paddingLG:            24,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   '#111827',
      headerBg:           '#0B1220',
      headerColor:        '#94A3B8',
      headerSortActiveBg: '#172034',
      rowHoverBg:         '#172034',
      borderColor:        '#1f2d42',
      colorText:          '#E5E7EB',
      colorTextHeading:   '#94A3B8',
    },
    Button: {
      colorPrimary:            '#16A34A',
      colorPrimaryHover:       '#22C55E',
      colorPrimaryActive:      '#15803D',
      primaryShadow:           'none',
      borderRadius:            8,
      borderRadiusSM:          6,
      defaultBg:               '#172034',
      defaultColor:            '#E5E7EB',
      defaultBorderColor:      '#1f2d42',
      defaultHoverBg:          '#1f2d42',
      defaultHoverColor:       '#E5E7EB',
      defaultHoverBorderColor: '#94A3B8',
    },
    Input: {
      colorBgContainer:     '#0B1220',
      colorBorder:          '#1f2d42',
      colorText:            '#E5E7EB',
      colorTextPlaceholder: '#475569',
      hoverBorderColor:     '#22C55E',
      activeBorderColor:    '#22C55E',
      activeShadow:         '0 0 0 3px rgba(34, 197, 94, 0.15)',
    },
    Select: {
      colorBgContainer:     '#0B1220',
      colorBorder:          '#1f2d42',
      colorText:            '#E5E7EB',
      colorTextPlaceholder: '#475569',
      optionSelectedBg:     '#172034',
      optionActiveBg:       '#111827',
      colorBgElevated:      '#1a2332',
    },
    Modal: {
      colorBgElevated: '#111827',
      colorBorder:     '#1f2d42',
      titleColor:      '#E5E7EB',
    },
    Drawer: {
      colorBgElevated: '#111827',
    },
    Dropdown: {
      colorBgElevated:    '#1a2332',
      colorText:          '#E5E7EB',
      controlItemBgHover: '#172034',
    },
    Tooltip: {
      colorBgSpotlight:    '#1a2332',
      colorTextLightSolid: '#E5E7EB',
    },
    Pagination: {
      colorBgContainer: '#111827',
      colorText:        '#94A3B8',
      itemActiveBg:     '#172034',
    },
    Statistic: {
      contentFontSize: 24,
      titleFontSize:   13,
    },
    Badge: {
      colorBgContainer: '#111827',
    },
    Tag: {
      defaultBg:    '#172034',
      defaultColor: '#94A3B8',
    },
    Divider: {
      colorSplit: '#1f2d42',
    },
    Spin: {
      colorPrimary: '#22C55E',
    },
    Progress: {
      colorSuccess: '#22C55E',
    },
    Alert: {
      colorSuccessBg:     '#052e16',
      colorSuccessBorder: '#15803D',
      colorErrorBg:       '#2a0f0f',
      colorErrorBorder:   '#7f1d1d',
      colorWarningBg:     '#2a1f00',
      colorWarningBorder: '#78350f',
      colorInfoBg:        '#0a1628',
      colorInfoBorder:    '#1e3a5f',
    },
    DatePicker: {
      colorBgContainer:     '#0B1220',
      colorBorder:          '#1f2d42',
      colorText:            '#E5E7EB',
      colorTextPlaceholder: '#475569',
      colorBgElevated:      '#1a2332',
    },
    Form: {
      labelColor:    '#94A3B8',
      labelFontSize: 13,
    },
    Typography: {
      colorText:           '#E5E7EB',
      colorTextSecondary:  '#94A3B8',
      colorTextDisabled:   '#475569',
      colorLink:           '#60A5FA',
      titleMarginBottom:   '0.5em',
    },
    Result: {
      colorTextDescription: '#94A3B8',
    },
    Empty: {
      colorTextDisabled: '#475569',
    },
    Notification: {
      colorBgElevated: '#111827',
      colorText:       '#E5E7EB',
    },
    Message: {
      colorBgElevated: '#111827',
      colorText:       '#E5E7EB',
    },
  },
  algorithm: undefined,
};

export const CHART_COLORS = [
  '#22C55E', // primary green
  '#60A5FA', // blue
  '#F59E0B', // amber
  '#A78BFA', // violet
  '#34D399', // emerald
  '#FB923C', // orange
  '#F472B6', // pink
  '#38BDF8', // sky
];
