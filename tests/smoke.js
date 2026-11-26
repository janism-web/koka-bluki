/* Smoke tests — palaid:  npm install && npx playwright install chromium && npm test
 * Pārbauda: nav JS kļūdu, nav ārējo pieprasījumu, SW darbojas bezsaistē, fonts ielādēts,
 * Spēle 15 (tastatūra, uzvara, saglabāšana), Koka Bloki (vilkšana noliek figūru), hub.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    }).listen(0, '127.0.0.1', () => resolve({ srv, base: 'http://127.0.0.1:' + srv.address().port }));
  });
}

let failed = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) failed++; };

(async () => {
  const { srv, base } = await serve();
  const browser = await chromium.launch();
  const mk = async (opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, ...opts });
    const page = await ctx.newPage();
    const errors = [], external = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) external.push(r.url()); });
    return { ctx, page, errors, external };
  };

  /* ---------- Hub ---------- */
  console.log('Hub');
  {
    const { ctx, page, errors, external } = await mk();
    await page.goto(base + '/index.html');
    await page.waitForTimeout(500);
    ok(errors.length === 0, 'nav JS kļūdu ' + JSON.stringify(errors));
    ok(external.length === 0, 'nav ārējo pieprasījumu ' + JSON.stringify(external));
    const before = await page.evaluate(() => document.documentElement.classList.contains('dark-mode'));
    await page.click('#theme-toggle-btn');
    const after = await page.evaluate(() => document.documentElement.classList.contains('dark-mode'));
    ok(before !== after, 'dienas/nakts pārslēgšana strādā');
    const fontOk = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('700 16px Nunito', 'ēāšžķļņģūī'); });
    ok(fontOk, 'Nunito ielādēts lokāli (arī latviešu burti)');
    await ctx.close();
  }

  /* ---------- Bezsaistes režīms ---------- */
  console.log('Service worker / bezsaiste');
  {
    const { ctx, page, errors } = await mk();
    await page.goto(base + '/index.html');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();                         // lai lapu kontrolētu SW
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    await ctx.setOffline(true);
    for (const p of ['index.html', 'spele15.html', 'koka-bloki.html']) {
      const r = await page.goto(base + '/' + p + '?x=1');
      ok(r && r.ok(), 'bezsaistē atveras ' + p);
    }
    const fontOk = await page.evaluate(async () => { await document.fonts.ready; return true; });
    ok(fontOk && errors.length === 0, 'bezsaistē nav kļūdu ' + JSON.stringify(errors));
    await ctx.close();
  }

  /* ---------- Spēle 15 ---------- */
  console.log('Spēle 15');
  {
    const { ctx, page, errors, external } = await mk();
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        sessionStorage.setItem('seeded', '1');
        localStorage.setItem('spele15_saved_state_v1', JSON.stringify({ size: 3, board: [1, 2, 3, 4, 5, 6, 7, 0, 8], moves: 7, seconds: 12 }));
      }
    });
    await page.goto(base + '/spele15.html');
    await page.waitForTimeout(600);
    ok(errors.length === 0 && external.length === 0, 'nav kļūdu / ārējo pieprasījumu ' + JSON.stringify([errors, external]));
    ok((await page.locator('.tile').count()) === 8, 'saglabātais 3×3 laukums atjaunots (8 flīzes)');
    await page.keyboard.press('ArrowLeft');      // 8 pārvietojas pa kreisi -> atrisināts
    await page.waitForSelector('#win-modal.open', { timeout: 4000 });
    ok(true, 'uzvara ar tastatūru, rezultātu logs atvērts');
    const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('spele15_best_3')));
    ok(rec && rec.moves === 8, 'rekords saglabāts');
    // bojāts saglabātais stāvoklis nedrīkst salauzt spēli
    await page.evaluate(() => localStorage.setItem('spele15_saved_state_v1', '{"size":4,"board":[1,1,1],"moves":1}'));
    await page.reload();
    await page.waitForTimeout(500);
    ok((await page.locator('.tile').count()) === 15, 'bojāts saglabājums ignorēts (jauns 4×4)');
    const hist = await page.evaluate(() => history.length);
    await page.click('#pause-btn'); await page.click('#resume-btn'); await page.click('#pause-btn'); await page.click('#resume-btn');
    ok((await page.evaluate(() => history.length)) === hist, 'pauze nepiesārņo vēsturi');
    await ctx.close();
  }

  /* ---------- Koka Bloki ---------- */
  console.log('Koka Bloki');
  {
    const { ctx, page, errors, external } = await mk();
    await page.goto(base + '/koka-bloki.html');
    await page.waitForTimeout(800);
    ok(errors.length === 0, 'nav JS kļūdu (rafPending avārija novērsta) ' + JSON.stringify(errors));
    ok(external.length === 0, 'nav ārējo pieprasījumu');
    const box = await page.locator('#gameCanvas').boundingBox();
    // dokā meklējam figūru: skenējam apakšējo daļu un velkam uz laukuma centru
    let placed = false;
    for (const fy of [0.9, 0.86, 0.82, 0.78]) {
      for (const fx of [0.17, 0.5, 0.83]) {
        const sx = box.x + box.width * fx, sy = box.y + box.height * fy;
        await page.mouse.move(sx, sy);
        await page.mouse.down();
        await page.mouse.move(sx, sy - 60, { steps: 4 });
        await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.45, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(150);
        const score = Number(await page.textContent('#score-val'));
        if (score > 0) { placed = true; break; }
      }
      if (placed) break;
    }
    ok(placed, 'figūra novilkta un nolikta uz laukuma (punkti > 0)');
    await page.reload();
    await page.waitForTimeout(500);
    ok(Number(await page.textContent('#score-val')) > 0, 'spēle atjaunota pēc pārlādes');
    await page.screenshot({ path: path.join(__dirname, 'koka.png') });
    ok(errors.length === 0, 'pēc spēles nav JS kļūdu ' + JSON.stringify(errors));
    await ctx.close();
  }

  /* ---------- Koka Bloki: noturība (iestrēdzis žests, slēpts logs) ---------- */
  console.log('Koka Bloki: noturība');
  {
    const { ctx, page, errors } = await mk();
    await page.goto(base + '/koka-bloki.html');
    await page.waitForTimeout(700);
    const cdp = await ctx.newCDPSession(page);
    const box = await page.locator('#gameCanvas').boundingBox();
    const touchDrag = async (fx, fy, finish = true, tx = 0.5, ty = 0.45) => {
      const sx = box.x + box.width * fx, sy = box.y + box.height * fy;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] });
      for (let i = 1; i <= 12; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + (box.x + box.width * tx - sx) * i / 12, y: sy - (sy - (box.y + box.height * ty)) * i / 12 }] });
        await page.waitForTimeout(16);
      }
      if (finish) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const score = async () => Number(await page.textContent('#score-val'));

    // 1) žests tiek pārtraukts (lietotne zaudē fokusu), pirksta pacelšana nenāk — nākamais žests tāpat jāstrādā
    await touchDrag(0.5, 0.86, false);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(150);
    let placed = false;
    for (const fx of [0.17, 0.5, 0.83]) {
      await touchDrag(fx, 0.86);
      await page.waitForTimeout(200);
      if ((await score()) > 0) { placed = true; break; }
    }
    ok(placed, 'pēc pārtraukta žesta figūru joprojām var paņemt un nolikt');

    // 2) konteiners uz brīdi paslēpts (loga pārslēgšana) — zīmēšana nedrīkst "nomirt"
    await page.evaluate(() => { document.getElementById('gameCanvas').parentElement.style.display = 'none'; });
    await page.waitForTimeout(200);
    await page.evaluate(() => { document.getElementById('gameCanvas').parentElement.style.display = ''; });
    await page.waitForTimeout(300);
    const before = await score();
    let placed2 = false;
    for (const [fx, tx, ty] of [[0.17, 0.2, 0.2], [0.5, 0.75, 0.2], [0.83, 0.2, 0.3], [0.17, 0.75, 0.3], [0.5, 0.2, 0.15], [0.83, 0.75, 0.15]]) {
      await touchDrag(fx, 0.86, true, tx, ty);
      await page.waitForTimeout(200);
      if ((await score()) > before) { placed2 = true; break; }
    }
    ok(placed2, 'pēc paslēpta/atjaunota loga spēle turpina strādāt');
    ok(errors.length === 0, 'nav JS kļūdu ' + JSON.stringify(errors));
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log(failed ? `\n${failed} pārbaude(s) NEIZDEVĀS` : '\nVisas pārbaudes izietas');
  process.exit(failed ? 1 : 0);
})();
