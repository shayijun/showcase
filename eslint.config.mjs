import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".source/**",
      ".wrangler/**",
      "build/**",
      "coverage/**",
      "dist/**",
      "next-env.d.ts",
      "node_modules/**",
      "out/**",
      "playwright-report/**",
      "src/config/db/migrations/**",
      "src/shared/types/cloudflare.d.ts",
      "test-results/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: [
      "src/shared/blocks/common/locale-detector.tsx",
      "src/shared/blocks/payment/payment-providers.tsx",
      "src/shared/blocks/sign/social-providers.tsx",
      "src/shared/blocks/table/time.tsx",
    ],
    rules: {
      "react-hooks/rules-of-hooks": "warn",
    },
  },
  {
    files: [
      "src/core/theme/index.ts",
      "src/shared/blocks/common/smart-icon.tsx",
    ],
    rules: {
      "@next/next/no-assign-module-variable": "warn",
    },
  },
  {
    files: ["src/mdx-components.tsx"],
    rules: {
      "react/display-name": "warn",
    },
  },
  {
    files: ["src/shared/blocks/common/markdown-editor.tsx"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
  {
    files: [
      "src/shared/components/ai-elements/shimmer.tsx",
      "src/shared/components/ui/animated-group.tsx",
    ],
    rules: {
      "react-hooks/static-components": "warn",
    },
  },
  {
    files: ["src/shared/components/ui/animated-grid-pattern.tsx"],
    rules: {
      "react-hooks/immutability": "warn",
    },
  },
  {
    files: ["src/shared/components/ui/sidebar.tsx"],
    rules: {
      "react-hooks/purity": "warn",
    },
  },
];

export default eslintConfig;
