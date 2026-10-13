import { test, expect } from "@playwright/test";

const restaurant = {
  restaurantId: 10,
  restaurantName: "테스트 식당",
  foodCategory: "KOREAN",
  pickCount: 1,
  latestPickedAt: "2026-10-13T00:00:00Z",
};

test("선택한 30일 기간으로 삭제 후 재조회", async ({ page }) => {
  let deleted = false;
  const periods = [];
  await page.route("**/v1/me/picks?*", (route) => {
    periods.push(new URL(route.request().url()).searchParams.get("period"));
    return route.fulfill({ json: { restaurants: deleted ? [] : [restaurant] } });
  });
  await page.route("**/v1/me/picks/restaurants/10", (route) => {
    deleted = true;
    return route.fulfill({ status: 204 });
  });
  await page.goto("/recent");
  await page.getByRole("button", { name: "일주일 기준", exact: true }).click();
  await page.getByRole("button", { name: "30일 기준", exact: true }).click();
  const row = page.getByRole("group", { name: "테스트 식당 최근 pick", exact: true });
  await row.focus();
  await page.keyboard.press("ArrowLeft");
  await page.getByRole("dialog").getByRole("button", { name: "네", exact: true }).click();
  await expect(page.getByText("선택한 기간에 Pick한 맛집이 없어요.")).toBeVisible();
  expect(periods).toEqual(["week", "month", "month"]);
});

for (const [status, code, message] of [
  [409, "PICK_006", "기록을 먼저 삭제해주세요."],
  [404, "PICK_001", "삭제할 Pick이 없어요."],
]) {
  test(`${code} 삭제 실패 시 목록 유지`, async ({ page }, testInfo) => {
    let queries = 0;
    await page.route("**/v1/me/picks?*", (route) => {
      queries++;
      return route.fulfill({ json: { restaurants: [restaurant] } });
    });
    await page.route("**/v1/me/picks/restaurants/10", (route) => route.fulfill({ status, json: { code } }));
    await page.goto("/recent");
    const row = page.getByRole("group", { name: "테스트 식당 최근 pick", exact: true, includeHidden: true });
    await row.focus();
    await page.keyboard.press("ArrowLeft");
    const modal = page.getByRole("dialog");
    await modal.getByRole("button", { name: "네", exact: true }).click();
    await expect(modal.getByRole("alert")).toContainText(message);
    await expect(modal.getByRole("button", { name: "네", exact: true })).toBeEnabled();
    expect(queries).toBe(1);
    if (status === 409) await page.screenshot({ path: testInfo.outputPath("delete-conflict.png") });
    await modal.getByRole("button", { name: "아니요", exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(row.getByText("1번째 방문", { exact: true })).toBeVisible();
  });
}
