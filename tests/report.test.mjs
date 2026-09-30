import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildReport,reportHTML} from '../src/reports.js';
test('rejects empty stage',()=>assert.throws(()=>buildReport({title:'x',stage:'initial',snapshot:{}})));
test('preserves full submission and does not infer missing answers',()=>{const r=buildReport({title:'x',stage:'initial',snapshot:{submissions:{initial:{text:'My exact response.'}}}});assert.match(r,/My exact response\./);assert.match(r,/no separate field response/);});
test('final includes evidence from all stages',()=>{const r=buildReport({title:'x',stage:'final',snapshot:{task:'Original task',deepdive:{dd1:'Trial finding'},final_audit:{fq1:'Observed evidence'}}});for(const x of ['Original task','Trial finding','Observed evidence','NotebookLM'])assert.ok(r.includes(x));});
test('print report escapes submitted markup',()=>assert.ok(!reportHTML('<script>alert(1)</script>').includes('<script>')));
