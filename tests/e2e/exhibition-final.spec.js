import { test, expect } from "@playwright/test";
test.use({ hasTouch: true, isMobile: true });

/** 피드 사진에 실제 터치 스와이프 입력 */
async function swipePhoto(page, image, dx) {
  const box = await image.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let step = 1; step <= 8; step++) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + (dx * step) / 8, y }] });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await client.detach();
}

/** 전시 수정사항을 실제 데이터 변경 없이 재현 */
test.beforeEach(async ({ page }) => {
  await page.route("**/v1/**", async (route) => {
    if (route.request().method() !== "GET") return route.abort();
    const path = new URL(route.request().url()).pathname;
    let data;
    if (path.endsWith("/feed"))
      data = {
        items: [
          {
            reviewId: 12,
            restaurantId: 101,
            restaurantName: "테스트 식당",
            authorNickname: "작성자 정보",
            content: "기록 내용",
            foodCategory: "KOREAN",
            companionType: "SOLO",
            imageUrls: Array.from({ length: 5 }, (_, i) => `http://localhost:5173/assets/dummy.png?photo=${i}`),
            likeCount: 0,
            likedByMe: false,
          },
        ],
        nextCursor: null,
      };
    else if (path.endsWith("/me/picks"))
      data = {
        restaurants: [
          {
            restaurantId: 101,
            restaurantName: "테스트 식당",
            pickCount: 2,
            foodCategory: "KOREAN",
            latestPickedAt: "2026-10-18T01:00:00Z",
            representativeImageUrl: null,
          },
        ],
      };
    else if (path.endsWith("/restaurants/101"))
      data = {
        id: 101,
        name: "테스트 식당",
        foodCategory: "KOREAN",
        imageUrls: [],
        representativeImageUrl: null,
        oneLineReview: "기록이 없습니다.",
      };
    else if (path.endsWith("/discovery-spots"))
      data = {
        spots: [
          {
            regionCode: "SINSA",
            regionName: "신사",
            displayOrder: 1,
            restaurants: [
              {
                restaurantId: 101,
                name: "테스트 식당",
                foodCategory: "KOREAN",
                displayOrder: 1,
                representativeImageUrl: "http://localhost:5173/missing-photo.png",
              },
            ],
          },
        ],
      };
    else if (path.endsWith("/me"))
      data = { memberId: 1, nickname: "픽잇", bio: "숨길 자기소개", profileImageUrl: null };
    else if (path.endsWith("/reviews/12"))
      data = {
        reviewId: 12,
        restaurantName: "테스트 식당",
        content: "기록 내용",
        imageUrls: [],
        foodCategory: "KOREAN",
        companionType: "SOLO",
      };
    else if (path.endsWith("/recommendations/17"))
      data = {
        sessionId: 17,
        radiusMeters: 1000,
        radiusOptions: [500, 1000, 2000],
        items: [
          { restaurantId: 101, name: "테스트 식당", rank: 1, foodCategory: "KOREAN", representativeImageUrl: null },
        ],
      };
    else return route.abort();
    await route.fulfill({ json: data });
  });
});

/** 페이지 전체와 개별 요소 넘침 확인 */
async function checkOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
}

for (const width of [360, 390, 430]) {
  test(`기본 식당 사진·최근 선택 상세 이동·자기소개 숨김 (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/recent");
    await expect(page.getByText("2번째 선택")).toBeVisible();
    await page.getByRole("link", { name: /테스트 식당/ }).click();
    await expect(page).toHaveURL(/\/restaurant\/101$/);
    await expect(page.getByRole("button", { name: "pick 지도에 저장", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "친구에게 공유", exact: true })).toBeVisible();
    await expect(page.getByAltText("테스트 식당 기본 사진")).toHaveAttribute("src", /thumbnail_default/);
    await page.getByRole("button", { name: "목록으로 돌아가기" }).click();
    await expect(page).toHaveURL(/\/recent$/);
    await page.goto("/explore/sinsa");
    await expect(page.getByAltText("테스트 식당")).toHaveAttribute("src", /thumbnail_default/);
    await checkOverflow(page);
    await page.goto("/recommend/result?sessionId=17");
    await expect(page.locator('img[src*="thumbnail_default"]')).toBeVisible();
    await page.goto("/mypage");
    await expect(page.getByText("픽잇님 안녕하세요.")).toBeVisible();
    await expect(page.getByText("숨길 자기소개")).toHaveCount(0);
    await checkOverflow(page);
  });

  test(`피드 상세 5장과 기록 500자 제한 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/feed");
    await page.getByRole("button", { name: /기록 보기/ }).click();
    const modal = page.getByRole("dialog");
    await expect(modal.getByText("작성자 정보")).toHaveCount(0);
    await expect(modal.getByRole("img", { name: "사진 1 / 5", exact: true })).toBeVisible();
    const dots = modal.getByRole("img", { name: "사진 1 / 5", exact: true });
    await expect(dots.locator("span")).toHaveCount(5);
    await expect(dots.locator('[aria-current="true"]')).toHaveCSS("background-color", "rgb(248, 120, 22)");
    await expect(modal.getByRole("button", { name: "다음 기록 사진" })).toHaveCount(0);
    await swipePhoto(page, modal.locator("img"), -90);
    await expect(modal.getByRole("img", { name: "사진 2 / 5", exact: true })).toBeVisible();
    await swipePhoto(page, modal.locator("img"), 90);
    await expect(modal.getByRole("img", { name: "사진 1 / 5", exact: true })).toBeVisible();
    for (let i = 2; i <= 5; i++) {
      await page.keyboard.press("ArrowRight");
      await expect(modal.getByRole("img", { name: `사진 ${i} / 5`, exact: true })).toBeVisible();
    }
    await page.keyboard.press("ArrowRight");
    await expect(modal.getByRole("img", { name: "사진 1 / 5", exact: true })).toBeVisible();
    expect((await modal.locator("img").boundingBox()).height).toBeGreaterThan(210);
    await checkOverflow(page);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("feed-detail.png") });
    await modal.getByRole("button", { name: "닫기", exact: true }).click();
    for (const path of ["/history/write?pickId=1", "/history/write?reviewId=12"]) {
      await page.goto(path);
      const content = page.getByRole("textbox", { name: "기록 내용" });
      await expect(content).toHaveAttribute("maxlength", "500");
      await content.fill("가".repeat(501));
      await expect(content).toHaveValue("가".repeat(500));
      await checkOverflow(page);
    }
  });
}
