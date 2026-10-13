import { test, expect } from "@playwright/test";

/** 실제 서버 요청 없이 화면 상태 재현 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("pickeat.accessToken", "test-access");
    sessionStorage.setItem("pickeat.refreshToken", "test-refresh");
  });
  await page.route("**/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() !== "GET") return route.abort();
    let data;
    if (url.pathname.endsWith("/me")) data = { memberId: 1, nickname: "픽잇", bio: "", profileImageUrl: null };
    else if (url.pathname.endsWith("/feed")) data = { items: [], nextCursor: null };
    else if (url.pathname.endsWith("/calendar"))
      data = {
        year: Number(url.searchParams.get("year")),
        month: Number(url.searchParams.get("month")),
        dates: [],
        picks: [],
      };
    else if (url.pathname.endsWith("/discovery-spots")) data = { spots: [] };
    else if (url.pathname.endsWith("/me/picks")) data = { restaurants: [] };
    else if (url.pathname.endsWith("/restaurants/155"))
      data = {
        id: 155,
        name: "테스트 식당",
        foodCategory: "KOREAN",
        oneLineReview: "기록이 없습니다.",
        imageUrls: ["http://localhost:5173/assets/dummy.png", "http://localhost:5173/assets/Sinsa.png"],
      };
    else return route.abort();
    await route.fulfill({ json: data });
  });
});

for (const width of [360, 390, 430]) {
  test(`로그아웃 확인과 취소 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    let logoutCount = 0;
    await page.route("**/v1/auth/logout", async (route) => {
      logoutCount++;
      expect(route.request().postDataJSON()).toEqual({ refreshToken: "test-refresh" });
      await route.fulfill({ status: 204 });
    });
    await page.goto("/mypage");
    await page.getByRole("button", { name: "로그아웃", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "로그아웃 하시겠습니까?" });
    await expect(dialog).toBeVisible();
    expect(logoutCount).toBe(0);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("logout.png") });
    await dialog.getByRole("button", { name: "아니요." }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/mypage$/);
    expect(await page.evaluate(() => sessionStorage.getItem("pickeat.accessToken"))).toBe("test-access");
    await page.getByRole("button", { name: "로그아웃", exact: true }).click();
    await dialog.getByRole("button", { name: "네.", exact: true }).click();
    await expect(page).toHaveURL("/");
    expect(logoutCount).toBe(1);
    expect(await page.evaluate(() => sessionStorage.getItem("pickeat.accessToken"))).toBeNull();
  });

  test(`하단 피드 분리와 알림 이동 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/calendar");
    const nav = page.getByRole("navigation", { name: "하단 메뉴" });
    await expect(nav.getByRole("button")).toHaveCount(4);
    const feedIcon = nav.getByRole("button", { name: "피드", exact: true }).locator("img");
    await expect(feedIcon).toHaveAttribute("src", /feed\.png/);
    await expect(feedIcon).toHaveJSProperty("naturalWidth", 24);
    const tab = await page.getByRole("button", { name: "캘린더", exact: true }).boundingBox();
    expect(tab.width).toBe(79);
    const lastTab = await page.getByRole("button", { name: "나의 기록", exact: true }).boundingBox();
    expect(lastTab.x + lastTab.width).toBeLessThan(width - 40);
    await expect(page.getByRole("button", { name: "pick 피드", exact: true })).toHaveCount(0);
    await nav.getByRole("button", { name: "피드", exact: true }).click();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(nav.getByRole("button", { name: "피드", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("button", { name: "캘린더", exact: true })).toHaveCount(0);
    await nav.getByRole("button", { name: "홈", exact: true }).click();
    const bell = page.getByRole("button", { name: "알림", exact: true });
    await expect(bell.locator("img")).toHaveJSProperty("naturalWidth", 24);
    await bell.click();
    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.getByRole("heading", { name: "알림", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "알림", exact: true }).locator("../../..")).toHaveCSS(
      "opacity",
      "1",
    );
    const periodButton = page.getByRole("button", { name: "알림 조회 기간" });
    await periodButton.click();
    await expect(page.getByRole("button", { name: "30일 기준", exact: true })).toBeVisible();
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("notification-dropdown.png") });
    await page.getByRole("button", { name: "30일 기준", exact: true }).click();
    await expect(periodButton).toHaveText("30일 기준");
    await expect(periodButton).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("notifications.png") });
  });

  test(`상세 사진 전체 보기 및 닫기 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/restaurant/155");
    await page.getByRole("button", { name: "식당 사진 전체 보기", exact: true }).click();
    const viewer = page.getByRole("dialog", { name: "테스트 식당 사진 전체 보기" });
    await expect(viewer).toBeVisible();
    await expect(viewer.locator("img")).toHaveJSProperty("complete", true);
    await expect(viewer.locator("img")).toHaveCSS("object-fit", "contain");
    await viewer.getByRole("button", { name: "전체 보기 다음 사진" }).click();
    await expect(viewer.getByText("2 / 2", { exact: true })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(viewer.getByText("1 / 2", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("photo-viewer.png") });
    await viewer.getByRole("button", { name: "사진 전체 보기 닫기" }).click();
    await expect(viewer).toBeHidden();
    await page.getByRole("button", { name: "식당 사진 전체 보기", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });
}
