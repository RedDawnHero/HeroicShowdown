/* Restore the archived final-city model in the main campaign only. */
(() => {
  window.createCampaignFinalCity=(T,scene)=>{
    let group=null,pending=null,active=false,error=false;
    const notice=document.createElement('div');notice.hidden=true;notice.dataset.campaignLoading='';notice.setAttribute('role','status');notice.style.cssText='position:absolute;inset:25% 10%;z-index:28;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;background:#111827ef;border:1px solid #d3b475;color:#fff2cc;text-align:center;font:600 15px sans-serif';
    const text=document.createElement('p'),retry=document.createElement('button');retry.type='button';retry.className='btn btn-gold';retry.textContent='RETRY FINAL CITY LOADING';retry.hidden=true;notice.append(text,retry);document.querySelector('.arena-wrap').appendChild(notice);
    const style=document.createElement('style');style.textContent='[data-campaign-loading][hidden]{display:none!important}';document.head.appendChild(style);
    const sky=window.finalBattleSky?new T.TextureLoader().load(window.finalBattleSky):null;if(sky)sky.colorSpace=T.SRGBColorSpace;
    window.campaignFinalCityStatus='idle';window.campaignFinalCastReady=false;
    function load(){
      if(pending||group)return;error=false;window.campaignFinalCityStatus='loading';
      pending=Promise.resolve().then(()=>{if(!window.loadFinalCity)throw Error('Final-city loader unavailable');return window.loadFinalCity();}).then(source=>{
        if(!source)throw Error('Final-city model unavailable');
        const city=new T.Group(),bounds=new T.Box3().setFromObject(source),size=bounds.getSize(new T.Vector3()),scale=75/Math.max(size.x,size.z),center=bounds.getCenter(new T.Vector3());
        for(let i=0;i<4;i++){const tile=new T.Group(),model=source.clone(true);model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);tile.add(model);tile.position.set(i%2?56:-56,0,(Math.floor(i/2)*2-1)*74);city.add(tile);}
        scene.add(city);group=city;group.name='Restored Dark Warrior final city';group.visible=active;window.campaignFinalCityStatus='ready';
      }).catch(e=>{console.warn('Final city loading:',e);error=true;window.campaignFinalCityStatus='error';}).finally(()=>{pending=null;});
    }
    window.retryCampaignFinalCity=()=>{if(error&&!pending){window.retryCampaignFinalCityModel?.();error=false;window.campaignFinalCityStatus='idle';load();}};retry.onclick=()=>{window.retryDetailedCharacterModels?.();window.retryCampaignFinalCity();};
    return {
      update(state){active=state?.phase==='game'&&state.round===5&&!state.intro;if(group)group.visible=active;if(active&&!group&&!error)load();
        notice.hidden=!active||(window.campaignFinalCityStatus==='ready'&&window.campaignFinalCastReady===true);retry.hidden=!(error||window.campaignFinalCastError);text.textContent=error||window.campaignFinalCastError?'A saved final-city or character model could not load. Your mission is paused; retry loading to continue.':'Preparing the final city and detailed characters… Your mission timer is paused.';
        if(active){if(sky)scene.background=sky;scene.fog.color.setHex(0x563638);scene.fog.near=30;scene.fog.far=155;}
      },
      hide(){active=false;if(group)group.visible=false;notice.hidden=true;}
    };
  };
})();
