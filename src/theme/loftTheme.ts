import type { ThemeConfig } from "antd";

import { colors, radius, spacing, typography } from "./tokens";

/** Ant Design theme recipe aligned with Design Harmony / Copan-like tokens. */
export const loftTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorLink: colors.primary,
    colorLinkHover: colors.primaryHover,
    colorSuccess: colors.feedback.success,
    colorWarning: colors.feedback.warning,
    colorError: colors.feedback.error,
    colorInfo: colors.feedback.info,

    colorTextBase: colors.text.primary,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorBgBase: colors.background.page,
    colorBgLayout: colors.background.secondary,
    colorBorder: colors.border.default,
    colorBorderSecondary: colors.border.default,

    fontFamily: typography.fontFamily,
    fontSize: typography.baseFontSize,
    fontSizeSM: typography.body.small,
    fontSizeHeading1: typography.headings.h1,
    fontSizeHeading2: typography.headings.h2,
    fontSizeHeading3: typography.headings.h3,
    fontSizeHeading4: typography.headings.h4,

    borderRadius: radius.default,
    borderRadiusSM: radius.small,
    borderRadiusLG: radius.default,

    padding: spacing.md,
    margin: spacing.md,
    controlHeight: 40,
  },
  components: {
    Button: { controlHeight: 40, fontWeight: 500 },
    Input: { controlHeight: 40 },
    Select: { controlHeight: 40 },
    Modal: { borderRadiusLG: radius.default },
    Layout: {
      bodyBg: colors.background.secondary,
      headerBg: colors.background.page,
      siderBg: colors.background.page,
      triggerBg: colors.background.secondary,
      triggerColor: colors.text.primary,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "color-mix(in oklab, #FF774A 10%, transparent)",
      itemSelectedColor: colors.primary,
      itemHoverBg: colors.background.secondary,
      groupTitleColor: colors.text.secondary,
    },
    Table: { headerBg: colors.background.secondary },
  },
};
