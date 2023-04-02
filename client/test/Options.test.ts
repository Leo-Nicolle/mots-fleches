

import { afterAll, beforeAll, describe, test } from 'vitest';
import { preview } from 'vite';
import type { PreviewServer } from 'vite';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import axios from 'axios';
import { expect } from '@playwright/test';


const tests = [
  {selector: '[role=name] input', path: 'name', value: 'my-name'},
  {selector: '[role=cell-size] input', path: 'grid.cellSize', type: '30', value: '30px'},
  {selector: '[role=border-size] input', path: 'grid.borderSize', type: '2',value: '2px'}, 
  {selector: '[role=definition-font] input', path: 'definition.font', value: 'Roboto'}, 
  {selector: '[role=definition-size] input', path: 'definition.size', type: '8',value: '8px'}, 
  {selector: '[role=arrow-size] input', path: 'arrow.size', type: '8',value: '8px'}, 
  {selector: '[role=format-width] input', path: 'paper.width', value: '10'},
  {selector: '[role=format-height] input', path: 'paper.height', value: '10'}, 
  {selector: '[role=format-margin-top] input', path: 'paper.margin.top', value: '2'},
  {selector: '[role=format-margin-bottom] input', path: 'paper.margin.bottom', value: '2'}, 
  {selector: '[role=format-margin-left] input', path: 'paper.margin.left', value: '2'}, 
  {selector: '[role=format-margin-right] input', path: 'paper.margin.right', value: '2'}, 
];

function getFromPath(obj: Record<string, any>, path:string){
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
describe('Options', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;
  const port = 3017;

  beforeAll(async () => {
    server = await preview({ preview: {port} });
    console.log(server.httpServer.address());
    browser = await chromium.launch({ headless: true, devtools: false });
    page = await browser.newPage();
    await page.goto(`http://localhost:${3017}/#options/default`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 60_000);

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close(error => error ? reject(error) : resolve());
    });
  });
  test.each(tests)(`should update $path`, async ({selector, path, type, value}) => {
    await page.waitForTimeout(100);
    await page.locator(selector).fill('');
    await page.locator(selector).type(type || value, {delay: 100});
    const {data: options} = await axios.get(`http://localhost:3015/options/default`);
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(`${getFromPath(options, path)}`).toBe(`${value}`);
  });
});