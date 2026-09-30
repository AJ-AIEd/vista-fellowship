const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.VISTA_URL || 'http://127.0.0.1:8765';
(async () => {
  const browser = await chromium.launch({executablePath:process.env.VISTA_BROWSER, headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  // No analytics or external fonts are needed for the local functional checks.
  await page.route('**/_vercel/insights/**', r=>r.fulfill({status:200,body:''}));
  await page.goto(base+'/vista.html');
  await page.locator('.path-a .path-btn').click();
  await page.locator('#s1task').fill('Algebra 2: compare linear and exponential models and explain which fits a new data set.');
  for (const type of ['proc','conc','eval','crea','emb']) {
    await page.locator(`.cl-card[data-type="${type}"]`).press('Enter');
  }
  await page.locator('#learningEvidence').fill('Independent explanation of an unfamiliar data set.');
  await page.locator('#humanAI').fill('AI can fit a model; students must justify the choice and explain limits.');
  for (const rating of ['full','subs','part']) {
    await page.locator(`.rc[data-d="${rating}"]`).press('Space');
    await page.waitForFunction(r => document.getElementById('dp-'+r).classList.contains('show'),rating);
    await page.locator('#navDeep').click();
    assert.equal(await page.locator(`#ptabs-${rating} .ptab`).count(),5);
    for (const type of ['proc','conc','eval','crea','emb']) {
      await page.locator(`#ptabs-${rating} .ptab[data-type="${type}"]`).press('Enter');
      assert.equal(await page.locator(`#pcontent-${rating}-${type}`).evaluate(e=>e.classList.contains('show')),true);
      assert.ok(await page.locator(`#pcontent-${rating}-${type} .pi`).count());
    }
    await page.locator('#navInitial').click();
  }
  await page.locator('.rc[data-d="min"]').click();
  await page.locator('#navDeep').click();
  await page.locator('#min_r4').fill('Students may rehearse an explanation without understanding.');
  await page.locator('#min_exemplar_text').fill('Check transfer to a new data set.');
  assert.equal(await page.locator('#dp-min blockquote').count(),0);
  await page.locator('#navInitial').click();
  await page.locator('.sail-row[data-level="L3"]').press('Enter');
  await page.locator('.sail-row[data-level="L1"]').press('Space');
  assert.equal(await page.locator('.sail-row.on').count(),2);
  await page.locator('#sailJustify').fill('Students choose and justify the model before AI edits their explanation.');
  await page.locator('#lr1').fill('Check their explanation on a new data set.');
  await page.locator('#view-initial .btn-sub').click();
  await page.locator('#navDeep').click();
  assert.match(await page.locator('#generatedPrompt').textContent(), /Algebra 2/);
  assert.match(await page.locator('#ahtrSailBlock').textContent(), /L3/);
  for (const id of ['ddYou1','dd1','dd2','dd3','dd4','dd4redesign']) await page.locator('#'+id).fill('Routine note '+id);
  await page.locator('#navFinal').click();
  for (let i=1;i<=9;i++) await page.locator('#fq'+i).fill('Evidence '+i);
  await page.locator('#navInitial').click();
  await page.locator('#navFinal').click();
  assert.equal(await page.locator('#fq2').inputValue(),'Evidence 2');
  await page.locator('#langToggle').click();
  assert.equal(await page.locator('#fq2').inputValue(),'Evidence 2');
  assert.match(await page.locator('#view-final').textContent(), /¿Dónde apoyó la IA/);
  await page.locator('#langToggle').click();
  await page.reload();
  await page.locator('#navInitial').click();
  assert.equal(await page.locator('#humanAI').inputValue(),'AI can fit a model; students must justify the choice and explain limits.');
  assert.equal(await page.locator('.sail-row.on').count(),2);
  assert.equal(await page.locator('#sailJustify').inputValue(),'Students choose and justify the model before AI edits their explanation.');
  await page.locator('#navDeep').click();
  assert.equal(await page.locator('#min_r4').inputValue(),'Students may rehearse an explanation without understanding.');
  assert.equal(await page.locator('#dd4').inputValue(),'Routine note dd4');
  await page.screenshot({path:'/tmp/vista-routine-desktop.png',fullPage:true});
  await page.locator('#navFinal').click();
  assert.equal(await page.locator('#fq9').inputValue(),'Evidence 9');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:'/tmp/vista-final-desktop.png',fullPage:true});
  // Every view fits a phone, including all rating branches.
  await page.setViewportSize({width:390,height:844});
  for (const view of ['launch','initial','deepdive','final','refs']) {
    await page.evaluate(v=>showView(v),view);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'phone overflow: '+view);
    if(view==='initial') for(const rating of ['full','subs','part','min']) {
      await page.locator(`.rc[data-d="${rating}"]`).click();
      await page.waitForFunction(r=>document.getElementById('dp-'+r).classList.contains('show'),rating);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'phone rating overflow: '+rating);
    }
    if(view==='launch') await page.screenshot({path:'/tmp/vista-launch-phone.png',fullPage:true});
  }
  for(const route of ['teacher-hub.html','vista-print.html']) {
    await page.goto(base+'/'+route);
    if(route==='teacher-hub.html') assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'hub overflow');
    await page.setViewportSize({width:1200,height:900});
    await page.screenshot({path:'/tmp/'+route+'.png',fullPage:true});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 15 pathways, minimal reflections, keyboard choices, task/SAIL transfer, draft reload, language switching, final revisit, mobile views, and page errors.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
