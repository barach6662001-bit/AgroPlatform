import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorBgBase:          '#060B14',
    colorBgContainer:     '#0C1222',
    colorBgElevated:      '#111A2E',
    colorBgLayout:        '#060B14',
    colorBgSpotlight:     '#111A2E',
    colorBorder:          '#1E2A45',
    colorBorderSecondary: '#253350',
    colorTextBase:        'rgba(255, 255, 255, 0.92)',
    colorText:            'rgba(255, 255, 255, 0.92)',
    colorTextSecondary:   'rgba(255, 255, 255, 0.55)',
    colorTextTertiary:    'rgba(255, 255, 255, 0.35)',
    colorTextQuaternary:  'rgba(255, 255, 255, 0.2)',
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
    fontFamily:           "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
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
      siderBg:      '#0C1222',
      headerBg:     '#0C1222',
      bodyBg:       '#060B14',
      triggerBg:    '#1A2540',
      triggerColor: '#a1a1a1',
    },
    Menu: {
      darkItemBg:            '#0C1222',
      darkSubMenuItemBg:     '#0C1222',
      darkItemSelectedBg:    'rgba(34, 197, 94, 0.08)',
      darkItemHoverBg:       '#1A2540',
      darkItemColor:         'rgba(255, 255, 255, 0.55)',
      darkItemSelectedColor: '#22C55E',
      darkItemHoverColor:    'rgba(255, 255, 255, 0.85)',
      itemBorderRadius:      8,
      itemHeight:            36,
      itemMarginInline:      8,
    },
    Card: {
      colorBgContainer:     '#0C1222',
      colorBorderSecondary: '#1E2A45',
      borderRadiusLG:       12,
      paddingLG:            20,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   'transparent',
      headerBg:           '#0C1222',
      headerColor:        'rgba(255, 255, 255, 0.4)',
      headerSortActiveBg: 'rgba(255, 255, 255, 0.04)',
      rowHoverBg:         '#111A2E',
      borderColor:        '#1E2A45',
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
      defaultBg:               '#111A2E',
      defaultColor:            'rgba(255, 255, 255, 0.8)',
      defaultBorderColor:      '#253350',
      defaultHoverBg:          '#1A2540',
      defaultHoverColor:       'rgba(255, 255, 255, 0.92)',
      defaultHoverBorderColor: 'rgba(255, 255, 255, 0.2)',
    },
    Input: {
      colorBgContainer:     '#111A2E',
      colorBorder:          '#253350',
      colorText:            'rgba(255, 255, 255, 0.92)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.35)',
      hoverBorderColor:     'rgba(255, 255, 255, 0.2)',
      activeBorderColor:    '#22C55E',
      activeShadow:         '0 0 0 3px rgba(34, 197, 94, 0.1)',
    },
    Select: {
      colorBgContainer:     '#111A2E',
      colorBorder:          '#253350',
      colorText:            'rgba(255, 255, 255, 0.92)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.35)',
      optionSelectedBg:     'rgba(34, 197, 94, 0.08)',
      optionActiveBg:       '#1A2540',
      colorBgElevated:      '#0C1222',
    },
    Modal: {
      colorBgElevated: '#0C1222',
      colorBorder:     '#1E2A45',
      titleColor:      'rgba(255, 255, 255, 0.92)',
    },
    Drawer: {
      colorBgElevated: '#0C1222',
    },
    Dropdown: {
      colorBgElevated:    '#0C1222',
      colorText:          'rgba(255, 255, 255, 0.85)',
      controlItemBgHover: '#1A2540',
    },
    Tooltip: {
      colorBgSpotlight:    '#1A2540',
      colorTextLightSolid: 'rgba(255, 255, 255, 0.92)',
    },
    Pagination: {
      colorBgContainer: '#111A2E',
      colorText:        'rgba(255, 255, 255, 0.55)',
      itemActiveBg:     'rgba(34, 197, 94, 0.08)',
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize:   11,
    },
    Badge: {
      colorBgContainer: '#0C1222',
    },
    Tag: {
      defaultBg:    '#1A2540',
      defaultColor: 'rgba(255, 255, 255, 0.55)',
    },
    Divider: {
      colorSplit: '#1E2A45',
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
      colorBgContainer:     '#111A2E',
      colorBorder:          '#253350',
      colorText:            'rgba(255, 255, 255, 0.92)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.35)',
      colorBgElevated:      '#0C1222',
    },
    Form: {
      labelColor:    'rgba(255, 255, 255, 0.6)',
      labelFontSize: 12,
    },
    Typography: {
      colorText:           'rgba(255, 255, 255, 0.92)',
      colorTextSecondary:  'rgba(255, 255, 255, 0.55)',
      colorTextDisabled:   'rgba(255, 255, 255, 0.35)',
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
      colorBgElevated: '#0C1222',
      colorText:       'rgba(255, 255, 255, 0.92)',
    },
    Message: {
      colorBgElevated: '#0C1222',
      colorText:       'rgba(255, 255, 255, 0.92)',
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
