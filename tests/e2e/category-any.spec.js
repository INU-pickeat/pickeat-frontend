import { test, expect } from "@playwright/test";

for (const width of [360, 390, 430]) {
  for (const any of [true, false]) {
    test(`음식 종류 무관 ${any ? "선택" : "해제"} 요청 (${width}px)`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 844 });
      await page.addInitScript(() => {
        if (location.pathname === "/recommend/category")
          history.replaceState({ ...history.state, usr: { latitude: 37, longitude: 127, situation: "solo" } }, "");
      });
      let body;
      await page.route("**/v1/recommendations", async (route) => {
        body = route.request().postDataJSON();
        await route.fulfill({
          json: { sessionId: 17, radiusMeters: 1000, radiusOptions: [500, 1000, 2000], items: [] },
        });
      });
      await page.goto("/recommend/category");
      await expect(page.locator('[data-id="korean"]')).toHaveCSS("background-color", "rgb(255, 248, 237)");
      const option = page.getByRole("checkbox", { name: "음식 종류 상관없이 추천받아요" });
      await page.getByText("음식 종류 상관없이 추천받아요", { exact: true }).click();
      await expect(option).toBeChecked();
      if (!any) {
        await page.getByText("음식 종류 상관없이 추천받아요", { exact: true }).click();
        await expect(option).not.toBeChecked();
      }
      if (width === 390 && any) await page.screenshot({ path: testInfo.outputPath("category-any.png") });
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      await page.getByRole("button", { name: "다음", exact: true }).click();
      await page.getByRole("button", { name: "가격대는 상관없어요", exact: true }).click();
      await page.getByRole("button", { name: "다음", exact: true }).click();
      await expect.poll(() => body).toBeTruthy();
      expect(body.foodCategories).toEqual(
        any ? ["KOREAN", "JAPANESE", "CHINESE", "WESTERN", "CAFE_DESSERT", "PUB_BAR", "OTHER"] : ["KOREAN"],
      );
      expect(body.priceRange).toBeUndefined();
      expect(body.companionType).toBe("SOLO");
    });
  }
}

test("작은 높이에서도 옵션과 다음 버튼이 화면 안에 표시", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/recommend/category");
  await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
  for (const element of [
    page.getByText("음식 종류 상관없이 추천받아요", { exact: true }),
    page.getByRole("button", { name: "다음", exact: true }),
  ]) {
    const box = await element.boundingBox();
    expect(box.y).toBeGreaterThan(0);
    expect(box.y + box.height).toBeLessThanOrEqual(640);
  }
  await page.getByText("음식 종류 상관없이 추천받아요", { exact: true }).click();
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await expect(page).toHaveURL(/\/recommend\/price$/);
});
