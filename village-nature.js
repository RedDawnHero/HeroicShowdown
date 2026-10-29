/* Quiet procedural water and wind; active only in the village. */
(() => {
 let context,master,enabled=false,muted=false;
 const button=document.createElement('button');button.textContent='WATER & WIND ON';button.hidden=true;button.type='button';button.style.cssText='position:absolute;left:16px;bottom:40px;z-index:36;padding:9px;background:#102523;color:#eefaff;border:1px solid #91c9ce';document.querySelector('.arena-wrap')?.appendChild(button);
 function volume(){if(master)master.gain.setTargetAtTime((enabled&&!muted&&!document.hidden) ? .17 : 0,context.currentTime,.35);button.textContent=muted?'WATER & WIND OFF':context?.state==='running'?'WATER & WIND ON':'ENABLE WATER & WIND';button.setAttribute('aria-pressed',String(!muted));}
 function unlock(){if(!enabled||muted)return;try{
  if(!context){context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=0;master.connect(context.destination);
   const buffer=context.createBuffer(2,context.sampleRate*12,context.sampleRate);
   for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);let low=0;for(let i=0;i<data.length;i++){low=(low+(Math.random()*2-1)*.03)/1.03;data[i]=low*4;}}
   for(const [frequency,gain,rate] of [[650,.65,.12],[2300,.28,.27],[180,.2,.07]]){
    const source=context.createBufferSource();source.buffer=buffer;source.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=frequency;
    const level=context.createGain();level.gain.value=gain;source.connect(filter).connect(level).connect(master);source.start();
    const sway=context.createOscillator(),depth=context.createGain();sway.frequency.value=rate;depth.gain.value=gain*.12;sway.connect(depth).connect(level.gain);sway.start();
   }
  }
  context.resume().then(volume).catch(()=>{button.textContent='ENABLE WATER & WIND';});volume();
 }catch{button.textContent='WATER SOUND UNAVAILABLE';}}
 button.onclick=()=>{if(context?.state!=='running'){muted=false;unlock();}else{muted=!muted;volume();}};
 window.villageNature={setActive(value){const changed=enabled!==!!value;enabled=!!value;button.hidden=!enabled;if(changed&&enabled)unlock();volume();}};
 for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{if(enabled&&(!context||context.state==='suspended'))unlock();},{capture:true});
 document.addEventListener('visibilitychange',volume);
})();
