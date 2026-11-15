import {COPY} from './studio-content.js';
import {exampleCycle} from './example.js';
import {stageName} from './reports.js';

export function installStudio({snapshot, changed}) {
 const F=window.VistaForm, $=id=>document.getElementById(id);
 const query=new URLSearchParams(location.search);
 const concept=['guided','notebook','workspace'].includes(query.get('concept'))?query.get('concept'):'workspace';
 document.body.dataset.concept=concept;
 let support=concept==='guided'?'guided':'independent';
 try {if(!query.has('concept')) support=localStorage.getItem('vista.studio.support')||support;}catch{}
 if(!['independent','guided','supported'].includes(support))support='independent';
 let learning={}, annotations=[], sectionIndex=0, lastView='', lastLang='', entry='tools';
 const lang=()=>F.lang()==='es'?'es':'en', c=()=>COPY[lang()];
 const n=(tag,props={},kids=[])=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(props)){if(k==='text')e.textContent=v;else if(k==='class')e.className=v;else if(k.startsWith('on'))e[k]=v;else if(v!==undefined&&v!==false)e.setAttribute(k,v===true?'':v);}e.append(...[].concat(kids).filter(Boolean));return e;};
 const button=(text,fn,cls='')=>n('button',{type:'button',text,onclick:fn,class:cls});
 const download=(text,name)=>{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=n('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function collect(){const out={...learning};document.querySelectorAll('[data-learning]').forEach(e=>out[e.dataset.learning]=e.value);return out;}
 function capture(){return {learning:collect(),annotations:structuredClone(annotations)};}
 function dirty(){learning=collect();changed();}
 function setEntry(next,arc){entry=next;learning=collect();learning.entry=next;if(arc!==undefined)learning.arc=String(arc);renderLearn();F.show('learn');dirty();}
 const sidebar=n('aside',{class:'studio-sidebar','aria-label':c().home});
 const menu=n('details',{class:'studio-menu',open:innerWidth>=1000});
 menu.append(n('summary',{id:'workspaceMenu'},[n('span',{id:'workspaceMenuLabel',text:c().home}),n('span',{id:'mobileSaveIndicator',class:'mobile-save',role:'status',text:$('saveIndicator')?.textContent||''})]));
 const arcNav=n('div',{class:'arc-nav'}), cycleWrap=n('div',{class:'cycle-navigation'});
 const stagebar=$('stagebar');
 sidebar.append(menu);menu.append(arcNav,cycleWrap);cycleWrap.append(n('h2',{class:'rail-label',text:c().cycle}),stagebar);
 document.body.insertBefore(sidebar,$('main'));
 matchMedia('(min-width:1000px)').addEventListener('change',event=>{menu.open=event.matches;});
 const toolbar=n('div',{class:'studio-toolbar'});document.body.insertBefore(toolbar,$('main'));
 const accountButton=button(lang()==='es'?'Cuenta':'Sign in',async()=>{accountButton.disabled=true;try{const {openAccount}=await import('./account.js');await openAccount({snapshot,returnFocus:accountButton,importCopy:(title,draft)=>window.VistaLocal.importCopy(title,draft),lang:lang()});}catch{alert(lang()==='es'?'No se pudo abrir la cuenta. Puedes seguir trabajando como invitado.':'Account access could not open. You can keep working as a guest.');}finally{accountButton.disabled=false;}},'nav-account');accountButton.id='accountButton';document.querySelector('.nav-right').prepend(accountButton);
 const learnView=n('div',{class:'view',id:'view-learn'});$('main').append(learnView);
 const help=n('aside',{class:'support-tray',id:'studioHelp','aria-label':c().help});
 const guided=n('div',{class:'focus-controls',id:'focusControls'});
 function closeMenu(){if(innerWidth<1000)menu.open=false;}
 function navigation(){arcNav.replaceChildren(n('a',{href:'/',class:'rail-home',text:c().home}),n('h2',{class:'rail-label',text:c().arcs}),...c().arcNames.map((name,i)=>button(name,()=>{setEntry('dilemma',i);closeMenu();},'arc-link')),button(c().learn,()=>{setEntry(entry);closeMenu();},'arc-link'));
  cycleWrap.querySelector('h2').textContent=c().cycle;$('workspaceMenuLabel').textContent=c().home;
 }
 function renderToolbar(){const label=n('label',{for:'supportMode',text:c().support});const select=n('select',{id:'supportMode','aria-label':c().support,'aria-describedby':'supportPreferenceNote',onchange:e=>{learning=collect();support=e.target.value;try{localStorage.setItem('vista.studio.support',support);}catch{}applyGuided();renderHelp();}});
  for(const[value,text]of c().modes){const o=n('option',{value,text});o.selected=value===support;select.append(o);}
  const hint=n('span',{id:'supportPreferenceNote',class:'visually-hidden',text:c().supportNote});
  toolbar.replaceChildren(label,select,hint,button(c().prepare,conversation,'conversation-button'));
 }
 function hub(){const inner=document.querySelector('.launch-inner');
  const resume=$('startResume')||button('Resume',()=>window.VistaLocal.resume());resume.id='startResume';
  const paths=n('div',{class:'entry-paths'},c().paths.map(([key,title,desc],i)=>{
    const b=button('',()=>key==='assessment'?window.VistaLocal.begin():setEntry(key),'entry-path');
    b.append(n('span',{class:'entry-number',text:`0${i+1}`}),n('span',{class:'entry-copy'},[n('strong',{text:title}),n('span',{text:desc})]),n('span',{'aria-hidden':'true',text:'↗'}));
    if(key==='assessment'){b.id='startOwn';b.classList.add('path-btn');const wrap=n('div',{class:'path-a'},b);return wrap;}return b;
  }));
  const startExample=button(c().example,()=>window.VistaLocal.example(),'start-secondary');startExample.id='startExample';
  const arcDetails=n('details',{class:'arc-overview'},[n('summary',{text:c().arcs}),n('ol',{},c().arcNames.map((a,i)=>n('li',{},[button(a,()=>setEntry('dilemma',i)),n('p',{text:c().arcQuestions[i]})])))]);
  inner.replaceChildren(n('p',{class:'studio-kicker',text:c().kicker}),n('h1',{text:c().title}),n('p',{class:'hub-intro',text:c().intro}),n('p',{class:'beacon-principle',text:lang()==='es'?'Ser un faro no significa tener todas las respuestas. Significa ayudar a encontrar un camino.':'Becoming a lighthouse is not knowing every answer. It is helping others find a path.'}),resume,paths,n('div',{class:'hub-secondary'},[startExample,n('a',{href:'/prototypes',text:c().concepts})]),n('p',{class:'start-privacy',text:c().saved}),n('section',{class:'hub-framework'},[n('h2',{text:c().journey}),n('p',{text:c().journeyText}),arcDetails,button(c().openCycle,()=>F.show('initial'),'studio-primary')]));
 }
 function field(key){const id=`learning-${key}`;return n('div',{class:'learning-field'},[n('label',{for:id,text:c()[key]}),n('textarea',{id,'data-learning':key,rows:key==='question'?3:4,oninput:dirty})]);}
 function renderLearn(){learning=collect();const copy=c();const head=entry==='tools'?copy.toolsHead:entry==='research'?copy.researchHead:copy.dilemmaHead;
  const header=n('header',{class:'learning-header'},[n('p',{class:'studio-kicker',text:copy.kicker}),n('h1',{text:head,tabindex:'-1'}),n('p',{text:copy.learnSub})]);
  const workflow=n('section',{class:'workflow-guide'});
  const arc=Number(learning.arc);if(learning.arc!==undefined&&learning.arc!==''&&copy.arcNames[arc])workflow.append(n('h2',{text:copy.arcNames[arc]}),n('p',{class:'arc-question',text:copy.arcQuestions[arc]}));
  if(entry==='tools'){
    for(const[title,text]of copy.toolSteps)workflow.append(n('details',{open:support==='supported'},[n('summary',{text:title}),n('p',{text})]));
    workflow.append(n('details',{},[n('summary',{text:copy.toolPromptLabel}),n('p',{text:copy.toolPrompt})]),n('p',{class:'workflow-caution',text:copy.toolLimits}),n('a',{href:'https://support.google.com/gemininotebook/answer/16179559?hl='+lang(),target:'_blank',rel:'noopener noreferrer',text:lang()==='es'?'Ayuda oficial de Google ↗':'Google’s source-checking guide ↗'}));
  } else workflow.append(n('ol',{},(entry==='research'?copy.researchSteps:copy.dilemmaSteps).map(text=>n('li',{text}))),entry==='research'?n('p',{text:copy.researchNote}):null);
  workflow.append(n('details',{},[n('summary',{text:copy.noAI}),n('p',{text:copy.noAIBody})]));
  if(entry==='tools') {
    workflow.append(details(copy.compareTools,[n('p',{text:copy.compareToolsIntro}),n('p',{class:'prompt-example',text:copy.comparisonPrompt}),n('p',{text:copy.compareToolLimits}),n('a',{href:'/field-guide',text:lang()==='es'?'Guía de las cuatro herramientas →':'A field guide to the four tools →'})]));
  }
  const fields=n('section',{class:'learning-notes'},[n('h2',{text:copy.learn}),...['question','responsibility'].map(field),details(lang()==='es'?'Después de explorar':'After your exploration',['sources','checked','insight','next'].map(field),true),details(lang()==='es'?'Aprender con alguien':'Learning with someone',['supportOrigin','supportNeed'].map(field))]);
  if(entry==='tools'){const comparison=details(copy.compareTools,['prompt','modelA','modelB','outputA','outputB','noticed','implication'].map(field),query.get('activity')==='compare');comparison.id='modelComparison';fields.append(comparison);}
  if(entry==='tools')fields.prepend(experiments());
  fields.append(inquiryNotes());
  const returnStage=['initial','deepdive','redesign','implementation','final','reflection'].includes(learning.returnStage)?learning.returnStage:'initial';
  const forward=button(lang()==='es'?'Volver a mi trabajo de evaluación':'Return to my assessment work',()=>F.show(returnStage),'studio-primary');
  learnView.replaceChildren(header,n('div',{class:'learning-layout'},[workflow,fields]),n('div',{class:'learning-actions'},[forward,button(copy.prepare,conversation),button(lang()==='es'?'Guardar ahora':'Save now',()=>window.VistaLocal.save())]));
  document.querySelectorAll('[data-learning]').forEach(e=>e.value=learning[e.dataset.learning]||'');
 }
 function experiments(){
  const es=lang()==='es';
  const purposes=es?['Investigar e informarse','Pensar y cuestionar','Crear y diseñar','Apoyar el aprendizaje','Evaluar y gobernar']:['Investigate and research','Think and critique','Create and design','Support and facilitate learning','Evaluate and govern'];
  const tasks=es?['Compara un resumen con el artículo original. Localiza una omisión que cambie su interpretación.','Pide una interpretación alternativa. Busca la evidencia que apoya o contradice cada lectura.','Crea dos versiones de una actividad. Examina qué razonamiento exige cada una al estudiante.','Prueba un diálogo guiado con respuestas ficticias, incluida una superficial. ¿La ayuda revela o sustituye el pensamiento?','Examina una afirmación importante sobre privacidad, sesgo o fiabilidad. Identifica la fuente y lo que falta verificar.']:['Compare a summary against the original article. Locate an omission that changes its interpretation.','Request an alternative interpretation. Locate evidence supporting or challenging each reading.','Create two versions of an activity. Examine what reasoning each asks students to do.','Test a guided dialogue with fictional responses, including a shallow one. Does the help reveal or replace thinking?','Examine a consequential privacy, bias, or reliability claim. Identify its source and what remains unverified.'];
  const select=n('select',{id:'learning-purpose','data-learning':'purpose',onchange:()=>{dirty();instruction.textContent=tasks[Number(select.value)]||tasks[0];}});
  purposes.forEach((name,i)=>select.append(n('option',{value:String(i),text:name})));select.value=learning.purpose||'0';
  const instruction=n('p',{id:'experimentInstruction',text:tasks[Number(select.value)]||tasks[0]});
  return n('section',{class:'experiment-plan'},[n('h2',{text:es?'Elige una investigación pequeña':'Choose one small investigation'}),n('label',{for:'learning-purpose',text:es?'Propósito educativo':'Educational purpose'}),select,instruction,n('p',{text:es?'Usa material permitido o ficticio. Anota tu predicción, realiza la prueba en una herramienta externa y trae el resultado. VISTA no genera respuestas de IA.':'Use permitted or fictional material. Record your prediction, run the trial in an external tool, and bring the result back. VISTA does not generate AI responses.'}),field('prediction'),field('claimType')]);
 }
 function inquiryNotes(){return details(lang()==='es'?'Ideas en desarrollo y juicio profesional':'Emerging ideas and professional judgment',[
  n('p',{text:lang()==='es'?'Una nota breve basta. Es una hipótesis, no una decisión final ni evidencia de mejora. Puedes conservarla, revisarla o descartarla. Una idea principal por ciclo; crea otro ciclo si quieres investigar otra.':'A brief note is enough. This is a hypothesis, not a final decision or evidence of improvement. Retain, revise, explore, or discard it. Keep one main idea per cycle; create another cycle for a separate inquiry.'}),
  ...['idea','prompted','whyIdea','investigate','outcomes','ideaStatus'].map(field),
  details(lang()==='es'?'Conectar tecnología, materia, pedagogía y contexto':'Connect technology, subject, pedagogy, and context',[
   n('p',{text:lang()==='es'?'Usa solo las preguntas que ayuden. Elegir una herramienta no resuelve estas relaciones.':'Use only the prompts that help. Selecting a tool does not resolve these relationships.'}),...['possible','replace','assumption','alternative','verify'].map(field)]),
  details(lang()==='es'?'Preparar una propuesta para colegas':'Prepare a proposal for colleagues',[field('proposal')])]);}
 function details(title,body,open=false){return n('details',{open},[n('summary',{text:title}),...body]);}
 function exampleText(view){const d=exampleCycle(lang()).draft;return {initial:d.humanAI,deepdive:d.deepdive.dd1,redesign:d.deepdive.dd4,implementation:d.implementation.evidence,final:d.final_audit.fq3,reflection:d.next.uncertain}[view]||'';}
 function renderHelp(){const view=F.view(),texts=c().stageHelp[view];if(!texts){help.remove();return;}
  const active=$('view-'+view),body=active.querySelector('.audit-body,.dd-body');
  if(!body)return;
  help.replaceChildren(n('h2',{text:c().help}),n('p',{class:'workflow-caution',text:lang()==='es'?'Este espacio permite apoyo y exploración. No es la línea de base independiente de competencias en IA.':'This workspace allows support and exploration. It is separate from the independent Initial AI Competency Baseline.'}),details(c().why,[n('p',{text:texts[0]})],support==='supported'),details(c().steps,[n('p',{text:texts[1]})],support==='supported'),details(c().exampleLabel,[n('p',{class:'example-label',text:lang()==='es'?'Ejemplo ficticio · no es evidencia de una clase':'Synthetic example · not classroom evidence'}),n('p',{text:exampleText(view)})]));
  if(view==='initial')help.append(details(lang()==='es'?'¿Qué es SAIL y de dónde viene?':'What is SAIL, and where does it come from?',[
    n('p',{text:lang()==='es'?'SAIL es el nombre local de las cinco opciones para definir qué papel puede tener la IA en una tarea. No mide la capacidad del estudiante ni la competencia del docente. Las opciones son una adaptación local de la AI Assessment Scale (AIAS), de Perkins, Furze, Roe y MacVaugh (2024); no son la versión oficial actual de AIAS. Elige según el aprendizaje que buscas.':'SAIL is the local name for five options describing the role AI may play in a task. It does not measure student ability or teacher competence. These options are a local adaptation of the AI Assessment Scale (AIAS), developed by Perkins, Furze, Roe and MacVaugh (2024); they are not the current official AIAS wording. Choose according to the learning you want.'}),
    n('a',{href:'https://doi.org/10.53761/q3azde36',target:'_blank',rel:'noopener noreferrer',text:lang()==='es'?'Investigación original: AIAS (2024) ↗':'Original AIAS research (2024) ↗'}),
    n('p',{class:'workflow-caution',text:lang()==='es'?'La atribución no establece permiso para reutilización comercial; los derechos siguen en revisión.':'Attribution does not establish commercial reuse permission; rights remain under review.'})
  ]));
  if(view==='initial'){
    const step=$('step5');
    if(step&&!step.querySelector('.sail-context')){const explain=n('p',{class:'sail-context'},[n('span',{text:lang()==='es'?'SAIL nombra cinco opciones para el papel de la IA en la tarea; no son niveles de competencia. Adaptación local de AIAS. ':'SAIL names five options for AI’s role in a task; they are not levels of competence. Locally adapted from AIAS. '}),n('a',{href:'https://doi.org/10.53761/q3azde36',target:'_blank',rel:'noopener noreferrer',text:'Perkins, Furze, Roe & MacVaugh (2024) ↗'})]);step.querySelector('.step-head')?.after(explain);}
  }
  help.append(button(lang()==='es'?'Explorar una posibilidad y volver aquí':'Explore a possibility and return here',()=>{learning=collect();learning.returnStage=view;setEntry('tools');}));
  if(view==='initial')help.append(details(c().annotations,[n('p',{text:c().annotateHelp}),button(c().annotate,annotationDialog),annotationList()]));
  if(view==='redesign'){
    const d=snapshot();help.append(details(c().compare,[n('p',{text:c().compareNote}),n('div',{class:'task-comparison'},[n('section',{},[n('h3',{text:c().before}),n('p',{id:'comparisonBefore',text:d.task||c().noOriginal})]),n('section',{},[n('h3',{text:c().after}),n('p',{id:'comparisonAfter',text:d.deepdive?.dd4redesign||c().noRevision})])])]));
  }
  body.prepend(help);
 }
 function annotationList(){const list=n('div',{class:'annotation-list'});if(!annotations.length)list.append(n('p',{text:c().annotationEmpty}));
  annotations.forEach((a,i)=>list.append(n('article',{},[n('blockquote',{text:a.quote}),n('p',{text:a.note}),button(c().remove,()=>{annotations.splice(i,1);changed();renderHelp();})])));return list;
 }
 function annotationDialog(){const d=n('dialog',{class:'vista-dialog','aria-labelledby':'annotationTitle'});const task=$('s1task');const selected=task?.value.slice(task.selectionStart,task.selectionEnd)||'';
  const quote=n('textarea',{id:'annotationQuote',required:true,rows:3}), note=n('textarea',{id:'annotationNote',required:true,rows:4});quote.value=selected;
  const error=n('p',{role:'status'});
  const form=n('form',{onsubmit:e=>{e.preventDefault();if(!(task?.value||'').includes(quote.value.trim())){error.textContent=lang()==='es'?'El pasaje debe aparecer en la tarea original.':'The passage must appear in the original task.';return;}if(annotations.length>=100){error.textContent=lang()==='es'?'Máximo de 100 anotaciones.':'Maximum of 100 annotations.';return;}annotations.push({quote:quote.value.trim(),note:note.value.trim()});changed();d.close();renderHelp();}},[n('h2',{id:'annotationTitle',text:c().annotate}),n('label',{for:'annotationQuote',text:c().quote}),quote,n('label',{for:'annotationNote',text:c().note}),note,error,n('button',{type:'submit',text:c().keep}),button(lang()==='es'?'Cancelar':'Cancel',()=>d.close())]);
  d.append(form);document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();quote.focus();
 }
 function conversation(){const data=snapshot(), currentStage={deepdive:'ahtr',learn:'initial'}[F.view()]||F.view();const tx=c();
  const fields=[[lang()==='es'?'Tarea':'Task',data.task],[tx.question,data.learning?.question],[tx.responsibility,data.learning?.responsibility],[lang()==='es'?'Predicción':'Prediction',data.humanAI],[lang()==='es'?'Decisión':'Decision',data.deepdive?.dd4],[lang()==='es'?'Evidencia':'Evidence',data.implementation?.evidence],[tx.insight,data.learning?.insight||data.next?.uncertain],[tx.supportOrigin,data.learning?.supportOrigin],[tx.supportNeed,data.learning?.supportNeed],[tx.next,data.learning?.next],...['idea','prompted','whyIdea','investigate','outcomes','ideaStatus','proposal'].map(key=>[c()[key],data.learning?.[key]])];
  const text=[`VISTA — ${tx.prepare}`,data.meta?.assessment||'',stageName(currentStage,lang())||tx.learn,'',...fields.flatMap(([label,value])=>[label,value||tx.noAnswer,''])].join('\n');
  const d=n('dialog',{class:'vista-dialog','aria-labelledby':'conversationTitle'}), out=n('textarea',{id:'conversationText',readonly:true,rows:16,'aria-label':tx.preview});out.value=text;
  d.append(n('h2',{id:'conversationTitle',text:tx.prepare}),n('p',{text:tx.prepareNote}),out,button(tx.download,()=>download(text,'vista-conversation.txt')),button(lang()==='es'?'Cerrar':'Close',()=>d.close()));document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();
 }
 function applyGuided(){document.querySelectorAll('.focus-hidden').forEach(e=>e.classList.remove('focus-hidden'));guided.remove();
  const view=$('view-'+F.view()),body=view?.querySelector('.audit-body,.dd-body');if(!body||support!=='guided')return;
  const blocks=[...body.children].filter(e=>e.matches('.step-block,.dd-section'));
  if(!blocks.length)return;sectionIndex=Math.min(Math.max(sectionIndex,0),blocks.length-1);
  blocks.forEach((b,i)=>b.classList.toggle('focus-hidden',i!==sectionIndex));
  const prev=button(c().back,()=>{sectionIndex--;applyGuided();guided.focus();});prev.disabled=sectionIndex===0;
  const next=button(c().forward,()=>{sectionIndex++;applyGuided();guided.focus();});next.disabled=sectionIndex===blocks.length-1;
  guided.tabIndex=-1;guided.replaceChildren(n('span',{role:'status',text:`${c().section} ${sectionIndex+1} ${c().of} ${blocks.length}`}),prev,next,button(c().all,()=>{support='independent';renderToolbar();applyGuided();}));body.prepend(guided);
 }
 function refresh(){const view=F.view(),language=lang();document.body.dataset.notebookDocument=String(concept==='notebook'&&!['launch','learn','refs'].includes(view));if(language!==lastLang){learning=collect();navigation();renderToolbar();hub();renderLearn();accountButton.textContent=language==='es'?'Cuenta':'Sign in';lastLang=language;lastView='';}
  if(view!==lastView){const heading=$('view-'+view)?.querySelector('.ah-title,.dd-title');if(heading){heading.setAttribute('role','heading');heading.setAttribute('aria-level',concept==='notebook'?'2':'1');}sectionIndex=0;renderHelp();applyGuided();lastView=view;closeMenu();if(concept==='notebook'&&document.body.dataset.notebookDocument==='true')$('view-'+view)?.scrollIntoView({behavior:'instant',block:'start'});}
  document.querySelectorAll('.studio-sidebar .nav-tab').forEach(tab=>tab.title=c().noScoring);
 }
 function load(draft){learning=structuredClone(draft.learning||{});annotations=structuredClone(draft.annotations||[]);entry=learning.entry||entry;document.querySelectorAll('[data-learning]').forEach(e=>e.value=learning[e.dataset.learning]||'');renderLearn();lastView='';refresh();}
 const nativeLoad=F.load;F.load=d=>{nativeLoad(d);load(d);};
 document.addEventListener('input',e=>{if(['dd4redesign','s1task'].includes(e.target.id)){if($('comparisonBefore'))$('comparisonBefore').textContent=$('s1task')?.value||c().noOriginal;if($('comparisonAfter'))$('comparisonAfter').textContent=$('dd4redesign')?.value||c().noRevision;}});
 window.VistaStudio={capture,refresh,load};
 load(window.VistaDraft||{});
 if(location.hash.includes('type=recovery'))queueMicrotask(()=>accountButton.click());
 if(query.has('concept')){const notice=n('div',{class:'concept-notice'},[n('span',{text:`${c().prototype}: ${c().protoNames[concept]}`}),n('a',{href:'/prototypes',text:c().concepts})]);toolbar.after(notice);}
 const requested=query.get('entry');if(['tools','dilemma','research'].includes(requested))setEntry(requested);
 if(query.get('activity')==='compare')$('learning-prompt')?.focus({preventScroll:true});
}
