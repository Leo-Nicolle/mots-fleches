

import { afterAll, beforeAll, describe, test } from 'vitest';
import { preview, build } from 'vite';
import type { PreviewServer } from 'vite';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import axios from 'axios';
import { expect } from '@playwright/test';

const tests = [
  {selector: '[role=rows] input', path: 'rows', value: '10'},
  {selector: '[role=cols] input', path: 'cols', value: '10'},
  {selector: '[role=title] input', path: 'title', value: 'My new title'},
  {selector: '[role=comment] textarea', path: 'comment', value: 'My new comment'},
];
// unstable in Windows, TODO: investigate
describe('ModalOptions', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    server = await preview({ preview: {port: 3016} });
    console.log(server.httpServer.address());
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto(`http://localhost:${3016}/#grid/grid-1`);
    await page.locator('[role=modal-options-button]').click();
    await new Promise(resolve => setTimeout(resolve, 200));
  }, 60_000);

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close(error => error ? reject(error) : resolve());
    });
  });

  test.each(tests)('should update $path', async ({selector, path, value}) => {
    await page.waitForTimeout(100);
    await page.locator(selector).fill('');
    await page.locator(selector).type(value, {delay: 100});
    await page.waitForTimeout(100);
    const {data: grid} = await axios.get(`http://localhost:3015/grid/grid-1`);
    expect(`${grid[path]}`).toBe(`${value}`);
  });

});