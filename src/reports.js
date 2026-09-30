export const STAGES = {initial:'Initial Audit',ahtr:'AHTR',final:'Final Audit'};
export const FIELDS = {
 initial:[['task','Task and intended thinking'],['learningEvidence','Evidence of student learning and why I trust it'],['humanAI','Predicted AI capabilities and student responsibilities'],['classifier','Types of learning'],['rating','Initial estimate of AI offloading'],['sail','Initial SAIL level'],['sailJustify','Reason for this SAIL level'],['light_reflection.lr1','Question to check'],['min_reflection.min_r1','What students demonstrate themselves'],['min_reflection.min_r2','Learning goal protected'],['min_reflection.min_r3','How AI has changed my understanding of this assessment'],['min_reflection.min_r4','Blind spots and evidence that could change my judgment'],['min_reflection.min_exemplar','Evidence plan, trust, limitations, and follow-up']],
 ahtr:[['deepdive.prediction','Prediction before testing with AI'],['deepdive.dd1','What the AI trial showed'],['deepdive.dd2','Checking accuracy and reasoning'],['deepdive.dd3','Classroom context and learning risks'],['deepdive.dd4','Redesign decision and final SAIL level'],['deepdive.dd4redesign','Revised task'],['deepdive.standaloneSail','SAIL level entered during the routine']],
 final:Array.from({length:9},(_,i)=>['final_audit.fq'+(i+1),['Unexpected student thinking','Where AI supported or replaced thinking','What the evidence shows and leaves unclear','What was difficult to balance','Assumptions confirmed or challenged','Next question to investigate','What changed in my understanding of AI','What to keep or change','What to share with a colleague'][i]])
};
const typeNames={proc:'Procedural',conc:'Conceptual',eval:'Evaluative',crea:'Creative',emb:'Embodied / tacit'};
const ratingNames={full:'Fully',subs:'Substantially',part:'Partially',min:'Minimally'};
export function valueAt(obj,path){return path.split('.').reduce((v,k)=>v?.[k],obj);}
export function stageHasContent(snapshot,stage){return Boolean(snapshot.submissions?.[stage]?.text?.trim() || FIELDS[stage].some(([p])=>{const v=valueAt(snapshot,p);return Array.isArray(v)?v.length:typeof v==='string'&&v.trim();}));}
export function handoff(stage){
 const focus={initial:'Help me test my assumptions about what AI could do and prepare for the AHTR. Ask me to predict before suggesting changes.',ahtr:'Help me examine my redesign, decide what student evidence to collect, and plan a manageable independent check of learning.',final:'Help me compare intentions with observed evidence, consider alternative explanations, and choose one next change or transfer task.'};
 return `Use this VISTA report as context. ${focus[stage]} Separate my observations from your interpretations. Do not fill missing responses or claim learning improved without evidence. Ask one useful question at a time and wait for my answer. Use the sources in this workspace when relevant and identify which source supports a claim. Help me think through the decisions; keep the final choices with me.`;
}
export function buildReport({title,stage,snapshot,createdAt=new Date().toISOString()}) {
 if(!STAGES[stage]) throw new Error('Unknown report stage');
 if(!stageHasContent(snapshot,stage)) throw new Error('Add a response or reviewed submission before creating this report.');
 const lines=[`VISTA — ${STAGES[stage]} report`,`Task / cycle: ${title}`,`Created: ${createdAt}`,`Teacher: ${snapshot.meta?.teacher||'Not provided'}`,`Department: ${snapshot.meta?.discipline||'Not provided'}`,'', 'This report records the teacher’s submitted responses. Empty fields are marked; they are not inferred.',''];
 const stages=Object.keys(STAGES).slice(0,Object.keys(STAGES).indexOf(stage)+1);
 for(const part of stages){
   lines.push(`## ${STAGES[part]}`);
   const submission=snapshot.submissions?.[part];
   if(submission?.text?.trim()) lines.push('### Reviewed full submission',submission.text,'');
   if(submission?.sources?.length) lines.push('Source files: '+submission.sources.map(s=>s.name).join(', '),'');
   for(const [path,label] of FIELDS[part]) {
     let value=valueAt(snapshot,path);
     if(path==='classifier') value=(value||[]).map(t=>typeNames[t]||t).join(', ');
     if(path==='rating') value=ratingNames[value]||value;
     if(path.startsWith('min_reflection')&&!value) continue;
     lines.push(`### ${label}`,String(value|| (submission?.text?.trim()?'See reviewed full submission; no separate field response.':'Not provided.')),'');
   }
 }
 lines.push('## Continue your analysis','Download this report and add it to your NotebookLM notebook, Gem, or Project. Review it for student-identifying details before sharing. Then paste the prompt below.','','### Handoff prompt',handoff(stage));
 return lines.join('\n');
}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function reportHTML(text,title='VISTA report') {return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHTML(title)}</title><style>body{font:15px/1.6 system-ui;max-width:850px;margin:40px auto;padding:20px;color:#17323d}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}@media print{body{margin:0}}</style></head><body><pre>${escapeHTML(text)}</pre></body></html>`;}
