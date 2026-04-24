import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

/**
 * Light-mode AntD theme.
 *
 * Mirrors `darkTheme.ts`: every color reference points at the same CSS custom
 * property, which is re-bound to its light value by the
 * `[data-theme='light']` block in `src/styles/tokens.css`.
 *
 * That means switching themes only requires toggling the `data-theme`
 * attribute on `<html>` — no React re-render, no AntD re-theme, no flash.
 */
export const lightTheme: ThemeConfig = {
  token: {
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
    colorPrimary:         '#16A34A',
    colorSuccess:         '#16A34A',
    colorError:           '#DC2626',
    colorWarning:         '#D97706',
    colorInfo:            '#2563EB',
    colorLink:            '#16A34A',
    colorLinkHover:       '#15803D',
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
      itemBg:                'var(--bg-surface)',
      subMenuItemBg:         'var(--bg-surface)',
      itemSelectedBg:        'var(--brand-muted)',
      itemHoverBg:           'var(--bg-hover)',
      itemColor:             'var(--text-secondary)',
      itemSelectedColor:     'var(--brand)',
      itemHoverColor:        'var(--text-primary)',
      itemBorderRadius:      8,
      itemHeight:            36,
      itemMarginInline:      8,
    },
    Card: {
      colorBgContainer:     'var(--bg-surface)',
      colorBorderSecondary: 'var(--border)',
      borderRadiusLG:       12,
      paddingLG:            20,
      boxShadow:            'var(--shadow-1)',
    },
    Table: {
      colorBgContainer:   'transparent',
      headerBg:           'rgba(15, 23, 42, 0.02)',
      headerColor:        'var(--text-tertiary)',
      headerSortActiveBg: 'rgba(15, 23, 42, 0.04)',
      rowHoverBg:         'rgba(15, 23, 42, 0.03)',
      borderColor:        'var(--border)',
      colorText:          'var(--text-primary)',
      colorTextHeading:   'var(--text-tertiary)',
    },
    Button: {
      colorPrimary:            'var(--brand)',
      colorPrimaryHover:       'var(--brand-hover)',
      colorPrimaryActive:      'var(--brand-active)',
      primaryShadow:           'none',
      primaryColor:            '#ffffff',
      borderRadius:            8,
      borderRadiusSM:          6,
      defaultBg:               'var(--bg-surface)',
      defaultColor:            'var(--text-primary)',
      defaultBorderColor:      'var(--border-hover)',
      defaultHoverBg:          'var(--bg-hover)',
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
      colorErrorBorder:   'rgba(220, 38, 38, 0.25)',
      colorWarningBg:     'var(--warning-bg)',
      colorWarningBorder: 'rgba(217, 119, 6, 0.25)',
      colorInfoBg:        'var(--info-bg)',
      colorInfoBorder:    'rgba(37, 99, 235, 0.25)',
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
  algorithm: theme.defaultAlgorithm,
};
