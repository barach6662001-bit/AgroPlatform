import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorBgBase:          '#0e1117',
    colorBgContainer:     '#161b22',
    colorBgElevated:      '#1c2128',
    colorBgLayout:        '#0e1117',
    colorBgSpotlight:     '#1c2128',
    colorBorder:          '#30363d',
    colorBorderSecondary: '#21262d',
    colorTextBase:        '#e6edf3',
    colorText:            '#e6edf3',
    colorTextSecondary:   '#8b949e',
    colorTextTertiary:    '#484f58',
    colorTextQuaternary:  '#30363d',
    colorPrimary:         '#238636',
    colorSuccess:         '#3fb950',
    colorError:           '#f85149',
    colorWarning:         '#d29922',
    colorInfo:            '#388bfd',
    colorLink:            '#388bfd',
    colorLinkHover:       '#58a6ff',
    borderRadius:         6,
    borderRadiusLG:       12,
    borderRadiusSM:       4,
    fontFamily:           "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize:             14,
    fontSizeLG:           16,
    lineHeight:           1.5,
    controlHeight:        36,
    controlHeightLG:      40,
    boxShadow:            'none',
    boxShadowSecondary:   'none',
  },
  components: {
    Layout: {
      siderBg:      '#0d1117',
      headerBg:     '#0d1117',
      bodyBg:       '#0e1117',
      triggerBg:    '#21262d',
      triggerColor: '#8b949e',
    },
    Menu: {
      darkItemBg:            '#0d1117',
      darkSubMenuItemBg:     '#0d1117',
      darkItemSelectedBg:    '#1a2f1e',
      darkItemHoverBg:       '#21262d',
      darkItemColor:         '#8b949e',
      darkItemSelectedColor: '#2ea043',
      darkItemHoverColor:    '#e6edf3',
      itemBorderRadius:      6,
    },
    Card: {
      colorBgContainer:     '#161b22',
      colorBorderSecondary: '#30363d',
      borderRadiusLG:       12,
      paddingLG:            20,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   'transparent',
      headerBg:           '#161b22',
      headerColor:        '#8b949e',
      headerSortActiveBg: '#21262d',
      rowHoverBg:         '#21262d',
      borderColor:        '#21262d',
      colorText:          '#e6edf3',
      colorTextHeading:   '#8b949e',
    },
    Button: {
      colorPrimary:            '#238636',
      colorPrimaryHover:       '#2ea043',
      colorPrimaryActive:      '#196127',
      primaryShadow:           'none',
      borderRadius:            6,
      borderRadiusSM:          4,
      defaultBg:               '#1c2128',
      defaultColor:            '#e6edf3',
      defaultBorderColor:      '#30363d',
      defaultHoverBg:          '#21262d',
      defaultHoverColor:       '#e6edf3',
      defaultHoverBorderColor: '#30363d',
    },
    Input: {
      colorBgContainer:     '#1c2128',
      colorBorder:          '#30363d',
      colorText:            '#e6edf3',
      colorTextPlaceholder: '#484f58',
      hoverBorderColor:     '#238636',
      activeBorderColor:    '#238636',
      activeShadow:         '0 0 0 2px rgba(35, 134, 54, 0.2)',
    },
    Select: {
      colorBgContainer:     '#1c2128',
      colorBorder:          '#30363d',
      colorText:            '#e6edf3',
      colorTextPlaceholder: '#484f58',
      optionSelectedBg:     '#1a2f1e',
      optionActiveBg:       '#21262d',
      colorBgElevated:      '#161b22',
    },
    Modal: {
      colorBgElevated: '#161b22',
      colorBorder:     '#30363d',
      titleColor:      '#e6edf3',
    },
    Drawer: {
      colorBgElevated: '#161b22',
    },
    Dropdown: {
      colorBgElevated:    '#161b22',
      colorText:          '#e6edf3',
      controlItemBgHover: '#21262d',
    },
    Tooltip: {
      colorBgSpotlight:    '#1c2128',
      colorTextLightSolid: '#e6edf3',
    },
    Pagination: {
      colorBgContainer: '#161b22',
      colorText:        '#8b949e',
      itemActiveBg:     '#238636',
    },
    Statistic: {
      contentFontSize: 24,
      titleFontSize:   13,
    },
    Badge: {
      colorBgContainer: '#161b22',
    },
    Tag: {
      defaultBg:    '#21262d',
      defaultColor: '#8b949e',
    },
    Divider: {
      colorSplit: '#30363d',
    },
    Spin: {
      colorPrimary: '#238636',
    },
    Progress: {
      colorSuccess: '#3fb950',
    },
    Alert: {
      colorSuccessBg:     '#1a2f1e',
      colorSuccessBorder: '#238636',
      colorErrorBg:       '#2a0f0f',
      colorErrorBorder:   '#7f1d1d',
      colorWarningBg:     '#2a1f00',
      colorWarningBorder: '#78350f',
      colorInfoBg:        '#0a1628',
      colorInfoBorder:    '#1e3a5f',
    },
    DatePicker: {
      colorBgContainer:     '#1c2128',
      colorBorder:          '#30363d',
      colorText:            '#e6edf3',
      colorTextPlaceholder: '#484f58',
      colorBgElevated:      '#161b22',
    },
    Form: {
      labelColor:    '#8b949e',
      labelFontSize: 13,
    },
    Typography: {
      colorText:           '#e6edf3',
      colorTextSecondary:  '#8b949e',
      colorTextDisabled:   '#484f58',
      colorLink:           '#388bfd',
      titleMarginBottom:   '0.5em',
    },
    Result: {
      colorTextDescription: '#8b949e',
    },
    Empty: {
      colorTextDisabled: '#484f58',
    },
    Notification: {
      colorBgElevated: '#161b22',
      colorText:       '#e6edf3',
    },
    Message: {
      colorBgElevated: '#161b22',
      colorText:       '#e6edf3',
    },
  },
  algorithm: undefined,
};

export const CHART_COLORS = [
  '#3fb950', // green accent
  '#388bfd', // blue
  '#d29922', // amber
  '#a371f7', // violet
  '#2dd4bf', // teal
  '#f0883e', // orange
  '#db61a2', // pink
  '#58a6ff', // sky
];
