import { expect, test } from "@playwright/test";

test("loads the home page and redirects protected visitors to login", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "A production-minded React foundation",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Protected route" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("browses creatures and displays the selected details", async ({
  page,
}) => {
  await page.route("**/tibiawiki-api/api/creatures", async (route) => {
    await route.fulfill({ json: ["Dragon", "Rat"] });
  });
  await page.route("**/tibiawiki-api/api/creatures/Dragon", async (route) => {
    await route.fulfill({
      json: {
        name: "Dragon",
        hp: "1000",
        exp: "700",
        attacktype: "Melee",
        occurrence: "Common",
        bestiarylevel: "Medium",
        bestiarytext: "Dragons are powerful monsters.",
      },
    });
  });

  await page.goto("/creatures");
  await page.getByRole("button", { name: "Dragon", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "Dragon", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("1,000")).toBeVisible();
  await expect(page.getByText("700")).toBeVisible();
  await expect(page.getByText("Dragons are powerful monsters.")).toBeVisible();
});
