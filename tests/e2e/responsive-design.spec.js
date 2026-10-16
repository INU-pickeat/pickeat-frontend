import { test, expect } from "@playwright/test";

/** 화면 경계와 기존 에셋 로딩 확인 */
async function checkLayout(page) {
  await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  for (const img of await page.locator('img[src*="icons"], nav img').all()) {
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
  }
}

for (const width of [360, 390, 430]) {
  test(`지역 카드 비율과 식당 이동 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/v1/discovery-spots", (route) =>
      route.fulfill({
        json: {
          spots: [
            {
              regionCode: "SINSA",
              regionName: "신사",
              displayOrder: 1,
              restaurants: [1, 2, 3].map((id) => ({
                restaurantId: id,
                name: `식당 ${id}`,
                foodCategory: "KOREAN",
                displayOrder: id,
              })),
            },
          ],
        },
      }),
    );
    await page.goto("/explore/sinsa");
    const card = page.locator('a[href="/restaurant/1"]');
    await expect(card).toBeVisible();
    await checkLayout(page);
    const box = await card.boundingBox();
    expect(box.width).toBe(width - 50);
    expect(Math.abs(box.width / box.height - 340 / 234)).toBeLessThan(0.01);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("explore.png") });
    await card.click();
    await expect(page).toHaveURL(/\/restaurant\/1$/);
  });

  test(`마이페이지 메뉴와 공통 하단바 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/v1/me", (route) =>
      route.fulfill({ json: { memberId: 1, nickname: "픽잇", profileImageUrl: null } }),
    );
    await page.goto("/mypage");
    await expect(page.getByText("픽잇님 안녕하세요.")).toBeVisible();
    await checkLayout(page);
    const nav = page.getByRole("navigation", { name: "하단 메뉴" });
    const box = await nav.boundingBox();
    expect(Math.abs(844 - box.y - box.height - 40)).toBeLessThan(1);
    await expect(nav.getByRole("button", { name: "마이페이지" })).toHaveCSS("background-color", "rgb(254, 212, 179)");
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("mypage.png") });
    await page.getByRole("button", { name: "로그아웃", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "아니요", exact: true }).click();
    await page.getByRole("button", { name: "내 정보 수정" }).click();
    await expect(page).toHaveURL(/\/mypage\/edit$/);
  });

  test(`나의 기록 카드와 필터·수정 이동 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/v1/me/reviews?*", (route) =>
      route.fulfill({
        json: {
          reviews: [
            {
              reviewId: 12,
              restaurantName: "테스트 식당",
              selectedAt: "2026-10-16T00:00:00Z",
              foodCategory: "KOREAN",
              companionType: "SOLO",
              imageUrls: ["http://localhost:5173/assets/dummy.png"],
              content: "기록 내용",
            },
          ],
        },
      }),
    );
    await page.goto("/history");
    await expect(page.getByText("테스트 식당", { exact: true })).toBeVisible();
    await checkLayout(page);
    const image = page.getByAltText("테스트 식당");
    await expect(image).toBeVisible();
    const box = await image.locator("..").boundingBox();
    expect(Math.abs(box.width / box.height - 340 / 166)).toBeLessThan(0.01);
    await page.getByRole("button", { name: "일주일 기준", exact: true }).click();
    await page.getByRole("button", { name: "30일 기준", exact: true }).click();
    await expect(page.getByText("테스트 식당", { exact: true })).toBeVisible();
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("history.png") });
    await image.locator("..").getByRole("button").first().click();
    await expect(page).toHaveURL(/reviewId=12/);
  });

  test(`음식 카드 선택과 다음 이동 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/recommend/category");
    await checkLayout(page);
    const next = page.getByRole("button", { name: "다음", exact: true });
    await expect(next).toBeEnabled();
    const japanese = page.locator('[data-id="japanese"]');
    await japanese.scrollIntoViewIfNeeded();
    await japanese.click();
    await expect(japanese).toHaveCSS("background-color", "rgb(255, 248, 237)");
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("category.png") });
    await next.click();
    await expect(page).toHaveURL(/\/recommend\/price$/);
  });
}

test("낮은 화면에서도 인증·음식 선택 버튼 접근", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/login");
  await page.getByRole("button", { name: "회원가입", exact: true }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await page.goto("/reset-password");
  await expect(page.getByLabel("새 비밀번호", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "비밀번호 변경하기" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.goto("/recommend/category");
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await expect(page).toHaveURL(/\/recommend\/price$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
