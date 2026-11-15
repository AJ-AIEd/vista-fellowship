// Account-free workspace for the VISTA tool: cycles, autosave, backups, reports, imports.
// All data stays in this browser. This module makes no network requests.
import {createStore, StoreError, draftHasContent, INDEX_KEY} from './store.js';
import {STAGE_ORDER, stageName, stageHasContent, buildReport, reportDocument, handoff} from './reports.js';
import {exampleCycle} from './example.js';

const F = window.VistaForm;
const $ = id => document.getElementById(id);
const LANG_KEY = 'vista.v3.lang', VIEW_KEY = 'vista.v3.view.';
const STAGE_VIEW = {initial: 'initial', ahtr: 'deepdive', redesign: 'redesign', implementation: 'implementation', final: 'final', reflection: 'reflection'};
const VIEW_STAGE = Object.fromEntries(Object.entries(STAGE_VIEW).map(([s, v]) => [v, s]));
const STAGE_TAB = {initial: 'navInitial', ahtr: 'navDeep', redesign: 'navRedesign', implementation: 'navImpl', final: 'navFinal', reflection: 'navReflect'};

const T = {
  en: {
    untitled: 'Untitled cycle', none: 'No cycle yet', saved: 'Saved on this device', saving: 'Saving…', unsaved: 'Not saved yet', idle: 'Saves automatically in this browser',
    failed: 'Not saved', blocked: 'This browser is not allowing VISTA to save (private window, blocked storage, or storage full). Your notes are still on this page. Download them now so nothing is lost.',
    download_now: 'Download my notes', conflict: 'This cycle was changed in another tab or window.', keep_mine: 'Keep this tab’s version', load_other: 'Load the other version',
    updated_elsewhere: 'Updated from another tab', deleted_elsewhere: 'This cycle was deleted in another tab. Your notes are still on this page; saving will store them as a new cycle.',
    example_notice: 'You are viewing a worked example. Every response is synthetic, written to illustrate the process; it is not a record of a real class. You can edit it freely.', start_own: 'Start my own cycle',
    recovered: 'A draft saved by an earlier version of VISTA was found in this browser and has been brought into your cycles.',
    resume: 'Resume', at: 'at',
    cycles_title: 'My cycles', cycles_intro: 'Each cycle follows one assessment from first audit to reflection. Cycles are stored in this browser on this device only.',
    open: 'Open', current: 'Open now', rename: 'Rename', save_name: 'Save name', export: 'Export', del: 'Delete', confirm_del: 'Delete permanently', cancel: 'Cancel', example: 'Example',
    updated: 'Updated', no_cycles: 'No saved cycles yet. A cycle is created when you start writing.',
    new_label: 'Name of the assessment', new_ph: 'e.g. Grade 10 source evaluation', new_btn: 'Start a new cycle',
    import_backup: 'Import a backup file', export_all: 'Download a backup of all cycles',
    storage_note: 'Browsers can remove this data: private windows, clearing history, some privacy settings, or long periods without visiting. Keep a backup file of anything you would not want to lose. A backup can be imported on another device.',
    usage: 'Stored here', close: 'Close', imported: 'cycle(s) imported', import_failed: 'This file could not be imported.', deleted: 'Cycle deleted', backup_done: 'Backup downloaded',
    report_title: 'Report', report_intro: 'A report sets out your own responses, stage by stage, up to the stage you choose. Nothing is scored or generated. Check it for student-identifying details before sharing.',
    report_stage: 'Include stages up to', print: 'Print or save as PDF', print_hint: 'In the print window, choose “Save as PDF” as the destination to keep a file.', download_text: 'Download as text (.md)', copy_prompt: 'Copy handoff prompt',
    copied: 'Copied', copy_failed: 'Copy did not work. Select the text and copy it manually.', report_empty: 'There is nothing to report yet. Add a response in any stage first.', preview: 'Report preview',
    import_title: 'Import text from a document', import_intro: 'Use this if you already wrote about this task elsewhere. The file is read on this device. It is not uploaded and the file itself is not kept: only the text you review below is saved with this cycle and included in your reports.',
    import_stage: 'This text belongs to', import_file: 'Choose a TXT, Markdown, searchable PDF, or DOCX file (25 MB or less)', import_text: 'Text to keep: review and edit', import_reviewed: 'I have reviewed this text and removed anything that identifies students.',
    import_accept: 'Save this text with the cycle', import_remove: 'Remove the saved text for this stage', import_need_review: 'Review the text, then tick the box.', import_need_text: 'Add some text first.', import_saved: 'Text saved with this cycle', import_removed: 'Saved text removed',
    import_ready: 'Text ready. Check that it is complete and remove any student names.', import_none: 'No text was found in this file.', import_long: 'This text is too long to store. Keep the parts that matter.', import_busy: 'Reading the file…',
    next_started: 'New cycle started. Your previous cycle is in My cycles.'
  },
  es: {
    untitled: 'Ciclo sin título', none: 'Aún no hay ciclo', saved: 'Guardado en este dispositivo', saving: 'Guardando…', unsaved: 'Sin guardar todavía', idle: 'Se guarda automáticamente en este navegador',
    failed: 'No guardado', blocked: 'Este navegador no permite que VISTA guarde (ventana privada, almacenamiento bloqueado o lleno). Tus notas siguen en esta página. Descárgalas ahora para no perder nada.',
    download_now: 'Descargar mis notas', conflict: 'Este ciclo se modificó en otra pestaña o ventana.', keep_mine: 'Conservar la versión de esta pestaña', load_other: 'Cargar la otra versión',
    updated_elsewhere: 'Actualizado desde otra pestaña', deleted_elsewhere: 'Este ciclo se eliminó en otra pestaña. Tus notas siguen en esta página; al guardar se almacenarán como un ciclo nuevo.',
    example_notice: 'Estás viendo un ejemplo resuelto. Todas las respuestas son ficticias, escritas para ilustrar el proceso; no es el registro de una clase real. Puedes editarlo libremente.', start_own: 'Comenzar mi propio ciclo',
    recovered: 'Se encontró en este navegador un borrador guardado por una versión anterior de VISTA y se añadió a tus ciclos.',
    resume: 'Continuar', at: 'en',
    cycles_title: 'Mis ciclos', cycles_intro: 'Cada ciclo sigue una evaluación desde la primera auditoría hasta la reflexión. Los ciclos se guardan solo en este navegador y en este dispositivo.',
    open: 'Abrir', current: 'Abierto ahora', rename: 'Renombrar', save_name: 'Guardar nombre', export: 'Exportar', del: 'Eliminar', confirm_del: 'Eliminar definitivamente', cancel: 'Cancelar', example: 'Ejemplo',
    updated: 'Actualizado', no_cycles: 'Aún no hay ciclos guardados. Un ciclo se crea cuando empiezas a escribir.',
    new_label: 'Nombre de la evaluación', new_ph: 'p. ej. Evaluación de fuentes, grado 10', new_btn: 'Comenzar un ciclo nuevo',
    import_backup: 'Importar una copia de seguridad', export_all: 'Descargar una copia de seguridad de todos los ciclos',
    storage_note: 'Los navegadores pueden borrar estos datos: ventanas privadas, borrado del historial, algunos ajustes de privacidad o largos periodos sin visitar el sitio. Conserva una copia de seguridad de lo que no quieras perder. Una copia puede importarse en otro dispositivo.',
    usage: 'Guardado aquí', close: 'Cerrar', imported: 'ciclo(s) importado(s)', import_failed: 'No se pudo importar este archivo.', deleted: 'Ciclo eliminado', backup_done: 'Copia de seguridad descargada',
    report_title: 'Informe', report_intro: 'Un informe presenta tus propias respuestas, etapa por etapa, hasta la etapa que elijas. Nada se califica ni se genera. Revisa que no identifique a estudiantes antes de compartirlo.',
    report_stage: 'Incluir las etapas hasta', print: 'Imprimir o guardar en PDF', print_hint: 'En la ventana de impresión, elige “Guardar como PDF” como destino para conservar un archivo.', download_text: 'Descargar como texto (.md)', copy_prompt: 'Copiar prompt de continuación',
    copied: 'Copiado', copy_failed: 'No se pudo copiar. Selecciona el texto y cópialo manualmente.', report_empty: 'Aún no hay nada que informar. Añade primero una respuesta en cualquier etapa.', preview: 'Vista previa del informe',
    import_title: 'Importar texto desde un documento', import_intro: 'Úsalo si ya escribiste sobre esta tarea en otro lugar. El archivo se lee en este dispositivo. No se sube y el archivo no se conserva: solo se guarda con este ciclo, y se incluye en tus informes, el texto que revises abajo.',
    import_stage: 'Este texto corresponde a', import_file: 'Elige un archivo TXT, Markdown, PDF con texto o DOCX (25 MB o menos)', import_text: 'Texto que se conservará: revísalo y edítalo', import_reviewed: 'Revisé este texto y quité todo lo que identifique a estudiantes.',
    import_accept: 'Guardar este texto con el ciclo', import_remove: 'Quitar el texto guardado de esta etapa', import_need_review: 'Revisa el texto y marca la casilla.', import_need_text: 'Añade primero un texto.', import_saved: 'Texto guardado con este ciclo', import_removed: 'Texto guardado eliminado',
    import_ready: 'Texto listo. Comprueba que esté completo y quita los nombres de estudiantes.', import_none: 'No se encontró texto en este archivo.', import_long: 'Este texto es demasiado largo para guardarlo. Conserva las partes importantes.', import_busy: 'Leyendo el archivo…',
    next_started: 'Nuevo ciclo iniciado. Tu ciclo anterior está en Mis ciclos.'
  }
};
const lang = () => (F.lang() === 'es' ? 'es' : 'en');
const tx = key => T[lang()][key] ?? T.en[key] ?? key;

let storage = null;
try { storage = window.localStorage; } catch { storage = null; }
const store = storage ? createStore(storage) : null;
let storageOK = Boolean(store && store.available());
let current = null;          // {id, rev} of the cycle open in this tab, or null before the first save
let submissions = {};        // reviewed imported text per stage
let dirty = false, timer = null, lastSaved = null, status = 'idle', conflicted = false;

// ── small helpers ────────────────────────────────────────────────────────────
function toast(message) { const t = $('toast'); if (!t) return; t.textContent = message; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3500); }
function download(text, name, type) {
  const url = URL.createObjectURL(new Blob([text], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
const slug = s => (String(s || 'vista').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'vista');
const today = () => new Date().toISOString().slice(0, 10);
const snapshot = () => ({...F.capture(), submissions: structuredClone(submissions)});
const titleOf = draft => (draft.meta?.assessment || '').trim();
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) { if (k === 'class') node.className = v; else if (k === 'text') node.textContent = v; else if (k.startsWith('on')) node[k] = v; else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : v); }
  node.append(...[].concat(children).filter(Boolean));
  return node;
}

// ── saving ───────────────────────────────────────────────────────────────────
function setStatus(next) {
  status = next;
  const node = $('saveIndicator'); if (!node) return;
  const time = lastSaved ? ' · ' + lastSaved.toLocaleTimeString(lang(), {hour: '2-digit', minute: '2-digit'}) : '';
  node.textContent = {idle: tx('idle'), saved: tx('saved') + time, saving: tx('saving'), unsaved: tx('unsaved'), failed: tx('failed')}[next];
  node.dataset.state = next;
}
function notice(message, actions = [], kind = 'info') {
  const bar = $('cycleNotice'); if (!bar) return;
  bar.replaceChildren();
  if (!message) { bar.hidden = true; document.body.classList.remove('has-notice'); return; }
  bar.dataset.kind = kind;
  bar.append(el('span', {text: message}), ...actions.map(([label, fn]) => el('button', {type: 'button', text: label, onclick: fn})));
  bar.hidden = false; document.body.classList.add('has-notice');
}
function changed() {
  dirty = true;
  if (status !== 'failed') setStatus('unsaved');
  clearTimeout(timer);
  timer = setTimeout(() => persist(), 700);
}
function emergencyDownload() {
  const draft = snapshot();
  download(JSON.stringify({format: 'vista-backup', version: 1, app: 'VISTA', exportedAt: new Date().toISOString(), cycles: [{title: titleOf(draft) || tx('untitled'), draft}]}, null, 2), `vista-notes-${today()}.json`, 'application/json');
}
function storageFailure() {
  setStatus('failed');
  notice(tx('blocked'), [[tx('download_now'), emergencyDownload]], 'error');
}
// Write the page's current state to this browser. Returns true when it is safely stored.
function persist({force = false} = {}) {
  clearTimeout(timer);
  const draft = snapshot();
  window.VistaDraft = draft;
  if (!storageOK) { storageFailure(); return false; }
  if (conflicted && !force) return false;
  try {
    if (!current) {
      if (!draftHasContent(draft)) { dirty = false; setStatus('idle'); return true; }
      const made = store.create({title: titleOf(draft) || tx('untitled'), draft});
      current = {id: made.id, rev: made.rev};
    }
    const meta = store.save(current.id, draft, {title: titleOf(draft) || undefined, baseRev: current.rev, force});
    current.rev = meta.rev; dirty = false; conflicted = false; lastSaved = new Date();
    setStatus('saved');
    if (!$('cycleNotice').hidden && ['error', 'conflict'].includes($('cycleNotice').dataset.kind)) showContextNotice();
    refreshChrome();
    return true;
  } catch (error) {
    if (error instanceof StoreError && error.code === 'CONFLICT') { showConflict(); return false; }
    if (error instanceof StoreError && error.code === 'MISSING') { current = null; notice(tx('deleted_elsewhere'), [], 'conflict'); return persist(); }
    storageFailure();
    return false;
  }
}
function showConflict() {
  conflicted = true; setStatus('unsaved');
  notice(tx('conflict'), [
    [tx('keep_mine'), () => { persist({force: true}); }],
    [tx('load_other'), () => { conflicted = false; dirty = false; openCycle(current.id, {skipSave: true}); }],
    [tx('download_now'), emergencyDownload]
  ], 'conflict');
}
function showContextNotice() {
  const meta = current && store?.meta(current.id);
  if (meta?.example) notice(tx('example_notice'), [[tx('start_own'), () => begin()]], 'example');
  else notice('');
}

// ── cycles ───────────────────────────────────────────────────────────────────
function openCycle(id, {skipSave = false} = {}) {
  if (!skipSave && dirty) persist();
  const loaded = store.load(id);
  if (!loaded) return false;
  current = {id, rev: loaded.meta.rev}; submissions = loaded.draft.submissions || {}; dirty = false; conflicted = false;
  lastSaved = loaded.meta.updatedAt ? new Date(loaded.meta.updatedAt) : null;
  store.setActive(id);
  F.load(loaded.draft);
  setStatus('saved'); showContextNotice(); refreshChrome();
  return true;
}
function blankCycle(meta = {}) {
  if (dirty) persist();
  current = null; submissions = {}; dirty = false; conflicted = false; lastSaved = null;
  if (storageOK) store.setActive(null);
  F.load({meta});
  setStatus('idle'); notice(''); refreshChrome();
}
function begin() {
  const meta = current && store?.meta(current.id);
  if (meta?.example) blankCycle();
  F.show('initial');
}
function lastView() {
  if (!current || !storageOK) return 'initial';
  try { const v = storage.getItem(VIEW_KEY + current.id); return VIEW_STAGE[v] ? v : 'initial'; } catch { return 'initial'; }
}
function resume() { F.show(lastView()); }
function example() {
  if (!storageOK) { F.load(exampleCycle(lang()).draft); F.show('initial'); notice(tx('example_notice'), [], 'example'); return; }
  const sample = exampleCycle(lang());
  if (dirty) persist();
  const existing = store.list().find(c => c.example && c.title === sample.title);
  const id = existing ? existing.id : store.create({title: sample.title, draft: sample.draft, example: true}).id;
  openCycle(id, {skipSave: true});
  F.show('initial');
}
function nextCycle() {
  const d = F.capture();
  blankCycle({teacher: d.meta?.teacher || '', discipline: d.meta?.discipline || ''});
  F.show('initial'); toast(tx('next_started'));
}
function backup(ids) {
  if (dirty) persist();
  if (!storageOK) { emergencyDownload(); return; }
  const data = store.exportBackup(ids);
  if (!data.cycles.length) { emergencyDownload(); return; }
  const name = ids?.length === 1 ? slug(data.cycles[0].title) : 'all-cycles';
  download(JSON.stringify(data, null, 2), `vista-backup-${name}-${today()}.json`, 'application/json');
  toast(tx('backup_done'));
}

// ── chrome: cycle label, stepper, resume ─────────────────────────────────────
function refreshChrome() {
  const meta = current && store?.meta(current.id);
  const label = $('cycleLabel'); if (label) label.textContent = meta ? meta.title : '';
  const draft = window.VistaDraft || {};
  let furthest = null;
  for (const stage of STAGE_ORDER) {
    const has = stageHasContent({...draft, submissions}, stage);
    $(STAGE_TAB[stage])?.classList.toggle('has-content', has);
    if (has) furthest = stage;
  }
  const resumeBtn = $('startResume');
  if (resumeBtn) {
    resumeBtn.hidden = !(meta && furthest);
    if (meta && furthest) resumeBtn.textContent = `${tx('resume')}: ${meta.title} (${tx('at')} ${stageName(VIEW_STAGE[lastView()], lang())}) →`;
  }
}
function viewChanged(view) {
  if (current && storageOK && VIEW_STAGE[view]) { try { storage.setItem(VIEW_KEY + current.id, view); } catch { /* not essential */ } }
  window.VistaDraft = snapshot();
  refreshChrome();
}
function languageChanged(next) {
  if (storageOK) { try { storage.setItem(LANG_KEY, next); } catch { /* preference only */ } }
  setStatus(status); refreshChrome();
  if (!$('cycleNotice').hidden && $('cycleNotice').dataset.kind === 'example') showContextNotice();
}

// ── dialogs ──────────────────────────────────────────────────────────────────
function dialog(id, labelId) {
  let d = $(id);
  if (!d) { d = el('dialog', {id, class: 'vista-dialog', 'aria-labelledby': labelId}); document.body.append(d); }
  d.replaceChildren();
  return d;
}
const head = (id, title, d) => el('div', {class: 'dialog-head'}, [el('h2', {id, text: title}), el('button', {type: 'button', class: 'dialog-close', text: tx('close'), onclick: () => d.close()})]);

function openCycles() {
  if (dirty) persist();
  const d = dialog('cyclesDialog', 'cyclesHeading');
  const list = el('div', {class: 'cycle-list', id: 'cycleList'});
  const message = el('p', {class: 'dialog-status', role: 'status', id: 'cyclesMessage'});
  const render = () => {
    list.replaceChildren();
    const cycles = storageOK ? store.list() : [];
    if (!cycles.length) list.append(el('p', {class: 'dialog-empty', text: tx('no_cycles')}));
    for (const c of cycles) {
      const loaded = store.load(c.id);
      const dots = el('span', {class: 'cycle-dots', 'aria-hidden': 'true'}, STAGE_ORDER.map(s => el('i', {class: stageHasContent(loaded.draft, s) ? 'on' : ''})));
      const done = STAGE_ORDER.filter(s => stageHasContent(loaded.draft, s)).map(s => stageName(s, lang())).join(', ');
      const info = el('div', {class: 'cycle-info'}, [
        el('strong', {text: c.title}), c.example ? el('span', {class: 'cycle-tag', text: tx('example')}) : null,
        el('small', {text: `${tx('updated')} ${new Date(c.updatedAt).toLocaleString(lang())}${done ? ' · ' + done : ''}`}), dots
      ]);
      const actions = el('div', {class: 'cycle-actions'});
      const isCurrent = current?.id === c.id;
      const normal = () => actions.replaceChildren(
        el('button', {type: 'button', class: 'primary', text: isCurrent ? tx('current') : tx('open'), onclick: () => { if (!isCurrent) openCycle(c.id); d.close(); F.show(isCurrent ? F.view() : 'launch'); }}),
        el('button', {type: 'button', text: tx('rename'), onclick: renaming}),
        el('button', {type: 'button', text: tx('export'), onclick: () => backup([c.id])}),
        el('button', {type: 'button', class: 'danger', text: tx('del'), onclick: deleting})
      );
      const renaming = () => {
        const input = el('input', {type: 'text', value: c.title, maxlength: '200', 'aria-label': tx('rename')});
        const apply = () => {
          const name = input.value.trim(); if (!name) return;
          if (isCurrent) { const field = $('fa'); if (field) field.value = name; persist(); if (!titleOf(F.capture())) store.rename(c.id, name); }
          else { const other = store.load(c.id); other.draft.meta.assessment = name; store.save(c.id, other.draft, {title: name}); }
          refreshChrome(); render();
        };
        input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } };
        actions.replaceChildren(input, el('button', {type: 'button', class: 'primary', text: tx('save_name'), onclick: apply}), el('button', {type: 'button', text: tx('cancel'), onclick: normal}));
        input.focus(); input.select();
      };
      const deleting = () => {
        const confirm = el('button', {type: 'button', class: 'danger', text: tx('confirm_del'), onclick: () => {
          store.remove(c.id);
          try { storage.removeItem(VIEW_KEY + c.id); } catch { /* ignore */ }
          if (isCurrent) { dirty = false; blankCycle(); F.show('launch'); }
          message.textContent = tx('deleted'); render();
        }});
        actions.replaceChildren(confirm, el('button', {type: 'button', text: tx('cancel'), onclick: normal}));
        confirm.focus();
      };
      normal();
      list.append(el('div', {class: 'cycle-row' + (isCurrent ? ' current' : '')}, [info, actions]));
    }
    usage.textContent = storageOK ? `${tx('usage')}: ${cycles.length} · ${Math.max(1, Math.round(store.usage() / 1024))} KB` : tx('blocked');
  };
  const usage = el('p', {class: 'dialog-note'});
  const nameInput = el('input', {type: 'text', id: 'newCycleName', maxlength: '200', placeholder: tx('new_ph')});
  const form = el('form', {class: 'cycle-new', onsubmit: e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (dirty) persist();
    if (name && storageOK) openCycle(store.create({title: name, draft: {meta: {assessment: name}}}).id, {skipSave: true});
    else blankCycle({assessment: name});
    d.close(); F.show('initial');
  }}, [el('label', {for: 'newCycleName', text: tx('new_label')}), nameInput, el('button', {type: 'submit', class: 'primary', text: tx('new_btn')})]);
  const file = el('input', {type: 'file', accept: '.json,application/json', id: 'backupFile', class: 'visually-hidden', onchange: async e => {
    const chosen = e.target.files[0]; e.target.value = '';
    if (!chosen) return;
    try {
      if (chosen.size > 20 * 1024 * 1024) throw new Error(tx('import_failed'));
      const made = store.importBackup(JSON.parse(await chosen.text()));
      message.textContent = `${made.length} ${tx('imported')}`;
      if (current) store.setActive(current.id);
      render();
    } catch (error) { message.textContent = error instanceof StoreError ? error.message : tx('import_failed'); }
  }});
  d.append(head('cyclesHeading', tx('cycles_title'), d), el('p', {class: 'dialog-intro', text: tx('cycles_intro')}), list, message, form,
    el('div', {class: 'dialog-tools'}, [
      el('button', {type: 'button', text: tx('export_all'), onclick: () => backup()}),
      el('label', {for: 'backupFile', class: 'file-button', tabindex: '0', role: 'button', text: tx('import_backup'), onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } }}), file
    ]), el('p', {class: 'dialog-note', text: tx('storage_note')}), usage);
  render();
  d.showModal();
}

function report(stage) {
  const draft = snapshot(); window.VistaDraft = draft;
  if (dirty) persist();
  const d = dialog('reportDialog', 'reportHeading');
  const withContent = STAGE_ORDER.filter(s => stageHasContent(draft, s));
  d.append(head('reportHeading', tx('report_title'), d));
  if (!withContent.length) { d.append(el('p', {class: 'dialog-empty', id: 'reportEmpty', text: tx('report_empty')})); d.showModal(); return; }
  if (!STAGE_ORDER.includes(stage)) stage = withContent[withContent.length - 1];
  const meta = current && store?.meta(current.id);
  const title = titleOf(draft) || meta?.title || tx('untitled');
  const select = el('select', {id: 'reportStage'}, STAGE_ORDER.map(s => el('option', {value: s, text: stageName(s, lang()), selected: s === stage})));
  const frame = el('iframe', {id: 'reportFrame', title: tx('preview')});
  const message = el('p', {class: 'dialog-status', role: 'status', id: 'reportMessage'});
  const options = () => ({title, stage: select.value, snapshot: draft, createdAt: new Date().toISOString(), lang: lang()});
  const render = () => { frame.srcdoc = reportDocument(options()); message.textContent = ''; };
  select.onchange = render;
  d.append(el('p', {class: 'dialog-intro', text: tx('report_intro')}),
    el('div', {class: 'dialog-tools'}, [
      el('label', {for: 'reportStage', text: tx('report_stage')}), select,
      el('button', {type: 'button', class: 'primary', id: 'printReport', text: tx('print'), onclick: () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); message.textContent = tx('print_hint'); } catch { message.textContent = tx('print_hint'); } }}),
      el('button', {type: 'button', id: 'downloadReport', text: tx('download_text'), onclick: () => download(buildReport(options()), `vista-${slug(title)}-${select.value}-${today()}.md`, 'text/markdown')}),
      el('button', {type: 'button', id: 'copyHandoff', text: tx('copy_prompt'), onclick: async () => { try { await navigator.clipboard.writeText(handoff(select.value, lang())); message.textContent = tx('copied'); } catch { message.textContent = tx('copy_failed') + ' ' + handoff(select.value, lang()); } }})
    ]), message, frame);
  render();
  d.showModal();
}

function importText(stage = 'initial') {
  const d = dialog('importDialog', 'importHeading');
  let source = null, busy = false;
  const select = el('select', {id: 'importStage'}, STAGE_ORDER.map(s => el('option', {value: s, text: stageName(s, lang()), selected: s === stage})));
  const area = el('textarea', {id: 'importTextArea', rows: '12', maxlength: '100000'});
  const reviewed = el('input', {type: 'checkbox', id: 'importReviewed'});
  const message = el('p', {class: 'dialog-status', role: 'status', id: 'importMessage'});
  const remove = el('button', {type: 'button', class: 'danger', text: tx('import_remove'), onclick: () => { delete submissions[select.value]; changed(); persist(); toast(tx('import_removed')); d.close(); }});
  const sync = () => { area.value = submissions[select.value]?.text || ''; reviewed.checked = false; source = null; remove.hidden = !submissions[select.value]; message.textContent = ''; };
  select.onchange = sync;
  const file = el('input', {type: 'file', id: 'importFile', accept: '.txt,.md,.pdf,.docx', onchange: async e => {
    const chosen = e.target.files[0]; if (!chosen || busy) return;
    busy = true; message.textContent = tx('import_busy');
    try {
      const {readSubmission, MAX_CHARS} = await import('./files.js');
      const text = await readSubmission(chosen, m => { message.textContent = m; });
      if (!text.trim()) throw new Error(tx('import_none'));
      if (text.length > MAX_CHARS) throw new Error(tx('import_long'));
      area.value = text; source = chosen.name; reviewed.checked = false; message.textContent = tx('import_ready');
    } catch (error) { message.textContent = error.message || tx('import_failed'); }
    finally { busy = false; e.target.value = ''; }
  }});
  d.append(head('importHeading', tx('import_title'), d), el('p', {class: 'dialog-intro', text: tx('import_intro')}),
    el('div', {class: 'dialog-tools'}, [el('label', {for: 'importStage', text: tx('import_stage')}), select]),
    el('label', {for: 'importFile', class: 'dialog-label', text: tx('import_file')}), file,
    el('label', {for: 'importTextArea', class: 'dialog-label', text: tx('import_text')}), area,
    el('label', {class: 'check-label'}, [reviewed, el('span', {text: tx('import_reviewed')})]), message,
    el('div', {class: 'dialog-tools'}, [
      el('button', {type: 'button', class: 'primary', id: 'importAccept', text: tx('import_accept'), onclick: () => {
        const text = area.value.trim();
        if (!text) { message.textContent = tx('import_need_text'); return; }
        if (!reviewed.checked) { message.textContent = tx('import_need_review'); return; }
        submissions[select.value] = {text, reviewedAt: new Date().toISOString(), sources: source ? [{name: source}] : (submissions[select.value]?.sources || [])};
        changed(); persist(); toast(tx('import_saved')); d.close();
      }}), remove
    ]));
  sync();
  d.showModal();
}

// ── wiring ───────────────────────────────────────────────────────────────────
document.addEventListener('input', e => { if (e.target.closest?.('.view')) changed(); });
document.addEventListener('click', e => { if (e.target.closest?.('.cl-card,.rc,.sail-row,.sail-chip,.ptab')) changed(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && dirty) persist(); });
window.addEventListener('pagehide', () => { if (dirty) persist(); });
window.addEventListener('beforeunload', e => { if (dirty && !persist()) { e.preventDefault(); e.returnValue = ''; } });
window.addEventListener('storage', e => {
  if (e.key !== INDEX_KEY || !current) return;
  const meta = store.meta(current.id);
  if (!meta) { current = null; dirty = true; notice(tx('deleted_elsewhere'), [], 'conflict'); return; }
  if (meta.rev === current.rev) { refreshChrome(); return; }
  if (dirty) showConflict(); else { const view = F.view(); openCycle(current.id, {skipSave: true}); F.show(view); toast(tx('updated_elsewhere')); }
});

window.VistaLocal = {save: () => { dirty = true; if (persist()) toast(tx('saved')); }, changed, report, import: importText, openCycles, begin, resume, example, nextCycle, backup, viewChanged, languageChanged};

// ── start ────────────────────────────────────────────────────────────────────
(function start() {
  const params = new URLSearchParams(location.search);
  let preferred = params.get('lang');
  if (!['en', 'es'].includes(preferred) && storageOK) { try { preferred = storage.getItem(LANG_KEY); } catch { preferred = null; } }
  if (['en', 'es'].includes(preferred)) F.setLang(preferred);
  if (!storageOK) { storageFailure(); setStatus('failed'); }
  else {
    const recovered = store.migrateLegacy();
    const id = store.activeId() || (recovered && recovered.id);
    if (id) openCycle(id, {skipSave: true}); else { setStatus('idle'); refreshChrome(); }
    if (recovered) notice(tx('recovered'), [[tx('close'), () => showContextNotice()]], 'info');
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  }
  if (params.has('example')) example();
  else if (VIEW_STAGE[params.get('view')]) F.show(params.get('view'));
  document.documentElement.dataset.vistaReady = 'true';
})();
