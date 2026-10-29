/* A self-contained evidence reveal; never changes the level or spawns a villain. */
(() => {
 const duration=24;
 window.VillageClueScene={
  photosFound(study){return Array.isArray(study?.found)&&study.found.length>=3&&study.found.slice(0,3).every(Boolean);},
  begin(s,p){if(s.round!==3||!p||!this.photosFound(s.homeStudy)||s.clueScene)return false;
   s.clueScene={id:Date.now(),heroId:p.id,age:0};s.homeStudy.cinematicSeen=true;
   for(const hero of Object.values(s.players)){hero.heldPhoto=null;hero.inspectingPhoto=false;hero.fx=hero.fy=0;hero.moveSpeed=0;hero.walkX=hero.walkY=0;hero.action='';hero.actionTime=0;}
   return true;
  },
  finish(s){s.clueScene=null;if(s.homeStudy)s.homeStudy.message='ECAL has a secret about the dimensions. All three photographs are connected. Explore the village or replay The Truth Revealed.';},
  step(s,dt,ready){if(!s.clueScene)return;if(ready&&!document.hidden)s.clueScene.age+=Math.min(.05,Math.max(0,Number.isFinite(dt)?dt:0));if(s.clueScene.age>=duration)this.finish(s);}
 };
 const wrap=document.querySelector('.arena-wrap'),overlay=document.createElement('div');overlay.hidden=true;
 overlay.style.cssText='position:absolute;inset:0;z-index:35;pointer-events:none;box-shadow:inset 0 32px #000,inset 0 -32px #000';
 const caption=document.createElement('div');caption.style.cssText='position:absolute;bottom:13%;left:9%;right:9%;color:#fff3d8;text-align:center;font:600 clamp(15px,2vw,23px) sans-serif;text-shadow:0 2px 7px black';overlay.appendChild(caption);
 const strip=document.createElement('div');strip.style.cssText='position:absolute;top:8%;left:20%;right:20%;display:flex;gap:8px;justify-content:center';
 for(let i=0;i<3;i++){const img=document.createElement('img');img.src=window.homeEvidenceImages[window.homeClues[i].image];img.alt=window.homeClues[i].title;img.style.cssText='width:22%;max-height:110px;object-fit:contain;border:1px solid #dfbb70;background:#101820';strip.appendChild(img);}overlay.appendChild(strip);
 const veil=document.createElement('div');veil.style.cssText='position:absolute;inset:0;background:black;opacity:0;pointer-events:none';overlay.appendChild(veil);
 const message=document.createElement('div');message.style.cssText='position:absolute;top:8%;width:100%;text-align:center;color:#b9eeff;letter-spacing:4px;font:600 18px sans-serif;text-shadow:0 0 18px #51cfff';overlay.appendChild(message);
 const skip=document.createElement('button');skip.textContent='Return to village →';skip.style.cssText='position:absolute;right:18px;bottom:40px;pointer-events:auto;padding:12px;background:#132330;color:#ffe2a0;border:1px solid #dfbb70';skip.onclick=()=>window.dispatchEvent(new Event('skip-village-clue-scene'));overlay.appendChild(skip);wrap.appendChild(overlay);
 const smooth=(x,a,b)=>{const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u);};let id,start,ecalAlly,otherAlly,effects,steadyEye,steadyTarget,lastCameraAge;const occluders=new Set();
 window.updateVillageClueCinematic=(T,s,camera,rigs)=>{
  for(const mesh of occluders)mesh.visible=true;occluders.clear();
  const c=s?.phase==='game'&&s.round===3?s.clueScene:null;overlay.hidden=!c;
  if(!c){id=null;steadyEye=steadyTarget=null;if(ecalAlly)ecalAlly.visible=false;if(otherAlly)otherAlly.visible=false;if(effects)effects.root.visible=false;veil.style.opacity=0;window.clueCinematicReady=null;return;}
  const actor=rigs.get(c.heroId);const g=actor?.userData.glbRig;
  if(!actor||(!g&&actor.userData.kind!=='sentinel')){caption.textContent='Preparing the evidence reveal…';window.clueCinematicReady=null;return;}
  actor.visible=true;actor.updateMatrixWorld(true);
  let speaker=actor;
  if(actor.userData.source?.hero!=='ecal'){
    speaker=[...rigs.values()].find(r=>r.userData.source?.hero==='ecal');
    if(!speaker){if(!ecalAlly&&window.createOpeningActor){ecalAlly=window.createOpeningActor('ecal','clue-ecal-ally');actor.parent.add(ecalAlly);}speaker=ecalAlly;}
    if(speaker){speaker.visible=true;if(speaker===ecalAlly){speaker.scale.setScalar(actor.scale.y);speaker.position.copy(actor.position).add(new T.Vector3(1.6,0,.5));speaker.position.y=window.modelVillageHeight?.(speaker.position.x,speaker.position.z)??actor.position.y;speaker.rotation.y=actor.rotation.y;}}
  }
  if(!speaker?.userData.glbRig){caption.textContent='Preparing Ecal’s reaction…';window.clueCinematicReady=null;return;}
  if(speaker===ecalAlly)window.resetCharacterPose?.(speaker);
  let companion=[...rigs.values()].find(r=>r.userData.source?.hero==='guardian');
  if(!companion){
   if(!otherAlly&&window.createOpeningActor){otherAlly=window.createOpeningActor('golden','clue-red-dawn-ally');actor.parent.add(otherAlly);}
   companion=otherAlly;
   if(companion){companion.visible=true;companion.scale.setScalar(actor.scale.y);companion.position.copy(actor.position).add(new T.Vector3(-1.7,0,.8));companion.position.y=window.modelVillageHeight?.(companion.position.x,companion.position.z)??actor.position.y;companion.rotation.y=actor.rotation.y;window.resetCharacterPose?.(companion);}
  }
  if(companion){companion.visible=true;companion.position.copy(speaker.position).add(new T.Vector3(-1.7,0,.8).applyQuaternion(speaker.quaternion));companion.position.y=speaker.position.y;companion.rotation.y=speaker.rotation.y;if(companion.userData.glbModel)companion.userData.glbModel.visible=true;if(companion.userData.helmetedModel)companion.userData.helmetedModel.visible=false;}
  if(!companion||(!companion.userData.glbRig&&companion.userData.kind!=='sentinel')){caption.textContent='Preparing the heroes…';window.clueCinematicReady=null;return;}
  if(!effects){
   const root=new T.Group();actor.parent.add(root);
   const material=new T.MeshBasicMaterial({color:0x7bdfff,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending});
   const symbols=[];for(let i=0;i<4;i++){const symbol=new T.Mesh(new T.TorusGeometry(.12,.015,6,4),material.clone());root.add(symbol);symbols.push(symbol);}
   const thread=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:0xb3efff,transparent:true,opacity:.8}));root.add(thread);
   const glow=new T.Mesh(new T.SphereGeometry(1,16,12),material.clone());root.add(glow);
   const light=new T.PointLight(0x69cfff,0,12);root.add(light);effects={root,symbols,thread,glow,light};
  }
  effects.root.visible=true;
  window.clueCinematicReady=c.id;
  if(id!==c.id){id=c.id;start=camera.position.clone();}
  const a=c.age,eg=speaker.userData.glbRig;
  speaker.updateMatrixWorld(true);companion.updateMatrixWorld(true);
  const origin=speaker.position.clone(),head=eg.head?.getWorldPosition(new T.Vector3())||origin.clone().add(new T.Vector3(0,2,0));
  const front=new T.Vector3(0,0,1).applyQuaternion(speaker.quaternion),side=new T.Vector3(front.z,0,-front.x);
  const companionHead=companion.userData.glbRig?.head?.getWorldPosition(new T.Vector3())||companion.position.clone().add(new T.Vector3(0,2,0));
  const groupCenter=head.clone().lerp(companionHead,.5);
  const reveal=origin.clone().addScaledVector(side,1.2).addScaledVector(front,.7);reveal.y=head.y-1.1;
  const points=effects.symbols.map((symbol,i)=>{const angle=i*Math.PI/2+a*.35;symbol.position.copy(reveal).addScaledVector(side,Math.cos(angle)*.45);symbol.position.y+=Math.sin(angle)*.35;symbol.rotation.z=a*.25+i;symbol.visible=a<5;symbol.material.opacity=(1-smooth(a,4,5))*(.65+Math.sin(a*4+i)*.2);return symbol.position.clone();});
  effects.thread.geometry.dispose();effects.thread.geometry=new T.BufferGeometry().setFromPoints([...points,points[0]]);effects.thread.visible=a>1&&a<5;
  effects.light.position.copy(reveal);effects.light.intensity=a<5?1+Math.sin(a*5)*.3:0;
  const horizon=origin.clone().addScaledVector(front,45);horizon.y+=16;
  effects.glow.position.copy(horizon);effects.glow.scale.setScalar(2+Math.sin(a*1.4)*.2);effects.glow.material.opacity=smooth(a,16,20)*.32;effects.glow.visible=a>=16;
  strip.hidden=a>=4;
  strip.style.opacity=String(smooth(a,.2,1)*(1-smooth(a,3.5,5)));strip.style.filter='drop-shadow(0 0 12px #75dfff)';
  message.textContent=a<4?'THE TRUTH REVEALED':a<5?'THE DIMENSIONS ARE CONNECTED':'';
  message.style.opacity=String(a<4?smooth(a,.5,1):1-smooth(a,4.5,5));
  let target=head.clone(),eye;
  if(a<5){const angle=-.5+smooth(a,0,5);eye=head.clone().addScaledVector(front,4*Math.cos(angle)).addScaledVector(side,4*Math.sin(angle));target.lerp(reveal,.3);caption.textContent='The final clue glows. The symbols connect.';}
  else if(a<10){eye=head.clone().addScaledVector(front,2.8+smooth(a,8,10)*2.2).addScaledVector(side,.65);target.lerp(groupCenter,smooth(a,8,10));caption.textContent='ECAL: “I think it’s time to tell the truth.”';}
  else if(a<13){target.copy(groupCenter);eye=groupCenter.clone().addScaledVector(front,5).addScaledVector(side,1.2);caption.textContent='RED DAWN: “What truth?”';}
  else if(a<18){target.copy(head);eye=head.clone().addScaledVector(front,4).addScaledVector(side,1.3);caption.textContent='ECAL: “Mr. Misfit isn’t the real villain. I know who is.”';}
  else{const turn=smooth(a,18,21);target.copy(head).lerp(horizon,turn);eye=head.clone().addScaledVector(front,4-8*turn).addScaledVector(side,1.3+2*Math.sin(turn*Math.PI));eye.y+=turn;caption.textContent='';}
  eye.lerpVectors(start,eye,smooth(a,0,1));if(!steadyEye||lastCameraAge>a){steadyEye=eye.clone();steadyTarget=target.clone();}
  const cameraBlend=1-Math.exp(-Math.max(0,a-(lastCameraAge??a))*5);lastCameraAge=a;
  steadyEye.lerp(eye,cameraBlend);steadyTarget.lerp(target,cameraBlend);camera.position.copy(steadyEye);camera.lookAt(steadyTarget);
  camera.updateMatrixWorld(true);
  // Hide scenery directly between the camera and either hero's face for this shot.
  const characterMeshes=new Set();for(const r of [...rigs.values(),ecalAlly,otherAlly].filter(Boolean))r.traverse(o=>characterMeshes.add(o));
  const candidates=[];actor.parent.traverse(o=>{if(o.isMesh&&o.visible&&!characterMeshes.has(o)&&!effects.root.getObjectById(o.id))candidates.push(o);});
  const sight=new T.Raycaster();
  for(const face of [head,companionHead]){const delta=face.clone().sub(camera.position),distance=delta.length();if(distance<.1)continue;sight.set(camera.position,delta.normalize());sight.far=distance-.18;for(const hit of sight.intersectObjects(candidates,false)){occluders.add(hit.object);hit.object.visible=false;}}

  veil.style.opacity=String(smooth(a,21,22.8));
  const curiosity=1-smooth(a,5,8),towardMountains=smooth(a,15,19);
  if(eg.head){eg.head.rotation.z+=.10*curiosity;eg.head.rotation.x+=.07*curiosity-.1*towardMountains;eg.head.rotation.y+=Math.sin(a*.7)*.04;}
  if(eg.chest)eg.chest.rotation.x+=Math.sin(a*1.8)*.009;
  eg.ears?.forEach((ear,i)=>{ear.rotation.z+=(i?-.07:.11)*curiosity+Math.sin(a*2+i)*.015;});
  const cg=companion.userData.glbRig;if(cg?.head)cg.head.rotation.z+=.12*Math.sin(smooth(a,10,14)*Math.PI);
  if(speaker===ecalAlly)window.stabilizeCharacterPose?.(speaker);
  if(companion===otherAlly)window.stabilizeCharacterPose?.(companion);

 };
})();
