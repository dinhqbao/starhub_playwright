import { Page, TestInfo } from '@playwright/test';
import { WebPage } from '../pages/BasePage';

export async function preorderSteps(page: Page) {
    const p = new WebPage(page, '/personal/pre-order/products?cat=Devices&launch=iphone15');
    await p.openWithEmptyCart();
    await page.getByText('iPhone 11 Pro', { exact: true }).click();
    await page.pause();
}

export async function bauSteps(page: Page) {
    const p = new WebPage(page, '/personal/store/mobile/devices/');
    await p.openWithEmptyCart();
    await page.getByText('iPhone 11 Pro', { exact: true }).click();
    await page.pause();
}
