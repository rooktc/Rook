// Scrape the yieldz.io leverage table (both views) into JSON.
// Usage: node yz_scrape.js <outfile.json>   (proxy shim on 127.0.0.1:8081)
const { chromium } = require('playwright');
const fs = require('fs');

const VIEWS = [
  { asset: 'USD', url: 'https://yieldz.io/leverage' },
  { asset: 'ETH', url: 'https://yieldz.io/leverage?corr=eth' },
];

async function extractPage(page) {
  return page.evaluate(() => {
    const parseMoney = (s) => {
      if (!s) return null;
      const m = s.replace(/[$,]/g, '').match(/([\d.]+)\s*([KMB])?/i);
      if (!m) return null;
      const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1;
      return Math.round(parseFloat(m[1]) * mult * 100) / 100;
    };
    const parsePct = (s) => {
      const m = (s || '').match(/(-?[\d.]+)\s*%/);
      return m ? parseFloat(m[1]) : null;
    };
    // column indexes come from the header row, so added/reordered columns
    // (e.g. the 2026-08 "Leverage" and "ORACLE" additions) don't shift fields
    const ths = [...document.querySelectorAll('table thead th')].map(c => c.innerText.trim().toUpperCase());
    const col = (name, fallback) => {
      const i = ths.findIndex(h => h.startsWith(name));
      return i >= 0 ? i : fallback;
    };
    const iDep = col('DEPOSIT', 1), iBor = col('BORROW', 2), iApy = col('APY', 4),
      iRisk = col('RISK', 5), iLiq = col('LIQUIDITY', 6), iTgt = col('TO TARGET', 7),
      iUtil = col('UTILIZATION', 8), iLltv = col('LLTV', 9);
    const need = Math.max(iDep, iBor, iApy, iRisk, iLiq, iTgt, iUtil, iLltv) + 1;
    return [...document.querySelectorAll('table tbody tr')].map((tr) => {
      const td = [...tr.querySelectorAll('td')].map((c) => c.innerText.trim());
      if (td.length < need) return null;
      const dep = td[iDep].split('\n').map(s => s.trim()).filter(Boolean);
      const bor = td[iBor].split('\n').map(s => s.trim()).filter(Boolean);
      const apyLines = td[iApy].split('\n').map(s => s.trim()).filter(Boolean);
      const pcts = apyLines.filter(s => /%/.test(s));
      const roe = parsePct(pcts[0]);
      let depApy = null, borApy = null;
      for (let i = 0; i < apyLines.length; i++) {
        if (/^Dep$/i.test(apyLines[i])) depApy = parsePct(apyLines[i - 1]);
        if (/^Bor$/i.test(apyLines[i])) borApy = parsePct(apyLines[i - 1]);
      }
      return {
        depositAsset: dep[0] || '', chain: dep[1] || '',
        borrowAsset: bor[0] || '', protocol: bor[1] || '',
        maxRoe: roe, depApy, borApy,
        risk: td[iRisk], liquidity: parseMoney(td[iLiq]), toTarget: parseMoney(td[iTgt]),
        utilization: parsePct(td[iUtil]), lltv: parsePct(td[iLltv]),
      };
    }).filter(Boolean);
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: true, executablePath: '/opt/pw-browsers/chromium',
    proxy: { server: 'http://127.0.0.1:8081' }, args: ['--no-sandbox'],
  });
  const out = [];
  for (const view of VIEWS) {
    const page = await (await browser.newContext({ viewport: { width: 1680, height: 1200 } })).newPage();
    await page.goto(view.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForSelector('table tbody tr', { timeout: 90000 });
    await page.waitForTimeout(8000);
    const rows = [];
    for (let pageNo = 1; pageNo <= 60; pageNo++) {
      const batch = await extractPage(page);
      rows.push(...batch);
      const next = page.locator('button', { hasText: /^Next$/ }).last();
      if ((await next.count()) === 0 || (await next.isDisabled())) break;
      const sig = await page.evaluate(() => {
        const tr = document.querySelector('table tbody tr');
        return tr ? tr.innerText.slice(0, 200) : '';
      });
      await next.click();
      // wait until the table content actually changes
      try {
        await page.waitForFunction((prev) => {
          const tr = document.querySelector('table tbody tr');
          return tr && tr.innerText.slice(0, 200) !== prev;
        }, sig, { timeout: 15000 });
      } catch {}
      await page.waitForTimeout(2000);
    }
    console.error(`${view.asset}: ${rows.length} rows`);
    for (const r of rows) r.asset = view.asset;
    out.push(...rows);
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
  console.error('saved', process.argv[2], out.length, 'total rows');
})().catch((e) => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
