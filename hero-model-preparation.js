/* No geometric hero stand-ins: show preparation until all real player models are ready. */
(() => {
  const wrap=document.querySelector('.arena-wrap');if(!wrap)return;
  const panel=document.createElement('div');panel.hidden=true;panel.dataset.heroPreparation='';panel.setAttribute('role','status');
  panel.style.cssText='position:absolute;inset:0;z-index:38;background:#101b2ff5;color:#fff2cf;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;box-sizing:border-box;font:700 18px sans-serif';
  const message=document.createElement('p');panel.appendChild(message);
  const retry=document.createElement('button');retry.type='button';retry.className='btn btn-outline';retry.textContent='RETRY MODEL LOADING';retry.onclick=async()=>{
    retry.disabled=true;retry.textContent='RETRYING MODELS…';
    try{
      if(window.retryDetailedCharacterModels)await Promise.race([window.retryDetailedCharacterModels(),new Promise(resolve=>setTimeout(resolve,15000))]);
    }catch(error){console.warn('Model retry is still pending:',error);}
    finally{retry.disabled=false;retry.textContent='RETRY MODEL LOADING';}
  };panel.appendChild(retry);
  const style=document.createElement('style');style.textContent='[data-hero-preparation][hidden]{display:none!important}';document.head.appendChild(style);wrap.appendChild(panel);
  window.syncDetailedHeroPreparation=state=>{
    const waiting=state?.phase==='game'&&!state.intro&&!state.heroModelsReady;
    panel.hidden=!waiting;if(!waiting)return;
    const players=Object.values(state.players||{}),ready=players.filter(p=>p.heroModelReady).length;
    message.textContent='Preparing detailed models · '+ready+' / '+players.length+' players ready. The mission timer is paused.';
  };
})();
