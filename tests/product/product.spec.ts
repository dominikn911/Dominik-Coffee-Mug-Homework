import { test, expect } from "@playwright/test";
import { getPrice, Product, searchProduct } from "../../common";

test.describe("search product", () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL as string);
    });

    test("by search box", async ({ page }) => {
        const product: Product = {
            name: "watch",
            price: 20,
            count: 9
        }
        
        await searchProduct(page, product.name);
        await expect(page.locator(".product-item")).toHaveCount(product.count as number);
    });

    test("by search box - no results", async ({ page }) => {
        const product: Product = {
            name: "iphone",
            price: 2000,
            count: 0
        }

        await searchProduct(page, product.name);
        await expect(page.getByText("Your search returned no")).toBeVisible();
    });

    test("by category and filters", async ({ page }) => {
        const product: Product = {
            name: "Rocco Gym Tank",
            price: 24,
            priceRange: "PLN 20.00 - PLN 29.99",
            category: "Tanks",
            color: "Blue",
            material: "Organic Cotton",
            size: "XS",
            count: 12
        }

        await page.getByRole("menuitem", { name: "What's New" }).click();
        await page.getByRole("link", { name: product.category, exact: true }).click();
        await expect(page.getByLabel("Items").getByText(product.category as string)).toBeVisible();
        await expect(page.locator(".product-item")).toHaveCount(product.count as number);

        await page.getByRole("tab", { name: "Price" }).click();
        await page.getByRole("link", { name: product.priceRange }).click();
        await expect(page.locator(".product-item")).toHaveCount(8);
        await page.getByRole("tab", { name: "Color" }).click();

        await page.locator(`#narrow-by-list div[data-option-label="${product.color}"]`).click();
        await expect(page.locator(".product-item")).toHaveCount(3);

        await page.getByRole("tab", { name: "Material" }).click();
        await page.getByRole("link", { name: product.material }).click();
        await expect(page.locator(".product-item")).toHaveCount(1);

        await page.getByRole("link", { name: `${product.name}-${product.size}-${product.color}` }).click();

        await expect(page.locator(".base").getByText(product.name)).toBeVisible();
        await expect(page.getByRole("tabpanel", { name: "Details" })).toBeVisible();

        const priceLocator = page.locator(".price").first();
        const price: number = await getPrice(page, priceLocator);
        expect(price).toBe(product.price);
    });
});
