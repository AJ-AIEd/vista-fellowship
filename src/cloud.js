import {accountAddress} from './auth.js';
import {createClient} from '@supabase/supabase-js';
import {config} from './config.js';
import {STAGES,buildReport,reportHTML,handoff,escapeHTML} from './reports.js';
import {ACCEPT,fileKind,readSubmission,cancelTranscription,MAX_BYTES} from './files.js';
const $=id=>document.getElementById(id);
const sb=createClient(config.url,config.key,{auth:{storageKey:'vista-auth-v1'}});
let user=null,cycle=null,submissions={},dirty=false,saving=null,saveTimer=null,importing=false,importStage='initial',pendingFile=null,recorder=null,recordStream=null,recordTimer=null;
let audioURL=null;
let authGeneration=0,operationBusy=false,importGeneration=0;
const status=message=>{$('cloudStatus').textContent=message;};
const alertStatus=message=>{$('cloudAlert').textContent=message;};
const safe=escapeHTML;
const field=(id)=>$(id)?.value?.trim()||'';
function snapshot(){return {...window.VistaForm.capture(),submissions:structuredClone(submissions)};}
function markDirty(){if(!cycle)return;dirty=true;status('Changes not saved yet');clearTimeout(saveTimer);saveTimer=setTimeout(()=>save().catch(e=>alertStatus(e.message)),1800);}
function assertActive(){if(!user||!cycle)throw new Error('Sign in and open a cycle first.');}
async function save(){
 assertActive();clearTimeout(saveTimer);
 if(saving){await saving;if(dirty)return save();return;}
 if(!dirty)return;
 const owner=user.id,id=cycle.id,revision=cycle.revision,draft=snapshot(),title=field('cycleTitle')||cycle.title;
 dirty=false;status('Saving…');
 saving=(async()=>{const {data,error}=await sb.rpc('vista_save_cycle',{p_id:id,p_revision:revision,p_title:title,p_draft:draft});
  if(error){if(user?.id!==owner||cycle?.id!==id)return;dirty=true;throw new Error(error.message.includes('SAVE_CONFLICT')?'This cycle changed in another tab or device. Download your unsaved notes, then reload the page and reopen the cycle before editing.':`Save failed. Your notes remain on this page. ${error.message}`);}
  if(user?.id!==owner||cycle?.id!==id)return;
  cycle=data[0];status('Saved to your account');alertStatus('');
 })();
 try{await saving;}finally{saving=null;}
 if(dirty)return save();
}
async function flush(){if(cycle&&dirty)await save();if(saving)await saving;}
function clearWorkspace(){clearTimeout(saveTimer);cancelImport();cycle=null;submissions={};dirty=false;window.VistaForm.load({});document.body.classList.remove('workspace-open');$('reportList').replaceChildren();$('cycleList').replaceChildren();$('reportText').textContent='';$('reportDialog').close();$('importDialog').close();$('cycleTitle').value='';status('');alertStatus('');}
async function listCycles(){
 const generation=authGeneration;
 const {data,error}=await sb.from('vista_cycles').select('id,title,updated_at,revision').order('updated_at',{ascending:false});if(error)throw error;
 if(generation!==authGeneration)return;
 $('cycleList').replaceChildren();
 if(!data.length)$('cycleList').textContent='No saved cycles yet. Start with one task.';
 for(const row of data){const item=document.createElement('div');item.className='saved-cycle';item.innerHTML=`<div><strong>${safe(row.title)}</strong><small>Updated ${safe(new Date(row.updated_at).toLocaleString())}</small></div><button type="button">Open cycle</button>`;item.querySelector('button').onclick=()=>run(()=>openCycle(row.id));$('cycleList').append(item);}
}
async function openCycle(id){await flush();const generation=authGeneration;const {data,error}=await sb.from('vista_cycles').select('*').eq('id',id).single();if(error)throw error;if(generation!==authGeneration)return;cycle=data;submissions=data.draft.submissions||{};window.VistaForm.load(data.draft);$('cycleTitle').value=data.title;dirty=false;document.body.classList.add('workspace-open');window.showView('initial');status('Saved to your account');await listReports();}
async function createCycle(){
 await flush();const title=field('newCycleTitle');if(!title)throw new Error('Give this task or cycle a name.');
 const {data,error}=await sb.from('vista_cycles').insert({title,user_id:user.id,draft:{}}).select().single();if(error)throw error;
 $('newCycleTitle').value='';await openCycle(data.id);
}
async function dashboard(){await flush();document.body.classList.remove('workspace-open');await listCycles();}
async function listReports(){if(!cycle)return;const active=cycle.id,generation=authGeneration;const {data,error}=await sb.from('vista_reports').select('id,stage,created_at').eq('cycle_id',cycle.id).order('created_at',{ascending:false});if(error)throw error;if(generation!==authGeneration||cycle?.id!==active)return;$('reportList').replaceChildren();for(const r of data){const b=document.createElement('button');b.textContent=`${STAGES[r.stage]} · ${new Date(r.created_at).toLocaleString()}`;b.onclick=()=>run(async()=>{const {data,error}=await sb.from('vista_reports').select('*').eq('id',r.id).single();if(error)throw error;if(generation!==authGeneration||cycle?.id!==active)return;showReport(data);});$('reportList').append(b);}}
async function createReport(stage){
 assertActive();dirty=true;await flush();const owner=user.id,active=cycle.id,generation=authGeneration;const draft=snapshot();const createdAt=new Date().toISOString();const text=buildReport({title:cycle.title,stage,snapshot:draft,createdAt});
 const {data,error}=await sb.from('vista_reports').insert({cycle_id:cycle.id,user_id:user.id,stage,snapshot:draft,report_text:text}).select().single();if(error)throw error;
 if(generation!==authGeneration||user?.id!==owner||cycle?.id!==active)return;await listReports();showReport(data);
}
function download(text,name,type='text/plain'){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);}
function showReport(report){$('reportHeading').textContent=STAGES[report.stage]+' report';$('reportText').textContent=report.report_text;$('downloadReport').onclick=()=>download(report.report_text,`VISTA-${report.stage}-${report.id.slice(0,8)}.txt`);$('printReport').onclick=()=>{const win=window.open('','_blank');if(!win){alertStatus('Allow a new window to print your report.');return;}win.document.write(reportHTML(report.report_text));win.document.close();win.onload=()=>win.print();};$('copyHandoff').onclick=()=>run(async()=>{await navigator.clipboard.writeText(handoff(report.stage));$('reportMessage').textContent='Handoff prompt copied.';});$('reportMessage').textContent='';$('reportDialog').showModal();}
function stopRecording(){clearTimeout(recordTimer);if(recorder?.state==='recording')recorder.stop();recordStream?.getTracks().forEach(t=>t.stop());recordStream=null;$('recordAudio').textContent='Record audio';}
function cancelImport(){if(audioURL)URL.revokeObjectURL(audioURL);audioURL=null;$('audioPreview').removeAttribute('src');$('audioPreview').hidden=true;importGeneration++;importing=false;pendingFile=null;cancelTranscription();stopRecording();$('importProgress').textContent='';$('acceptImport').disabled=false;$('submissionFile').value='';}
function openImport(stage){assertActive();cancelImport();importStage=stage;pendingFile=null;$('importHeading').textContent=`${STAGES[stage]} — full submission`;$('submissionText').value=submissions[stage]?.text||'';$('reviewedSubmission').checked=false;$('importProgress').textContent='';$('importDialog').showModal();}
async function processFile(file){
 if(importing)throw new Error('Finish or cancel the current import first.');
 if(file.size>MAX_BYTES)throw new Error('Use a file of 25 MB or less.');
 const kind=fileKind(file);if(field('submissionText')&&!confirm('Replace the text in this review window with this file? The saved submission stays unchanged until you accept.'))return;
 if(audioURL)URL.revokeObjectURL(audioURL);audioURL=null;$('audioPreview').hidden=kind!=='audio';if(kind==='audio'){audioURL=URL.createObjectURL(file);$('audioPreview').src=audioURL;}
 const generation=++importGeneration;importing=true;$('acceptImport').disabled=true;pendingFile=null;$('reviewedSubmission').checked=false;
 try{const text=await readSubmission(file,m=>$('importProgress').textContent=m,$('audioLanguage').value);if(!importing||generation!==importGeneration)return;if(!text.trim())throw new Error('No text was found. Paste your response or try another file.');if(text.length>250000)throw new Error('This submission is too long. Split it into shorter files.');$('submissionText').value=text;pendingFile=file;$('importProgress').textContent=kind==='audio'?'Transcript ready. Listen back and correct it before accepting.':'Text ready. Check that all your responses are included.';}
 finally{if(generation===importGeneration){importing=false;$('acceptImport').disabled=false;}}
}
async function acceptImport(){
 assertActive();if(importing)throw new Error('Wait for the text to finish processing.');if(!$('reviewedSubmission').checked)throw new Error('Review the text, then confirm it is ready.');const text=field('submissionText');if(!text)throw new Error('Add your submission first.');
 const activeId=cycle.id,owner=user.id;let source=null;$('acceptImport').disabled=true;
 if(pendingFile){
  const id=crypto.randomUUID(),path=`${owner}/${activeId}/${id}`;
  const {error}=await sb.storage.from('vista-submissions').upload(path,pendingFile,{contentType:pendingFile.type||'application/octet-stream',upsert:false});if(error)throw error;
  const {error:rowError}=await sb.from('vista_files').insert({id,cycle_id:activeId,user_id:owner,stage:importStage,name:pendingFile.name,object_path:path,mime_type:pendingFile.type||'application/octet-stream',size_bytes:pendingFile.size});
  if(rowError){await sb.storage.from('vista-submissions').remove([path]);throw rowError;}source={id,name:pendingFile.name};
 }
 if(user?.id!==owner||cycle?.id!==activeId)throw new Error('Your session changed. Sign in and import again.');
 submissions[importStage]={text,reviewedAt:new Date().toISOString(),sources:source?[source]:(submissions[importStage]?.sources||[])};
 markDirty();await save();$('importDialog').close();await createReport(importStage);
}
async function startRecording(){
 if(recorder?.state==='recording'){stopRecording();return;}if(importing)throw new Error('Finish the current import first.');
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('Recording is unavailable in this browser. You can upload an audio file instead.');
 recordStream=await navigator.mediaDevices.getUserMedia({audio:true});
 const type=['audio/webm;codecs=opus','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t));
 const recordingGeneration=importGeneration;
 recorder=new MediaRecorder(recordStream,type?{mimeType:type}:{});const chunks=[];
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onstop=()=>{if(!$('importDialog').open||recordingGeneration!==importGeneration)return;const mime=recorder.mimeType;run(()=>processFile(new File(chunks,`VISTA-recording.${mime.includes('mp4')?'m4a':'webm'}`,{type:mime})));};
 recorder.start();$('recordAudio').textContent='Stop recording';$('importProgress').textContent='Recording… Stop when you have finished. Maximum 20 minutes.';recordTimer=setTimeout(stopRecording,1200000);
}
async function authSubmit(e){
 e.preventDefault();const mode=$('authMode').value,password=$('authPassword').value;
 $('authMessage').textContent='Signing in…';
 try{
  const name=field('authName'),email=accountAddress(name);
  if(mode==='signup'){const response=await fetch(config.url+'/auth/v1/settings',{headers:{apikey:config.key}});if(!response.ok)throw new Error('Account setup could not be checked. Please try again.');const settings=await response.json();if(!settings.mailer_autoconfirm)throw new Error('New accounts are not open yet. Please ask your facilitator to finish account setup.');}
  const result=mode==='signup'
   ?await sb.auth.signUp({email,password,options:{data:{display_name:name}}})
   :await sb.auth.signInWithPassword({email,password});
  if(result.error)throw result.error;
  if(!result.data.session)throw new Error('Account setup is not ready yet. Please contact your facilitator.');
  $('authPassword').value='';$('authMessage').textContent='';
 }catch(err){$('authMessage').textContent=err.message==='Invalid login credentials'?'Name or password not recognised. Check your spelling, or create an account if this is your first visit.':err.message;}
}
async function sessionChanged(session,event){
 const next=session?.user;if(next?.id===user?.id&&event!=='PASSWORD_RECOVERY')return;
 const generation=++authGeneration;clearWorkspace();user=next||null;
 document.body.classList.toggle('account-locked',!user);$('authPassword').value='';
 if(!user)return;
 $('accountEmail').textContent=user.user_metadata?.display_name||user.email?.split('@')[0]||'';
 if(event==='PASSWORD_RECOVERY'||new URLSearchParams(location.search).has('recovery')){$('passwordDialog').showModal();return;}
 try{await listCycles();if(generation!==authGeneration)return;}catch(e){alertStatus(e.message);}
}
async function run(fn){if(operationBusy)return;operationBusy=true;try{await fn();}catch(e){alertStatus(e.message||'Something went wrong. Try again.');if($('importDialog').open)$('importProgress').textContent=e.message;}finally{operationBusy=false;}}
function mount(){
 const app=document.createElement('div');app.id='vistaAccount';app.innerHTML=`
 <section id="authPanel" class="account-card"><div class="eyebrow">VISTA · Your private workspace</div><h1>Sign in to continue</h1><p>Save your cycles and take a report into your next conversation.</p>
 <form id="authForm"><label for="authMode">Account</label><select id="authMode"><option value="signin">Sign in</option><option value="signup">First visit — create my account</option></select><label for="authName">Your sign-in name</label><input id="authName" type="text" autocomplete="username" minlength="3" maxlength="50" required placeholder="e.g. Alex Rivera"><p class="hint">Use the same name each time. If it is taken, add an initial or number.</p><label for="authPassword">Password</label><input id="authPassword" type="password" autocomplete="current-password" minlength="8" required><p class="hint">Choose a memorable password with at least 8 characters. Keep it somewhere safe. There is no email password reset.</p><button type="submit">Sign in</button></form><p id="authMessage" role="status"></p></section>
 <section id="cloudBar"><div class="account-row"><strong>VISTA</strong><span id="accountEmail"></span><button id="myCycles">My cycles</button><button id="signOut">Sign out</button></div><div id="cloudAlert" role="alert"></div>
 <div class="cycle-controls"><label>Current task <input id="cycleTitle" maxlength="200"></label><span id="cloudStatus" role="status"></span><button id="saveCloud">Save now</button><button id="unsavedDownload">Download my current notes</button></div></section>
 <section id="dashboard" class="account-card"><h1>My VISTA cycles</h1><p>Start a cycle for one task. Return after each stage to save a report.</p><form id="newCycleForm"><label for="newCycleTitle">Task or cycle name</label><input id="newCycleTitle" maxlength="200" required placeholder="e.g. Grade 10 source evaluation · Cycle 1"><button>Start a cycle</button></form><div id="cycleList"></div></section>
 <section id="stageActions" class="account-card"><h2>Your submissions and reports</h2><p>Complete the fields, or submit your full response as text, a document, or audio. Review imported text before creating a report.</p><div class="stage-buttons">${Object.entries(STAGES).map(([key,name])=>`<div><strong>${name}</strong><button data-import="${key}">Submit text / file / audio</button><button data-report="${key}">Save ${name} report</button></div>`).join('')}</div><details><summary>Saved reports</summary><div id="reportList"></div></details></section>
 <dialog id="importDialog"><div class="dialog-head"><h2 id="importHeading"></h2><button id="closeImport" aria-label="Close submission">Close</button></div><p>Submit your responses for this stage in your own words. Avoid student names and identifying details. Text and audio are processed on this device; accepted submissions and original files are saved privately to your account.</p><div id="fileDrop" tabindex="0" role="button" aria-label="Choose or drop a submission"><strong>Drop a document or recording here</strong><span>TXT, Markdown, searchable PDF, DOCX, or audio · up to 25 MB</span><input id="submissionFile" type="file" accept="${ACCEPT}"></div><div class="account-row"><button id="recordAudio">Record audio</button><label>Audio language <select id="audioLanguage"><option value="english">English</option><option value="spanish">Español</option></select></label></div><p class="hint">Audio transcription downloads a speech model the first time and can take several minutes. Use a desktop browser and review the transcript for errors.</p><audio id="audioPreview" controls hidden style="width:100%"></audio><p id="importProgress" role="status"></p><label for="submissionText">Your full submission — review and edit</label><textarea id="submissionText" rows="12" maxlength="250000"></textarea><label class="check-label"><input id="reviewedSubmission" type="checkbox"> I have reviewed this text and it is ready for my report.</label><button id="acceptImport">Save submission and create report</button></dialog>
 <dialog id="reportDialog"><div class="dialog-head"><h2 id="reportHeading"></h2><button id="closeReport">Close</button></div><p>Add this report to your NotebookLM notebook, Gem, or Project, then use the handoff prompt to continue your thinking.</p><div class="account-row"><button id="downloadReport">Download report (.txt)</button><button id="printReport">Print / Save PDF</button><button id="copyHandoff">Copy handoff prompt</button></div><p id="reportMessage" role="status"></p><pre id="reportText"></pre></dialog>
 <dialog id="passwordDialog"><h2>Choose a new password</h2><form id="passwordForm"><label for="newPassword">New password</label><input id="newPassword" type="password" autocomplete="new-password" minlength="8" required><button>Update password</button></form><p id="passwordMessage" role="status"></p></dialog>`;
 document.body.prepend(app);document.body.appendChild($('stageActions')); 
 $('authForm').onsubmit=authSubmit;$('authMode').onchange=()=>{const signup=$('authMode').value==='signup';$('authPassword').autocomplete=signup?'new-password':'current-password';$('authForm').querySelector('button').textContent=signup?'Create my account':'Sign in';};
 $('newCycleForm').onsubmit=e=>{e.preventDefault();run(createCycle);};$('myCycles').onclick=()=>run(dashboard);$('saveCloud').onclick=()=>run(save);$('cycleTitle').oninput=markDirty;
 $('signOut').onclick=()=>run(async()=>{await flush();const {error}=await sb.auth.signOut();if(error)throw error;await sessionChanged(null,'SIGNED_OUT');});
 $('unsavedDownload').onclick=()=>download(JSON.stringify(snapshot(),null,2),'VISTA-current-notes.json','application/json');
 document.querySelectorAll('[data-import]').forEach(b=>b.onclick=()=>run(()=>openImport(b.dataset.import)));
 document.querySelectorAll('[data-report]').forEach(b=>b.onclick=()=>run(()=>createReport(b.dataset.report)));
 $('submissionFile').onchange=e=>{const f=e.target.files[0];if(f)run(()=>processFile(f));};
 $('fileDrop').ondragover=e=>e.preventDefault();$('fileDrop').ondrop=e=>{e.preventDefault();if(e.dataTransfer.files.length!==1){$('importProgress').textContent='Import one file at a time.';return;}run(()=>processFile(e.dataTransfer.files[0]));};
 $('fileDrop').onkeydown=e=>{if(e.target===$('fileDrop')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();$('submissionFile').click();}};
 $('acceptImport').onclick=()=>run(async()=>{try{await acceptImport();}finally{$('acceptImport').disabled=false;}});$('recordAudio').onclick=()=>run(startRecording);$('closeImport').onclick=()=>{$('importDialog').close();cancelImport();};$('importDialog').onclose=cancelImport;$('closeReport').onclick=()=>$('reportDialog').close();
 $('passwordForm').onsubmit=e=>{e.preventDefault();run(async()=>{const {error}=await sb.auth.updateUser({password:$('newPassword').value});if(error){$('passwordMessage').textContent=error.message;return;}$('newPassword').value='';$('passwordDialog').close();history.replaceState(null,'',location.pathname);await listCycles();});};
 document.addEventListener('input',e=>{if(e.target.closest('.view'))markDirty();});document.addEventListener('click',e=>{if(e.target.closest('.cl-card,.rc,.sail-row'))markDirty();});
 window.addEventListener('beforeunload',e=>{if(dirty||saving||importing){e.preventDefault();e.returnValue='';}});
 window.VistaCloud={save:()=>run(save),report:stage=>run(()=>createReport(stage)),import:stage=>run(()=>openImport(stage)),changed:markDirty};
}
mount();
sb.auth.onAuthStateChange((event,session)=>{setTimeout(()=>sessionChanged(session,event).catch(e=>alertStatus(e.message)),0);});
const {data,error}=await sb.auth.getSession();if(error)$('authMessage').textContent=error.message;else await sessionChanged(data.session,'INITIAL_SESSION');
