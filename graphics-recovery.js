/* Recovery is outside the arena so it remains visible in menus and cinematics. */
(()=>{
 const lost=new Set(),failures=new Map();let notice,paused=false;
 function update(){if(!notice){notice=document.createElement('div');notice.id='graphicsRecoveryScreen';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#101b2f;color:#fff2cf;display:none;place-items:center;text-align:center;padding:30px;font:600 18px system-ui,sans-serif';document.body.appendChild(notice);}const next=lost.size>0||failures.size>0;window.heroGraphicsContextLost=lost.size>0;window.heroGraphicsPaused=next;notice.style.display=next?'grid':'none';notice.textContent=lost.size?'Restoring the 3D view… Your mission is paused.':failures.size?'Restoring the game view… Your mission is paused. '+[...failures.values()][0]:'';if(next!==paused){paused=next;window.dispatchEvent(new CustomEvent('hero-graphics-pause',{detail:{paused:next}}));}}
 document.addEventListener('webglcontextlost',event=>{const canvas=event.target;if(canvas?.dataset?.unbrokenRetired==='true')return;event.preventDefault();lost.add(canvas);update();queueMicrotask(update);},true);
 document.addEventListener('webglcontextrestored',event=>{lost.delete(event.target);update();queueMicrotask(update);},true);
 window.heroForgetGraphicsCanvas=canvas=>{lost.delete(canvas);update();};
 window.heroRenderFrameError=(source,error)=>{failures.set(source,String(error?.message||error||'The scene is still loading.'));update();};
 window.heroRenderFrameHealthy=source=>{if(failures.delete(source))update();};
 window.heroClearRenderFailure=source=>{failures.delete(source);update();};
})();
