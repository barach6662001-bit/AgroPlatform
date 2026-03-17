import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorBgBase:          '#0a0a0a',
    colorBgContainer:     '#111111',
    colorBgElevated:      '#1a1a1a',
    colorBgLayout:        '#0a0a0a',
    colorBgSpotlight:     '#1a1a1a',
    colorBorder:          '#2a2a2a',
    colorBorderSecondary: '#383838',
    colorTextBase:        '#ededed',
    colorText:            '#ededed',
    colorTextSecondary:   '#a1a1a1',
    colorTextTertiary:    '#6b6b6b',
    colorTextQuaternary:  '#3d3d3d',
    colorPrimary:         '#22c55e',
    colorSuccess:         '#22c55e',
    colorError:           '#ef4444',
    colorWarning:         '#f59e0b',
    colorInfo:            '#3b82f6',
    colorLink:            '#3b82f6',
    colorLinkHover:       '#60a5fa',
    borderRadius:         8,
    borderRadiusLG:       12,
    borderRadiusSM:       4,
    fontFamily:           "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize:             14,
    fontSizeLG:           16,
    lineHeight:           1.5,
    controlHeight:        34,
    controlHeightLG:      40,
    boxShadow:            'none',
    boxShadowSecondary:   'none',
  },
  components: {
    Layout: {
      siderBg:      '#111111',
      headerBg:     '#111111',
      bodyBg:       '#0a0a0a',
      triggerBg:    '#242424',
      triggerColor: '#a1a1a1',
    },
    Menu: {
      darkItemBg:            '#111111',
      darkSubMenuItemBg:     '#111111',
      darkItemSelectedBg:    'rgba(34, 197, 94, 0.1)',
      darkItemHoverBg:       '#242424',
      darkItemColor:         '#a1a1a1',
      darkItemSelectedColor: '#22c55e',
      darkItemHoverColor:    '#ededed',
      itemBorderRadius:      8,
    },
    Card: {
      colorBgContainer:     '#111111',
      colorBorderSecondary: '#2a2a2a',
      borderRadiusLG:       12,
      paddingLG:            20,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   'transparent',
      headerBg:           '#111111',
      headerColor:        '#6b6b6b',
      headerSortActiveBg: '#1a1a1a',
      rowHoverBg:         '#1a1a1a',
      borderColor:        '#2a2a2a',
      colorText:          '#ededed',
      colorTextHeading:   '#6b6b6b',
    },
    Button: {
      colorPrimary:            '#22c55e',
      colorPrimaryHover:       '#16a34a',
      colorPrimaryActive:      '#15803d',
      primaryShadow:           'none',
      primaryColor:            '#000000',
      borderRadius:            8,
      borderRadiusSM:          4,
      defaultBg:               '#1a1a1a',
      defaultColor:            '#ededed',
      defaultBorderColor:      '#383838',
      defaultHoverBg:          '#242424',
      defaultHoverColor:       '#ededed',
      defaultHoverBorderColor: '#4a9eff',
    },
    Input: {
      colorBgContainer:     '#1a1a1a',
      colorBorder:          '#383838',
      colorText:            '#ededed',
      colorTextPlaceholder: '#6b6b6b',
      hoverBorderColor:     '#4a9eff',
      activeBorderColor:    '#4a9eff',
      activeShadow:         '0 0 0 2px rgba(74, 158, 255, 0.15)',
    },
    Select: {
      colorBgContainer:     '#1a1a1a',
      colorBorder:          '#383838',
      colorText:            '#ededed',
      colorTextPlaceholder: '#6b6b6b',
      optionSelectedBg:     'rgba(34, 197, 94, 0.1)',
      optionActiveBg:       '#242424',
      colorBgElevated:      '#111111',
    },
    Modal: {
      colorBgElevated: '#111111',
      colorBorder:     '#2a2a2a',
      titleColor:      '#ededed',
    },
    Drawer: {
      colorBgElevated: '#111111',
    },
    Dropdown: {
      colorBgElevated:    '#111111',
      colorText:          '#ededed',
      controlItemBgHover: '#242424',
    },
    Tooltip: {
      colorBgSpotlight:    '#242424',
      colorTextLightSolid: '#ededed',
    },
    Pagination: {
      colorBgContainer: '#1a1a1a',
      colorText:        '#a1a1a1',
      itemActiveBg:     'rgba(34, 197, 94, 0.1)',
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize:   12,
    },
    Badge: {
      colorBgContainer: '#111111',
    },
    Tag: {
      defaultBg:    '#242424',
      defaultColor: '#a1a1a1',
    },
    Divider: {
      colorSplit: '#2a2a2a',
    },
    Spin: {
      colorPrimary: '#22c55e',
    },
    Progress: {
      colorSuccess: '#22c55e',
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
      colorBgContainer:     '#1a1a1a',
      colorBorder:          '#383838',
      colorText:            '#ededed',
      colorTextPlaceholder: '#6b6b6b',
      colorBgElevated:      '#111111',
    },
    Form: {
      labelColor:    '#a1a1a1',
      labelFontSize: 12,
    },
    Typography: {
      colorText:           '#ededed',
      colorTextSecondary:  '#a1a1a1',
      colorTextDisabled:   '#6b6b6b',
      colorLink:           '#3b82f6',
      titleMarginBottom:   '0.5em',
    },
    Result: {
      colorTextDescription: '#a1a1a1',
    },
    Empty: {
      colorTextDisabled: '#6b6b6b',
    },
    Notification: {
      colorBgElevated: '#111111',
      colorText:       '#ededed',
    },
    Message: {
      colorBgElevated: '#111111',
      colorText:       '#ededed',
    },
  },
  algorithm: undefined,
};

export const CHART_COLORS = [
  '#22c55e', // green accent
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#a78bfa', // violet
  '#2dd4bf', // teal
  '#f97316', // orange
  '#ec4899', // pink
  '#60a5fa', // sky
];
