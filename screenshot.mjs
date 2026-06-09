import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const screenshotDir = join(__dirname, 'temporary screenshots');

if (!existsSync(screenshotDir)) {
  mkdirSync(screenshotDir, { recursive: true });
}

function nextIndex() {
  const files = existsSync(screenshotDir) ? readdirSync(screenshotDir) : [];
  const nums = files
    .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0'))
    .filter(n => !isNaN(n));
  return nums.length ? Math.max(...nums) + 1 : 1;
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3];
const idx = nextIndex();
const filename = label ? `screenshot-${idx}-${label}.png` : `screenshot-${idx}.png`;
const outPath = join(screenshotDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2' });
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outPath}`);
