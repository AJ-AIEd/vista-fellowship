import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accountAddress} from '../src/auth.js';
import {readSubmission,fileKind,MAX_BYTES} from '../src/files.js';
import {buildReport} from '../src/reports.js';
test('sign-in names are stable across capitalization, accents and spaces',()=>{assert.equal(accountAddress('  Álex Rivera '),accountAddress('alex rivera'));assert.throws(()=>accountAddress('<script>'));assert.throws(()=>accountAddress('ab'));});
test('text submission preserves teacher response',async()=>{const text='Learning evidence\nI will ask for an independent explanation.';assert.equal(await readSubmission(new File([text],'audit.txt')),text);});
test('rejects unsupported or oversized files before processing',async()=>{assert.throws(()=>fileKind({name:'audit.exe'}));await assert.rejects(readSubmission({name:'audit.txt',size:MAX_BYTES+1}));});
test('each report includes the latest audit fields and cumulative submissions',()=>{const snapshot={learningEvidence:'Transfer to a new task',humanAI:'Students justify their decisions',sail:'L1, L3',submissions:{initial:{text:'Initial draft'},ahtr:{text:'Trial and partial redesign'},final:{text:'What students actually learned'}}};for(const stage of ['initial','ahtr','final']){const text=buildReport({title:'Cycle',stage,snapshot});for(const expected of ['Transfer to a new task','Students justify their decisions','L1, L3','Initial draft'])assert.ok(text.includes(expected));if(stage==='final'){assert.ok(text.includes('Trial and partial redesign'));assert.ok(text.includes('What students actually learned'));}assert.ok(text.includes('NotebookLM'));}});
