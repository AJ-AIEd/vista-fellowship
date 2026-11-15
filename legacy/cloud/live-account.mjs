import assert from 'node:assert/strict';
import {config} from '../src/config.js';
import {accountAddress} from '../src/auth.js';
import {buildReport} from '../src/reports.js';
const stamp=Date.now(),password=crypto.randomUUID()+'Aa1!';
async function request(path,token,method='GET',body,extra={}){const r=await fetch(config.url+path,{method,signal:AbortSignal.timeout(20000),headers:{apikey:config.key,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json',...extra},body:body===undefined?undefined:JSON.stringify(body)});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}return {ok:r.ok,status:r.status,data};}
const users=[];let cycle,path;
try{
 for(let i=0;i<2;i++){const email=accountAddress('vista-check-'+stamp+'-'+i);const r=await request('/auth/v1/signup',null,'POST',{email,password});assert.equal(r.ok,true,JSON.stringify(r.data));assert.ok(r.data.access_token);users.push({...r.data,email});}console.log('PASS: name/password account creation');
 const [a,b]=users,token=a.access_token,owner=a.user.id;
 const made=await request('/rest/v1/vista_cycles',token,'POST',{title:'Disposable integration check',user_id:owner,draft:{}},{Prefer:'return=representation'});assert.equal(made.ok,true,JSON.stringify(made.data));cycle=made.data[0].id;
 const draft={task:'Students compare explanations',learningEvidence:'Independent transfer task',humanAI:'Students justify choices',sail:'L1, L3',deepdive:{dd1:'AI trial'},final_audit:{fq1:'Observed evidence'}};
 const saved=await request('/rest/v1/rpc/vista_save_cycle',token,'POST',{p_id:cycle,p_revision:0,p_title:'Disposable integration check',p_draft:draft});assert.ok(saved.ok,JSON.stringify(saved.data));assert.equal(saved.data[0].revision,1);
 assert.equal((await request('/rest/v1/rpc/vista_save_cycle',token,'POST',{p_id:cycle,p_revision:0,p_title:'Stale',p_draft:{}})).ok,false);
 for(const stage of ['initial','ahtr','final']){const r=await request('/rest/v1/vista_reports',token,'POST',{cycle_id:cycle,user_id:owner,stage,snapshot:draft,report_text:buildReport({title:'Check',stage,snapshot:draft})});assert.ok(r.ok,JSON.stringify(r.data));}
 const reports=await request('/rest/v1/vista_reports?select=stage&cycle_id=eq.'+cycle,token);assert.equal(reports.data.length,3);console.log('PASS: saved cycle, three report stages, stale-save rejection');
 path=owner+'/'+cycle+'/'+crypto.randomUUID();const text='Teacher submission';const upload=await fetch(config.url+'/storage/v1/object/vista-submissions/'+path,{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+token,'Content-Type':'text/plain'},body:text,signal:AbortSignal.timeout(20000)});assert.ok(upload.ok,await upload.text());
 const download=await request('/storage/v1/object/authenticated/vista-submissions/'+path,token);assert.equal(download.data,text);
 for(const table of ['vista_cycles','vista_reports','vista_files']){const r=await request('/rest/v1/'+table+'?select=id&'+(table==='vista_cycles'?'id':'cycle_id')+'=eq.'+cycle,b.access_token);assert.ok(r.ok);assert.equal(r.data.length,0);}
 assert.equal((await request('/storage/v1/object/authenticated/vista-submissions/'+path,b.access_token)).ok,false);
 assert.equal((await request('/rest/v1/rpc/vista_save_cycle',b.access_token,'POST',{p_id:cycle,p_revision:1,p_title:'Other user',p_draft:{}})).ok,false);console.log('PASS: private file upload/download and cross-account isolation');
 await request('/auth/v1/logout',token,'POST',{});
 const login=await request('/auth/v1/token?grant_type=password',null,'POST',{email:a.email,password});assert.ok(login.ok);a.access_token=login.data.access_token;
 const restored=await request('/rest/v1/vista_cycles?select=draft&id=eq.'+cycle,a.access_token);assert.deepEqual(restored.data[0].draft,draft);console.log('PASS: sign-out/sign-in restores saved teacher work');
}finally{const token=users[0]?.access_token;if(path)await request('/storage/v1/object/vista-submissions',token,'DELETE',{prefixes:[path]});if(cycle)await request('/rest/v1/vista_cycles?id=eq.'+cycle,token,'DELETE');for(const u of users)await request('/auth/v1/logout',u.access_token,'POST',{});}
