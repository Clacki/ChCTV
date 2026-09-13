import { expect, test } from "@playwright/test";

test("shows the ChCTV discovery skeleton", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DISCOVERY AREA" })).toBeVisible();
});
