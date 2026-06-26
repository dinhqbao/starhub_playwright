import { BasePage } from '@pages/BasePage';
import { appTest as test } from '../fixtures';

test.describe('bau', () => {
    let p: BasePage;

    test.beforeEach(async ({ basePage, page }) => {});

    test('purchase', async ({ basePage, page }) => {
        p = basePage('/Torpedo/Products?cat=Devices');

        await p.openWithEmptyCart();
        await page.getByText('iPhone 11 Pro', { exact: true }).click();
        await page.getByText('Pay today').click();
        await p.btn_click('Next');
        await page.getByText('Sign up for a new line').click();
        await p.btn_click('Next');
        await page.getByText('5G Unlimited+ Core').click();
        await p.btn_click('Next');
        await page.getByText('Physical SIM', { exact: true }).click();
        await p.btn_click('Next');
        await p.btn_click('Skip');
    });

    test('checkout', async ({ basePage, page }) => {
        p = basePage('/Torpedo/OneCart_ReviewOrder');

        await p.open();
        await p.btn_click('Proceed to checkout');
        await page.locator('.number-selection-list .number-selection-option').nth(0).click();
        await p.btn_click('Next');

        const options = page.locator('.delivery-available-item');
        const radios = options.locator('input[type="radio"]');
        await radios.first().waitFor();

        const anyChecked = await radios.evaluateAll((inputs) =>
            inputs.some((el) => (el as HTMLInputElement).checked)
        );
        console.log('anyChecked: ' + anyChecked);
        if (!anyChecked) {
            await options.filter({ hasText: 'Standard delivery' }).getByRole('radio').click();

            const addresses = page.locator('.delivery-address-block');
            await addresses
                .first()
                .waitFor({ timeout: BasePage.longTimeout })
                .catch(async () => {
                    await page.getByText('Add delivery address').click();
                    await page
                        .locator('.postal-code-address-container')
                        .getByRole('checkbox')
                        .first()
                        .check();
                    await page.getByRole('button', { name: 'Save address' }).click();
                });

            await addresses.first().getByRole('radio').click();
            await page.getByRole('button', { name: 'Next, select date & time' }).click();
            await page.getByRole('button', { name: 'Confirm' }).click();
        }

        await page.locator('.agreement-checkboxes').getByRole('checkbox').check();
        await page.locator('.inner-footer .btn.btn-primary').click();

        await page.pause();

        // await page.getByRole('button', { name: 'Confirm and pay' }).click();
        // await page
        //     .locator('[id=".security-code"]')
        //     .contentFrame()
        //     .getByRole('textbox', { name: 'Security Code' })
        //     .fill('123');
        // await p.btn_click('Proceed to checkout');
        // await p.btn_click('Confirm and pay');
        // await p.btn_click('Okay, I got it');
    });
});
