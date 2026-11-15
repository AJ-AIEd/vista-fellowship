import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStore, sanitizeDraft, draftHasContent, StoreError, LEGACY_KEY, INDEX_KEY} from '../src/store.js';

function memory(limit = Infinity) {
  const m = new Map();
  return {
    get length() { return m.size; }, key: i => [...m.keys()][i] ?? null,
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem(k, v) { if (String(v).length > limit) throw new Error('QuotaExceededError'); m.set(k, String(v)); },
    removeItem: k => { m.delete(k); }
  };
}
test('a cycle survives a reload and keeps every stage', () => {
  const s = memory(), a = createStore(s);
  const c = a.create({title: 'Grade 10 modelling'});
  a.save(c.id, {task: 'Compare models', rating: 'part', sail: 'L1, L3', deepdive: {dd1: 'trial'}, redesign: {sail: 'L1', evidence: 'exit task'}, implementation: {ready: ['route'], evidence: 'saw it'}, final_audit: {fq7: 'changed'}, next: {transfer: 'next task'}}, {baseRev: 0});
  const b = createStore(s).load(c.id); // a second store over the same storage is a reload
  assert.equal(b.draft.task, 'Compare models');
  assert.equal(b.draft.redesign.sail, 'L1');
  assert.deepEqual(b.draft.implementation.ready, ['route']);
  assert.equal(b.draft.next.transfer, 'next task');
  assert.equal(b.meta.rev, 1);
});
test('several cycles stay separate, and deleting one leaves the others', () => {
  const st = createStore(memory());
  const a = st.create({title: 'A', draft: {task: 'first'}}), b = st.create({title: 'B', draft: {task: 'second'}});
  assert.equal(st.list().length, 2);
  st.remove(a.id);
  assert.equal(st.load(a.id), null);
  assert.equal(st.load(b.id).draft.task, 'second');
});
test('a save from a stale tab is refused instead of overwriting newer work', () => {
  const st = createStore(memory());
  const c = st.create({title: 'T'});
  st.save(c.id, {task: 'newer, from the other tab'}, {baseRev: 0});
  assert.throws(() => st.save(c.id, {task: 'stale'}, {baseRev: 0}), e => e instanceof StoreError && e.code === 'CONFLICT');
  assert.equal(st.load(c.id).draft.task, 'newer, from the other tab');
  st.save(c.id, {task: 'kept on purpose'}, {baseRev: 0, force: true});
  assert.equal(st.load(c.id).draft.task, 'kept on purpose');
});
test('a full or blocked browser store reports failure instead of losing work silently', () => {
  const st = createStore(memory(3000));
  const c = st.create({title: 'T'});
  assert.throws(() => st.save(c.id, {task: 'x'.repeat(5000)}, {baseRev: 0}), e => e instanceof StoreError && e.code === 'STORAGE');
  const blocked = createStore({getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {}});
  assert.equal(blocked.available(), false);
});
test('backup export and import round-trips and never replaces existing cycles', () => {
  const st = createStore(memory());
  const c = st.create({title: 'Original', draft: {task: 'kept', submissions: {initial: {text: 'my notes', sources: [{name: 'notes.docx'}]}}}});
  const backup = JSON.parse(JSON.stringify(st.exportBackup()));
  const other = createStore(memory());
  other.create({title: 'Already here', draft: {task: 'untouched'}});
  const made = other.importBackup(backup);
  assert.equal(made.length, 1);
  assert.equal(other.list().length, 2);
  assert.equal(other.load(made[0].id).draft.submissions.initial.text, 'my notes');
  assert.ok(other.list().some(x => x.title === 'Already here'));
  assert.equal(st.load(c.id).draft.task, 'kept');
  assert.throws(() => other.importBackup({hello: 'world'}), e => e.code === 'FORMAT');
  assert.throws(() => other.importBackup({format: 'vista-backup', version: 99, cycles: []}), e => e.code === 'VERSION');
});
test('a draft from the earlier single-draft version is recovered once and left in place', () => {
  const s = memory();
  s.setItem(LEGACY_KEY, JSON.stringify({meta: {assessment: 'Old audit'}, task: 'From v2', final_audit: {fq1: 'evidence'}}));
  const st = createStore(s);
  const made = st.migrateLegacy();
  assert.equal(made.title, 'Old audit');
  assert.equal(st.load(made.id).draft.final_audit.fq1, 'evidence');
  assert.equal(st.migrateLegacy(), null);
  assert.ok(s.getItem(LEGACY_KEY));
});
test('imported files cannot smuggle markup or unknown values into fields that reach the page', () => {
  const d = sanitizeDraft({sail: '<img src=x onerror=alert(1)>', rating: 'full"><script>', classifier: ['proc', '"]<b>'], lang: 'xx', redesign: {sail: 'L9'}, implementation: {ready: ['route', '<x>']}, task: 42, evil: {a: 1}, submissions: {initial: {text: 'ok', sources: [{name: 'a.pdf', extra: 1}]}, bogus: {text: 'no'}}});
  assert.equal(d.sail, null); assert.equal(d.rating, null); assert.deepEqual(d.classifier, ['proc']);
  assert.equal(d.lang, 'en'); assert.equal(d.redesign.sail, null); assert.deepEqual(d.implementation.ready, ['route']);
  assert.equal(d.task, ''); assert.equal(d.evil, undefined);
  assert.deepEqual(Object.keys(d.submissions), ['initial']);
  assert.deepEqual(d.submissions.initial.sources, [{name: 'a.pdf'}]);
  assert.equal(draftHasContent({meta: {teacher: 'Name only'}}), false);
  assert.equal(draftHasContent({next: {uncertain: 'something'}}), true);
});

test('exploration and annotations survive backup recovery without replacing existing work', () => {
  const a=createStore(memory());
  const draft={learning:{entry:'tools',question:'What do students need to judge?',prompt:'Same prompt',modelA:'A',modelB:'B',outputA:'First response',outputB:'Second response',supportOrigin:'A colleague modelled one source check.'},annotations:[{quote:'Interpret the source',note:'Whose interpretation is this?'}]};
  a.create({title:'Inquiry',draft});
  const b=createStore(memory());b.create({title:'Existing',draft:{task:'Keep this'}});
  const [made]=b.importBackup(a.exportBackup());
  assert.equal(b.load(made.id).draft.learning.question,draft.learning.question);
  assert.equal(b.load(made.id).draft.learning.outputB,'Second response');
  assert.deepEqual(b.load(made.id).draft.annotations,draft.annotations);
  assert.equal(b.list().length,2);
});
test('annotation imports are bounded and retain only known string fields',()=>{
  const draft=sanitizeDraft({annotations:[{quote:'A passage',note:'<script>untrusted text</script>',owner:'forged'},{quote:4,note:{}},null]});
  assert.deepEqual(draft.annotations,[{quote:'A passage',note:'<script>untrusted text</script>'}]);
  assert.equal(sanitizeDraft({annotations:Array.from({length:150},()=>({quote:'q',note:'n'}))}).annotations.length,100);
});

test('an emerging idea and exploration return path survive save and backup import',()=>{
 const store=createStore(memory());const cycle=store.create({title:'Inquiry',draft:{learning:{idea:'Keep close reading',ideaStatus:'explore',returnStage:'redesign',prediction:'An omission matters',proposal:'Discuss one checkpoint'}}});
 const recovered=createStore(memory());recovered.importBackup(store.exportBackup());
 const draft=recovered.load(recovered.list()[0].id).draft;
 for(const key of ['idea','ideaStatus','returnStage','prediction','proposal'])assert.equal(draft.learning[key],store.load(cycle.id).draft.learning[key]);
});
