/* Make the mission-loss condition visible before it ends the game. */
(() => {
  const wrap=document.querySelector('.arena-wrap');if(!wrap)return;
  const badge=document.createElement('div');badge.hidden=true;badge.dataset.cityDanger='';badge.setAttribute('role','status');badge.setAttribute('aria-live','polite');
  badge.style.cssText='position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:6;padding:7px 12px;max-width:85%;border-radius:6px;background:#102034e8;color:#ffe5a3;font:800 12px sans-serif;text-align:center;pointer-events:none';wrap.appendChild(badge);
  const style=document.createElement('style');style.textContent='[data-city-danger][hidden]{display:none!important}';document.head.appendChild(style);
  window.updateCityDangerUI=state=>{
    badge.hidden=state?.phase!=='game'||!!state.intro||!!state.misfitConfrontation||!!state.misfitEscape;
    if(badge.hidden)return;
    const danger=Math.round(Math.max(0,Math.min(100,state.danger||0))),critical=Number.isFinite(state.cityCriticalTime);
    const message=critical?'CITY CRITICAL · '+Math.ceil(state.cityCriticalTime)+'s TO RECOVER — defeat enemies or rescue civilians':'CITY DANGER · '+danger+'%';
    if(badge.textContent!==message)badge.textContent=message;
    badge.style.background=critical?'#8b1b21ee':danger>=75?'#7a4415ee':'#102034e8';
  };
})();
