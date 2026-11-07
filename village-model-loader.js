/* Decode the existing original GLB without compiling its 83 MB JavaScript wrapper. */
(()=>{
 let pending=null;
 window.loadOriginalVillageModel=(loader,onProgress=()=>{})=>{
  if(pending)return pending;
  pending=(async()=>{const controller=new AbortController();let timer,expired=false;const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;controller.abort();reject(Error('Village download timed out. Please retry.'));},180000);});
   try{return await Promise.race([(async()=>{
    onProgress('Downloading the original village model…');const response=await fetch('assets/level3-village-data.js',{signal:controller.signal});if(!response.ok)throw Error('Village asset returned HTTP '+response.status);const text=await response.text();if(expired)throw Error('Village load expired');
    const marker='window.level3ModelData.village="',start=text.indexOf(marker)+marker.length,end=text.indexOf('";',start);if(start<marker.length||end<=start)throw Error('Original village asset is invalid');
    onProgress('Preparing the original village buildings and terrain…');const encoded=text.slice(start,end),padding=encoded.endsWith('==')?2:encoded.endsWith('=')?1:0,bytes=new Uint8Array(encoded.length/4*3-padding),chunkSize=262144;let offset=0;
    for(let i=0;i<encoded.length;i+=chunkSize){const raw=atob(encoded.slice(i,i+chunkSize));for(let j=0;j<raw.length;j++)bytes[offset++]=raw.charCodeAt(j);}
    const view=new DataView(bytes.buffer);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(8,true)!==bytes.length)throw Error('Original village GLB is incomplete');
    return new Promise((resolve,reject)=>loader.parse(bytes.buffer,'',g=>{if(!expired)resolve(g.scene);},reject));
   })(),timeout]);}finally{clearTimeout(timer);}
  })().catch(error=>{pending=null;throw error;});return pending;
 };
})();
