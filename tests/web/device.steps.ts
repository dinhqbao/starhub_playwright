import { Page, TestInfo } from '@playwright/test';
import { SH_Page } from '../pages/SH_Page';

export async function preorderSteps(page: Page, shouldClearCart = true) {
    const p = new SH_Page(page, '/personal/pre-order/products?cat=Devices&launch=iphone15');
    await p.goto(shouldClearCart);
    await page.getByText('iPhone 11 Pro', { exact: true }).click();
    await page.pause();
}

export async function bauSteps(page: Page, shouldClearCart = true) {
    const p = new SH_Page(page, '/personal/store/mobile/devices/');
    await p.goto(shouldClearCart);
    await page.getByText('iPhone 11 Pro', { exact: true }).click();
    await page.pause();
}
