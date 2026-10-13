import { test, expect } from "@playwright/test";

for (const width of [360, 390, 430]) {
  test(`좋아요 알림 조회·기간 선택·기록 보기 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.clock.install({ time: new Date("2026-10-13T06:00:00Z") });
    let requests = 0;
    await page.route("**/v1/me/notifications", async (route) => {
      requests++;
      expect(route.request().method()).toBe("GET");
      expect(new URL(route.request().url()).search).toBe("");
      await route.fulfill({
        json: {
          notifications: [
            {
              type: "REVIEW_LIKE",
              reviewId: 12,
              restaurantName: "테스트 식당",
              actorNickname: "지인",
              actorProfileImageUrl: null,
              message: "지인님이 회원님의 기록을 좋아해요",
              createdAt: "2026-10-13T05:00:00Z",
            },
            {
              type: "REVIEW_LIKE",
              reviewId: 13,
              restaurantName: "다른 식당",
              actorNickname: "픽잇",
              actorProfileImageUrl: null,
              message: "픽잇님이 회원님의 기록을 좋아해요",
              createdAt: "2026-09-25T05:00:00Z",
            },
          ],
        },
      });
    });
    await page.route("**/v1/reviews/12", (route) =>
      route.fulfill({
        json: {
          reviewId: 12,
          restaurantName: "테스트 식당",
          content: "내가 작성한 기록",
          foodCategory: "KOREAN",
          companionType: "SOLO",
          imageUrls: [],
        },
      }),
    );
    await page.goto("/notifications");
    const notification = page.getByRole("button", { name: "테스트 식당: 지인님이 회원님의 기록을 좋아해요" });
    await expect(notification).toBeVisible();
    await expect(page.getByText("픽잇님이 회원님의 기록을 좋아해요", { exact: true })).toHaveCount(0);
    await expect(notification.locator("img")).toHaveAttribute("src", /profile_default/);
    await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("notifications.png") });
    await page.getByRole("button", { name: "알림 조회 기간" }).click();
    await page.getByRole("button", { name: "30일 기준", exact: true }).click();
    await expect(page.getByText("픽잇님이 회원님의 기록을 좋아해요", { exact: true })).toBeVisible();
    expect(requests).toBe(1);
    await notification.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("내가 작성한 기록", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "닫기", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}

test("알림 없음 안내", async ({ page }) => {
  await page.route("**/v1/me/notifications", (route) => route.fulfill({ json: { notifications: [] } }));
  await page.goto("/notifications");
  await expect(page.getByText("선택한 기간에 알림이 없어요.")).toBeVisible();
});

test("조회 오류 메시지와 재시도", async ({ page }) => {
  let requests = 0;
  await page.route("**/v1/me/notifications", (route) => {
    requests++;
    return route.fulfill(
      requests === 1 ? { status: 500, json: { message: "알림 조회 실패" } } : { json: { notifications: [] } },
    );
  });
  await page.goto("/notifications");
  await expect(page.getByRole("alert")).toContainText("알림 조회 실패");
  await page.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(page.getByText("선택한 기간에 알림이 없어요.")).toBeVisible();
});

test("미인증 시 로그인 안내", async ({ page }) => {
  await page.route("**/v1/me/notifications", (route) => route.fulfill({ status: 401, json: {} }));
  await page.goto("/notifications");
  await expect(page.getByRole("alert")).toContainText("로그인이 필요합니다.");
  await expect(page.getByRole("link", { name: "로그인하기" })).toHaveAttribute("href", "/login");
});
