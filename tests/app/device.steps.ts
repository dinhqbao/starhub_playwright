import { Page, TestInfo } from '@playwright/test';
import { AppPage } from '../pages/BasePage';

export async function preorderSteps(page: Page) {
    const p = new AppPage(page, '/Torpedo/PreOrderProducts?launch=iphone15&cat=Devices');
    await p.openWithEmptyCart();
    await page.getByText('iPhone 11 Pro', { exact: true }).click();
    await page.pause();
}

export async function bauSteps(page: Page) {
    const p = new AppPage(page, '/Torpedo/Products?cat=Devices');
    await p.openWithEmptyCart();
    await page.getByText('iPhone 11 Pro', { exact: true }).click();
    await page.pause();
}
