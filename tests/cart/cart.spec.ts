import { test, expect, Page, Locator } from "@playwright/test";
import { getPrice, Product, searchProduct } from "../../common";

async function addToCart(
    page: Page,
    product: string,
    addToCartButton: Locator,
): Promise<void> {
    await addToCartButton.click();
    await expect(
        page.getByText(`You added ${product} to your shopping cart.`),
    ).toBeVisible();
    await page.waitForSelector(".minicart-wrapper .qty", { state: "visible" });
    await page.getByRole("link", { name: "My Cart" }).click();
    await expect(page.locator("#mini-cart").getByTitle(product)).toBeVisible();
    await page.getByRole("link", { name: "View and Edit Cart" }).click();
    await expect(page.locator(".base").getByText("Shopping Cart")).toBeVisible();
    await expect(
        page.locator(".product-item-name").getByText(product),
    ).toBeVisible();
}

async function getCartItemId(
    page: Page,
    productName: string,
): Promise<string | null> {
    const nameAttr: string | null = await page
        .locator("tbody.cart.item")
        .filter({ hasText: productName })
        .locator('input[name*="cart["]')
        .getAttribute("name");

    return nameAttr?.match(/cart\[(\d+)\]/)?.[1] || null;
}

test.describe("cart tests", () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL as string);
    });

    test("add from details view", async ({ page }) => {
        const product: Product = {
            name: "Aim Analog Watch",
            price: 45
        };

        await searchProduct(page, product.name);
        await expect(
            page.getByRole("link", { name: product.name }).first(),
        ).toBeVisible();
        await page.getByRole("link", { name: product.name }).first().click();
        await expect(page.locator(".base").getByText(product.name)).toBeVisible();
        await page.waitForLoadState("networkidle");

        const addToCartButton: Locator = page.getByRole("button", {
            name: "Add to Cart",
        });

        await addToCart(page, product.name, addToCartButton);

        const priceLocator = page.locator("tr.grand.totals span.price");
        const price: number = await getPrice(page, priceLocator);
        expect(price).toBe(product.price);
    });

    test("add from list view", async ({ page }) => {
        const product: Product = {
            name: "Cruise Dual Analog Watch",
            price: 55
        };

        await page.getByRole("menuitem", { name: "Gear" }).click();
        await page
            .getByRole("link", { name: "Watches", exact: true })
            .first()
            .click();
        await expect(page.getByLabel("Items").getByText("Watches")).toBeVisible();
        await expect(page.locator(".product-item")).toHaveCount(9);
        await expect(
            page.getByRole("link", { name: product.name }).first(),
        ).toBeVisible();
        await page.getByRole("link", { name: product.name }).first().hover();

        const addToCartButton: Locator = page
            .locator("li.item.product.product-item")
            .filter({ hasText: product.name })
            .locator("button.action.tocart");

        await addToCart(page, product.name, addToCartButton);

        const priceLocator = page.locator("tr.grand.totals span.price");
        const price: number = await getPrice(page, priceLocator);
        expect(price).toBe(product.price);
    });

    test("mutation", async ({ page, navigationTimeout }) => {
        const product1: Product = {
            name: "Dual Handle Cardio Ball",
            price: 12
        };

        await searchProduct(page, product1.name);
        await expect(
            page.getByRole("link", { name: product1.name }).first(),
        ).toBeVisible();
        await page.getByRole("link", { name: product1.name }).first().click();
        await expect(page.locator(".base").getByText(product1.name)).toBeVisible();
        await page.waitForLoadState("networkidle");

        const addToCartButton: Locator = page.getByRole("button", {
            name: "Add to Cart",
        });

        await addToCart(page, product1.name, addToCartButton);

        const priceLocator = page.locator("tr.grand.totals span.price");
        let price: number = await getPrice(page, priceLocator);
        expect(price).toBe(product1.price);

        const product2: Product = {
            name: "Joust Duffle Bag",
            price: 34,
        };

        await searchProduct(page, product2.name);
        await expect(
            page.getByRole("link", { name: product2.name }).first(),
        ).toBeVisible();
        await page.getByRole("link", { name: product2.name }).first().click();
        await expect(page.locator(".base").getByText(product2.name)).toBeVisible();
        await page.waitForTimeout(navigationTimeout);

        await addToCart(page, product2.name, addToCartButton);

        price = await getPrice(page, priceLocator);
        expect(price).toBe(product1.price + product2.price);

        const cartItemId: string | null = await getCartItemId(page, product2.name);
        await page.locator(`#cart-${cartItemId}-qty`).clear();
        await page.locator(`#cart-${cartItemId}-qty`).fill("2");
        await page.locator(`#cart-${cartItemId}-qty`).press("Enter");
        await page.waitForTimeout(navigationTimeout);

        price = await getPrice(page, priceLocator);
        expect(price).toBe(product1.price + 2 * product2.price);

        await page
            .locator("tbody.cart.item")
            .filter({ hasText: product2.name })
            .getByRole("link", { name: "Remove item" })
            .click();

        await expect(
            page.locator(".product-item-name").getByText(product2.name),
        ).toBeHidden();

        price = await getPrice(page, priceLocator);
        expect(price).toBe(product1.price);
    });

    test("discount", async ({ page, navigationTimeout }) => {
        const product: Product = {
            name: "Affirm Water Bottle",
            price: 7
        };

        await searchProduct(page, product.name);
        await expect(
            page.getByRole("link", { name: product.name }).first(),
        ).toBeVisible();
        await page.getByRole("link", { name: product.name }).first().click();
        await expect(page.locator(".base").getByText(product.name)).toBeVisible();
        await page.waitForTimeout(navigationTimeout);

        const addToCartButton: Locator = page.getByRole("button", {
            name: "Add to Cart",
        });
        await addToCart(page, product.name, addToCartButton);

        const priceLocator = page.locator("tr.grand.totals span.price");
        const price: number = await getPrice(page, priceLocator);
        expect(price).toBe(product.price);

        await page.getByRole("tab", { name: "Apply Discount Code" }).click();

        const discountCode: string = "H20";
        await page
            .getByRole("textbox", { name: "Enter discount code" })
            .fill(discountCode);
        await page.getByRole("button", { name: "Apply Discount" }).click();
        await expect(
            page.getByText(`You used coupon code "${discountCode}".`),
        ).toBeVisible();

        const discountPercent: number = 0.7
        const priceAfterDiscount: number = await getPrice(page, priceLocator);
        const expectedPriceAfterDiscount: number = product.price * (1 - discountPercent);
        expect(priceAfterDiscount).toBe(parseFloat(expectedPriceAfterDiscount.toFixed(1)));
    });

    test("invalid discount", async ({ page, navigationTimeout }) => {
        const product: Product = {
            name: "Zing Jump Rope",
            price: 12
        };
        await searchProduct(page, product.name);
        await expect(
            page.getByRole("link", { name: product.name }).first(),
        ).toBeVisible();
        await page.getByRole("link", { name: product.name }).first().click();
        await expect(page.locator(".base").getByText(product.name)).toBeVisible();
        await page.waitForTimeout(navigationTimeout);

        const addToCartButton: Locator = page.getByRole("button", {
            name: "Add to Cart",
        });
        await addToCart(page, product.name, addToCartButton);

        const priceLocator = page.locator("tr.grand.totals span.price");
        const price: number = await getPrice(page, priceLocator);
        expect(price).toBe(product.price);

        await page.getByRole("tab", { name: "Apply Discount Code" }).click();

        const invalidDiscountCode: string = "H30";
        await page
            .getByRole("textbox", { name: "Enter discount code" })
            .fill(invalidDiscountCode);
        await page.getByRole("button", { name: "Apply Discount" }).click();
        await expect(
            page.getByText(`The coupon code "${invalidDiscountCode}" is not valid.`),
        ).toBeVisible();

        const priceAfterDiscount: number = await getPrice(page, priceLocator);
        expect(priceAfterDiscount).toBe(product.price);
    });
});
