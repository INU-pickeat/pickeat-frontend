import { test, expect } from "@playwright/test";

for (const width of [360, 390, 430]) {
  test(`선택 완료 화면과 버튼 동작 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      if (location.pathname === "/recommend/complete")
        history.replaceState(
          {
            usr: {
              pick: { pickId: 30, restaurantId: 10, restaurantName: "야스노야지로 본점" },
              selectedRestaurant: { id: 10, name: "야스노야지로 본점", foodCategory: "KOREAN" },
              situation: "solo",
            },
            key: "test",
            idx: 0,
          },
          "",
        );
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data) => {
          window.sharedRestaurant = data;
        },
      });
    });
    await page.route("**/v1/restaurants/10/navigation-links", (route) =>
      route.fulfill({ json: { naverMapUrl: "https://map.naver.com/", kakaoMapUrl: "https://map.kakao.com/" } }),
    );
    await page.goto("/recommend/complete");
    await expect(page.getByRole("heading", { name: "오늘의 Pick 저장 완료!" })).toBeVisible();
    await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
    await expect(page.getByRole("img", { name: "캐릭터" })).toHaveCSS("opacity", "1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("complete-select.png") });
    await page.getByRole("button", { name: "길안내", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "pick 공유", exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.sharedRestaurant?.url)).toContain("/restaurant/10");
    await page.getByRole("button", { name: "기록하기", exact: true }).click();
    await expect(page).toHaveURL(/\/history\/write\?pickId=30$/);
    await expect(page.getByText("야스노야지로 본점", { exact: true })).toBeVisible();
    await page.goto("/recommend/complete");
    await page.getByRole("button", { name: "홈으로 이동" }).click();
    await expect(page).toHaveURL(/\/home$/);
  });
}

test("선택 정보 없이 진입하면 동작 버튼 비활성화", async ({ page }) => {
  await page.goto("/recommend/complete");
  for (const name of ["길안내", "pick 공유", "기록하기"])
    await expect(page.getByRole("button", { name, exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "홈으로 이동" })).toBeEnabled();
});
