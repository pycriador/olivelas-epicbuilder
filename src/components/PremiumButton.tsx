import { Button, ConfigProvider, type ButtonProps } from "antd";

import { colors } from "@/theme/tokens";

/**
 * PremiumButton — VIP / premium actions using Premium Gold only.
 */
export function PremiumButton(props: ButtonProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.premium,
          colorPrimaryHover: "#A66C00",
          colorPrimaryActive: "#8C5B00",
        },
      }}
    >
      <Button type="primary" {...props} />
    </ConfigProvider>
  );
}
