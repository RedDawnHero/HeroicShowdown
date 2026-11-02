/* Original regenerated-boss face-off, using Red Dawn's helmet-off GLB. */
(() => {
  const wrap=document.querySelector('.arena-wrap');if(!wrap)return;
  let hero=null,sceneRef=null,savedFov=null,lastCamera=null;const hiddenActors=new Set();
  const overlay=document.createElement('div');overlay.hidden=true;overlay.dataset.misfitFaceoff='';overlay.setAttribute('role','status');
  overlay.style.cssText='position:absolute;inset:0;z-index:41;pointer-events:auto;box-shadow:inset 0 35px #000,inset 0 -42px #000;display:flex;align-items:flex-end;justify-content:center;padding:0 18px 48px;box-sizing:border-box;text-align:center;color:#fff3cd;text-shadow:0 2px 8px #000;font:800 clamp(14px,3vw,24px) sans-serif';
  const style=document.createElement('style');style.textContent='[data-misfit-faceoff][hidden]{display:none!important}';document.head.appendChild(style);wrap.appendChild(overlay);
  function createActor(){
    if(!window.createOpeningActor||!sceneRef)return;
    if(hero)hero.removeFromParent();
    hero=window.createOpeningActor('golden','red-dawn-faceoff');hero.userData.cinematicHelmetOff=true;hero.visible=false;
  }
  window.prepareMisfitConfrontation=(state,scene)=>{sceneRef=scene;if(state?.phase==='game'&&state.round===1&&!hero)createActor();};
  window.misfitConfrontationModelReady=()=>!!hero?.userData.glbModel;
  window.retryMisfitConfrontationActor=()=>{if(!hero?.userData.glbModel)createActor();};
  window.syncMisfitConfrontationUI=state=>{
    const c=state?.phase==='game'&&state.misfitConfrontation;overlay.hidden=!c;
    if(c){overlay.textContent=c.age<.7?'MR. MISFIT REGENERATES':c.age<3.3?'RED DAWN STANDS READY':c.age<4.5?'MISFIT ANSWERS THE CHALLENGE':'ROUND TWO · GET READY';return;}
    if(hero)hero.visible=false;for(const actor of hiddenActors)actor.visible=true;hiddenActors.clear();
    if(lastCamera&&savedFov!==null){lastCamera.fov=savedFov;lastCamera.updateProjectionMatrix();savedFov=null;}
  };
  const ease=(T,u,a,b)=>T.MathUtils.smoothstep(u,a,b);
  window.updateMisfitConfrontation=(T,state,camera,rigs)=>{
    const c=state?.misfitConfrontation;if(!c||!hero?.userData.glbModel)return;
    const boss=rigs.get('ashen-king');if(!boss?.userData.glbModel)return;
    lastCamera=camera;if(savedFov===null)savedFov=camera.fov;
    hero.visible=true;hero.position.set((c.heroX-500)*.055,boss.position.y,(c.heroY-300)*.055);
    hero.rotation.set(0,Math.atan2(c.bossX-c.heroX,c.bossY-c.heroY),0);hero.scale.setScalar(1);
    // Hide the playing Red Dawn during his stand-in shot without changing helmet choice.
    for(const [key,p] of Object.entries(state.players))if(p.hero==='guardian'){const actor=rigs.get(key);if(actor){hiddenActors.add(actor);actor.visible=false;}}
    window.resetCharacterPose?.(hero);
    const g=hero.userData.glbRig,bg=boss.userData.glbRig;
    hero.userData.glbModel.visible=true;if(hero.userData.helmetedModel)hero.userData.helmetedModel.visible=false;
    if(g?.mask){g.mask.bone.position.copy(g.mask.home);g.mask.bone.rotation.x=0;}
    const raise=ease(T,c.age,1.9,3.15),answer=ease(T,c.age,3.35,4.4);
    for(const rig of [g,bg].filter(Boolean)){
      const amount=rig===g?raise:answer,index=rig===g?1:0;
      if(rig.arms?.[index]){rig.arms[index].rotation.x=-.12-amount*1.05;rig.arms[index].rotation.z=(index?1:-1)*(.08+amount*.16);}
      if(rig.forearms?.[index])rig.forearms[index].rotation.x=-.25-amount*1.15;
      if(rig.chest)rig.chest.rotation.y=(rig===g?-1:1)*amount*.16;
      if(rig.head)rig.head.rotation.x=-amount*.04;
    }
    hero.updateMatrixWorld(true);boss.updateMatrixWorld(true);
    const heroFace=g?.head?.getWorldPosition(new T.Vector3())||hero.position.clone().add(new T.Vector3(0,2.05,0));
    const bossFace=bg?.head?.getWorldPosition(new T.Vector3())||boss.position.clone().add(new T.Vector3(0,2.05,0));
    const heroFront=new T.Vector3(Math.sin(hero.rotation.y),0,Math.cos(hero.rotation.y));
    if(c.age<.7){camera.position.copy(boss.position).add(new T.Vector3(2,2.5,4.5));camera.lookAt(bossFace);camera.fov=43;}
    else if(c.age<3.3){
      const distance=1.35+ease(T,c.age,1.9,3.3)*3.2;
      camera.position.copy(heroFace).add(heroFront.clone().multiplyScalar(distance)).add(new T.Vector3(.15,.05,0));
      const aim=heroFace.clone();aim.y-=ease(T,c.age,1.9,3.3)*.65;camera.lookAt(aim);camera.fov=35;
    }else if(c.age<4.5){
      const front=hero.position.clone().sub(boss.position).normalize();
      camera.position.copy(bossFace).add(front.multiplyScalar(2.35)).add(new T.Vector3(.4,.05,0));camera.lookAt(bossFace);camera.fov=39;
    }else{
      const midpoint=hero.position.clone().add(boss.position).multiplyScalar(.5).add(new T.Vector3(0,1.2,0));
      const line=boss.position.clone().sub(hero.position).normalize(),side=new T.Vector3(-line.z,0,line.x);
      camera.position.copy(midpoint).add(side.multiplyScalar(8.5)).add(new T.Vector3(0,1.7,0));camera.lookAt(midpoint);camera.fov=45;
    }
    camera.updateProjectionMatrix();
  };
})();
