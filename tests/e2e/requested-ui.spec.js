import { test, expect } from "@playwright/test";

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

  test(`추천 제외 사유 바로 선택 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    let exclusions = 0;
    await page.route("**/v1/recommendations/17", (route) =>
      route.fulfill({
        json: {
          sessionId: 17,
          items: [{ restaurantId: 155, name: "테스트 식당", foodCategory: "KOREAN", rank: 1, distanceMeters: 320 }],
        },
      }),
    );
    await page.route("**/v1/restaurants/155", (route) =>
      route.fulfill({
        json: { id: 155, name: "테스트 식당", foodCategory: "KOREAN", representativeImageUrl: null, imageUrls: [] },
      }),
    );
    await page.route("**/v1/recommendations/17/exclusions", async (route) => {
      exclusions++;
      expect(route.request().postDataJSON()).toEqual({ restaurantId: 155, reason: "WANT_DIFFERENT" });
      await route.fulfill({ json: { sessionId: 17, items: [] } });
    });
    await page.goto("/recommend/result?sessionId=17");
    const open = page.getByRole("button", { name: "다른 식당으로 추천" });
    await expect(page.getByText("내 위치에서 320m", { exact: true })).toBeVisible();
    await expect(open.locator("../../..")).toHaveCSS("opacity", "1");
    await page.getByRole("button", { name: "추천 거리 기준" }).click();
    await expect(page.getByRole("button", { name: "2km 기준", exact: true })).toBeVisible();
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("구현 예정");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "1km 기준", exact: true }).click();
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("recommendation.png") });
    await open.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading")).toHaveText("이 추천 맛집이 아쉬운 이유가 있나요?");
    await expect(dialog.getByRole("radio")).toHaveCount(5);
    await expect(dialog.getByRole("button", { name: "제외하기" })).toBeDisabled();
    await dialog.getByText("다른 곳을 볼래요.", { exact: true }).click();
    await dialog.getByRole("button", { name: "취소" }).click();
    expect(exclusions).toBe(0);
    await open.click();
    await expect(dialog.getByRole("button", { name: "제외하기" })).toBeDisabled();
    await dialog.getByText("다른 곳을 볼래요.", { exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("exclusion.png") });
    await dialog.getByRole("button", { name: "제외하기" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("조건에 맞는 맛집이 없어요.")).toBeVisible();
    expect(exclusions).toBe(1);
  });
}
