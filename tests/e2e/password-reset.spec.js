import { test, expect } from "@playwright/test";

/** 인증 토큰 없이 재설정 요청 재현 */
async function mockReset(page, { confirmFails = false, resetFails = false } = {}) {
  const calls = [];
  await page.addInitScript(() => {
    sessionStorage.setItem("pickeat.accessToken", "old-access");
    sessionStorage.setItem("pickeat.refreshToken", "old-refresh");
  });
  await page.route("**/v1/auth/**", async (route) => {
    expect(route.request().headers().authorization).toBeUndefined();
    const path = new URL(route.request().url()).pathname;
    const body = route.request().postDataJSON();
    calls.push({ path, body });
    if (path.endsWith("/confirm") && confirmFails) return route.fulfill({ status: 400, json: { message: "인증번호가 올바르지 않습니다." } });
    if (path.endsWith("/password-reset") && resetFails) return route.fulfill({ status: 403, json: { message: "인증이 만료되었습니다." } });
    await route.fulfill({ status: 204 });
  });
  return calls;
}

async function verifyEmail(page) {
  await page.getByLabel("이메일", { exact: true }).fill("USER@pickeat.com");
  await page.getByRole("button", { name: "인증하기", exact: true }).click();
  await page.getByLabel("인증번호", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "인증 확인", exact: true }).click();
  await expect(page.getByRole("button", { name: "인증 완료", exact: true })).toBeVisible();
}

for (const width of [360, 390, 430]) {
  test(`비밀번호 재설정 전체 흐름 (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    const calls = await mockReset(page);
    await page.goto("/reset-password");
    await verifyEmail(page);
    await page.getByLabel("새 비밀번호", { exact: true }).fill("changed-password123");
    await page.getByLabel("새 비밀번호 확인", { exact: true }).fill("changed-password123");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("password-reset.png") });
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "비밀번호 변경하기" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(calls.map((call) => call.body)).toEqual([
      { email: "user@pickeat.com" },
      { email: "user@pickeat.com", code: "123456" },
      { email: "user@pickeat.com", newPassword: "changed-password123" },
    ]);
    expect(calls.map((call) => call.path.replace(/^.*\/v1/, "/v1"))).toEqual([
      "/v1/auth/password-reset/email-verifications", "/v1/auth/email-verifications/confirm", "/v1/auth/password-reset",
    ]);
    expect(await page.evaluate(() => sessionStorage.getItem("pickeat.accessToken"))).toBeNull();
    expect(await page.evaluate(() => sessionStorage.getItem("pickeat.refreshToken"))).toBeNull();
  });
}

test("인증 전 제출·비밀번호 불일치·이메일 변경 방지", async ({ page }) => {
  const calls = await mockReset(page);
  await page.goto("/reset-password");
  await page.getByRole("button", { name: "비밀번호 변경하기" }).click();
  await expect(page.getByRole("alert")).toContainText("이메일 인증");
  expect(calls).toHaveLength(0);
  await verifyEmail(page);
  await page.getByLabel("새 비밀번호", { exact: true }).fill("short");
  await page.getByRole("button", { name: "비밀번호 변경하기" }).click();
  await expect(page.getByRole("alert")).toContainText("8~64자");
  await page.getByLabel("새 비밀번호", { exact: true }).fill("password123");
  await page.getByLabel("새 비밀번호 확인", { exact: true }).fill("different123");
  await page.getByRole("button", { name: "비밀번호 변경하기" }).click();
  await expect(page.getByRole("alert")).toContainText("일치하지");
  await page.getByLabel("이메일", { exact: true }).fill("other@pickeat.com");
  await expect(page.getByRole("button", { name: "인증하기", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "비밀번호 변경하기" }).click();
  await expect(page.getByRole("alert")).toContainText("이메일 인증");
  expect(calls).toHaveLength(2);
});

test("잘못된 인증번호는 변경 요청으로 이어지지 않음", async ({ page }) => {
  const calls = await mockReset(page, { confirmFails: true });
  await page.goto("/reset-password");
  await page.getByLabel("이메일", { exact: true }).fill("user@pickeat.com");
  await page.getByRole("button", { name: "인증하기", exact: true }).click();
  await page.getByLabel("인증번호", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "인증 확인", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("인증번호가 올바르지 않습니다.");
  await page.getByRole("button", { name: "비밀번호 변경하기" }).click();
  expect(calls).toHaveLength(2);
  await expect(page).toHaveURL(/\/reset-password$/);
});

test("서버 인증 만료 시 오류 표시 및 재인증", async ({ page }) => {
  await mockReset(page, { resetFails: true });
  await page.goto("/reset-password");
  await verifyEmail(page);
  await page.getByLabel("새 비밀번호", { exact: true }).fill("password123");
  await page.getByLabel("새 비밀번호 확인", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "비밀번호 변경하기" }).click();
  await expect(page.getByRole("alert")).toHaveText("인증이 만료되었습니다.");
  await expect(page.getByRole("button", { name: "인증번호 재발송" })).toBeEnabled();
  await expect(page).toHaveURL(/\/reset-password$/);
  expect(await page.evaluate(() => sessionStorage.getItem("pickeat.accessToken"))).toBe("old-access");
});
