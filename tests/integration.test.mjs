import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readSubmission, fileKind, MAX_BYTES} from '../src/files.js';
import {buildReport, reportDocument, STAGE_ORDER, stageStatus, handoff} from '../src/reports.js';
import {exampleCycle} from '../src/example.js';
import {sanitizeDraft} from '../src/store.js';

test('text submission preserves teacher response', async () => { const text = 'Learning evidence\nI will ask for an independent explanation.'; assert.equal(await readSubmission(new File([text], 'audit.txt')), text); });
test('rejects unsupported or oversized files before processing', async () => { assert.throws(() => fileKind({name: 'audit.exe'})); assert.throws(() => fileKind({name: 'voice.mp3'})); await assert.rejects(readSubmission({name: 'audit.txt', size: MAX_BYTES + 1})); });
test('each report includes the latest audit fields and cumulative submissions', () => { const snapshot = {learningEvidence: 'Transfer to a new task', humanAI: 'Students justify their decisions', sail: 'L1, L3', submissions: {initial: {text: 'Initial draft'}, ahtr: {text: 'Trial and partial redesign'}, final: {text: 'What students actually learned'}}}; for (const stage of ['initial', 'ahtr', 'final']) { const text = buildReport({title: 'Cycle', stage, snapshot}); for (const expected of ['Transfer to a new task', 'Students justify their decisions', 'L1, L3', 'Initial draft']) assert.ok(text.includes(expected)); if (stage === 'final') { assert.ok(text.includes('Trial and partial redesign')); assert.ok(text.includes('What students actually learned')); } assert.ok(text.includes('NotebookLM')); } });
test('a full-cycle report covers all six stages in order, in English and Spanish', () => {
  for (const lang of ['en', 'es']) {
    const {title, draft} = exampleCycle(lang);
    const snapshot = sanitizeDraft(draft); // the example must survive the same validation as teacher data
    const text = buildReport({title, stage: 'reflection', snapshot, lang});
    const positions = STAGE_ORDER.map(s => text.indexOf('## ' + {en: {initial: 'Initial Audit', ahtr: 'AHTR', redesign: 'Redesign', implementation: 'Implementation', final: 'Final Audit', reflection: 'Reflection and Next Cycle'}, es: {initial: 'Auditoría Inicial', ahtr: 'RHPA', redesign: 'Rediseño', implementation: 'Implementación', final: 'Auditoría Final', reflection: 'Reflexión y siguiente ciclo'}}[lang][s]));
    assert.ok(positions.every(p => p > 0), 'every stage heading present: ' + positions);
    assert.deepEqual([...positions].sort((a, b) => a - b), positions);
    assert.ok(text.includes(snapshot.next.transfer) && text.includes(snapshot.redesign.evidence) && text.includes(snapshot.implementation.evidence));
    assert.ok(text.includes('L1, L4'));
    assert.ok(!/Not provided\.|Sin respuesta\./.test(text), 'the worked example leaves no required field empty');
    assert.ok(Object.values(stageStatus(snapshot)).every(v => v === 'started'));
    assert.ok(handoff('reflection', lang).length > 80);
  }
  assert.ok(buildReport({title: 't', stage: 'final', snapshot: exampleCycle('es').draft, lang: 'es'}).includes('Docente'));
});
test('the printable report escapes everything a teacher typed', () => {
  const html = reportDocument({title: '<script>alert(1)</script>', stage: 'reflection', snapshot: {task: '<img src=x onerror=1>', meta: {teacher: '"><b>x'}, next: {uncertain: '</p><script>x</script>'}}});
  assert.ok(!/<script|<img|<b>/i.test(html));
  assert.ok(html.includes('&lt;img src=x onerror=1&gt;'));
});
