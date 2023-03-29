

import { afterAll, beforeAll, describe, test } from 'vitest';
import { preview, build } from 'vite';
import type { PreviewServer } from 'vite';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import axios from 'axios';
import { expect } from '@playwright/test';
import { toMatchImageSnapshot } from 'jest-image-snapshot'

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchImageSnapshot(): R
    }
  }
}
describe('GridView', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;
  const port = 3018;

  beforeAll(async () => {
    server = await preview({ preview: {port} });
    browser = await chromium.launch({ headless: false, devtools: true });
    page = await browser.newPage();
    await page.goto(`http://localhost:${port}/#/grid-export/split-test`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 60_000);

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close(error => error ? reject(error) : resolve());
    });
  });
  test('renders properlly', async () => {
    const svg = await page.evaluate(() => {
      return document.querySelector('svg.grid')?.outerHTML;
    });
    const snapshot = await page.screenshot();

    expect(snapshot).toMatchSnapshot();

    // page.locator('svg.grid').).toBe(true);
  });
  // test.each(tests)(`should update $path`, async ({selector, path, type, value}) => {
  //   await page.locator(selector).fill('');
  //   await page.locator(selector).type(type || value, {delay: 100});
  //   const {data: options} = await axios.get(`http://localhost:3015/options/default`);
  //   console.log(options);
  //   await new Promise(resolve => setTimeout(resolve, 250));
  //   expect(getFromPath(options, path)).toBe(`${value}`);
  // });
});