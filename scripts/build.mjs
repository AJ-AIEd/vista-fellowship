// Builds the static site into dist/ (the Vercel output directory).
import {build} from 'esbuild';
import {mkdir, copyFile, cp, readdir, rm} from 'node:fs/promises';

await rm('assets', {recursive: true, force: true});
await mkdir('assets', {recursive: true});
// local.js is the account-free workspace. Document import (pdf.js, mammoth) is split into
// chunks that load only when a teacher imports a file.
await build({entryPoints: ['src/local.js'], bundle: true, outdir: 'assets', format: 'esm', splitting: true, minify: true, platform: 'browser', target: 'es2022', entryNames: '[name]', chunkNames: 'chunk-[hash]', legalComments: 'none'});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'assets/pdf.worker.min.mjs');
// Self-hosted fonts: see css/fonts.css.
await mkdir('assets/fonts', {recursive: true});
const fonts = {
  '@fontsource-variable/fraunces': ['fraunces-latin-opsz-normal', 'fraunces-latin-opsz-italic'],
  '@fontsource/dm-sans': ['dm-sans-latin-300-normal', 'dm-sans-latin-300-italic', 'dm-sans-latin-400-normal', 'dm-sans-latin-500-normal'],
  '@fontsource/dm-mono': ['dm-mono-latin-400-normal', 'dm-mono-latin-500-normal']
};
for (const [pkg, files] of Object.entries(fonts)) for (const f of files) await copyFile(`node_modules/${pkg}/files/${f}.woff2`, `assets/fonts/${f}.woff2`);

await rm('dist', {recursive: true, force: true});
await mkdir('dist', {recursive: true});
for (const name of await readdir('.')) if (/\.(html|css|ico|png|svg|webmanifest|txt)$/.test(name)) await copyFile(name, 'dist/' + name);
// Preserve school archives in source, but do not publish them in product previews.
// Reintroducing these materials requires an explicit ownership and privacy review.
for (const name of ['assets', 'css', 'js']) await cp(name, 'dist/' + name, {recursive: true});
console.log('Built dist/');
