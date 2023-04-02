

import { expect, afterAll, beforeAll, describe, test } from 'vitest';
import { preview } from 'vite';
import type { PreviewServer } from 'vite';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import fs from 'fs-extra';
import path from 'path';


const tests = [
  { link: 'split-test', name: 'basic-export' },
  { link: 'split-test?borders=false', name: 'no-borders' },
  { link: 'split-test?outerBorders=false', name: 'no-outerborder' },
  { link: 'split-test?borders=false&outerBorders=false', name: 'no-any-border' },
  { link: 'split-test?margins=false', name: 'no-margins' },
  { link: 'split-test?splits=false', name: 'no-splits' },
  { link: 'split-test?texts=false', name: 'no-texts' },
  { link: 'split-test?definitions=false', name: 'no-definitions' },
];

describe('Grid-view', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;
  const port = 3018;
  const outputFolder = 'dist/test/svg/';
  const inputFolder = 'test/fixtures/';

  beforeAll(async () => {
    server = await preview({ preview: { port } });
    browser = await chromium.launch({ headless: false, devtools: true });
    page = await browser.newPage();
    await fs.mkdir(path.resolve(outputFolder), { recursive: true });
    await fs.mkdir(path.resolve(inputFolder), { recursive: true });
  }, 2000);

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close(error => error ? reject(error) : resolve());
    });
  });
  test.each(tests)(`Renders properlly: $name: ($url) `, async ({ link, name }) => {
    await page.goto(`http://localhost:${port}/#/grid-export/${link}`);
    await new Promise(resolve => setTimeout(resolve, 100));

    const actual = await page.evaluate(() => {
      const svg = document.querySelector('svg.grid') as SVGSVGElement;
      return svg.outerHTML;
    });
    if (process.env.UPDATE_SNAPSHOTS) {
      console.log('Updating snapshots...')
      await fs.writeFile(path.join(inputFolder, `${name}.svg`), actual);
      return;
    }

    const expected = await fs.readFile(path.resolve(inputFolder, `${name}.svg`), 'utf-8');
    await fs.writeFile(path.resolve(outputFolder, `${name}-actual.svg`), actual);
    await fs.writeFile(path.resolve(outputFolder, `${name}-expected.svg`), expected);
    expect(actual).equal(expected);
  });
});