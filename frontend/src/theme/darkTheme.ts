import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorBgBase:          '#0a0f0d',
    colorBgContainer:     '#111814',
    colorBgElevated:      '#1a2320',
    colorBgLayout:        '#0a0f0d',
    colorBgSpotlight:     '#1a2320',
    colorBorder:          '#1f2d24',
    colorBorderSecondary: '#1f2d24',
    colorTextBase:        '#f0fdf4',
    colorText:            '#f0fdf4',
    colorTextSecondary:   '#86efac',
    colorTextTertiary:    '#4ade80',
    colorTextQuaternary:  '#166534',
    colorPrimary:         '#16a34a',
    colorSuccess:         '#22c55e',
    colorError:           '#ef4444',
    colorWarning:         '#f59e0b',
    colorInfo:            '#3b82f6',
    colorLink:            '#60a5fa',
    colorLinkHover:       '#93c5fd',
    borderRadius:         8,
    borderRadiusLG:       16,
    borderRadiusSM:       6,
    fontFamily:           "'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize:             14,
    fontSizeLG:           16,
    lineHeight:           1.5714,
    controlHeight:        38,
    controlHeightLG:      44,
    boxShadow:            '0 2px 12px rgba(0, 0, 0, 0.45)',
    boxShadowSecondary:   '0 4px 24px rgba(0, 0, 0, 0.55)',
  },
  components: {
    Layout: {
      siderBg:      '#0d1510',
      headerBg:     '#0a0f0d',
      bodyBg:       '#0a0f0d',
      triggerBg:    '#1f2d24',
      triggerColor: '#86efac',
    },
    Menu: {
      darkItemBg:            '#0d1510',
      darkSubMenuItemBg:     '#0a0f0d',
      darkItemSelectedBg:    '#1f2d24',
      darkItemHoverBg:       '#111814',
      darkItemColor:         '#86efac',
      darkItemSelectedColor: '#4ade80',
      darkItemHoverColor:    '#f0fdf4',
      itemBorderRadius:      8,
    },
    Card: {
      colorBgContainer:     '#111814',
      colorBorderSecondary: '#1f2d24',
      borderRadiusLG:       16,
      paddingLG:            24,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   'transparent',
      headerBg:           '#111814',
      headerColor:        '#4ade80',
      headerSortActiveBg: '#1f2d24',
      rowHoverBg:         '#1a2320',
      borderColor:        '#1f2d24',
      colorText:          '#f0fdf4',
      colorTextHeading:   '#4ade80',
    },
    Button: {
      colorPrimary:            '#16a34a',
      colorPrimaryHover:       '#15803d',
      colorPrimaryActive:      '#166534',
      primaryShadow:           'none',
      borderRadius:            8,
      borderRadiusSM:          6,
      defaultBg:               '#1f2d24',
      defaultColor:            '#f0fdf4',
      defaultBorderColor:      '#1f2d24',
      defaultHoverBg:          '#243028',
      defaultHoverColor:       '#f0fdf4',
      defaultHoverBorderColor: '#2d4a35',
    },
    Input: {
      colorBgContainer:     '#1a2320',
      colorBorder:          '#1f2d24',
      colorText:            '#f0fdf4',
      colorTextPlaceholder: '#4ade80',
      hoverBorderColor:     '#16a34a',
      activeBorderColor:    '#16a34a',
      activeShadow:         '0 0 0 3px rgba(22, 163, 74, 0.15)',
    },
    Select: {
      colorBgContainer:     '#1a2320',
      colorBorder:          '#1f2d24',
      colorText:            '#f0fdf4',
      colorTextPlaceholder: '#4ade80',
      optionSelectedBg:     '#1f2d24',
      optionActiveBg:       '#111814',
      colorBgElevated:      '#1a2320',
    },
    Modal: {
      colorBgElevated: '#111814',
      colorBorder:     '#1f2d24',
      titleColor:      '#f0fdf4',
    },
    Drawer: {
      colorBgElevated: '#111814',
    },
    Dropdown: {
      colorBgElevated:    '#1a2320',
      colorText:          '#f0fdf4',
      controlItemBgHover: '#1f2d24',
    },
    Tooltip: {
      colorBgSpotlight:    '#1a2320',
      colorTextLightSolid: '#f0fdf4',
    },
    Pagination: {
      colorBgContainer: '#111814',
      colorText:        '#86efac',
      itemActiveBg:     '#1f2d24',
    },
    Statistic: {
      contentFontSize: 24,
      titleFontSize:   13,
    },
    Badge: {
      colorBgContainer: '#111814',
    },
    Tag: {
      defaultBg:    '#1f2d24',
      defaultColor: '#86efac',
    },
    Divider: {
      colorSplit: '#1f2d24',
    },
    Spin: {
      colorPrimary: '#16a34a',
    },
    Progress: {
      colorSuccess: '#22c55e',
    },
    Alert: {
      colorSuccessBg:     '#052e16',
      colorSuccessBorder: '#15803d',
      colorErrorBg:       '#2a0f0f',
      colorErrorBorder:   '#7f1d1d',
      colorWarningBg:     '#2a1f00',
      colorWarningBorder: '#78350f',
      colorInfoBg:        '#0a1628',
      colorInfoBorder:    '#1e3a5f',
    },
    DatePicker: {
      colorBgContainer:     '#1a2320',
      colorBorder:          '#1f2d24',
      colorText:            '#f0fdf4',
      colorTextPlaceholder: '#4ade80',
      colorBgElevated:      '#1a2320',
    },
    Form: {
      labelColor:    '#86efac',
      labelFontSize: 13,
    },
    Typography: {
      colorText:           '#f0fdf4',
      colorTextSecondary:  '#86efac',
      colorTextDisabled:   '#166534',
      colorLink:           '#60a5fa',
      titleMarginBottom:   '0.5em',
    },
    Result: {
      colorTextDescription: '#86efac',
    },
    Empty: {
      colorTextDisabled: '#4ade80',
    },
    Notification: {
      colorBgElevated: '#111814',
      colorText:       '#f0fdf4',
    },
    Message: {
      colorBgElevated: '#111814',
      colorText:       '#f0fdf4',
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
