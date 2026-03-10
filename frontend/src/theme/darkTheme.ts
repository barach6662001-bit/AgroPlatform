import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorBgBase:          '#0D1117',
    colorBgContainer:     '#161B22',
    colorBgElevated:      '#1C2128',
    colorBgLayout:        '#0D1117',
    colorBgSpotlight:     '#1C2128',
    colorBorder:          '#30363D',
    colorBorderSecondary: '#21262D',
    colorTextBase:        '#E6EDF3',
    colorText:            '#E6EDF3',
    colorTextSecondary:   '#8B949E',
    colorTextTertiary:    '#6E7681',
    colorTextQuaternary:  '#484F58',
    colorPrimary:         '#3FB950',
    colorSuccess:         '#3FB950',
    colorError:           '#F85149',
    colorWarning:         '#D29922',
    colorInfo:            '#1F6FEB',
    colorLink:            '#58A6FF',
    colorLinkHover:       '#79C0FF',
    borderRadius:         8,
    borderRadiusLG:       10,
    borderRadiusSM:       6,
    fontFamily:           "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize:             14,
    fontSizeLG:           16,
    lineHeight:           1.5714,
    controlHeight:        36,
    controlHeightLG:      44,
    boxShadow:            '0 2px 8px rgba(0, 0, 0, 0.4)',
    boxShadowSecondary:   '0 4px 16px rgba(0, 0, 0, 0.5)',
  },
  components: {
    Layout: {
      siderBg:      '#0D1117',
      headerBg:     '#161B22',
      bodyBg:       '#0D1117',
      triggerBg:    '#21262D',
      triggerColor: '#8B949E',
    },
    Menu: {
      darkItemBg:            '#0D1117',
      darkSubMenuItemBg:     '#0D1117',
      darkItemSelectedBg:    '#21262D',
      darkItemHoverBg:       '#161B22',
      darkItemColor:         '#8B949E',
      darkItemSelectedColor: '#2DD4BF',
      darkItemHoverColor:    '#E6EDF3',
      itemBorderRadius:      6,
    },
    Card: {
      colorBgContainer:     '#161B22',
      colorBorderSecondary: '#30363D',
      borderRadiusLG:       10,
      paddingLG:            20,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   '#161B22',
      headerBg:           '#0D1117',
      headerColor:        '#8B949E',
      headerSortActiveBg: '#21262D',
      rowHoverBg:         '#21262D',
      borderColor:        '#30363D',
      colorText:          '#E6EDF3',
      colorTextHeading:   '#8B949E',
    },
    Button: {
      colorPrimary:            '#238636',
      colorPrimaryHover:       '#2EA043',
      colorPrimaryActive:      '#196C2E',
      primaryShadow:           'none',
      borderRadius:            6,
      borderRadiusSM:          4,
      defaultBg:               '#21262D',
      defaultColor:            '#E6EDF3',
      defaultBorderColor:      '#30363D',
      defaultHoverBg:          '#30363D',
      defaultHoverColor:       '#E6EDF3',
      defaultHoverBorderColor: '#8B949E',
    },
    Input: {
      colorBgContainer:     '#0D1117',
      colorBorder:          '#30363D',
      colorText:            '#E6EDF3',
      colorTextPlaceholder: '#484F58',
      hoverBorderColor:     '#58A6FF',
      activeBorderColor:    '#58A6FF',
      activeShadow:         '0 0 0 3px rgba(31, 111, 235, 0.2)',
    },
    Select: {
      colorBgContainer:     '#0D1117',
      colorBorder:          '#30363D',
      colorText:            '#E6EDF3',
      colorTextPlaceholder: '#484F58',
      optionSelectedBg:     '#21262D',
      optionActiveBg:       '#161B22',
      colorBgElevated:      '#1C2128',
    },
    Modal: {
      colorBgElevated: '#161B22',
      colorBorder:     '#30363D',
      titleColor:      '#E6EDF3',
    },
    Drawer: {
      colorBgElevated: '#161B22',
    },
    Dropdown: {
      colorBgElevated:    '#1C2128',
      colorText:          '#E6EDF3',
      controlItemBgHover: '#21262D',
    },
    Tooltip: {
      colorBgSpotlight:    '#1C2128',
      colorTextLightSolid: '#E6EDF3',
    },
    Pagination: {
      colorBgContainer: '#161B22',
      colorText:        '#8B949E',
      itemActiveBg:     '#21262D',
    },
    Statistic: {
      contentFontSize: 24,
      titleFontSize:   13,
    },
    Badge: {
      colorBgContainer: '#161B22',
    },
    Tag: {
      defaultBg:    '#21262D',
      defaultColor: '#8B949E',
    },
    Divider: {
      colorSplit: '#30363D',
    },
    Spin: {
      colorPrimary: '#3FB950',
    },
    Progress: {
      colorSuccess: '#3FB950',
    },
    Alert: {
      colorSuccessBg:     '#0f2a1a',
      colorSuccessBorder: '#196C2E',
      colorErrorBg:       '#2a0f0f',
      colorErrorBorder:   '#6e1919',
      colorWarningBg:     '#2a200f',
      colorWarningBorder: '#6e4d19',
      colorInfoBg:        '#0f1a2a',
      colorInfoBorder:    '#193056',
    },
    DatePicker: {
      colorBgContainer:     '#0D1117',
      colorBorder:          '#30363D',
      colorText:            '#E6EDF3',
      colorTextPlaceholder: '#484F58',
      colorBgElevated:      '#1C2128',
    },
    Form: {
      labelColor:    '#8B949E',
      labelFontSize: 13,
    },
    Typography: {
      colorText:           '#E6EDF3',
      colorTextSecondary:  '#8B949E',
      colorTextDisabled:   '#484F58',
      colorLink:           '#58A6FF',
      titleMarginBottom:   '0.5em',
    },
    Result: {
      colorTextDescription: '#8B949E',
    },
    Empty: {
      colorTextDisabled: '#484F58',
    },
    Notification: {
      colorBgElevated: '#161B22',
      colorText:       '#E6EDF3',
    },
    Message: {
      colorBgElevated: '#161B22',
      colorText:       '#E6EDF3',
    },
  },
  algorithm: undefined,
};

export const CHART_COLORS = [
  '#3FB950', // зелений (primary)
  '#79C0FF', // блакитний
  '#F78166', // червоно-помаранчевий
  '#E3B341', // жовтий
  '#BC8CFF', // фіолетовий
  '#FFA657', // помаранчевий
  '#FF7B72', // червоний
  '#56D364', // світло-зелений
];
