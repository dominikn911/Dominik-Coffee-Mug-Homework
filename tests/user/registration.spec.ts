import { test, expect } from "@playwright/test";

test.describe("registration test", () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL as string);
        await page.getByRole("link", { name: "Create an Account" }).click();
        await expect(page.getByText("Create New Customer Account")).toBeVisible();
    });

    test("add new user", async ({ page }) => {
        const name: string = "test_name";
        const lastName: string = "test_lastName";
        const email: string = `test_${Date.now()}@example.com`;
        const password: string = process.env.REGISTRATION_PASSWORD as string;

        await page.getByRole("textbox", { name: "First Name *" }).fill(name);
        await page.getByRole("textbox", { name: "Last Name *" }).fill(lastName);
        await page.getByRole("textbox", { name: "Email*" }).fill(email);
        await page.getByRole("textbox", { name: "Password*" }).fill(password);
        await page
            .getByRole("textbox", { name: "Confirm Password *" })
            .fill(password);
        await page.getByRole("button", { name: "Create an Account" }).click();

        await expect(page.getByText("Thank you for registering")).toBeVisible();
        await expect(page.locator(".base").getByText("My Account")).toBeVisible();
        await expect(page.getByText(`${name} ${lastName} ${email}`)).toBeVisible();
    });
});
