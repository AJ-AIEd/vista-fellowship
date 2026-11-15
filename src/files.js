// On-device text extraction for imported teacher documents.
// Files are read in the browser. Nothing is uploaded, and the original file is not stored:
// only the text the teacher reviews and accepts is kept with the cycle.
export const MAX_BYTES = 25 * 1024 * 1024;
export const MAX_CHARS = 100000;
export const ACCEPT = '.txt,.md,.pdf,.docx';
export function fileKind(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (['txt', 'md', 'pdf', 'docx'].includes(ext)) return ext;
  throw new Error('Use a TXT, Markdown, searchable PDF, or DOCX file.');
}
export async function readSubmission(file, onProgress = () => {}) {
  if (!file.size || file.size > MAX_BYTES) throw new Error('Choose a file between 1 byte and 25 MB.');
  const kind = fileKind(file);
  if (kind === 'txt' || kind === 'md') return file.text();
  if (kind === 'docx') {
    const {default: mammoth} = await import('mammoth/mammoth.browser.js');
    const {value} = await mammoth.extractRawText({arrayBuffer: await file.arrayBuffer()});
    return value;
  }
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
  const task = pdfjs.getDocument({data: await file.arrayBuffer(), isEvalSupported: false});
  const pdf = await task.promise;
  try {
    if (pdf.numPages > 100) throw new Error('Use a PDF of 100 pages or fewer.');
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress(`Reading page ${i} of ${pdf.numPages}…`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(x => x.str + (x.hasEOL ? '\n' : ' ')).join('');
      if (!text.trim()) throw new Error(`Page ${i} has no readable text. Use a searchable PDF or paste the text; this file has not been imported.`);
      pages.push(`[Page ${i}]\n${text}`);
    }
    return pages.join('\n\n');
  } finally { await task.destroy(); }
}
