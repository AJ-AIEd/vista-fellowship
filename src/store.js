// Local, account-free storage for VISTA cycles.
// Everything lives in the browser's localStorage on this device. Nothing is sent anywhere.
// The storage object is injected so this module can be tested outside a browser.
export const INDEX_KEY = 'vista.v3.index';
export const CYCLE_PREFIX = 'vista.v3.cycle.';
export const LEGACY_KEY = 'dlp_draft_v2'; // single-draft key used by VISTA v1/v2
export const BACKUP_FORMAT = 'vista-backup';
export const BACKUP_VERSION = 1;
const MAX_TEXT = 100000, MAX_CYCLES_PER_IMPORT = 200;
const TYPES = ['proc', 'conc', 'eval', 'crea', 'emb'], RATINGS = ['full', 'subs', 'part', 'min'];
const READY = ['instructions', 'route', 'evidence', 'privacy'];
const STAGES = ['initial', 'ahtr', 'redesign', 'implementation', 'final', 'reflection'];
const GROUPS = {
  meta: ['teacher', 'discipline', 'assessment', 'date'],
  reflection: ['r1', 'r2', 'r3', 'r4'],
  min_reflection: ['min_r1', 'min_r2', 'min_r3', 'min_r4', 'min_exemplar'],
  deepdive: ['prediction', 'dd1', 'dd2', 'dd3', 'dd4', 'dd4redesign', 'standaloneSail'],
  light_reflection: ['lr1'],
  final_audit: ['fq1', 'fq2', 'fq3', 'fq4', 'fq5', 'fq6', 'fq7', 'fq8', 'fq9'],
  final_meta: ['teacher', 'discipline', 'assessment', 'cycle'],
  redesign: ['evidence', 'supports'],
  implementation: ['when', 'evidence', 'adjustments'],
  next: ['uncertain', 'transfer']
};

export class StoreError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
const text = v => (typeof v === 'string' ? v.slice(0, MAX_TEXT) : '');
const sail = v => (typeof v === 'string' && /^L[1-5](, L[1-5]){0,4}$/.test(v) ? v : null);
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const newId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

// Keep only fields VISTA knows, with the types it expects. Imported files are untrusted:
// some values are later placed into page markup, so nothing unvalidated may pass through.
export function sanitizeDraft(input) {
  const d = isObject(input) ? input : {};
  const out = {lang: d.lang === 'es' ? 'es' : 'en'};
  for (const key of ['task', 'learningEvidence', 'humanAI', 'sailJustify']) out[key] = text(d[key]);
  out.classifier = Array.isArray(d.classifier) ? TYPES.filter(t => d.classifier.includes(t)) : [];
  out.rating = RATINGS.includes(d.rating) ? d.rating : null;
  out.sail = sail(d.sail);
  for (const [group, keys] of Object.entries(GROUPS)) {
    out[group] = {};
    for (const key of keys) out[group][key] = text(d[group]?.[key]);
  }
  out.redesign.sail = sail(d.redesign?.sail);
  out.implementation.ready = Array.isArray(d.implementation?.ready) ? READY.filter(k => d.implementation.ready.includes(k)) : [];
  out.submissions = {};
  if (isObject(d.submissions)) for (const stage of STAGES) {
    const s = d.submissions[stage];
    if (!isObject(s) || !text(s.text).trim()) continue;
    out.submissions[stage] = {
      text: text(s.text),
      reviewedAt: text(s.reviewedAt).slice(0, 40),
      sources: Array.isArray(s.sources) ? s.sources.slice(0, 20).map(x => ({name: text(x?.name).slice(0, 250)})).filter(x => x.name) : []
    };
  }
  out.savedAt = text(d.savedAt).slice(0, 40);
  return out;
}
export function draftHasContent(d) {
  const s = sanitizeDraft(d);
  if (s.task || s.learningEvidence || s.humanAI || s.sailJustify || s.classifier.length || s.rating || s.sail) return true;
  if (Object.keys(s.submissions).length || s.redesign.sail || s.implementation.ready.length) return true;
  return Object.entries(GROUPS).some(([g, keys]) => g !== 'meta' && g !== 'final_meta' && keys.some(k => s[g][k]));
}
const cleanTitle = (t, fallback) => (text(t).trim().slice(0, 200) || fallback);

export function createStore(storage, {now = () => new Date().toISOString()} = {}) {
  const read = key => { try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; } };
  const write = (key, value) => {
    try { storage.setItem(key, JSON.stringify(value)); }
    catch (cause) { throw new StoreError('STORAGE', 'This browser could not save your work. Storage may be full, blocked, or in private mode.'); }
  };
  const index = () => {
    const i = read(INDEX_KEY);
    return isObject(i) && Array.isArray(i.cycles) ? i : {activeId: null, cycles: [], legacyImported: false};
  };
  const putIndex = i => write(INDEX_KEY, i);
  const meta = id => index().cycles.find(c => c.id === id) || null;

  function available() {
    try { storage.setItem('vista.v3.probe', '1'); storage.removeItem('vista.v3.probe'); return true; } catch { return false; }
  }
  function list() { return [...index().cycles].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))); }
  function create({title, draft = {}, example = false} = {}) {
    const i = index(), id = newId(), stamp = now();
    const entry = {id, title: cleanTitle(title, 'Untitled cycle'), createdAt: stamp, updatedAt: stamp, rev: 0, example: Boolean(example)};
    write(CYCLE_PREFIX + id, sanitizeDraft(draft)); // write the cycle first so the index never points at nothing
    i.cycles.push(entry); i.activeId = id; putIndex(i);
    return entry;
  }
  function load(id) {
    const entry = meta(id);
    if (!entry) return null;
    return {meta: entry, draft: sanitizeDraft(read(CYCLE_PREFIX + id))};
  }
  // baseRev is the revision this tab last loaded or saved. If another tab saved since, refuse
  // rather than silently overwrite; the caller decides which version to keep.
  function save(id, draft, {title, baseRev, force = false} = {}) {
    const i = index(), entry = i.cycles.find(c => c.id === id);
    if (!entry) throw new StoreError('MISSING', 'This cycle no longer exists in this browser. It may have been deleted in another tab.');
    if (!force && baseRev !== undefined && entry.rev !== baseRev) throw new StoreError('CONFLICT', 'This cycle was changed in another tab.');
    const stamp = now();
    write(CYCLE_PREFIX + id, {...sanitizeDraft(draft), savedAt: stamp});
    entry.rev += 1; entry.updatedAt = stamp;
    if (title !== undefined) entry.title = cleanTitle(title, entry.title);
    putIndex(i);
    return {...entry};
  }
  function rename(id, title) {
    const i = index(), entry = i.cycles.find(c => c.id === id);
    if (!entry) return null;
    entry.title = cleanTitle(title, entry.title); putIndex(i);
    return {...entry};
  }
  function remove(id) {
    const i = index();
    i.cycles = i.cycles.filter(c => c.id !== id);
    if (i.activeId === id) i.activeId = null;
    putIndex(i);
    try { storage.removeItem(CYCLE_PREFIX + id); } catch { /* index no longer lists it */ }
  }
  function setActive(id) { const i = index(); i.activeId = meta(id) ? id : null; putIndex(i); }
  function activeId() { const i = index(); return i.cycles.some(c => c.id === i.activeId) ? i.activeId : null; }
  // Bring a draft from VISTA v1/v2 into a cycle, once. The old key is left untouched.
  function migrateLegacy() {
    const i = index();
    if (i.legacyImported) return null;
    const legacy = read(LEGACY_KEY);
    i.legacyImported = true; putIndex(i);
    if (!isObject(legacy) || !draftHasContent(legacy)) return null;
    return create({title: legacy.meta?.assessment || 'Recovered draft', draft: legacy});
  }
  function exportBackup(ids) {
    const cycles = index().cycles.filter(c => !ids || ids.includes(c.id)).map(c => ({
      title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt, example: Boolean(c.example), draft: sanitizeDraft(read(CYCLE_PREFIX + c.id))
    }));
    return {format: BACKUP_FORMAT, version: BACKUP_VERSION, app: 'VISTA', exportedAt: now(), cycles};
  }
  // Imported cycles are always added as new cycles; existing work is never replaced.
  function importBackup(data) {
    let items;
    if (isObject(data) && data.format === BACKUP_FORMAT && Array.isArray(data.cycles)) {
      if (data.version > BACKUP_VERSION) throw new StoreError('VERSION', 'This backup was made by a newer version of VISTA.');
      items = data.cycles.filter(isObject).map(c => ({title: c.title, example: c.example, draft: c.draft}));
    } else if (isObject(data) && (isObject(data.meta) || typeof data.task === 'string' || isObject(data.final_audit))) {
      items = [{title: data.meta?.assessment, draft: data}]; // a single draft saved by an earlier version
    } else throw new StoreError('FORMAT', 'This file is not a VISTA backup.');
    if (!items.length) throw new StoreError('EMPTY', 'This backup contains no cycles.');
    if (items.length > MAX_CYCLES_PER_IMPORT) throw new StoreError('FORMAT', 'This backup contains too many cycles.');
    return items.map(item => create({title: item.title || item.draft?.meta?.assessment || 'Imported cycle', draft: item.draft, example: item.example}));
  }
  function usage() {
    let bytes = 0;
    try { for (let n = 0; n < storage.length; n++) { const k = storage.key(n); if (k?.startsWith('vista.v3.')) bytes += k.length + (storage.getItem(k)?.length || 0); } } catch { /* unknown */ }
    return bytes * 2; // UTF-16 code units
  }
  return {available, list, create, load, save, rename, remove, setActive, activeId, meta, migrateLegacy, exportBackup, importBackup, usage};
}
