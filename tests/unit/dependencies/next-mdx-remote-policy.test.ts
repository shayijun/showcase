import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
);

function firstSemverMajor(versionRange: string): number {
  const match = versionRange.match(/\d+/);

  return match ? Number(match[0]) : 0;
}

describe("next-mdx-remote dependency policy", () => {
  it("uses a Vercel-accepted version", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(rootDir, "package.json"), "utf8")
    ) as { dependencies: Record<string, string> };

    expect(
      firstSemverMajor(packageJson.dependencies["next-mdx-remote"])
    ).toBeGreaterThanOrEqual(6);
  });
});
