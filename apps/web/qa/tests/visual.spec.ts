import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WORKSPACE = "dexter";

// One entry per §10 state. `goto` drives the page into the exact visual state the matching
// reference screenshot (qa/expected/<name>.png) shows — a menu open, a search query typed, etc.
const STATES: { name: string; goto: (page: Page) => Promise<void> }[] = [
  {
    name: "board",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/tasks?view=board`);
    },
  },
  {
    name: "board-fields",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/tasks?view=board`);
      await page.getByRole("button", { name: "Fields" }).click();
    },
  },
  {
    name: "list",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/tasks?view=list`);
    },
  },
  {
    name: "list-search",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/tasks?view=list`);
      await page.getByRole("button", { name: "Search" }).click();
      await page.getByPlaceholder(/search/i).fill("Design Homepage");
    },
  },
  {
    name: "list-fields",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/tasks?view=list`);
      await page.getByRole("button", { name: "Fields" }).click();
    },
  },
  {
    name: "task-priority",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/tasks?view=list`);
      await page.getByText("Write API Documentation").first().click();
      await page.getByText("Priority", { exact: true }).locator("..").getByRole("button").click();
    },
  },
  {
    name: "task-datepicker",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/tasks?view=list`);
      await page.getByText("Write API Documentation").first().click();
      await page.getByText("Dates", { exact: true }).locator("..").getByRole("button").click();
    },
  },
  {
    name: "projects-theme",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/projects`);
      await page.getByRole("button", { name: "Dexter" }).click();
      await page.getByText("Change Theme").click();
    },
  },
  {
    name: "projects-colormode",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/projects`);
      await page.getByRole("button", { name: "Dexter" }).click();
      await page.getByText("Color Mode").click();
    },
  },
  {
    name: "projects-nested-fields",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/projects`);
      await page.getByRole("button", { name: "Fields" }).click();
      await page.getByRole("menuitem", { name: "Priority" }).click();
    },
  },
  {
    name: "project-tasks",
    goto: async (page) => {
      await page.goto(`/w/${WORKSPACE}/projects`);
      await page.getByText("Design Homepage").first().click();
    },
  },
  {
    name: "settings-profile",
    goto: async (page) => {
      await page.goto("/settings/profile");
    },
  },
];

test.describe("light", () => {
  for (const state of STATES) {
    test(state.name, async ({ page }) => {
      await state.goto(page);
      await page.waitForTimeout(150);
      await page.screenshot({ path: `qa/actual/${state.name}.png` });
      await expect(page).toHaveScreenshot(`${state.name}.png`, { maxDiffPixelRatio: 0.02 });
    });
  }
});

test.describe("login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(150);
    await page.screenshot({ path: "qa/actual/login.png" });
    await expect(page).toHaveScreenshot("login.png", { maxDiffPixelRatio: 0.02 });
  });
});

test.describe("dark", () => {
  test.use({ storageState: "./qa/.auth/user-dark.json" });

  test("login-dark", async ({ page, context }) => {
    await context.clearCookies();
    await context.addCookies([{ name: "theme", value: "dark", domain: "localhost", path: "/" }]);
    await page.goto("/login");
    await page.waitForTimeout(150);
    await page.screenshot({ path: "qa/actual/login-dark.png" });

    const results = await new AxeBuilder({ page }).withTags(["wcag2aa"]).analyze();
    const contrastViolations = results.violations.filter((v) => v.id === "color-contrast");
    expect(contrastViolations, JSON.stringify(contrastViolations, null, 2)).toEqual([]);
  });

  for (const state of STATES) {
    test(`${state.name}-dark`, async ({ page }) => {
      await state.goto(page);
      await page.waitForTimeout(150);
      await page.screenshot({ path: `qa/actual/${state.name}-dark.png` });

      // No reference to diff against in dark mode — the gate is an automated AA contrast
      // assertion instead, per §10.6.
      const results = await new AxeBuilder({ page }).withTags(["wcag2aa"]).analyze();
      const contrastViolations = results.violations.filter((v) => v.id === "color-contrast");
      expect(contrastViolations, JSON.stringify(contrastViolations, null, 2)).toEqual([]);
    });
  }
});
