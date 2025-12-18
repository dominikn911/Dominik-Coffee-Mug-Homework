import { expect, Locator, Page } from "@playwright/test";

export interface Product {
  name: string,
  price: number,
  priceRange?: string,
  category?: string,
  color?: string,
  material?: string,
  size?: string,
  count?: number
}

export async function searchProduct(
  page: Page,
  product: string,
): Promise<void> {
  const searchBox: Locator = page.getByRole("combobox", { name: "Search" });

  await searchBox.fill(product);
  await searchBox.press("Enter");

  await expect(
    page.locator("#maincontent").getByText(`Search results for: '${product}'`),
  ).toBeVisible();
}

export async function getPrice(page: Page, priceLocator: Locator): Promise<number> {
  const priceText: string | null = await priceLocator.textContent();
  if (!priceText) return 0;

  const cleanPrice = priceText
    .trim()
    .replace(/[^\d.,]/g, "")
    .replace(",", ".");
  return parseFloat(cleanPrice);
}
