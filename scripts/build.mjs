import {build} from 'esbuild';
import {mkdir,copyFile,cp,readdir,rm} from 'node:fs/promises';
await rm('assets',{recursive:true,force:true});
await mkdir('assets',{recursive:true});
await build({entryPoints:['src/cloud.js','src/audio-worker.js'],bundle:true,outdir:'assets',format:'esm',splitting:true,minify:true,platform:'browser',target:'es2022',entryNames:'[name]',chunkNames:'chunk-[hash]'});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','assets/pdf.worker.min.mjs');

await mkdir('assets/onnx',{recursive:true});
for(const ext of ['mjs','wasm'])await copyFile('node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.'+ext,'assets/onnx/ort-wasm-simd-threaded.'+ext);
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const name of await readdir('.'))if(/\.(html|css|ico|png|svg|webmanifest)$/.test(name))await copyFile(name,'dist/'+name);
for(const name of ['assets','css','public'])await cp(name,'dist/'+name,{recursive:true});
