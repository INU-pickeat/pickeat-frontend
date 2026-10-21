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
      expect(route.request().postDataJSON()).toEqual({ contentType: "image/png" });
      await route.fulfill({
        json: {
          uploadUrl: "https://uploads.example.test/profile",
          imageUrl: "https://images.example.test/profile.png",
          contentType: "image/png",
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
    const confirmation = page.waitForEvent("dialog");
    await page.getByRole("button", { name: "저장", exact: true }).click();
    const dialog = await confirmation;
    expect(dialog.message()).toBe("내 정보가 변경되었어요.");
    await dialog.accept();
    await expect(page).toHaveURL(/\/mypage$/);
    expect(saved).toBe(true);
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
