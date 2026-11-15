import {pipeline,env} from '@huggingface/transformers';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.wasmPaths={mjs:new URL('/assets/onnx/ort-wasm-simd-threaded.mjs',self.location.origin).href,wasm:new URL('/assets/onnx/ort-wasm-simd-threaded.wasm',self.location.origin).href};
let transcriber;
self.onmessage=async({data})=>{
 try {
  transcriber ||= await pipeline('automatic-speech-recognition','onnx-community/whisper-tiny',{device:'wasm',dtype:'q8',progress_callback:p=>self.postMessage({type:'progress',message:p.status==='progress'?`Downloading speech model: ${Math.round(p.progress||0)}%`:'Preparing on-device transcription…'})});
  self.postMessage({type:'progress',message:'Transcribing on this device…'});
  const result=await transcriber(data.samples,{language:data.language,task:'transcribe',chunk_length_s:25,stride_length_s:5,return_timestamps:false});
  self.postMessage({type:'done',text:result.text});
 }catch(error){self.postMessage({type:'error',message:'Transcription could not finish on this device. Try a shorter recording or paste a transcript. '+error.message});}
};
