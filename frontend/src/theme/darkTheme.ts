import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorBgBase:          '#0B1220',
    colorBgContainer:     '#0F1629',
    colorBgElevated:      '#141B2D',
    colorBgLayout:        '#0B1220',
    colorBgSpotlight:     '#141B2D',
    colorBorder:          'rgba(255, 255, 255, 0.06)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.12)',
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
      siderBg:      '#0A0E14',
      headerBg:     '#0B1220',
      bodyBg:       '#0B1220',
      triggerBg:    '#141B2D',
      triggerColor: 'rgba(255, 255, 255, 0.55)',
    },
    Menu: {
      darkItemBg:            'transparent',
      darkSubMenuItemBg:     'transparent',
      darkItemSelectedBg:    'rgba(34, 197, 94, 0.08)',
      darkItemHoverBg:       'rgba(255, 255, 255, 0.04)',
      darkItemColor:         'rgba(255, 255, 255, 0.55)',
      darkItemSelectedColor: '#22C55E',
      darkItemHoverColor:    'rgba(255, 255, 255, 0.85)',
      itemBorderRadius:      8,
      itemHeight:            36,
      itemMarginInline:      8,
    },
    Card: {
      colorBgContainer:     '#0F1629',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
      borderRadiusLG:       12,
      paddingLG:            20,
      boxShadow:            'none',
    },
    Table: {
      colorBgContainer:   'transparent',
      headerBg:           'rgba(255, 255, 255, 0.02)',
      headerColor:        'rgba(255, 255, 255, 0.4)',
      headerSortActiveBg: 'rgba(255, 255, 255, 0.04)',
      rowHoverBg:         'rgba(255, 255, 255, 0.03)',
      borderColor:        'rgba(255, 255, 255, 0.04)',
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
      defaultBorderColor:      'rgba(255, 255, 255, 0.1)',
      defaultHoverBg:          'rgba(255, 255, 255, 0.1)',
      defaultHoverColor:       'rgba(255, 255, 255, 0.92)',
      defaultHoverBorderColor: 'rgba(255, 255, 255, 0.2)',
    },
    Input: {
      colorBgContainer:     '#111827',
      colorBorder:          'rgba(255, 255, 255, 0.1)',
      colorText:            'rgba(255, 255, 255, 0.92)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.35)',
      hoverBorderColor:     'rgba(255, 255, 255, 0.2)',
      activeBorderColor:    '#22C55E',
      activeShadow:         '0 0 0 3px rgba(34, 197, 94, 0.1)',
    },
    Select: {
      colorBgContainer:     '#111827',
      colorBorder:          'rgba(255, 255, 255, 0.1)',
      colorText:            'rgba(255, 255, 255, 0.92)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.35)',
      optionSelectedBg:     'rgba(34, 197, 94, 0.08)',
      optionActiveBg:       'rgba(255, 255, 255, 0.04)',
      colorBgElevated:      '#141B2D',
    },
    Modal: {
      colorBgElevated: '#0F1629',
      colorBorder:     'rgba(255, 255, 255, 0.06)',
      titleColor:      'rgba(255, 255, 255, 0.92)',
    },
    Drawer: {
      colorBgElevated: '#0F1629',
    },
    Dropdown: {
      colorBgElevated:    '#141B2D',
      colorText:          'rgba(255, 255, 255, 0.85)',
      controlItemBgHover: 'rgba(255, 255, 255, 0.04)',
    },
    Tooltip: {
      colorBgSpotlight:    '#1A2332',
      colorTextLightSolid: 'rgba(255, 255, 255, 0.92)',
    },
    Pagination: {
      colorBgContainer: '#141B2D',
      colorText:        'rgba(255, 255, 255, 0.55)',
      itemActiveBg:     'rgba(34, 197, 94, 0.08)',
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize:   11,
    },
    Badge: {
      colorBgContainer: '#0F1629',
    },
    Tag: {
      defaultBg:    'rgba(255, 255, 255, 0.06)',
      defaultColor: 'rgba(255, 255, 255, 0.55)',
    },
    Divider: {
      colorSplit: 'rgba(255, 255, 255, 0.04)',
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
      colorBgContainer:     '#111827',
      colorBorder:          'rgba(255, 255, 255, 0.1)',
      colorText:            'rgba(255, 255, 255, 0.92)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.35)',
      colorBgElevated:      '#141B2D',
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
      colorBgElevated: '#141B2D',
      colorText:       'rgba(255, 255, 255, 0.92)',
    },
    Message: {
      colorBgElevated: '#141B2D',
      colorText:       'rgba(255, 255, 255, 0.92)',
    },
  },
  algorithm: theme.darkAlgorithm,
};

export const CHART_COLORS = [
  '#22C55E', // green (primary)
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
];
