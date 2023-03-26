

import { afterAll, beforeAll, describe, test } from 'vitest';
import { preview, build } from 'vite';
import type { PreviewServer } from 'vite';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import axios from 'axios';
import { expect } from '@playwright/test';

// unstable in Windows, TODO: investigate
describe('basic', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    await build();
    server = await preview({ preview: {port: 3016} });
    console.log(server.httpServer.address());
    browser = await chromium.launch({ headless: false });
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

  test('should update rows', async () => {
    await page.locator('[role=rows] input').fill('10');
    await new Promise(resolve => setTimeout(resolve, 500));
    const {data: grid} = await axios.get(`http://localhost:3015/grid/grid-1`);
    expect(grid.rows).toBe(10);
  });
  test('should update cols', async () => {
    await page.locator('[role=cols] input').fill('10');
    await new Promise(resolve => setTimeout(resolve, 500));
    const {data: grid} = await axios.get(`http://localhost:3015/grid/grid-1`);
    expect(grid.cols).toBe(10);
  });

  test('should update title', async () => {
    const title = 'My new Title';
    await page.locator('[role=title] input').fill(title);
    await new Promise(resolve => setTimeout(resolve, 500));
    const {data: grid} = await axios.get(`http://localhost:3015/grid/grid-1`);
    expect(grid.title).toBe(title);
  });

  test('should update comment', async () => {
    const comment = 'My new comment';
    // page.getByText('Commentaire').locator('textarea').fill(comment);
    await page.locator('[role=comment] textarea').fill(comment);
    await new Promise(resolve => setTimeout(resolve, 500));
    const {data: grid} = await axios.get(`http://localhost:3015/grid/grid-1`);
    expect(grid.comment).toBe(comment);
  });

});