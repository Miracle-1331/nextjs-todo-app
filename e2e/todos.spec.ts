import { test, expect, Locator } from "@playwright/test";

// Controlled React checkboxes revert the DOM while awaiting the PATCH response,
// so Playwright's .check() (which asserts state immediately) always fails.
// Use clickAndWaitChecked() instead — clicks then waits for the checked state.
async function clickAndWaitChecked(checkbox: Locator) {
  await checkbox.click();
  await expect(checkbox).toBeChecked({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  await page.request.delete("/api/e2e-reset").catch(() => {});
  await page.goto("/");
});

test("shows empty state on first load", async ({ page }) => {
  await expect(page.getByTestId("empty-message")).toBeVisible();
  await expect(page.getByTestId("empty-message")).toContainText("No todos yet");
});

test("can add a new todo", async ({ page }) => {
  await page.getByTestId("todo-input").fill("Buy groceries");
  await page.getByTestId("add-btn").click();

  const items = page.getByTestId("todo-item");
  await expect(items).toHaveCount(1);
  await expect(items.first().getByTestId("todo-title")).toHaveText("Buy groceries");
});

test("add button is disabled when input is empty", async ({ page }) => {
  await expect(page.getByTestId("add-btn")).toBeDisabled();
  await page.getByTestId("todo-input").fill("something");
  await expect(page.getByTestId("add-btn")).toBeEnabled();
  await page.getByTestId("todo-input").clear();
  await expect(page.getByTestId("add-btn")).toBeDisabled();
});

test("can mark a todo as completed", async ({ page }) => {
  await page.getByTestId("todo-input").fill("Walk the dog");
  await page.getByTestId("add-btn").click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);

  await clickAndWaitChecked(page.getByTestId("todo-checkbox").first());

  await expect(page.getByTestId("todo-title").first()).toHaveClass(/done/);
});

test("can delete a todo", async ({ page }) => {
  await page.getByTestId("todo-input").fill("Delete me");
  await page.getByTestId("add-btn").click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);

  await page.getByTestId("delete-btn").first().click();

  await expect(page.getByTestId("todo-item")).toHaveCount(0);
  await expect(page.getByTestId("empty-message")).toBeVisible();
});

test("filter buttons show/hide correct todos", async ({ page }) => {
  await page.getByTestId("todo-input").fill("Active task");
  await page.getByTestId("add-btn").click();
  await page.getByTestId("todo-input").fill("Done task");
  await page.getByTestId("add-btn").click();
  await expect(page.getByTestId("todo-item")).toHaveCount(2);

  await clickAndWaitChecked(page.getByTestId("todo-checkbox").nth(1));

  await page.getByTestId("filter-active").click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  await expect(page.getByTestId("todo-title").first()).toHaveText("Active task");

  await page.getByTestId("filter-completed").click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  await expect(page.getByTestId("todo-title").first()).toHaveText("Done task");

  await page.getByTestId("filter-all").click();
  await expect(page.getByTestId("todo-item")).toHaveCount(2);
});

test("active count updates correctly", async ({ page }) => {
  await page.getByTestId("todo-input").fill("Task 1");
  await page.getByTestId("add-btn").click();
  await page.getByTestId("todo-input").fill("Task 2");
  await page.getByTestId("add-btn").click();
  await expect(page.getByTestId("todo-item")).toHaveCount(2);

  await expect(page.getByTestId("active-count")).toHaveText("2 items left");

  await clickAndWaitChecked(page.getByTestId("todo-checkbox").first());
  await expect(page.getByTestId("active-count")).toHaveText("1 item left");
});

test("clear completed removes all done todos", async ({ page }) => {
  await page.getByTestId("todo-input").fill("Keep me");
  await page.getByTestId("add-btn").click();
  await page.getByTestId("todo-input").fill("Clear me");
  await page.getByTestId("add-btn").click();
  await expect(page.getByTestId("todo-item")).toHaveCount(2);

  await clickAndWaitChecked(page.getByTestId("todo-checkbox").nth(1));
  await expect(page.getByTestId("clear-completed")).toBeVisible();
  await page.getByTestId("clear-completed").click();

  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  await expect(page.getByTestId("todo-title").first()).toHaveText("Keep me");
  await expect(page.getByTestId("clear-completed")).not.toBeVisible();
});

test("can add todo by pressing Enter", async ({ page }) => {
  await page.getByTestId("todo-input").fill("Enter key todo");
  await page.getByTestId("todo-input").press("Enter");
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
});
