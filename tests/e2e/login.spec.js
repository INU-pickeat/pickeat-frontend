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

for (const width of [360, 390, 430]) {
  test(`애플 로고 가운데 정렬 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/login");
    const button = page.getByRole("button", { name: "애플 로그인" });
    await expect(button).toBeVisible();
    await expect(page.locator("form").locator("..")).toHaveCSS("opacity", "1");
    const buttonBox = await button.boundingBox();
    const iconBox = await button.locator("svg").boundingBox();
    const shapeBox = await button.locator("path").boundingBox();
    expect(Math.abs(buttonBox.x + buttonBox.width / 2 - iconBox.x - iconBox.width / 2)).toBeLessThan(1);
    // 잎을 포함한 외곽 중심보다 몸통이 내려 보여 위로 1.5px 보정
    expect(Math.abs(buttonBox.y + buttonBox.height / 2 - iconBox.y - iconBox.height / 2 - 1.5)).toBeLessThan(0.1);
    expect(Math.abs(buttonBox.x + buttonBox.width / 2 - shapeBox.x - shapeBox.width / 2)).toBeLessThan(0.1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("login.png") });
  });
}
