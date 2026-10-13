import { test, expect } from "@playwright/test";

for (const width of [360, 390, 430]) {
  test(`프로필 사진 업로드 후 정보 저장 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    let uploaded = false;
    let saved = false;
    const profile = { memberId: 1, nickname: "픽잇", bio: "", profileImageUrl: null };
    await page.route("**/v1/me", async (route) => {
      if (route.request().method() === "PATCH") {
        expect(uploaded).toBe(true);
        expect(route.request().postDataJSON()).toEqual({ profileImageUrl: "https://images.example.test/profile.png" });
        saved = true;
        profile.profileImageUrl = "https://images.example.test/profile.png";
      }
      await route.fulfill({ json: profile });
    });
    await page.route("**/v1/me/profile-image/upload-url", async (route) => {
      expect(route.request().postDataJSON()).toEqual({ contentTypes: ["image/png"] });
      await route.fulfill({
        json: {
          uploads: [
            {
              uploadUrl: "https://uploads.example.test/profile",
              imageUrl: "https://images.example.test/profile.png",
              contentType: "image/png",
            },
          ],
        },
      });
    });
    await page.route("https://uploads.example.test/profile", async (route) => {
      expect(route.request().method()).toBe("PUT");
      expect(route.request().headers()["content-type"]).toBe("image/png");
      expect(route.request().headers().authorization).toBeUndefined();
      expect(route.request().postDataBuffer().length).toBeGreaterThan(0);
      uploaded = true;
      await route.fulfill({ status: 200 });
    });
    await page.route("https://images.example.test/profile.png", (route) =>
      route.fulfill({ path: "public/assets/Sinsa.png", contentType: "image/png" }),
    );
    await page.goto("/mypage/edit");
    await expect(page.getByLabel("이름", { exact: true })).toHaveValue("픽잇");
    await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
    await page.locator('input[type="file"]').setInputFiles("public/assets/Sinsa.png");
    await expect(page.getByRole("img", { name: "프로필 이미지" })).toHaveAttribute("src", /^blob:/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("profile-preview.png") });
    await page.getByRole("button", { name: "저장", exact: true }).click();
    await expect(page).toHaveURL(/\/mypage$/);
    expect(saved).toBe(true);
  });

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
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("feed.svg") });
    await card.getByRole("button", { name: /기록 보기/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "닫기", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}

test("프로필 업로드 실패 시 회원정보 수정 안 함", async ({ page }) => {
  let patches = 0;
  await page.route("**/v1/me", async (route) => {
    if (route.request().method() === "PATCH") patches++;
    await route.fulfill({ json: { memberId: 1, nickname: "픽잇", bio: "" } });
  });
  await page.route("**/v1/me/profile-image/upload-url", (route) =>
    route.fulfill({ status: 503, json: { message: "이미지 저장소 미설정" } }),
  );
  await page.goto("/mypage/edit");
  await expect(page.getByLabel("이름", { exact: true })).toHaveValue("픽잇");
  await page.locator('input[type="file"]').setInputFiles("public/assets/Sinsa.png");
  const message = page.waitForEvent("dialog");
  await page.getByRole("button", { name: "저장", exact: true }).click();
  const dialog = await message;
  expect(dialog.message()).toBe("이미지 저장소 미설정");
  await dialog.accept();
  expect(patches).toBe(0);
  await expect(page).toHaveURL(/\/mypage\/edit$/);
});
