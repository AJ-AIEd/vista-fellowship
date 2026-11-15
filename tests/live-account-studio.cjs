// Explicit opt-in: creates two synthetic, non-deliverable QA accounts and one QA copy.
// Never reads/deletes another account's records. No email is sent; refuses if autoconfirm is off.
const {chromium}=require('playwright');
const {createClient}=require('@supabase/supabase-js');
const {randomUUID}=require('node:crypto');
const assert=require('node:assert/strict');
const url='https://kzbcuoqdxlorhgpoeemi.supabase.co';
const key='sb_publishable_zTKQn0GWc3-T7r5tbCuFWg_gA141Z5V';
const base=process.env.VISTA_URL||'http://127.0.0.1:8765';
(async()=>{
 if(process.env.VISTA_LIVE_ACCOUNT_TEST!=='1')throw new Error('Set VISTA_LIVE_ACCOUNT_TEST=1 to create synthetic QA accounts.');
 const settings=await fetch(url+'/auth/v1/settings',{headers:{apikey:key}}).then(r=>r.json());
 assert.equal(settings.mailer_autoconfirm,true,'refuse tests that would request confirmation emails');
 const id=randomUUID().replaceAll('-','').slice(0,12),password=randomUUID()+'Aa!9';
 const names=['vistaqa-a-'+id,'vistaqa-b-'+id];
 const clients=names.map(()=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}));
 for(let i=0;i<2;i++){const{data,error}=await clients[i].auth.signUp({email:names[i]+'@accounts.vista.invalid',password});if(error)throw error;assert.ok(data.session);}
 const browser=await chromium.launch();try{
  const context=await browser.newContext({viewport:{width:1280,height:900}});await context.route('**/_vercel/**',r=>r.fulfill({status:200,body:''}));const p=await context.newPage();await p.goto(base+'/vista');await p.waitForFunction(()=>document.documentElement.dataset.vistaReady==='true');
  await p.locator('#startOwn').click();await p.locator('#fa').fill('Synthetic QA account copy '+id);await p.locator('#s1task').fill('Synthetic task: compare two interpretations. No real teacher/student data.');
  await p.locator('#accountButton').click();await p.locator('#accountIdentity').fill(names[0]);await p.locator('#accountPassword').fill(password);await p.locator('#accountDialog').getByRole('button',{name:'Sign in',exact:true}).click();
  const save=p.getByRole('button',{name:'Save a new account copy of this cycle',exact:true});await save.waitFor();await save.click();await p.waitForFunction(()=>document.getElementById('accountStatus').textContent.includes('A new copy is saved'));
  const{data:own,error}=await clients[0].from('vista_cycles').select('id,title,draft').like('title','Synthetic QA account copy '+id);if(error)throw error;assert.equal(own.length,1);assert.match(own[0].draft.task,/Synthetic task/);
  const{data:other,error:otherError}=await clients[1].from('vista_cycles').select('id').eq('id',own[0].id);if(otherError)throw otherError;assert.deepEqual(other,[],'other account cannot read the copy');
  const{data:changed,error:updateError}=await clients[1].from('vista_cycles').update({title:'Unauthorized change'}).eq('id',own[0].id).select('id');assert.ok(updateError||changed.length===0,'other account cannot update it');
  await p.getByRole('button',{name:'Open as a new local cycle',exact:true}).click();await p.waitForFunction(()=>!document.getElementById('accountDialog'));assert.match(await p.locator('#s1task').inputValue(),/Synthetic task/);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('vista.v3.index')).cycles.length),2,'cloud open adds without replacing local cycle');
  await p.locator('#accountButton').click();await p.getByRole('button',{name:'Sign out',exact:true}).click();await p.waitForFunction(()=>document.getElementById('accountStatus').textContent.includes('Signed out.'));await p.keyboard.press('Escape');assert.match(await p.locator('#s1task').inputValue(),/Synthetic task/);
  await context.close();console.log('PASS: real optional overlay sign-in, explicit account copy, account ownership isolation, import as new local cycle, sign-out preserves local work. Synthetic QA accounts/copy retained; no existing user data deleted.');
 }finally{await browser.close();for(const c of clients)await c.auth.signOut();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
