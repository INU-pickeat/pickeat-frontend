import { test, expect } from "@playwright/test";

for (const width of [360, 390, 430]) {
  test(`로그인 화면과 회원가입 이동 (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "로그인", exact: true })).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
    await page.getByRole("button", { name: "회원가입", exact: true }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });
}
