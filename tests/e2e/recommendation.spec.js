import { test, expect } from "@playwright/test";

for (const width of [360, 390, 430]) {
  test(`추천 제외 사유 바로 선택 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    let exclusions = 0;
    await page.route("**/v1/recommendations/17", (route) =>
      route.fulfill({
        json: {
          sessionId: 17,
          radiusMeters: 1000,
          radiusOptions: [500, 1000, 2000],
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
      await route.fulfill({ json: { sessionId: 17, radiusMeters: 1000, radiusOptions: [500, 1000, 2000], items: [] } });
    });
    await page.goto("/recommend/result?sessionId=17");
    const open = page.getByRole("button", { name: "다른 식당으로 추천" });
    await expect(page.getByText("내 위치에서 320m", { exact: true })).toBeVisible();
    await expect(open.locator("../../..")).toHaveCSS("opacity", "1");
    await page.getByRole("button", { name: "추천 거리 기준" }).click();
    await expect(page.getByRole("button", { name: "2km 기준", exact: true })).toBeVisible();
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

for (const width of [360, 390, 430]) {
  test(`반경 변경 시 동일 조건으로 새 세션 생성 (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      if (location.pathname === "/recommend/result") {
        history.replaceState(
          {
            ...history.state,
            usr: { latitude: 35, longitude: 128, situation: "solo", category: "korean", price: "any" },
          },
          "",
        );
      }
    });
    const item = {
      restaurantId: 155,
      name: "테스트 식당",
      foodCategory: "KOREAN",
      rank: 1,
      distanceMeters: 1200,
      representativeImageUrl: "/assets/dummy.png",
    };
    let creates = 0;
    let details = 0;
    let release;
    const responseReady = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/v1/restaurants/155", (route) => {
      details++;
      return route.fulfill({ json: {} });
    });
    await page.route("**/v1/recommendations/17", (route) =>
      route.fulfill({ json: { sessionId: 17, radiusMeters: 5000, radiusOptions: [1000, 3000, 5000], items: [item] } }),
    );
    await page.route("**/v1/recommendations", async (route) => {
      creates++;
      expect(route.request().postDataJSON()).toEqual({
        latitude: 35,
        longitude: 128,
        foodCategories: ["KOREAN"],
        companionType: "SOLO",
        radiusMeters: 3000,
      });
      await responseReady;
      await route.fulfill({
        json: { sessionId: 18, radiusMeters: 3000, radiusOptions: [1000, 3000, 5000], items: [item] },
      });
    });
    await page.route("**/v1/recommendations/18", (route) =>
      route.fulfill({ json: { sessionId: 18, radiusMeters: 3000, radiusOptions: [1000, 3000, 5000], items: [item] } }),
    );
    await page.goto("/recommend/result?sessionId=17");
    await expect(page.getByRole("button", { name: "추천 거리 기준" })).toHaveText("5km 기준");
    await expect(page.getByText("내 위치에서 1.2km")).toBeVisible();
    await page.getByRole("button", { name: "추천 거리 기준" }).click();
    await expect(page.getByRole("button", { name: "5km 기준", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "500m 기준", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "3km 기준", exact: true }).click();
    await expect(page.getByRole("button", { name: "추천 거리 기준" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "테스트 식당 상세보기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "테스트 식당 상세보기" })).toBeDisabled();
    await expect(page).toHaveURL(/sessionId=17/);
    await expect(page.getByRole("progressbar")).toHaveCount(0);
    release();
    await expect(page).toHaveURL(/sessionId=18/, { timeout: 10000 });
    await expect(page.getByRole("button", { name: "추천 거리 기준" })).toHaveText("3km 기준");
    expect(creates).toBe(1);
    expect(details).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test("반경 변경 실패 후 기존 결과 유지 및 재시도", async ({ page }) => {
  await page.addInitScript(() => {
    history.replaceState(
      { ...history.state, usr: { latitude: 37, longitude: 127, situation: "solo", category: "korean", price: "any" } },
      "",
    );
  });
  const item = { restaurantId: 155, name: "기존 식당", foodCategory: "KOREAN", rank: 1 };
  await page.route("**/v1/recommendations/17", (route) =>
    route.fulfill({ json: { sessionId: 17, radiusMeters: 1000, radiusOptions: [500, 1000, 2000], items: [item] } }),
  );
  let creates = 0;
  await page.route("**/v1/recommendations", (route) => {
    creates++;
    return creates === 1
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: { sessionId: 18, radiusMeters: 2000, radiusOptions: [500, 1000, 2000], items: [item] } });
  });
  await page.goto("/recommend/result?sessionId=17");
  await page.getByRole("button", { name: "추천 거리 기준" }).click();
  await page.getByRole("button", { name: "2km 기준", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: "기존 식당 상세보기" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "추천 거리 기준" })).toHaveText("1km 기준");
  await expect(page).toHaveURL(/sessionId=17/);
  await page.getByRole("button", { name: "추천 거리 기준" }).click();
  await page.getByRole("button", { name: "2km 기준", exact: true }).click();
  await expect(page).toHaveURL(/sessionId=18/);
  await expect(page.getByRole("button", { name: "추천 거리 기준" })).toHaveText("2km 기준");
});

test("추천 조건 없는 직접 진입에서는 반경 생성을 보내지 않음", async ({ page }) => {
  await page.route("**/v1/recommendations/17", (route) =>
    route.fulfill({ json: { sessionId: 17, radiusMeters: 1000, radiusOptions: [500, 1000, 2000], items: [] } }),
  );
  let creates = 0;
  await page.route("**/v1/recommendations", (route) => {
    creates++;
    return route.abort();
  });
  await page.goto("/recommend/result?sessionId=17");
  await page.getByRole("button", { name: "추천 거리 기준" }).click();
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("추천 조건");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "2km 기준", exact: true }).click();
  expect(creates).toBe(0);
});
