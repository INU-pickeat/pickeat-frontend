import { test, expect } from "@playwright/test";

for (const width of [360, 390, 430]) {
  test(`피드 디자인과 좋아요·안내·모달 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    const review = {
      reviewId: 12,
      restaurantId: 101,
      restaurantName: "야스노야지로 본점",
      authorNickname: "푸드현",
      authorProfileImageUrl: null,
      content: "맛있는 양고기와 프라이빗한 공간",
      foodCategory: "JAPANESE",
      companionType: "FAMILY",
      imageUrls: ["http://localhost:5173/assets/dummy.png"],
      likedByMe: false,
      likeCount: 12,
    };
    await page.route("**/v1/feed?*", (route) => route.fulfill({ json: { items: [review], nextCursor: null } }));
    await page.route("**/v1/reviews/12/likes", (route) =>
      route.fulfill({ json: { reviewId: 12, liked: true, likeCount: 13 } }),
    );
    await page.goto("/feed");
    const card = page.locator("article");
    await expect(card.getByText("푸드현", { exact: true })).toBeVisible();
    await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
    await expect(card.getByRole("img", { name: "프로필 이미지" })).toHaveAttribute("src", /profile_default/);
    for (const name of ["팔로우", "좋아요순"]) {
      page.once("dialog", async (dialog) => {
        expect(dialog.message()).toBe("구현 예정입니다.");
        await dialog.accept();
      });
      await page.getByRole("button", { name, exact: true }).click();
    }
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await card.getByRole("button", { name: "좋아요", exact: true }).click();
    await expect(card.getByRole("button", { name: "좋아요 취소" })).toHaveAttribute("aria-pressed", "true");
    await expect(card.getByText("13", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("feed.png") });
    await card.getByRole("button", { name: /기록 보기/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "닫기", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}
