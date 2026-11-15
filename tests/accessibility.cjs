// Automated WCAG checks supplement (and do not replace) manual keyboard review.
const {chromium} = require('playwright');
const {default: AxeBuilder} = require('@axe-core/playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/_vercel/**', r => r.fulfill({status: 200, body: ''}));
    const base = process.env.VISTA_URL || 'http://127.0.0.1:8765';
    const scan = async name => {
      const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      results.push({name, violations: result.violations.map(v => ({id:v.id, impact:v.impact, nodes:v.nodes.map(n => ({target:n.target, summary:n.failureSummary}))}))});
    };
    for (const width of [390, 768, 1280]) {
      await page.setViewportSize({width,height:900});
      for (const route of ['/', '/schools', '/method', '/privacy', '/field-guide', '/prototypes']) {
        await page.goto(base + route); await scan(`${route} @${width}`);
      }
      await page.goto(base + '/vista?example');
      await page.waitForFunction(() => document.documentElement.dataset.vistaReady === 'true');
      for (const view of ['launch','initial','deepdive','redesign','implementation','final','reflection','learn']) {
        await page.evaluate(view => showView(view), view);
        await page.emulateMedia({reducedMotion:'reduce'});
        await scan(`${view} @${width}`);
      }
      await page.locator('#accountButton').click();await page.locator('#accountDialog').waitFor();await scan(`account overlay @${width}`);await page.keyboard.press('Escape');await page.locator('#accountDialog').waitFor({state:'detached'});
      for(const concept of ['guided','notebook','workspace']){await page.goto(base+'/vista?concept='+concept+'&example');await page.waitForFunction(()=>Boolean(window.VistaStudio));await scan(`concept ${concept} @${width}`);}
    }
    const output = process.env.VISTA_A11Y || '../../outputs/accessibility.json';
    fs.writeFileSync(output, JSON.stringify(results,null,2));
    const failures = results.filter(r => r.violations.length);
    console.log(JSON.stringify(failures.map(r => ({name:r.name, rules:r.violations.map(v=>`${v.id}: ${v.nodes.length}`)})),null,2));
    if (failures.length) process.exitCode = 1;
    else console.log(`PASS: ${results.length} automated WCAG scans`);
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
