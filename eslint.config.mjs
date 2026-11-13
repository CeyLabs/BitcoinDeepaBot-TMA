import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const PLATFORM_MESSAGE =
  "Telegram APIs live behind src/platform. Use usePlatform(), haptic or useBackButton from '@/platform' instead.";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Keep Telegram/web differences in one place (see src/platform).
    // @telegram-apps/telegram-ui is a plain UI kit and stays allowed.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/platform/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@telegram-apps/sdk", "@telegram-apps/sdk-react", "@telegram-apps/sdk/*"],
              message: PLATFORM_MESSAGE,
            },
          ],
        },
      ],
      "no-restricted-properties": [
        "error",
        { object: "window", property: "Telegram", message: PLATFORM_MESSAGE },
      ],
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
