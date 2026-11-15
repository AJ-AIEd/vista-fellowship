// Browser checks for the account-free workspace and the public pages.
// Run `npm run build && npm run serve` first. Uses synthetic data only.
const engines = require('playwright');
const browserName = process.env.VISTA_ENGINE || 'chromium';
const chromium = engines[browserName];
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), zlib = require('node:zlib');
const base = process.env.VISTA_URL || 'http://127.0.0.1:8765';
const shots = process.env.VISTA_SHOTS || os.tmpdir();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vista-'));
const ready = p => p.waitForFunction(() => document.documentElement.dataset.vistaReady === 'true');
const saved = p => p.waitForFunction(() => document.getElementById('saveIndicator').dataset.state === 'saved');

// Minimal .docx (a zip with stored entries) so document import can be tested without fixtures.
function docx(text) {
  const files = {
    '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`
  };
  const parts = [], central = []; let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.from(content), n = Buffer.from(name), crc = zlib.crc32(data);
    const head = Buffer.alloc(30); head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt32LE(crc, 14); head.writeUInt32LE(data.length, 18); head.writeUInt32LE(data.length, 22); head.writeUInt16LE(n.length, 26);
    const cd = Buffer.alloc(46); cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(data.length, 20); cd.writeUInt32LE(data.length, 24); cd.writeUInt16LE(n.length, 28); cd.writeUInt32LE(offset, 42);
    parts.push(head, n, data); central.push(cd, n); offset += 30 + n.length + data.length;
  }
  const cdSize = central.reduce((a, b) => a + b.length, 0), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(3, 8); end.writeUInt16LE(3, 10); end.writeUInt32LE(cdSize, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, ...central, end]);
}

(async () => {
  const browser = await chromium.launch({executablePath: process.env.VISTA_BROWSER, headless: true});
  const errors = [];
  const watch = p => { p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); return p; };
  const newContext = async (opts = {}) => { const c = await browser.newContext({viewport: {width: 1280, height: 900}, acceptDownloads: true, ...opts}); await c.route('**/_vercel/**', r => r.fulfill({status: 200, body: ''})); return c; };

  // ── 1. cycles: example, own cycle, several cycles, rename, export, delete, import ──
  let ctx = await newContext(); let page = watch(await ctx.newPage());
  await page.goto(base + '/vista?example'); await ready(page);
  assert.equal(await page.locator('#view-initial').isVisible(), true);
  assert.match(await page.locator('#cycleNotice').textContent(), /synthetic/);
  assert.match(await page.locator('#s1task').inputValue(), /resale prices/);
  assert.equal(await page.locator('.stagebar .nav-tab.has-content').count(), 6);
  await page.locator('#cycleNotice button').click(); // start my own cycle
  assert.equal(await page.locator('#s1task').inputValue(), '');
  assert.equal(await page.locator('#cycleNotice').isHidden(), true);
  await page.locator('#fa').fill('Grade 9 source evaluation');
  await page.locator('#s1task').fill('Students evaluate two sources on the same event and justify which is more reliable.');
  await saved(page);
  assert.match(await page.locator('#cycleLabel').textContent(), /Grade 9 source evaluation/);
  await page.locator('#cycleButton').click();
  assert.equal(await page.locator('#cycleList .cycle-row').count(), 2);
  await page.locator('#newCycleName').fill('Grade 11 lab report');
  await page.locator('.cycle-new button').click();
  assert.equal(await page.locator('#fa').inputValue(), 'Grade 11 lab report');
  assert.equal(await page.locator('#s1task').inputValue(), '', 'a new cycle starts empty');
  await page.locator('#s1task').fill('Lab report on reaction rates.');
  await saved(page);
  await page.locator('#cycleButton').click();
  assert.equal(await page.locator('#cycleList .cycle-row').count(), 3);
  // keyboard: Escape closes the dialog, focus is inside it while open
  assert.equal(await page.evaluate(() => document.getElementById('cyclesDialog').contains(document.activeElement)), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#cyclesDialog').evaluate(d => d.open), false);
  await page.locator('#cycleButton').click();
  // switch back to the first own cycle: its text is intact
  await page.locator('.cycle-row', {hasText: 'Grade 9 source evaluation'}).getByRole('button', {name: 'Open', exact: true}).click();
  await page.locator('#navInitial').click();
  assert.match(await page.locator('#s1task').inputValue(), /two sources/);
  // rename
  await page.locator('#cycleButton').click();
  await page.locator('.cycle-row.current').getByRole('button', {name: 'Rename'}).click();
  await page.locator('.cycle-row.current input').fill('Grade 9 sources (renamed)');
  await page.keyboard.press('Enter');
  assert.match(await page.locator('.cycle-row.current').textContent(), /renamed/);
  // export everything
  let [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', {name: 'Download a backup of all cycles'}).click()]);
  const backupPath = path.join(tmp, 'backup.json'); await dl.saveAs(backupPath);
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  assert.equal(backup.format, 'vista-backup'); assert.equal(backup.cycles.length, 3);
  assert.ok(backup.cycles.some(c => /two sources/.test(c.draft.task)));
  // delete needs a second, explicit confirmation
  const row = page.locator('.cycle-row', {hasText: 'Grade 11 lab report'});
  await row.getByRole('button', {name: 'Delete'}).click();
  assert.equal(await page.locator('#cycleList .cycle-row').count(), 3);
  await row.getByRole('button', {name: 'Delete permanently'}).click();
  assert.equal(await page.locator('#cycleList .cycle-row').count(), 2);
  await page.screenshot({path: shots + '/cycles-dialog.png'});
  await ctx.close();

  // a different browser (new context): import the backup, nothing is replaced
  ctx = await newContext(); page = watch(await ctx.newPage());
  await page.goto(base + '/vista'); await ready(page);
  await page.locator('#startOwn').click(); await page.locator('#s1task').fill('Existing work on this device.'); await saved(page);
  await page.locator('#cycleButton').click();
  await page.locator('#backupFile').setInputFiles(backupPath);
  await page.waitForFunction(() => /3/.test(document.getElementById('cyclesMessage').textContent));
  assert.equal(await page.locator('#cycleList .cycle-row').count(), 4);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#s1task').inputValue(), 'Existing work on this device.');
  // a hostile backup file cannot inject markup
  const evil = path.join(tmp, 'evil.json');
  fs.writeFileSync(evil, JSON.stringify({format: 'vista-backup', version: 1, cycles: [{title: '<img src=x onerror="window.__pwned=1">', draft: {task: '<script>window.__pwned=1</script>', sail: '<img src=x onerror="window.__pwned=1">', rating: 'full', classifier: ['"]<img src=x onerror=window.__pwned=1>'], humanAI: '<img src=x onerror="window.__pwned=1">'}}]}));
  await page.locator('#cycleButton').click();
  await page.locator('#backupFile').setInputFiles(evil);
  await page.waitForFunction(() => /^1 /.test(document.getElementById('cyclesMessage').textContent));
  await page.locator('.cycle-row', {hasText: 'onerror'}).getByRole('button', {name: 'Open', exact: true}).click();
  for (const v of ['initial', 'deepdive', 'redesign', 'implementation', 'final', 'reflection']) await page.evaluate(v => showView(v), v);
  await page.locator('#reportButton').click();
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => window.__pwned), undefined, 'imported markup must not execute');
  await page.keyboard.press('Escape');

  // ── 2. document import: txt, docx, pdf are read on the device ──
  await page.locator('#cycleButton').click();
  await page.locator('.cycle-row', {hasText: 'Existing work'}).or(page.locator('.cycle-row', {hasText: 'Untitled cycle'})).first().getByRole('button', {name: 'Open', exact: true}).click();
  await page.locator('#navInitial').click();
  const pdfPage = await ctx.newPage(); await pdfPage.setContent('<p style="font:20px serif">Audit notes from a PDF: students justify the model.</p>');
  const pdfPath = path.join(tmp, 'notes.pdf'); await pdfPage.pdf({path: pdfPath}); await pdfPage.close();
  const docxPath = path.join(tmp, 'notes.docx'); fs.writeFileSync(docxPath, docx('Audit notes from Word: independent explanation.'));
  const txtPath = path.join(tmp, 'notes.txt'); fs.writeFileSync(txtPath, 'Audit notes from text.');
  const requests = []; page.on('request', r => { if (r.method() !== 'GET') requests.push(r.method() + ' ' + r.url()); });
  for (const [file, expected] of [[txtPath, /from text/], [docxPath, /from Word/], [pdfPath, /from a PDF/]]) {
    await page.getByRole('button', {name: 'Import text from a document'}).click();
    await page.locator('#importFile').setInputFiles(file);
    await page.waitForFunction(() => /ready/i.test(document.getElementById('importMessage').textContent), null, {timeout: 20000}).catch(async () => { throw new Error('import of ' + file + ' failed: ' + await page.locator('#importMessage').textContent()); });
    assert.match(await page.locator('#importTextArea').inputValue(), expected);
    await page.locator('#importAccept').click(); // refused until reviewed
    assert.match(await page.locator('#importMessage').textContent(), /tick the box/);
    await page.locator('#importReviewed').check();
    await page.locator('#importAccept').click();
    assert.equal(await page.locator('#importDialog').evaluate(d => d.open), false);
  }
  assert.deepEqual(requests, [], 'importing a document uploads nothing');

  // ── 3. reports: preview, text download, printable PDF ──
  await page.locator('#reportButton').click();
  const frame = page.frameLocator('#reportFrame');
  await frame.locator('h1').waitFor();
  assert.match(await frame.locator('body').textContent(), /Audit notes from a PDF/);
  assert.match(await frame.locator('body').textContent(), /Existing work on this device/);
  [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#downloadReport').click()]);
  const md = path.join(tmp, 'report.md'); await dl.saveAs(md);
  assert.match(fs.readFileSync(md, 'utf8'), /## Initial Audit[\s\S]*Existing work on this device/);
  const html = await page.locator('#reportFrame').getAttribute('srcdoc');
  const printer = await ctx.newPage(); await printer.setContent(html);
  const pdf = await printer.pdf({format: 'A4'}); await printer.close();
  assert.ok(pdf.length > 5000 && pdf.subarray(0, 4).toString() === '%PDF', 'the report prints to a PDF');
  fs.writeFileSync(path.join(shots, 'sample-report.pdf'), pdf);
  await page.screenshot({path: shots + '/report-dialog.png'});
  await page.keyboard.press('Escape');
  // an empty cycle explains itself instead of failing
  await page.locator('#cycleButton').click(); await page.locator('.cycle-new button').click();
  await page.locator('#reportButton').click();
  assert.equal(await page.locator('#reportEmpty').isVisible(), true);
  await page.keyboard.press('Escape');
  await ctx.close();

  // ── 4. two tabs: no silent overwrite ──
  ctx = await newContext(); const a = watch(await ctx.newPage());
  await a.goto(base + '/vista'); await ready(a); await a.locator('#startOwn').click();
  await a.locator('#s1task').fill('Version from tab A, first.'); await saved(a);
  const b = watch(await ctx.newPage()); await b.goto(base + '/vista?view=initial'); await ready(b);
  assert.equal(await b.locator('#s1task').inputValue(), 'Version from tab A, first.');
  await b.locator('#s1task').fill('Edited in tab B.'); await saved(b);
  // tab A had no unsaved edits, so it follows tab B
  await a.waitForFunction(() => document.getElementById('s1task').value === 'Edited in tab B.');
  // now both edit; the slower tab is told instead of overwriting
  await a.evaluate(() => { const el = document.getElementById('s1task'); el.value = 'Unsaved edit in tab A.'; el.dispatchEvent(new Event('input', {bubbles: true})); });
  await b.evaluate(() => { const el = document.getElementById('s1task'); el.value = 'Second edit in tab B.'; el.dispatchEvent(new Event('input', {bubbles: true})); window.VistaLocal.save(); });
  await a.waitForFunction(() => document.getElementById('cycleNotice').dataset.kind === 'conflict' && !document.getElementById('cycleNotice').hidden);
  assert.equal(await b.evaluate(() => JSON.parse(localStorage.getItem('vista.v3.cycle.' + JSON.parse(localStorage.getItem('vista.v3.index')).activeId)).task), 'Second edit in tab B.');
  await a.getByRole('button', {name: 'Keep this tab’s version'}).click(); await saved(a);
  assert.equal(await a.evaluate(() => JSON.parse(localStorage.getItem('vista.v3.cycle.' + JSON.parse(localStorage.getItem('vista.v3.index')).activeId)).task), 'Unsaved edit in tab A.');
  await ctx.close();

  // ── 5. a draft left by the earlier version is recovered ──
  ctx = await newContext(); page = watch(await ctx.newPage());
  await page.addInitScript(() => { if (!localStorage.getItem('vista.v3.index')) localStorage.setItem('dlp_draft_v2', JSON.stringify({meta: {teacher: 'Synthetic Teacher', assessment: 'Old audit'}, task: 'Draft from the earlier version.', classifier: ['conc'], rating: 'part', sail: 'L2', final_audit: {fq1: 'Old evidence'}})); });
  await page.goto(base + '/vista'); await ready(page);
  assert.match(await page.locator('#cycleNotice').textContent(), /earlier version/);
  assert.match(await page.locator('#startResume').textContent(), /Old audit/);
  await page.locator('#startResume').click();
  assert.equal(await page.locator('#s1task').inputValue(), 'Draft from the earlier version.');
  await page.locator('#navFinal').click();
  assert.equal(await page.locator('#fq1').inputValue(), 'Old evidence');
  await ctx.close();

  // ── 6. storage unavailable: the teacher is told and can still download ──
  ctx = await newContext(); page = watch(await ctx.newPage());
  await page.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('blocked', 'QuotaExceededError'); }; });
  await page.goto(base + '/vista'); await ready(page);
  assert.equal(await page.locator('#saveIndicator').getAttribute('data-state'), 'failed');
  assert.match(await page.locator('#cycleNotice').textContent(), /not allowing VISTA to save/);
  await page.locator('#startOwn').click(); await page.locator('#s1task').fill('Typed while storage is blocked.');
  [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#cycleNotice button').click()]);
  const rescue = path.join(tmp, 'rescue.json'); await dl.saveAs(rescue);
  assert.match(fs.readFileSync(rescue, 'utf8'), /Typed while storage is blocked/);
  // Failed saving must not discard the only copy when opening an example or a new cycle.
  await page.locator('#navStart').click();
  await page.locator('#startExample').click();
  await page.locator('#navInitial').click();
  assert.equal(await page.locator('#s1task').inputValue(), 'Typed while storage is blocked.');
  await page.locator('#cycleButton').click();
  await page.locator('#newCycleName').fill('Must not replace unsaved work');
  await page.locator('.cycle-new button').click();
  assert.equal(await page.locator('#s1task').inputValue(), 'Typed while storage is blocked.');

  await ctx.close();

  // ── 7. Spanish: preference persists, example and new stages are translated ──
  ctx = await newContext(); page = watch(await ctx.newPage());
  await page.goto(base + '/vista'); await ready(page);
  await page.locator('#langToggle').click();
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'es');
  await page.reload(); await ready(page);
  assert.match(await page.locator('#startOwn').textContent(), /Repensar una evaluación/);
  await page.locator('#startExample').click();
  assert.match(await page.locator('#s1task').inputValue(), /precios de reventa/);
  for (const [view, text] of [['redesign', /Tu nivel SAIL después de la rutina/], ['implementation', /Antes de enseñar/], ['reflection', /Lo que tienes ahora/], ['final', /Lo que registraste antes/]]) {
    await page.evaluate(v => showView(v), view);
    assert.match(await page.locator('#view-' + view).textContent(), text);
  }
  await page.locator('#reportButton').click();
  await page.frameLocator('#reportFrame').locator('h1').waitFor();
  assert.match(await page.frameLocator('#reportFrame').locator('body').textContent(), /Reflexión y siguiente ciclo[\s\S]*Qué sigue siendo incierto/);
  await page.keyboard.press('Escape');
  const untranslated = await page.evaluate(() => [...document.querySelectorAll('[data-k]')].filter(el => !STRINGS.es[el.dataset.k]).map(el => el.dataset.k));
  assert.deepEqual(untranslated, [], 'every labelled element has a Spanish string');
  assert.equal(await page.locator('label[for=ft]').textContent(), 'Docente');
  assert.equal(await page.locator('#fa').getAttribute('placeholder'), 'Nombre de la tarea que vas a revisar');
  assert.equal(await page.locator('label[for=fcycle]').textContent(), 'Ciclo');
  await ctx.close();

  // ── 8. keyboard-only start, and every control in the tool has an accessible name ──
  ctx = await newContext(); page = watch(await ctx.newPage());
  await page.goto(base + '/vista'); await ready(page);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
  for (let i = 0; i < 40 && await page.evaluate(() => document.activeElement.id) !== 'startOwn'; i++) await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#view-initial').isVisible(), true);
  for (const v of ['initial', 'deepdive', 'redesign', 'implementation', 'final', 'reflection']) {
    await page.evaluate(v => showView(v), v);
    const unnamed = await page.evaluate(() => [...document.querySelectorAll('.view.active textarea,.view.active input,.view.active button')].filter(el => !(el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent.trim())).map(el => el.id || el.outerHTML.slice(0, 60)));
    assert.deepEqual(unnamed, [], 'unnamed controls in ' + v);
  }
  await ctx.close();

  // ── 9. public pages: load, links resolve, no overflow, inquiry form works ──
  ctx = await newContext(); page = watch(await ctx.newPage());
  const seen = new Set(), queue = ['/', '/schools', '/method', '/privacy', '/vista', '/vista-print'];
  for (const route of queue) {
    const res = await page.goto(base + route); assert.equal(res.status(), 200, route);
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
    for (const href of links) if (href.startsWith('/') && !href.startsWith('//')) seen.add(href.split('#')[0].split('?')[0]);
    assert.equal(await page.locator('h1').count() >= 1, true, 'h1 on ' + route);
  }
  for (const href of seen) { const res = await ctx.request.get(base + href); assert.equal(res.status(), 200, 'broken internal link ' + href); }
  for (const [from, to] of [['/teacher-hub', '/cng/teacher-hub'], ['/proposal', '/cng/proposal'], ['/es', '/cng/es'], ['/launch', '/']]) { const response = await ctx.request.get(base + from, {maxRedirects: 0}); assert.equal(response.status(), 307); assert.equal(response.headers().location, to); }
  assert.equal((await ctx.request.get(base + '/no-such-page')).status(), 404);
  for (const path of ['/cng/', '/cng/proposal', '/public/docs/Journal_Article_Draft.docx']) assert.equal((await ctx.request.get(base + path)).status(), 404, 'school archive is excluded from product builds');
  for (const width of [390, 768, 1280]) for (const route of ['/', '/schools', '/method', '/privacy']) {
    await page.setViewportSize({width, height: 900}); await page.goto(base + route);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${route} @${width}`);
    if (width !== 768) await page.screenshot({path: `${shots}/site${route === '/' ? '-home' : route.replace('/', '-')}-${width}.png`, fullPage: true, animations: 'disabled'});
  }
  await page.setViewportSize({width: 1280, height: 900}); await page.goto(base + '/schools');
  for (const text of ['testimonial', 'Not yet known', 'hypothesis', 'not enforced by technical access restrictions', 'Start with a supported pilot', 'No pilot price has been published', 'no school workspace']) assert.ok((await page.locator('main').textContent()).includes(text), 'schools page states: ' + text);
  for (const [id, value] of [['iq-name', 'Synthetic Person'], ['iq-role', 'Director of Learning'], ['iq-school', 'Example International School'], ['iq-reply', 'person@example.org'], ['iq-context', 'Departments disagree about take-home tasks.']]) await page.locator('#' + id).fill(value);
  await page.getByRole('button', {name: 'Prepare my inquiry'}).click();
  assert.match(await page.locator('#inquiryOutput').textContent(), /Example International School[\s\S]*take-home tasks/);
  assert.match(await page.locator('#inquiryNote').textContent(), /nothing has been sent/);
  await page.goto(base + '/?'); await page.getByRole('link', {name: 'See a worked example'}).click(); await ready(page);
  assert.match(await page.locator('#cycleNotice').textContent(), /synthetic/);
  await ctx.close();

  assert.deepEqual(errors, []);
  console.log('PASS: multiple cycles, rename, delete with confirmation, backup export/import across browsers, hostile import neutralised, TXT/DOCX/PDF import on device with no upload, report preview/text/PDF, two-tab conflict handling, legacy draft recovery, blocked-storage warning and rescue download, Spanish persistence and coverage, keyboard start and control names, public pages, internal links, redirects, 404, responsive widths, inquiry form.');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
