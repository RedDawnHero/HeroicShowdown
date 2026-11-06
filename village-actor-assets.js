/* Original village actors, with lossless packing for the large companion GLB. */
(() => {
  const cache=new Map();
  const parse=(loader,bytes)=>new Promise((resolve,reject)=>loader.parse(bytes,'',g=>resolve(g.scene),reject));
  window.loadVillagePeopleAsset=(key,loader)=>{
    if(cache.has(key))return cache.get(key);
    const request=(async()=>{
      if(key==='villagers')return new Promise((resolve,reject)=>loader.load('assets/level3-villagers.glb?v=original-1',g=>resolve(g.scene),undefined,reject));
      if(key!=='finnew-companions')throw Error('Unknown village actor group');
      const pieces=await Promise.all([0,1,2].map(async i=>{const r=await fetch('assets/level3-finnew-companions.glb.gz.part'+i+'?v=original-1');if(!r.ok)throw Error('Companion model part '+i+' could not load');return r.arrayBuffer();}));
      const packed=new Blob(pieces);let bytes;
      if(typeof DecompressionStream==='function')bytes=await new Response(packed.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      else{const{gunzipSync}=await import('https://cdn.jsdelivr.net/npm/fflate@0.8.2/esm/browser.js');const raw=gunzipSync(new Uint8Array(await packed.arrayBuffer()));bytes=raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength);}
      return parse(loader,bytes);
    })().catch(error=>{cache.delete(key);throw error;});
    cache.set(key,request);return request;
  };
})();
