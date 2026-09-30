export const MAX_BYTES=25*1024*1024;
export const ACCEPT='.txt,.md,.pdf,.docx,.mp3,.wav,.m4a,.mp4,.ogg,.webm,.flac';
export function fileKind(file){const ext=file.name.split('.').pop().toLowerCase();if(['txt','md','pdf','docx'].includes(ext))return ext;if(['mp3','wav','m4a','mp4','ogg','webm','flac'].includes(ext))return 'audio';throw new Error('Use TXT, Markdown, PDF, DOCX, or an audio file.');}
let worker,pendingReject;
export function cancelTranscription(){worker?.terminate();worker=null;const reject=pendingReject;pendingReject=null;reject?.(new Error("Transcription cancelled."));}
export async function readSubmission(file,onProgress,language='english'){
 if(!file.size||file.size>MAX_BYTES)throw new Error('Choose a file between 1 byte and 25 MB.');
 const kind=fileKind(file);
 if(kind==='txt'||kind==='md')return file.text();
 if(kind==='docx'){
  const {default:mammoth}=await import('mammoth/mammoth.browser.js');
  const {value}=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return value;
 }
 if(kind==='pdf'){
  const pdfjs=await import('pdfjs-dist/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='/assets/pdf.worker.min.mjs';
  const pdf=await pdfjs.getDocument({data:await file.arrayBuffer(),isEvalSupported:false}).promise;
  if(pdf.numPages>100){await pdf.destroy();throw new Error('Use a PDF of 100 pages or fewer.');}
  try {
   const pages=[];
   for(let i=1;i<=pdf.numPages;i++){onProgress(`Reading page ${i} of ${pdf.numPages}…`);const page=await pdf.getPage(i);const content=await page.getTextContent();const text=content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('');if(!text.trim())throw new Error(`Page ${i} has no readable text. Use a searchable PDF or paste a transcript; this file has not been imported.`);pages.push(`[Page ${i}]\n${text}`);}
   return pages.join('\n\n');
  }finally{await pdf.destroy();}
 }
 onProgress('Reading audio…');
 const context=new AudioContext();
 let decoded;try{decoded=await context.decodeAudioData(await file.arrayBuffer());}finally{await context.close();}
 if(decoded.duration>1200)throw new Error('Use an audio recording of 20 minutes or less. Split longer recordings into parts.');
 const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000);
 const source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();
 const samples=(await offline.startRendering()).getChannelData(0);
 return new Promise((resolve,reject)=>{
  pendingReject=reject;
  worker=new Worker('/assets/audio-worker.js',{type:'module'});
  worker.onmessage=({data})=>{if(data.type==='progress')onProgress(data.message);else{pendingReject=null;cancelTranscription();data.type==='done'?resolve(data.text):reject(new Error(data.message));}};
  worker.onerror=()=>{pendingReject=null;cancelTranscription();reject(new Error('This browser could not run transcription. Try a desktop browser or paste a transcript.'));};
  worker.postMessage({samples,language},[samples.buffer]);
 });
}
