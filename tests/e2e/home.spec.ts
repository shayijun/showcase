import { expect, test } from "@playwright/test";

test("public landing page renders", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("body")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /CiteTrace checks every citation before submission/i,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Analyze references/i })
  ).toBeVisible();
});
