import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      ".next/**",
      ".source/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "out/**",
      "tests/e2e/**",
    ],
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "coverage",
      exclude: [
        "src/**/*.d.ts",
        "src/**/layout.tsx",
        "src/**/page.tsx",
        "src/**/loading.tsx",
        "src/**/not-found.tsx",
        "src/**/error.tsx",
        "src/config/locale/messages/**",
        "src/config/db/schema.*.ts",
      ],
    },
  },
});
