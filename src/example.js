// A worked example cycle. Every response here is synthetic: it was written to illustrate
// what a completed cycle can look like. It is not a record of a real class and is not evidence
// about VISTA's effects.
const en = {
  title: 'Example · Linear or exponential? (Grade 10 mathematics)',
  draft: {
    lang: 'en',
    meta: {teacher: 'Example teacher (synthetic)', discipline: 'High School Mathematics', assessment: 'Example · Linear or exponential? (Grade 10 mathematics)', date: 'Illustrative example'},
    task: 'Grade 10, functions unit. Students receive a table of resale prices for one phone model at different ages (in months). In Desmos they fit a linear and an exponential model, decide which describes the data better, and write a paragraph justifying the choice.\n\nThe thinking I want: recognising constant differences versus constant ratios in real, noisy data; using a residual plot as evidence rather than quoting R²; interpreting the parameters in context; and saying where the model stops being trustworthy. A student who understands can explain what in the data would have to be different for the other model to win.',
    learningEvidence: 'The written justification. I have trusted it because it has to refer to features of the data. Writing this down, I am less sure: the paragraph shows that a good justification exists, not that the student produced the reasoning.',
    humanAI: 'Conceptual: AI can state the difference between linear and exponential change, but I expect it to stay generic rather than use this table.\nEvaluative: I expect it to pick the model with the higher R² and stop there. I do not expect it to read a residual plot.\nProcedural: it can run both regressions.\nStudents must still decide what counts as evidence for a model, and connect the parameters to the phone context.',
    classifier: ['proc', 'conc', 'eval'],
    rating: 'subs',
    sail: 'L3',
    sailJustify: 'L3 (Edit): students fit the models and draft the justification themselves, then may use AI to improve the clarity of the paragraph. This should protect the model choice, which happens before any AI use. I would change it if the trial shows AI can produce the reasoning itself.',
    light_reflection: {lr1: 'Will AI use the residual pattern, or only quote R²?'},
    deepdive: {
      prediction: 'Unchanged from my audit: I expect a choice based on R² alone and a generic explanation.',
      dd1: 'My prediction was wrong in the way that matters. Given the table, the AI fitted both models, chose the exponential one, and justified it with approximately constant ratios between successive prices and with a curved pattern in the linear residuals. That is the reasoning I assess. What it did not do: it never questioned the data (one price looks like a typo), and it asserted a “typical depreciation rate for phones” with no source.\n\nI went back to the Initial Audit and changed my estimate from Partially to Substantially.',
      dd2: 'Checked independently: I recomputed both regressions in Desmos. The AI’s exponential parameters did not match mine until I switched off log mode, so it had fitted a linearised model without saying so. A student would not notice that. The claim that the higher R² “proves” the exponential model is too strong for eleven data points; my standard is that R² is one piece of evidence and the residual pattern is another. Still uncertain: whether students can tell a fluent justification from a sound one. The AI’s paragraph sounds like understanding.',
      dd3: 'Students who are confident with the tools would paste the table and submit the paragraph. Students still developing academic English could gain from help with phrasing, but the same help supplies the reasoning, so the access benefit and the bypass arrive together. The student I worry about most can already recite “exponential means constant ratio” and would recognise the AI answer as correct without ever checking the table. Assumption to test: that my students would notice the suspicious data point. I can check that with a warm-up before the task.',
      dd4: 'What must stay the student’s: choosing a model for data they have not seen before, and saying what in the data would change their mind. What AI may do: produce a justification that students then evaluate.\n\nAlternative I considered: keep the take-home paragraph and add a process log. I rejected it because the log can be generated as easily as the paragraph. Trade-off: I lose a polished written product and gain direct evidence of the decision. Evidence: a short in-class explanation on a new table. It can miss retention, and it may under-represent students who need longer to write.',
      dd4redesign: 'Part A (no AI, in class, 15 minutes): You receive a new table. Decide whether a linear or an exponential model describes it better. Give two pieces of evidence from the table or the residual plot, and state one thing that would have to be different for the other model to fit better. You may write or record your explanation.\n\nPart B (AI output provided, pairs): Here is a justification written by an AI for the phone data. Mark one claim you accept, one you would check, and one you reject, with reasons.',
      standaloneSail: ''
    },
    redesign: {
      sail: 'L1, L4',
      evidence: 'Part A responses on the new table. They would reflect the student’s own thinking because the table is unseen and no tools beyond Desmos are open. They cannot show whether the understanding lasts, and written responses may hide what some students could explain aloud.',
      supports: 'A vocabulary bank (difference, ratio, residual, pattern) and the option to record a spoken explanation. Route without AI for Part B: critique a flawed justification that I wrote, with the same three decisions.'
    },
    implementation: {
      when: 'Two Grade 10 sections, one 80-minute block each, in the second week of the functions unit.',
      ready: ['instructions', 'route', 'evidence', 'privacy'],
      evidence: 'Illustrative notes. Part A: roughly two thirds of explanations pointed to ratios or differences in the actual table; about a third said “exponential because it curves” without using the data. Several students could not say what would make the other model fit. Part B: most pairs flagged the R² claim; few questioned the unsourced depreciation rate.\n\nWhat this does not show: whether the students who used the table would do so without the prompt “give two pieces of evidence”.',
      adjustments: 'Gave three extra minutes for Part A. Two students recorded spoken explanations. I read the Part B instructions aloud after the first section misread “reject”.'
    },
    final_audit: {
      fq1: 'How many students could choose the right model but could not say what would change their mind. I had treated the choice and the reasoning as one thing.',
      fq2: 'In Part B the AI text helped: it gave students something concrete to disagree with, and their criticisms of the R² claim were specific. It would have done the thinking for them in the original task, where the same text would simply have been submitted.',
      fq3: 'It shows which students use evidence from the data when asked for it. It cannot show whether they would look for that evidence unprompted, or whether this holds for a different family of functions.',
      fq4: 'Fluent writing versus visible reasoning. I gave up the paragraph I used to grade, and I am not sure the shorter responses let stronger students show depth.',
      fq5: 'I assumed the written justification was evidence of the reasoning. An alternative explanation for the weaker Part A responses is time pressure rather than missing understanding; I did not separate the two.',
      fq6: 'Do students who cannot state a disconfirming condition improve if I ask that question routinely? I could compare responses on the next modelling task.',
      fq7: 'In this topic AI handles the model choice and a competent justification. It was weakest where judgment about the data itself was needed: the suspicious point and the unsupported real-world claim. I had the boundary in the wrong place.',
      fq8: 'Keep the unseen table and the “what would change your mind” prompt. Next time allow more time for Part A, and look at whether the prompt is doing the work by removing it for one question.',
      fq9: 'Run the AI trial before deciding anything. My audit was confident and wrong about what the tool would do with my own task. I am still unsure how much of the improvement is the redesign and how much is simply asking a better question.'
    },
    next: {
      uncertain: 'Whether the in-class explanation measures understanding or speed, and whether any of this transfers beyond modelling tasks.',
      transfer: 'The quadratic modelling task later in the year. I will reuse the unseen-data check and the disconfirming-condition prompt, and drop the paired critique unless I can find a better AI output to critique.'
    }
  }
};
const es = {
  title: 'Ejemplo · ¿Lineal o exponencial? (Matemáticas, grado 10)',
  draft: {
    lang: 'es',
    meta: {teacher: 'Docente de ejemplo (ficticio)', discipline: 'Matemáticas de bachillerato', assessment: 'Ejemplo · ¿Lineal o exponencial? (Matemáticas, grado 10)', date: 'Ejemplo ilustrativo'},
    task: 'Grado 10, unidad de funciones. Los estudiantes reciben una tabla con precios de reventa de un modelo de teléfono según su antigüedad (en meses). En Desmos ajustan un modelo lineal y uno exponencial, deciden cuál describe mejor los datos y escriben un párrafo que justifique la elección.\n\nEl pensamiento que busco: reconocer diferencias constantes frente a razones constantes en datos reales e imperfectos; usar la gráfica de residuos como evidencia en lugar de citar R²; interpretar los parámetros en contexto; y decir dónde deja de ser confiable el modelo. Quien comprende puede explicar qué tendría que ser distinto en los datos para que ganara el otro modelo.',
    learningEvidence: 'La justificación escrita. He confiado en ella porque tiene que referirse a características de los datos. Al escribirlo, tengo menos certeza: el párrafo muestra que existe una buena justificación, no que el estudiante haya producido el razonamiento.',
    humanAI: 'Conceptual: la IA puede enunciar la diferencia entre cambio lineal y exponencial, pero espero que se quede en lo genérico y no use esta tabla.\nEvaluativo: espero que elija el modelo con mayor R² y se detenga ahí. No espero que lea una gráfica de residuos.\nProcedimental: puede calcular ambas regresiones.\nLos estudiantes deben seguir decidiendo qué cuenta como evidencia a favor de un modelo y relacionar los parámetros con el contexto del teléfono.',
    classifier: ['proc', 'conc', 'eval'],
    rating: 'subs',
    sail: 'L3',
    sailJustify: 'L3 (Editar): los estudiantes ajustan los modelos y redactan la justificación por su cuenta; después pueden usar IA para mejorar la claridad del párrafo. Esto debería proteger la elección del modelo, que ocurre antes de cualquier uso de IA. Lo cambiaría si la prueba muestra que la IA puede producir el razonamiento.',
    light_reflection: {lr1: '¿Usará la IA el patrón de los residuos o solo citará R²?'},
    deepdive: {
      prediction: 'Igual que en mi auditoría: espero una elección basada solo en R² y una explicación genérica.',
      dd1: 'Mi predicción falló justo en lo importante. Con la tabla, la IA ajustó ambos modelos, eligió el exponencial y lo justificó con razones aproximadamente constantes entre precios sucesivos y con un patrón curvo en los residuos del modelo lineal. Ese es el razonamiento que evalúo. Lo que no hizo: nunca cuestionó los datos (un precio parece un error de digitación) y afirmó una “tasa de depreciación típica de los teléfonos” sin fuente.\n\nVolví a la Auditoría Inicial y cambié mi estimación de Parcialmente a Sustancialmente.',
      dd2: 'Comprobado de forma independiente: recalculé ambas regresiones en Desmos. Los parámetros exponenciales de la IA no coincidieron con los míos hasta que desactivé el modo logarítmico, así que había ajustado un modelo linealizado sin decirlo. Un estudiante no lo notaría. La afirmación de que un R² mayor “demuestra” el modelo exponencial es excesiva para once datos; mi criterio es que R² es una evidencia y el patrón de residuos es otra. Sigue incierto: si los estudiantes distinguen una justificación fluida de una sólida. El párrafo de la IA suena a comprensión.',
      dd3: 'Quienes manejan bien las herramientas pegarían la tabla y entregarían el párrafo. Quienes aún desarrollan el español académico podrían beneficiarse de ayuda con la redacción, pero esa misma ayuda entrega el razonamiento, de modo que el acceso y la sustitución llegan juntos. Me preocupa sobre todo quien ya recita “exponencial significa razón constante” y reconocería la respuesta de la IA como correcta sin mirar la tabla. Supuesto por comprobar: que mis estudiantes notarían el dato sospechoso. Puedo comprobarlo con una actividad inicial antes de la tarea.',
      dd4: 'Lo que debe seguir siendo del estudiante: elegir un modelo para datos que no ha visto y decir qué en los datos le haría cambiar de opinión. Lo que puede hacer la IA: producir una justificación que los estudiantes evalúan.\n\nAlternativa que consideré: mantener el párrafo para la casa y añadir un registro del proceso. La descarté porque el registro puede generarse tan fácilmente como el párrafo. Costo: pierdo un producto escrito pulido y gano evidencia directa de la decisión. Evidencia: una explicación breve en clase sobre una tabla nueva. Puede no captar la retención y puede subrepresentar a quienes necesitan más tiempo para escribir.',
      dd4redesign: 'Parte A (sin IA, en clase, 15 minutos): Recibes una tabla nueva. Decide si un modelo lineal o uno exponencial la describe mejor. Da dos evidencias de la tabla o de la gráfica de residuos e indica una cosa que tendría que ser distinta para que el otro modelo ajustara mejor. Puedes escribir o grabar tu explicación.\n\nParte B (resultado de IA entregado, en parejas): Esta es una justificación escrita por una IA para los datos del teléfono. Marca una afirmación que aceptas, una que comprobarías y una que rechazas, con razones.',
      standaloneSail: ''
    },
    redesign: {
      sail: 'L1, L4',
      evidence: 'Las respuestas de la Parte A sobre la tabla nueva. Reflejarían el pensamiento propio porque la tabla es desconocida y solo está abierto Desmos. No pueden mostrar si la comprensión perdura, y las respuestas escritas pueden ocultar lo que algunos estudiantes explicarían oralmente.',
      supports: 'Un banco de vocabulario (diferencia, razón, residuo, patrón) y la opción de grabar una explicación oral. Vía sin IA para la Parte B: criticar una justificación defectuosa escrita por mí, con las mismas tres decisiones.'
    },
    implementation: {
      when: 'Dos grupos de grado 10, un bloque de 80 minutos cada uno, en la segunda semana de la unidad de funciones.',
      ready: ['instructions', 'route', 'evidence', 'privacy'],
      evidence: 'Notas ilustrativas. Parte A: cerca de dos tercios de las explicaciones señalaron razones o diferencias en la tabla; alrededor de un tercio dijo “exponencial porque se curva” sin usar los datos. Varios estudiantes no pudieron decir qué haría que el otro modelo ajustara. Parte B: la mayoría de las parejas cuestionó la afirmación sobre R²; pocas cuestionaron la tasa de depreciación sin fuente.\n\nLo que esto no muestra: si quienes usaron la tabla lo harían sin la indicación “da dos evidencias”.',
      adjustments: 'Di tres minutos más para la Parte A. Dos estudiantes grabaron explicaciones orales. Leí en voz alta las instrucciones de la Parte B después de que el primer grupo malinterpretó “rechazas”.'
    },
    final_audit: {
      fq1: 'Cuántos estudiantes podían elegir el modelo correcto pero no decir qué les haría cambiar de opinión. Yo había tratado la elección y el razonamiento como una sola cosa.',
      fq2: 'En la Parte B el texto de la IA ayudó: dio a los estudiantes algo concreto con lo cual discrepar, y sus críticas a la afirmación sobre R² fueron específicas. En la tarea original habría pensado por ellos, porque ese mismo texto simplemente se habría entregado.',
      fq3: 'Muestra qué estudiantes usan evidencia de los datos cuando se les pide. No puede mostrar si la buscarían sin que se les indique, ni si esto se mantiene con otra familia de funciones.',
      fq4: 'Escritura fluida frente a razonamiento visible. Renuncié al párrafo que solía calificar y no sé si las respuestas más breves permiten a los estudiantes más avanzados mostrar profundidad.',
      fq5: 'Supuse que la justificación escrita era evidencia del razonamiento. Otra explicación de las respuestas más débiles en la Parte A es la presión de tiempo y no la falta de comprensión; no separé ambas.',
      fq6: '¿Mejoran quienes no pueden enunciar una condición que refute su elección si hago esa pregunta de forma habitual? Podría comparar las respuestas en la siguiente tarea de modelación.',
      fq7: 'En este tema la IA resuelve la elección del modelo y una justificación competente. Fue más débil donde hacía falta juicio sobre los datos mismos: el punto sospechoso y la afirmación sin respaldo sobre el mundo real. Yo había puesto el límite en el lugar equivocado.',
      fq8: 'Mantener la tabla desconocida y la pregunta “¿qué te haría cambiar de opinión?”. La próxima vez daré más tiempo para la Parte A y comprobaré si la indicación está haciendo el trabajo, quitándola en una pregunta.',
      fq9: 'Haz la prueba con IA antes de decidir cualquier cosa. Mi auditoría era segura y se equivocó sobre lo que la herramienta haría con mi propia tarea. Aún no sé cuánto de la mejora se debe al rediseño y cuánto a hacer una mejor pregunta.'
    },
    next: {
      uncertain: 'Si la explicación en clase mide comprensión o rapidez, y si algo de esto se transfiere más allá de las tareas de modelación.',
      transfer: 'La tarea de modelación cuadrática de más adelante. Reutilizaré la comprobación con datos desconocidos y la pregunta sobre la condición que refuta, y dejaré la crítica en parejas salvo que encuentre un mejor resultado de IA para criticar.'
    }
  }
};
export function exampleCycle(lang = 'en') { return structuredClone(lang === 'es' ? es : en); }
