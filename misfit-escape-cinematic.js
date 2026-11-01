/* Original short fake-out and portal escape using the game's existing boss model. */
(() => {
  const wrap=document.querySelector('.arena-wrap');if(!wrap)return;
  const overlay=document.createElement('div');overlay.hidden=true;overlay.setAttribute('role','status');
  overlay.style.cssText='position:absolute;inset:0;z-index:40;pointer-events:auto;box-shadow:inset 0 35px #000,inset 0 -45px #000;display:flex;align-items:flex-end;justify-content:center;padding:0 20px 50px;box-sizing:border-box;color:#fff4dc;text-shadow:0 2px 8px #000;font:800 clamp(15px,3vw,26px) sans-serif;text-align:center';
  // Author styles must not override the hidden attribute.
  const style=document.createElement('style');style.textContent='[data-misfit-escape][hidden]{display:none!important}';document.head.appendChild(style);overlay.dataset.misfitEscape='';wrap.appendChild(overlay);
  let portal=null,lastBoss=null,lastCamera=null,savedFov=null;
  window.syncMisfitEscapeUI=state=>{
    const c=state?.phase==='game'&&state.misfitEscape;overlay.hidden=!c;
    if(c){overlay.textContent=c.age<1.3?'MR. MISFIT… DEFEATED?':c.age<2.4?'“YOU HAVEN’T SEEN THE LAST OF ME.”':c.age<4.2?'STOP HIM!':'MR. MISFIT HAS ESCAPED.';return;}
    if(portal)portal.visible=false;
    if(lastBoss)lastBoss.visible=true;
    if(lastCamera&&savedFov!==null){lastCamera.fov=savedFov;lastCamera.updateProjectionMatrix();savedFov=null;}
  };
  window.updateMisfitEscapeCinematic=(T,state,scene,camera,rigs)=>{
    const c=state?.misfitEscape;if(!c)return;
    const boss=rigs.get('ashen-king');if(!boss)return;
    lastBoss=boss;lastCamera=camera;if(savedFov===null)savedFov=camera.fov;
    if(!portal){
      portal=new T.Group();portal.name='Mr. Misfit escape portal';
      const rim=new T.Mesh(new T.TorusGeometry(1.35,.1,12,64),new T.MeshBasicMaterial({color:0xffbb55,transparent:true,opacity:.95}));
      const surface=new T.Mesh(new T.CircleGeometry(1.26,64),new T.MeshBasicMaterial({color:0x842cff,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false}));
      const inner=new T.Mesh(new T.TorusGeometry(1.13,.035,8,64),new T.MeshBasicMaterial({color:0x82efff}));
      portal.add(rim,surface,inner);scene.add(portal);
    }
    portal.visible=c.age>=1.7&&c.age<4.8;
    portal.position.set((c.targetX-500)*.055,boss.position.y+1.55,(c.targetY-300)*.055);
    portal.rotation.y=Math.atan2(c.targetX-c.startX,c.targetY-c.startY);
    const opening=T.MathUtils.smoothstep(c.age,1.7,2.4),closing=1-T.MathUtils.smoothstep(c.age,4.2,4.8);
    portal.scale.setScalar(Math.max(.001,opening*closing));portal.children[0].rotation.z=c.age*2;portal.children[2].rotation.z=-c.age*3;
    boss.visible=c.age<4.12;
    const g=boss.userData.glbRig;
    if(g&&c.age<2.4){
      const stagger=1-T.MathUtils.smoothstep(c.age,1.3,2.3);
      if(g.chest)g.chest.rotation.x+=stagger*.3;
      if(g.head)g.head.rotation.x+=stagger*.32;
      g.knees?.forEach(b=>b.rotation.x+=stagger*.32);
    }
    const focus=boss.position.clone().add(new T.Vector3(0,c.age<1.3?1.1:1.8,0));
    if(c.age<1.3){camera.position.copy(focus).add(new T.Vector3(2.4,1.2,4.1));camera.fov=43;}
    else if(c.age<2.4){camera.position.copy(focus).add(new T.Vector3(1,.25,2.6));camera.fov=35;}
    else{
      const target=new T.Vector3((c.targetX-500)*.055,1.7,(c.targetY-300)*.055);
      focus.lerp(target,.4);camera.position.copy(target).add(new T.Vector3(-6,3.3,8));camera.fov=49;
    }
    camera.lookAt(focus);camera.updateProjectionMatrix();
  };
})();
