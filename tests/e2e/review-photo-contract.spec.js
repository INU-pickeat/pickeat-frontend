import { test, expect } from "@playwright/test";
import { Buffer } from "node:buffer";

const photo = (index) => ({
  name: `photo-${index}.png`,
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  ),
});

for (const width of [360, 390, 430]) {
  test(`사진 필수·5장 제한·작성 및 사진 수정 차단 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      if (location.pathname === "/history/write")
        history.replaceState(
          {
            ...history.state,
            usr: { selectedRestaurant: { name: "테스트 식당", foodCategory: "KOREAN" }, situation: "solo" },
          },
          "",
        );
    });
    let created;
    let updated;
    let uploads = 0;
    await page.route("**/v1/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/images/upload-urls")) {
        uploads++;
        return route.fulfill({
          json: {
            uploads: [
              {
                uploadUrl: `http://localhost:5173/mock-upload/${uploads}`,
                imageUrl: `https://images.test/${uploads}.png`,
                contentType: "image/png",
              },
            ],
          },
        });
      }
      if (path.endsWith("/reviews/12")) {
        if (route.request().method() === "PATCH") updated = route.request().postDataJSON();
        return route.fulfill({
          json: {
            reviewId: 12,
            content: "기존 기록",
            restaurantName: "테스트 식당",
            imageUrls: [],
            foodCategory: "KOREAN",
            companionType: "SOLO",
          },
        });
      }
      if (path.endsWith("/reviews") && route.request().method() === "POST") {
        created = route.request().postDataJSON();
        return route.fulfill({ json: { reviewId: 12, pickId: 1 } });
      }
      return route.fulfill({ json: { reviews: [] } });
    });
    await page.route("**/mock-upload/*", (route) => route.fulfill({ status: 200 }));
    await page.goto("/history/write?pickId=1");
    await page.getByRole("textbox", { name: "기록 내용" }).fill("테스트 기록");
    await page.getByRole("button", { name: "기록하기", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("사진을 1장 이상 첨부해 주세요.");
    expect(created).toBeUndefined();
    const input = page.getByLabel("기록 사진 추가");
    await expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    await input.setInputFiles({ name: "unsupported.heic", mimeType: "image/heic", buffer: Buffer.from("test") });
    await expect(page.getByRole("alert")).toHaveText("JPEG·PNG·WebP 사진만 첨부할 수 있어요.");
    await expect(page.getByRole("img", { name: /^첨부 사진/ })).toHaveCount(0);
    expect(uploads).toBe(0);
    await input.setInputFiles(Array.from({ length: 6 }, (_, i) => photo(i)));
    await expect(page.getByRole("alert")).toHaveText("사진은 최대 5장까지 첨부할 수 있어요.");
    await input.setInputFiles([photo(0), photo(1)]);
    await page.getByRole("button", { name: "사진 1 삭제", exact: true }).click();
    await input.setInputFiles([photo(2), photo(3), photo(4), photo(5)]);
    await expect(page.getByRole("img", { name: /^첨부 사진/ })).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("write-photos.png") });
    await page.getByRole("button", { name: "기록하기", exact: true }).click();
    await expect.poll(() => created?.imageUrls?.length).toBe(5);
    expect(uploads).toBe(5);
    await page.goto("/history/write?reviewId=12");
    await expect(page.getByText("첨부된 사진이 없어요.")).toBeVisible();
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
    await page.getByRole("textbox", { name: "기록 내용" }).fill("변경한 기록");
    await page.getByRole("button", { name: "수정하기", exact: true }).click();
    await expect.poll(() => updated).toEqual({ content: "변경한 기록" });
  });
}
