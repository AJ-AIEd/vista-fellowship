const engines = require('playwright');
const browserName = process.env.VISTA_ENGINE || 'chromium';
const chromium = engines[browserName];
const assert = require('node:assert/strict');
const base = process.env.VISTA_URL || 'http://127.0.0.1:8765';
const shots = process.env.VISTA_SHOTS || require('node:os').tmpdir();
(async () => {
  const browser = await chromium.launch({executablePath:process.env.VISTA_BROWSER, headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
  const external=[]; page.on('request', r=>{ if(!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  // No analytics or external fonts are needed for the local functional checks.
  await page.route('**/_vercel/insights/**', r=>r.fulfill({status:200,body:''}));
  await page.goto(base+'/vista');
  await page.waitForFunction(()=>document.documentElement.dataset.vistaReady==='true');
  // No login barrier: the tool is usable immediately.
  assert.equal(await page.locator('input[type=password]').count(),0);
  assert.equal(await page.locator('#view-launch').isVisible(),true);
  await page.locator('.path-a .path-btn').click();
  assert.equal(await page.locator('#s1task').isVisible(),true);
  await page.locator('#s1task').fill('Algebra 2: compare linear and exponential models and explain which fits a new data set.');
  for (const type of ['proc','conc','eval','crea','emb']) {
    await page.locator(`.cl-card[data-type="${type}"]`).press('Enter');
  }
  await page.locator('#learningEvidence').fill('Independent explanation of an unfamiliar data set.');
  await page.locator('#humanAI').fill('AI can fit a model; students must justify the choice and explain limits.');
  for (const rating of ['full','subs','part']) {
    await page.locator(`.rc[data-d="${rating}"]`).press('Space');
    await page.waitForFunction(r => document.getElementById('dp-'+r).classList.contains('show'),rating);
    await page.locator('#navRedesign').click();
    assert.equal(await page.locator(`#ptabs-${rating} .ptab`).count(),5);
    for (const type of ['proc','conc','eval','crea','emb']) {
      await page.locator(`#ptabs-${rating} .ptab[data-type="${type}"]`).press('Enter');
      assert.equal(await page.locator(`#pcontent-${rating}-${type}`).evaluate(e=>e.classList.contains('show')),true);
      assert.ok(await page.locator(`#pcontent-${rating}-${type} .pi`).count());
    }
    await page.locator('#navInitial').click();
  }
  await page.locator('.rc[data-d="min"]').click();
  await page.locator('#navRedesign').click();
  await page.locator('#min_r4').fill('Students may rehearse an explanation without understanding.');
  await page.locator('#min_exemplar_text').fill('Check transfer to a new data set.');
  assert.equal(await page.locator('#dp-min blockquote').count(),0);
  await page.locator('#navInitial').click();
  await page.locator('.sail-row[data-level="L3"]').press('Enter');
  await page.locator('.sail-row[data-level="L1"]').press('Space');
  assert.equal(await page.locator('.sail-row.on').count(),2);
  await page.locator('#sailJustify').fill('Students choose and justify the model before AI edits their explanation.');
  await page.locator('#lr1').fill('Check their explanation on a new data set.');
  await page.locator('#view-initial .btn-sub').click(); // continue to the routine
  assert.equal(await page.locator('#view-deepdive').isVisible(),true);
  assert.match(await page.locator('#generatedPrompt').textContent(), /Algebra 2/);
  // Earlier decisions are carried forward into the next stage.
  assert.match(await page.locator('#recap-deepdive').textContent(), /AI can fit a model/);
  for (const id of ['ddYou1','dd1','dd2','dd3']) await page.locator('#'+id).fill('Routine note '+id);
  await page.locator('#view-deepdive .btn-sub').click();
  assert.equal(await page.locator('#view-redesign').isVisible(),true);
  assert.match(await page.locator('#ahtrSailBlock').textContent(), /L3/);
  assert.match(await page.locator('#recap-redesign').textContent(), /Routine note dd1/);
  for (const id of ['dd4','dd4redesign']) await page.locator('#'+id).fill('Routine note '+id);
  await page.locator('.sail-chip[data-rlevel="L1"]').click();
  await page.locator('.sail-chip[data-rlevel="L4"]').press('Enter');
  await page.locator('#redesignEvidence').fill('Unseen data set, short explanation.');
  await page.locator('#redesignSupports').fill('Oral option; critique a teacher-written justification.');
  await page.locator('#view-redesign .btn-sub').click();
  assert.equal(await page.locator('#view-implementation').isVisible(),true);
  assert.match(await page.locator('#recap-implementation').textContent(), /L1, L4/);
  await page.locator('.impl-ready[data-key="route"]').check();
  await page.locator('.impl-ready[data-key="privacy"]').press('Space');
  await page.locator('#implWhen').fill('Two Grade 10 sections.');
  await page.locator('#implEvidence').fill('Most explanations used the table.');
  await page.locator('#implAdjust').fill('Three extra minutes.');
  await page.locator('#view-implementation .btn-sub').click();
  assert.equal(await page.locator('#view-final').isVisible(),true);
  assert.match(await page.locator('#recap-final').textContent(), /Most explanations used the table/);
  for (let i=1;i<=6;i++) await page.locator('#fq'+i).fill('Evidence '+i);
  await page.locator('#view-final .btn-sub').click();
  assert.equal(await page.locator('#view-reflection').isVisible(),true);
  for (let i=7;i<=9;i++) await page.locator('#fq'+i).fill('Evidence '+i);
  await page.locator('#nextUncertain').fill('Whether it transfers.');
  await page.locator('#nextTransfer').fill('The quadratic modelling task.');
  assert.equal(await page.locator('#cycleComplete').isVisible(),true);
  await page.locator('#navInitial').click();
  await page.locator('#navFinal').click();
  assert.equal(await page.locator('#fq2').inputValue(),'Evidence 2');
  await page.locator('#navReflect').click();
  assert.equal(await page.locator('#fq8').inputValue(),'Evidence 8');
  await page.locator('#navFinal').click();
  await page.locator('#langToggle').click();
  assert.equal(await page.locator('#fq2').inputValue(),'Evidence 2');
  assert.match(await page.locator('#view-final').textContent(), /¿Dónde apoyó la IA/);
  await page.locator('#langToggle').click();
  // Autosave: no Save button is pressed before the reload.
  await page.waitForFunction(()=>document.getElementById('saveIndicator').dataset.state==='saved');
  await page.reload();
  await page.waitForFunction(()=>document.documentElement.dataset.vistaReady==='true');
  assert.match(await page.locator('#startResume').textContent(), /Resume/);
  assert.match(await page.locator('#cycleLabel').textContent(), /Untitled cycle/);
  await page.locator('#navInitial').click();
  assert.equal(await page.locator('#humanAI').inputValue(),'AI can fit a model; students must justify the choice and explain limits.');
  assert.equal(await page.locator('.sail-row.on').count(),2);
  assert.equal(await page.locator('#sailJustify').inputValue(),'Students choose and justify the model before AI edits their explanation.');
  await page.locator('#navDeep').click();
  assert.equal(await page.locator('#dd2').inputValue(),'Routine note dd2');
  await page.locator('#navRedesign').click();
  assert.equal(await page.locator('#min_r4').inputValue(),'Students may rehearse an explanation without understanding.');
  assert.equal(await page.locator('#dd4').inputValue(),'Routine note dd4');
  assert.equal(await page.locator('.sail-chip.on').count(),2);
  assert.equal(await page.locator('#redesignEvidence').inputValue(),'Unseen data set, short explanation.');
  await page.screenshot({path:shots+'/vista-redesign-desktop.png',fullPage:true, animations: 'disabled'});
  await page.locator('#navImpl').click();
  assert.equal(await page.locator('.impl-ready:checked').count(),2);
  assert.equal(await page.locator('#implEvidence').inputValue(),'Most explanations used the table.');
  await page.locator('#navFinal').click();
  assert.equal(await page.locator('#fq6').inputValue(),'Evidence 6');
  await page.locator('#navReflect').click();
  assert.equal(await page.locator('#fq9').inputValue(),'Evidence 9');
  assert.equal(await page.locator('#nextTransfer').inputValue(),'The quadratic modelling task.');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:shots+'/vista-reflection-desktop.png',fullPage:true, animations: 'disabled'});
  // Every view fits a phone, including all rating branches.
  await page.setViewportSize({width:390,height:844});
  for (const view of ['launch','initial','deepdive','redesign','implementation','final','reflection','refs']) {
    await page.evaluate(v=>showView(v),view);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'phone overflow: '+view);
    if(view==='initial') for(const rating of ['full','subs','part','min']) {
      await page.locator(`.rc[data-d="${rating}"]`).click();
      await page.waitForFunction(r=>document.getElementById('dp-'+r).classList.contains('show'),rating);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'phone rating overflow: '+rating);
    }
    await page.screenshot({path:shots+'/vista-'+view+'-phone.png',fullPage:true, animations: 'disabled'});
  }
  await page.goto(base+'/vista-print');
  assert.ok(await page.locator('.doc-title').count());
  assert.deepEqual(external.filter(u=>!u.includes('/_vercel/')),[],'the tool makes no third-party requests');
  assert.deepEqual(errors,[]);
  console.log('PASS: no login barrier, 15 pathways, minimal reflections, keyboard choices, all six stages with carried-forward recaps, autosave and reload, language switching, phone layouts for every view, no third-party requests, no page errors.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
