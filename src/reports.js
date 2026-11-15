// Report building for VISTA cycles. Pure functions: no DOM, no network.
// A report records the teacher's own responses. Nothing is inferred, scored, or generated.

export const STAGE_ORDER = ['initial', 'ahtr', 'redesign', 'implementation', 'final', 'reflection'];

const STAGE_NAMES = {
  en: {initial: 'Initial Audit', ahtr: 'AHTR', redesign: 'Redesign', implementation: 'Implementation', final: 'Final Audit', reflection: 'Reflection and Next Cycle'},
  es: {initial: 'Auditoría Inicial', ahtr: 'RHPA', redesign: 'Rediseño', implementation: 'Implementación', final: 'Auditoría Final', reflection: 'Reflexión y siguiente ciclo'}
};
// English names keyed by stage; kept as a named export for existing callers.
export const STAGES = STAGE_NAMES.en;
export function stageName(stage, lang = 'en') { return (STAGE_NAMES[lang] || STAGE_NAMES.en)[stage]; }

// [path in the saved cycle, English label, Spanish label]
export const FIELDS = {
  initial: [
    ['task', 'Task and intended thinking', 'Tarea y pensamiento que busca desarrollar'],
    ['learningEvidence', 'Evidence of student learning and why I trust it', 'Evidencia del aprendizaje y por qué confío en ella'],
    ['humanAI', 'Predicted AI capabilities and student responsibilities', 'Predicción: qué podría hacer la IA y qué debe hacer el estudiante'],
    ['classifier', 'Types of learning', 'Tipos de aprendizaje'],
    ['rating', 'Initial estimate of AI offloading', 'Estimación inicial de la delegación en IA'],
    ['sail', 'Initial SAIL level', 'Nivel SAIL inicial'],
    ['sailJustify', 'Reason for this SAIL level', 'Razón de este nivel SAIL'],
    ['light_reflection.lr1', 'Question to check', 'Duda por comprobar'],
    ['min_reflection.min_r1', 'What students demonstrate themselves', 'Qué demuestran los estudiantes por sí mismos'],
    ['min_reflection.min_r2', 'Learning goal protected', 'Aprendizaje que la tarea protege'],
    ['min_reflection.min_r3', 'How AI has changed my understanding of this assessment', 'Cómo ha cambiado la IA mi comprensión de esta evaluación'],
    ['min_reflection.min_r4', 'Blind spots and evidence that could change my judgment', 'Puntos ciegos y evidencia que cambiaría mi juicio'],
    ['min_reflection.min_exemplar', 'Evidence plan, trust, limitations, and follow-up', 'Plan de evidencia, confianza, límites y seguimiento']
  ],
  ahtr: [
    ['deepdive.prediction', 'Prediction before testing with AI', 'Predicción antes de probar con IA'],
    ['deepdive.dd1', 'What the AI trial showed', 'Qué mostró la prueba con IA'],
    ['deepdive.dd2', 'Checking accuracy and reasoning', 'Comprobación de exactitud y razonamiento'],
    ['deepdive.dd3', 'Classroom context and learning risks', 'Contexto del aula y riesgos para el aprendizaje']
  ],
  redesign: [
    ['deepdive.dd4', 'Redesign decision: what stays the student’s, what AI may do', 'Decisión de rediseño: qué sigue siendo del estudiante y qué puede hacer la IA'],
    ['redesign.sail', 'Revised SAIL level', 'Nivel SAIL revisado'],
    ['deepdive.standaloneSail', 'SAIL level entered during the routine', 'Nivel SAIL indicado durante la rutina'],
    ['deepdive.dd4redesign', 'Revised task', 'Tarea revisada'],
    ['redesign.evidence', 'Evidence I will collect and what it cannot show', 'Evidencia que recogeré y qué no puede mostrar'],
    ['redesign.supports', 'Supports and the route without AI', 'Apoyos y la vía sin IA']
  ],
  implementation: [
    ['implementation.when', 'When and with whom', 'Cuándo y con quiénes'],
    ['implementation.ready', 'Before teaching', 'Antes de enseñar'],
    ['implementation.evidence', 'Evidence collected', 'Evidencia recogida'],
    ['implementation.adjustments', 'What changed during teaching', 'Qué cambió durante la enseñanza']
  ],
  final: [
    ['final_audit.fq1', 'Unexpected student thinking', 'Pensamiento estudiantil inesperado'],
    ['final_audit.fq2', 'Where AI supported or replaced thinking', 'Dónde la IA apoyó o sustituyó el pensamiento'],
    ['final_audit.fq3', 'What the evidence shows and leaves unclear', 'Qué muestra la evidencia y qué deja sin aclarar'],
    ['final_audit.fq4', 'What was difficult to balance', 'Qué fue difícil de equilibrar'],
    ['final_audit.fq5', 'Assumptions confirmed or challenged', 'Supuestos confirmados o cuestionados'],
    ['final_audit.fq6', 'Next question to investigate', 'Siguiente pregunta por investigar']
  ],
  reflection: [
    ['final_audit.fq7', 'What changed in my understanding of AI', 'Qué cambió en mi comprensión de la IA'],
    ['final_audit.fq8', 'What to keep or change', 'Qué mantener o cambiar'],
    ['final_audit.fq9', 'What to share with a colleague', 'Qué compartir con un colega'],
    ['next.uncertain', 'What remains uncertain', 'Qué sigue siendo incierto'],
    ['next.transfer', 'The next assessment and what I will carry over', 'La siguiente evaluación y qué llevaré conmigo']
  ]
};

const TYPE_NAMES = {
  en: {proc: 'Procedural', conc: 'Conceptual', eval: 'Evaluative', crea: 'Creative', emb: 'Embodied / tacit'},
  es: {proc: 'Procedimental', conc: 'Conceptual', eval: 'Evaluativo', crea: 'Creativo', emb: 'Corporal / tácito'}
};
const RATING_NAMES = {
  en: {full: 'Fully', subs: 'Substantially', part: 'Partially', min: 'Minimally'},
  es: {full: 'Totalmente', subs: 'Sustancialmente', part: 'Parcialmente', min: 'Mínimamente'}
};
const READY_NAMES = {
  en: {instructions: 'Task instructions state the AI-use level', route: 'Students have a route without AI', evidence: 'I know what I will observe or collect', privacy: 'Notes will not identify individual students'},
  es: {instructions: 'Las instrucciones indican el nivel de uso de IA', route: 'Hay una vía sin IA para los estudiantes', evidence: 'Sé qué observaré o recogeré', privacy: 'Mis notas no identificarán a estudiantes'}
};
const TEXT = {
  en: {
    report: 'report', cycle: 'Task / cycle', created: 'Created', teacher: 'Teacher', department: 'Department', none: 'Not provided',
    preface: 'This report records the teacher’s submitted responses. Empty fields are marked; they are not inferred.',
    reviewed: 'Reviewed full submission', sources: 'Source files', seeSubmission: 'See reviewed full submission; no separate field response.', notProvided: 'Not provided.',
    continueHead: 'Continue your analysis',
    continueBody: 'You can keep this report for your own records, share it with a colleague, or add it to your own AI workspace (for example a NotebookLM notebook, a Gem, or a Project). Review it for student-identifying details before sharing. If you continue with an AI tool, paste the prompt below.',
    handoffHead: 'Handoff prompt', summary: 'Cycle at a glance', empty: 'Add a response or reviewed submission before creating this report.',
    footer: 'Created in the teacher’s own browser with VISTA. It contains the teacher’s responses only. VISTA does not score, evaluate, or generate these responses.'
  },
  es: {
    report: 'informe', cycle: 'Tarea / ciclo', created: 'Creado', teacher: 'Docente', department: 'Departamento', none: 'Sin indicar',
    preface: 'Este informe recoge las respuestas del docente. Los campos vacíos se marcan; no se infieren.',
    reviewed: 'Entrega completa revisada', sources: 'Archivos de origen', seeSubmission: 'Consulta la entrega completa revisada; no hay respuesta en este campo.', notProvided: 'Sin respuesta.',
    continueHead: 'Continúa tu análisis',
    continueBody: 'Puedes conservar este informe, compartirlo con un colega o añadirlo a tu propio espacio de IA (por ejemplo un cuaderno de NotebookLM, un Gem o un Proyecto). Revisa que no identifique a estudiantes antes de compartirlo. Si continúas con una herramienta de IA, pega el prompt siguiente.',
    handoffHead: 'Prompt de continuación', summary: 'El ciclo de un vistazo', empty: 'Añade una respuesta o una entrega revisada antes de crear este informe.',
    footer: 'Creado en el navegador del docente con VISTA. Contiene únicamente sus respuestas. VISTA no califica, evalúa ni genera estas respuestas.'
  }
};
const HANDOFF = {
  en: {
    initial: 'Help me test my assumptions about what AI could do and prepare for the AHTR. Ask me to predict before suggesting changes.',
    ahtr: 'Help me examine what the AI trial showed, separate what I verified from what I assumed, and decide what that means for the task.',
    redesign: 'Help me examine my redesign, decide what student evidence to collect, and plan a manageable independent check of learning.',
    implementation: 'Help me organise what I observed while teaching without over-interpreting it, and decide what I still need to look at.',
    final: 'Help me compare intentions with observed evidence, consider alternative explanations, and choose one next change or transfer task.',
    reflection: 'Help me decide what to carry into my next assessment and what question to investigate, without overstating what this cycle showed.',
    rules: 'Separate my observations from your interpretations. Do not fill missing responses or claim learning improved without evidence. Ask one useful question at a time and wait for my answer. Use the sources in this workspace when relevant and identify which source supports a claim. Help me think through the decisions; keep the final choices with me.',
    lead: 'Use this VISTA report as context.'
  },
  es: {
    initial: 'Ayúdame a poner a prueba mis supuestos sobre lo que podría hacer la IA y a preparar la RHPA. Pídeme predecir antes de sugerir cambios.',
    ahtr: 'Ayúdame a examinar qué mostró la prueba con IA, a separar lo que verifiqué de lo que supuse y a decidir qué implica para la tarea.',
    redesign: 'Ayúdame a examinar mi rediseño, decidir qué evidencia estudiantil recoger y planear una comprobación independiente y manejable del aprendizaje.',
    implementation: 'Ayúdame a ordenar lo que observé al enseñar sin sobreinterpretarlo y a decidir qué me falta revisar.',
    final: 'Ayúdame a comparar mis intenciones con la evidencia observada, considerar explicaciones alternativas y elegir un siguiente cambio o una tarea de transferencia.',
    reflection: 'Ayúdame a decidir qué llevar a mi siguiente evaluación y qué pregunta investigar, sin exagerar lo que mostró este ciclo.',
    rules: 'Separa mis observaciones de tus interpretaciones. No completes respuestas que falten ni afirmes que el aprendizaje mejoró sin evidencia. Haz una pregunta útil a la vez y espera mi respuesta. Usa las fuentes de este espacio cuando sean pertinentes e indica cuál respalda cada afirmación. Ayúdame a pensar las decisiones; las decisiones finales son mías.',
    lead: 'Usa este informe VISTA como contexto.'
  }
};

const L = lang => (lang === 'es' ? 'es' : 'en');
export function valueAt(obj, path) { return path.split('.').reduce((v, k) => v?.[k], obj); }
const filled = v => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' && v.trim().length > 0);

export function stageHasContent(snapshot, stage) {
  return Boolean(snapshot?.submissions?.[stage]?.text?.trim() || FIELDS[stage].some(([p]) => filled(valueAt(snapshot, p))));
}
// How far a cycle has got, for progress displays: 'empty' | 'started' per stage.
export function stageStatus(snapshot) {
  return Object.fromEntries(STAGE_ORDER.map(s => [s, stageHasContent(snapshot || {}, s) ? 'started' : 'empty']));
}
export function handoff(stage, lang = 'en') {
  const h = HANDOFF[L(lang)];
  return `${h.lead} ${h[stage]} ${h.rules}`;
}
function display(path, value, lang) {
  if (path === 'classifier') return (value || []).map(t => TYPE_NAMES[lang][t] || t).join(', ');
  if (path === 'rating') return RATING_NAMES[lang][value] || value || '';
  if (path === 'implementation.ready') return (value || []).map(k => READY_NAMES[lang][k] || k).join('; ');
  return value == null ? '' : String(value);
}
// Structured form of a report, shared by the text and the printable versions.
export function reportModel({title, stage, snapshot, createdAt = new Date().toISOString(), lang = 'en'}) {
  lang = L(lang);
  if (!STAGE_NAMES.en[stage]) throw new Error('Unknown report stage');
  const tx = TEXT[lang];
  const stages = STAGE_ORDER.slice(0, STAGE_ORDER.indexOf(stage) + 1);
  if (!stages.some(s => stageHasContent(snapshot, s))) throw new Error(tx.empty);
  const sections = stages.map(part => {
    const submission = snapshot.submissions?.[part];
    const hasSubmission = Boolean(submission?.text?.trim());
    const items = [];
    for (const [path, en, es] of FIELDS[part]) {
      const value = display(path, valueAt(snapshot, path), lang);
      const optional = path.startsWith('min_reflection') || path === 'deepdive.standaloneSail' || path === 'light_reflection.lr1';
      if (optional && !value) continue;
      items.push({label: lang === 'es' ? es : en, value: value || (hasSubmission ? tx.seeSubmission : tx.notProvided), empty: !value});
    }
    return {stage: part, name: stageName(part, lang), submission: hasSubmission ? submission.text : '', sources: (submission?.sources || []).map(s => s.name), items};
  });
  const summary = [
    [FIELDS.initial[3][lang === 'es' ? 2 : 1], display('classifier', snapshot.classifier, lang)],
    [FIELDS.initial[4][lang === 'es' ? 2 : 1], display('rating', snapshot.rating, lang)],
    [FIELDS.initial[5][lang === 'es' ? 2 : 1], snapshot.sail || ''],
    [FIELDS.redesign[1][lang === 'es' ? 2 : 1], snapshot.redesign?.sail || '']
  ].filter(([, v]) => v);
  return {
    lang, stage, title: title || tx.none, createdAt,
    heading: `VISTA — ${stageName(stage, lang)} ${tx.report}`,
    teacher: snapshot.meta?.teacher || tx.none, department: snapshot.meta?.discipline || tx.none,
    summary, sections, handoff: handoff(stage, lang), tx
  };
}
// Plain-text (Markdown-compatible) report.
export function buildReport(options) {
  const m = reportModel(options), tx = m.tx;
  const lines = [m.heading, `${tx.cycle}: ${m.title}`, `${tx.created}: ${m.createdAt}`, `${tx.teacher}: ${m.teacher}`, `${tx.department}: ${m.department}`, '', tx.preface, ''];
  if (m.summary.length) { lines.push(`## ${tx.summary}`); for (const [k, v] of m.summary) lines.push(`- ${k}: ${v}`); lines.push(''); }
  for (const s of m.sections) {
    lines.push(`## ${s.name}`);
    if (s.submission) lines.push(`### ${tx.reviewed}`, s.submission, '');
    if (s.sources.length) lines.push(`${tx.sources}: ${s.sources.join(', ')}`, '');
    for (const item of s.items) lines.push(`### ${item.label}`, item.value, '');
  }
  lines.push(`## ${tx.continueHead}`, tx.continueBody, '', `### ${tx.handoffHead}`, m.handoff);
  return lines.join('\n');
}
export function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c])); }
// Minimal printable wrapper around plain text.
export function reportHTML(text, title = 'VISTA report') {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHTML(title)}</title><style>body{font:15px/1.6 system-ui;max-width:850px;margin:40px auto;padding:20px;color:#17323d}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}@media print{body{margin:0}}</style></head><body><pre>${escapeHTML(text)}</pre></body></html>`;
}
// Typeset report for printing or saving as PDF. Every teacher-supplied string is escaped.
export function reportDocument(options) {
  const m = reportModel(options), tx = m.tx, e = escapeHTML;
  const date = new Date(m.createdAt);
  const when = isNaN(date) ? m.createdAt : date.toLocaleDateString(m.lang === 'es' ? 'es' : 'en', {year: 'numeric', month: 'long', day: 'numeric'});
  const section = s => `<section><h2>${e(s.name)}</h2>${s.submission ? `<h3>${e(tx.reviewed)}</h3><p class="answer">${e(s.submission)}</p>` : ''}${s.sources.length ? `<p class="meta">${e(tx.sources)}: ${e(s.sources.join(', '))}</p>` : ''}${s.items.map(i => `<div class="item"><h3>${e(i.label)}</h3><p class="answer${i.empty ? ' empty' : ''}">${e(i.value)}</p></div>`).join('')}</section>`;
  return `<!doctype html><html lang="${m.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(m.heading)} — ${e(m.title)}</title><style>
@page{margin:20mm 18mm}
*{box-sizing:border-box}
body{font:11.5pt/1.55 Georgia,'Times New Roman',serif;color:#1a1f2e;max-width:760px;margin:32px auto;padding:0 24px}
header{border-bottom:2px solid #0f2236;padding-bottom:14px;margin-bottom:22px}
.kicker{font:600 8.5pt/1.2 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#1a6b7a;margin:0 0 6px}
h1{font-size:22pt;line-height:1.15;margin:0 0 10px;color:#0f2236}
.meta{font:9.5pt/1.5 system-ui,sans-serif;color:#4b5a63;margin:2px 0}
.note{font:italic 10pt/1.5 Georgia,serif;color:#4b5a63;margin:14px 0 0}
table{border-collapse:collapse;width:100%;margin:6px 0 4px;font:10pt/1.4 system-ui,sans-serif}
th,td{text-align:left;padding:6px 10px 6px 0;border-bottom:1px solid #d9d2c6;vertical-align:top}
th{width:42%;font-weight:600;color:#0f2236}
section{margin:26px 0 0}
h2{font:700 14pt/1.25 Georgia,serif;color:#0f2236;border-bottom:1px solid #c4861a;padding-bottom:5px;margin:0 0 12px;break-after:avoid}
h3{font:600 9.5pt/1.35 system-ui,sans-serif;color:#1a6b7a;margin:14px 0 4px;break-after:avoid}
.answer{white-space:pre-wrap;overflow-wrap:anywhere;margin:0}
.answer.empty{color:#7a858c;font-style:italic}
.item{break-inside:avoid-page}
.handoff{background:#f4f1ea;border-left:3px solid #c4861a;padding:10px 14px;font:10pt/1.5 system-ui,sans-serif}
footer{margin-top:30px;padding-top:10px;border-top:1px solid #d9d2c6;font:8.5pt/1.45 system-ui,sans-serif;color:#5d6a72}
@media print{body{margin:0;padding:0;max-width:none}}
</style></head><body>
<header><p class="kicker">VISTA · Visibility Into Student Thinking and Agency</p><h1>${e(m.title)}</h1>
<p class="meta">${e(stageName(m.stage, m.lang))} ${e(tx.report)} · ${e(when)}</p>
<p class="meta">${e(tx.teacher)}: ${e(m.teacher)} · ${e(tx.department)}: ${e(m.department)}</p>
<p class="note">${e(tx.preface)}</p></header>
${m.summary.length ? `<section><h2>${e(tx.summary)}</h2><table>${m.summary.map(([k, v]) => `<tr><th scope="row">${e(k)}</th><td>${e(v)}</td></tr>`).join('')}</table></section>` : ''}
${m.sections.map(section).join('')}
<section><h2>${e(tx.continueHead)}</h2><p>${e(tx.continueBody)}</p><h3>${e(tx.handoffHead)}</h3><p class="handoff">${e(m.handoff)}</p></section>
<footer>${e(tx.footer)}</footer>
</body></html>`;
}
