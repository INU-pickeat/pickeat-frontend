import { test, expect } from "@playwright/test";

for (const [width, height] of [[360, 844], [390, 844], [430, 932], [768, 1024], [820, 1180], [834, 1194], [1024, 1366]]) {
  test(`모바일 화면 중앙 배치와 버튼 (${width}×${height})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.route("**/v1/**", (route) => route.fulfill({ json: { restaurants: [], spots: [], items: [], nextCursor: null } }));
    for (const path of ["/login", "/signup", "/home", "/recommend/category"]) {
      await page.goto(path);
      await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
      const box = await page.locator("main").boundingBox();
      expect(box.width).toBe(Math.min(width, 430));
      expect(Math.abs(box.x - (width - box.width) / 2)).toBeLessThan(1);
      if (width >= 768) {
        expect(box.height).toBe(Math.min(900, height - 64));
        expect(Math.abs(box.y - (height - box.height) / 2)).toBeLessThan(1);
      } else {
        expect(box.height).toBeGreaterThanOrEqual(height);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      if (width >= 768) await expect(page.locator(".app-shell")).toHaveCSS("background-color", "rgb(252, 241, 223)");
      if (path === "/login") {
        await page.getByRole("button", { name: "회원가입", exact: true }).click();
        await expect(page).toHaveURL(/\/signup$/);
      }
      if (path === "/home") {
        const nav = await page.getByRole("navigation", { name: "하단 메뉴" }).boundingBox();
        expect(nav.x).toBeGreaterThanOrEqual(box.x);
        expect(nav.x + nav.width).toBeLessThanOrEqual(box.x + box.width);
        expect(nav.y).toBeGreaterThanOrEqual(box.y);
        expect(nav.y + nav.height).toBeLessThan(box.y + box.height);
        if (width === 820) await page.screenshot({ path: testInfo.outputPath("ipad-home.png") });
        await page.getByRole("button", { name: "피드", exact: true }).click();
        await expect(page).toHaveURL(/\/feed$/);
      }
      if (path === "/recommend/category") {
        const next = page.getByRole("button", { name: "다음", exact: true });
        await expect(next).toBeInViewport();
        await next.click();
        await expect(page).toHaveURL(/\/recommend\/price$/);
      }
    }
  });
}
