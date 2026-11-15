const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.VISTA_URL||'http://127.0.0.1:8765';
const shots=process.env.VISTA_SHOTS||'../../outputs/design-research';
const ready=p=>p.waitForFunction(()=>document.documentElement.dataset.vistaReady==='true'&&Boolean(window.VistaStudio));
const saved=p=>p.waitForFunction(()=>document.getElementById('saveIndicator').dataset.state==='saved');
(async()=>{const browser=await chromium.launch();try{
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});await ctx.route('**/_vercel/**',r=>r.fulfill({status:200,body:''}));const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/vista?entry=tools');await ready(page);
 assert.equal(await page.locator('#view-learn').isVisible(),true);
 assert.equal(await page.locator('input[type=password]').count(),0,'guest work is not gated');
 await page.locator('#learning-question').fill('How can research students check a synthesis without outsourcing reading?');
 await page.locator('#learning-responsibility').fill('Interpret the passage and justify whether a claim follows.');
 await page.locator('#learning-checked').fill('The response omitted the study limitation.');
 await page.locator('#modelComparison summary').click();
 for(const[id,value]of [['prompt','Compare the two provided extracts.'],['modelA','Synthetic system A, 2026-11-15'],['modelB','Synthetic system B, 2026-11-15'],['outputA','Excerpt A'],['outputB','Excerpt B'],['noticed','Same prompt, different assumptions.'],['implication','Students need to check the evidence.']])await page.locator('#learning-'+id).fill(value);
 await saved(page);await page.reload();await ready(page);
 assert.match(await page.locator('#learning-question').inputValue(),/research students/);
 assert.equal(await page.locator('#learning-outputB').inputValue(),'Excerpt B');
 await page.getByRole('button',{name:'Prepare a conversation',exact:true}).first().click();assert.match(await page.locator('#conversationText').inputValue(),/research students/);await page.keyboard.press('Escape');
 await page.locator('#reportButton').click();await page.frameLocator('#reportFrame').locator('h1').waitFor();assert.match(await page.frameLocator('#reportFrame').locator('body').textContent(),/Same prompt, different assumptions/);await page.keyboard.press('Escape');
 await page.locator('#view-learn').getByRole('button',{name:'Return to my assessment work',exact:true}).click();
 await page.locator('#s1task').fill('Compare two historical accounts and defend an interpretation.');
 await page.locator('#studioHelp').getByText('Assessment annotations',{exact:true}).click();
 await page.locator('#s1task').evaluate(e=>e.setSelectionRange(0,31));await page.getByRole('button',{name:'Annotate a selected passage',exact:true}).click();
 await page.locator('#annotationQuote').fill('Compare two historical accounts');await page.locator('#annotationNote').fill('What sourcing and interpretation must remain the student’s? <script>not executable</script>');await page.getByRole('button',{name:'Keep this annotation',exact:true}).click();await saved(page);
 await page.locator('#navRedesign').click();
 await page.getByRole('button',{name:'Explore a possibility and return here',exact:true}).click();
 await page.getByText('Emerging ideas and professional judgment',{exact:true}).click();
 await page.locator('#learning-idea').fill('Test a source-selection checkpoint before changing the semester course.');
 await page.getByText('Add context or a status (optional)',{exact:true}).click();
 await page.locator('#learning-ideaStatus').fill('Explore; not approved or implemented');
 await saved(page);await page.reload();await ready(page);
 assert.match(await page.locator('#learning-idea').inputValue(),/source-selection/);
 await page.getByRole('button',{name:'Return to my assessment work',exact:true}).click();
 assert.equal(await page.locator('#view-redesign').isVisible(),true);
 assert.match(await page.locator('#s1task').inputValue(),/historical accounts/);
 await page.locator('#dd4redesign').fill('Compare the accounts, then defend a choice without AI.');
 await page.locator('#studioHelp').getByText('Original and revised task',{exact:true}).click();
 assert.match(await page.locator('#comparisonBefore').textContent(),/historical accounts/);assert.match(await page.locator('#comparisonAfter').textContent(),/without AI/);
 await page.locator('#navInitial').click();await page.locator('#supportMode').selectOption('guided');assert.ok(await page.locator('.focus-hidden').count()>0);await page.getByRole('button',{name:'Next section',exact:true}).click();await page.getByRole('button',{name:'Show all sections',exact:true}).click();assert.equal(await page.locator('.focus-hidden').count(),0);
 await page.locator('#cycleButton').click();await page.locator('#newCycleName').fill('A second inquiry');await page.locator('.cycle-new button').click();await page.locator('#s1task').fill('A second task to compare.');await saved(page);await page.locator('#cycleButton').click();await page.locator('#compareCyclesButton').click();assert.equal(await page.locator('.cycle-comparison section').count(),2);assert.match(await page.locator('.cycle-comparison').textContent(),/historical accounts/);await page.keyboard.press('Escape');
 await page.locator('#accountButton').click();await page.locator('#accountDialog').waitFor();assert.equal(await page.locator('#accountPassword').isVisible(),true);await page.keyboard.press('Escape');await page.locator('#accountDialog').waitFor({state:'detached'});assert.equal(await page.locator('#accountDialog').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.id),'accountButton');assert.equal(await page.locator('#s1task').inputValue(),'A second task to compare.');
 for(const concept of ['guided','notebook','workspace']){
  await page.goto(base+'/vista?concept='+concept+'&example');await ready(page);
  if(concept==='guided'){assert.equal(await page.locator('#supportMode').inputValue(),'guided');assert.ok(await page.locator('.focus-hidden').count()>0);}
  if(concept==='notebook')for(const view of ['initial','deepdive','redesign','implementation','final','reflection'])assert.equal(await page.locator('#view-'+view).isVisible(),true);
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${concept} @${width}`);await page.screenshot({path:`${shots}/concept-${concept}-${width}.png`,animations:'disabled'});}
 }
 assert.deepEqual(errors,[]);await ctx.close();console.log('PASS: entry paths, exploration/experiment autosave and reload, conversation handoff, report inclusion, annotations, before/after comparison, focused mode, cycle comparison, optional sign-in overlay, all three responsive concepts.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
