import { test, expect } from "@playwright/test";

/** 홈 기준 안내 문구와 가로 넘침 확인 */
async function checkMessage(page, message) {
  await expect(message).toBeVisible();
  await expect(message).toHaveCSS("color", "rgb(119, 119, 119)");
  await expect(message).toHaveCSS("font-size", "14px");
  await expect(message).toHaveCSS("font-weight", "400");
  await expect(message).toHaveCSS("line-height", "20px");
  await expect(message).toHaveCSS("text-align", "center");
  await expect(message).toHaveCSS("word-break", "keep-all");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
}

for (const width of [360, 390, 430]) {
  test(`오류·빈 목록 안내 스타일과 재시도 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    const error = "정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요. " + "long-error-without-spaces-".repeat(5);
    let empty = false;
    let requests = 0;
    await page.route("**/v1/**", async (route) => {
      requests++;
      if (!empty) return route.fulfill({ status: 500, json: { message: error } });
      const url = new URL(route.request().url());
      const data = url.pathname.endsWith("/calendar")
        ? {
            year: Number(url.searchParams.get("year")),
            month: Number(url.searchParams.get("month")),
            dates: [],
            picks: [],
          }
        : { reviews: [], restaurants: [], notifications: [], items: [], nextCursor: null };
      return route.fulfill({ json: data });
    });
    for (const path of [
      "/home",
      "/explore/sinsa",
      "/calendar",
      "/history",
      "/recent",
      "/feed",
      "/notifications",
      "/mypage",
      "/restaurant/101",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("alert").first()).toBeVisible();
      const alert = page.getByRole("alert").first();
      await checkMessage(page, (await alert.locator("p").count()) ? alert.locator("p").first() : alert);
      const retry = page.getByRole("button", { name: "다시 시도", exact: true }).first();
      if (await retry.count()) {
        const previous = requests;
        await retry.click();
        await expect.poll(() => requests).toBeGreaterThan(previous);
      }
    }
    empty = true;
    for (const [path, text] of [
      ["/calendar", "이날은 선택한 Pick이 없어요."],
      ["/history", "일주일 기준 기록한 맛집이 없어요."],
      ["/feed", "아직 공개된 기록이 없어요."],
      ["/notifications", "선택한 기간에 알림이 없어요."],
    ]) {
      await page.goto(path);
      await checkMessage(page, page.getByText(text, { exact: true }));
    }
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("empty-notifications.png") });
    await page.goto("/signup");
    await page.getByRole("button", { name: "인증하기", exact: true }).click();
    await checkMessage(page, page.getByRole("alert"));
  });
}
