import { test, expect, Page } from "@playwright/test";

const userName: string = "Veronica";
const userLastName: string = "Costello";
const email: string = process.env.USERNAME as string;

async function login(
    page: Page,
    user: string = process.env.USERNAME as string,
    password: string = process.env.PASSWORD as string,
): Promise<void> {
    if (!user || !password) {
        throw new Error("USERNAME and PASSWORD must be set in the environment variables.");
    }

    await page.getByRole("link", { name: "Sign In" }).click();
    await expect(page.getByText("Customer login")).toBeVisible();

    await page
        .getByRole("textbox", { name: "Email*" })
        .fill(user);
    await page
        .getByRole("textbox", { name: "Password" })
        .fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForLoadState("networkidle");
}

async function logout(page: Page): Promise<void> {
    await page
        .getByRole("listitem")
        .filter({ hasText: "Change My Account My Wish" })
        .locator("button")
        .click();
    await page.getByRole("link", { name: "Sign Out" }).click();
    await expect(page.getByText("You are signed out")).toBeVisible();
    await expect(
        page.getByRole("banner").getByText("Default welcome msg!"),
    ).toBeVisible();
}

async function checkLoggedUser(page: Page): Promise<void> {
    await page.getByRole('listitem').filter({ hasText: 'Change My Account My Wish' }).locator('button').click();
    await page.getByRole('link', { name: 'My Account' }).click();
    await expect(page.locator(".base").getByText("My Account")).toBeVisible();
    await expect(page.getByText(`${userName} ${userLastName} ${email}`)).toBeVisible();
}

test.describe("login tests", () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL as string);
    });

    test("login passed", async ({ page }) => {
        await login(page);
        await checkLoggedUser(page);
    });

    test("login failed", async ({ page, actionTimeout }) => {
        const wrongEmail = "wrong@email.com";
        const wrongPassword = "wrongpassword";
        await login(page, wrongEmail, wrongPassword);
        await expect(
            page.locator(".message-error")
        ).toBeVisible({ timeout: actionTimeout });
    });

    test("refresh session", async ({ page }) => {
        await login(page);
        while (true) {
            const currentUrl: string = page.url();
            await page.reload();
            if (page.url() === currentUrl) break;
        }

        await page.waitForLoadState("networkidle");
        await checkLoggedUser(page);
    });

    test("logout", async ({ page }) => {
        await login(page);
        await checkLoggedUser(page);
        await page.waitForLoadState("networkidle");
        await logout(page);
    });
});
