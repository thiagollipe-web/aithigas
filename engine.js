import { Wllama } from 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.1/esm/index.js';

const CONFIG={default:'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.1/esm/wasm/wllama.wasm'};
let runtime=null;
let loadedName='';

export function supportsWebGPU(){return !!navigator.gpu;}

export async function bootRuntime(){
  if(runtime) return runtime;
  runtime=new Wllama(CONFIG,{suppressNativeLog:true});
  return runtime;
}

export async function loadLocalModel(files,{n_ctx=4096,onProgress}={}){
  const w=await bootRuntime();
  try{await w.exit();}catch{}
  runtime=new Wllama(CONFIG,{suppressNativeLog:true});
  if(onProgress) onProgress(15);
  await runtime.loadModel(files,{n_ctx,n_gpu_layers:99999,jinja:true});
  if(onProgress) onProgress(95);
  const meta=runtime.getModelMetadata()?.meta||{};
  const name=meta['general.name']||files[0].name;
  loadedName=name;
  return {
    name,
    arch:meta['general.architecture']||'',
    quant:meta['general.file_type']||meta['general.quantization_version']||''
  };
}

export async function unloadModel(){if(runtime){await runtime.exit();runtime=null;loadedName='';}}

export async function chatStream(messages,{temperature=.7,max_tokens=1024,onToken}={}){
  if(!runtime) throw new Error('Nenhum modelo carregado.');
  const stream=await runtime.createChatCompletion({messages,temperature,max_tokens,stream:true});
  for await(const chunk of stream){
    const token=chunk?.choices?.[0]?.delta?.content||'';
    if(token&&onToken) onToken(token);
  }
  return true;
}
