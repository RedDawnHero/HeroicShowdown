(() => {
 let effects;
 const escapeUI=document.createElement('div');escapeUI.style.cssText='position:absolute;inset:0;z-index:36;pointer-events:none;display:none;border-top:24px solid black;border-bottom:24px solid black;box-sizing:border-box';
 const escapeText=document.createElement('div');escapeText.style.cssText='position:absolute;bottom:12%;width:100%;text-align:center;color:white;font:600 20px sans-serif;text-shadow:0 2px 5px black';escapeUI.appendChild(escapeText);
 const escapeSkip=document.createElement('button');escapeSkip.textContent='SKIP GETAWAY →';escapeSkip.style.cssText='position:absolute;bottom:12px;right:20px;pointer-events:auto;padding:12px;background:#132330;color:#ffe2a0;border:1px solid #dfbb70';escapeSkip.onclick=()=>window.dispatchEvent(new Event('heroic-ashen-movie-finished'));escapeUI.appendChild(escapeSkip);document.querySelector('.arena-wrap')?.appendChild(escapeUI);

 const frame=document.createElement('div');frame.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:18;display:none;border-top:clamp(20px,5vh,55px) solid #05070a;border-bottom:clamp(20px,5vh,55px) solid #05070a;box-sizing:border-box';
 document.querySelector('.arena-wrap')?.appendChild(frame);
 function atmosphere(T,hero,boss,tr){
  const scene=hero.parent;
  if(!effects){const root=new T.Group();scene.add(root);const mat=new T.MeshBasicMaterial({color:0xffbc55,transparent:true,blending:T.AdditiveBlending,depthWrite:false});const trail=[];for(let i=0;i<24;i++){const o=new T.Mesh(new T.SphereGeometry(.12,8,6),mat.clone());root.add(o);trail.push(o);}const ring=new T.Mesh(new T.TorusGeometry(1,.045,8,64),mat.clone());root.add(ring);const rubble=[];for(let i=0;i<32;i++){const rock=new T.Mesh(new T.DodecahedronGeometry(.18+(i%5)*.09,0),new T.MeshStandardMaterial({color:0x423c38,roughness:1}));root.add(rock);rubble.push(rock);}const crater=new T.Mesh(new T.CircleGeometry(3.5,32),new T.MeshBasicMaterial({color:0x070605,transparent:true,depthWrite:false}));crater.rotation.x=-Math.PI/2;root.add(crater);effects={root,trail,ring,rubble,crater,lastAge:0};}
  effects.root.visible=true;const a=Math.max(0,tr.age-4);
  if(a<effects.lastAge)effects.trail.forEach(o=>o.visible=false);effects.lastAge=a;
  const collapse=a-1.65,origin=new T.Vector3();
  origin.copy(hero.position);origin.y=.035;origin.z-=1.7;
  effects.crater.visible=collapse>0;effects.crater.position.copy(origin);effects.crater.material.opacity=Math.min(1,Math.max(0,collapse)*4);
  effects.rubble.forEach((o,i)=>{o.visible=collapse>0&&collapse<6;const v=Math.max(0,collapse),angle=i*2.399,r=1+(i%7)*.3+Math.min(v,1.8)*(1+i%3);o.position.set(origin.x+Math.cos(angle)*r,Math.max(.08,(2+i%4)*v-3*v*v),origin.z+Math.sin(angle)*r);o.rotation.set(v*(i%3+1),angle+v,v*.7);});
  const active=a>5.3&&a<7.8;
  for(let i=effects.trail.length-1;i>0;i--)effects.trail[i].position.copy(effects.trail[i-1].position);
  effects.trail[0].position.copy(boss.position).add(new T.Vector3(0,2,0));
  effects.trail.forEach((o,i)=>{o.visible=active;o.scale.setScalar(1.5-i/20);o.material.opacity=(1-i/24)*.55;});
  const impact=a>=8.0,elapsed=impact?a-8.0:a-5.3;
  effects.ring.visible=elapsed>=0&&elapsed<1.6;effects.ring.position.copy(impact?new T.Vector3((tr.x-500)*.055,.12,(tr.y-300)*.055):hero.position.clone().add(new T.Vector3(0,3,-1)));
  effects.ring.rotation.x=impact?-Math.PI/2:0;effects.ring.scale.setScalar(1+Math.max(0,elapsed)*(impact?10:5));effects.ring.material.opacity=Math.max(0,1-elapsed/1.6);
  const flash=Math.max(0,1-Math.abs(a-5.3)/.14)*.65+Math.max(0,1-Math.abs(a-8.0)/.3)*.7;
  frame.style.background=flash>0?'rgba(255,235,195,'+flash+')':'transparent';
 }

 window.redDawnPunchCamera=(T,state,camera,rigs)=>{
  const tr=state.ashenTransition;
  escapeUI.style.display=tr?.stage==='getaway'?'block':'none';
  if(tr?.stage!=='getaway')window.misfitGetawayReady=null;
  if(tr?.stage==='getaway'){
   frame.style.display='none';if(effects)effects.root.visible=false;
   const hero=rigs.get(tr.hero.id),boss=rigs.get('ashen-king');
   if(!hero||!boss?.userData.glbRig||(!hero.userData.glbRig&&hero.userData.kind!=='sentinel')){escapeText.textContent='Preparing Mr. Misfit’s getaway…';window.misfitGetawayReady=null;return;}
   window.misfitGetawayReady=tr.id;
   const a=tr.age,ease=(l,h)=>T.MathUtils.smoothstep(a,l,h),base=new T.Vector3((state.bossX-500)*.055,0,(state.bossY-300)*.055),portal=new T.Vector3((tr.x-500)*.055,0,(tr.y-300)*.055);
   boss.visible=a<6.5;boss.position.copy(base).lerp(portal,ease(2.5,6.4));boss.position.y+=Math.sin(ease(2.5,6.4)*Math.PI)*.08;boss.rotation.set(0,Math.PI*ease(1.2,2.5),0);
   const g=boss.userData.glbRig,stride=Math.sin(a*12)*Math.sin(ease(2.5,6.4)*Math.PI);
   g.thighs?.forEach((b,i)=>b.rotation.x=(i?1:-1)*stride*.55);g.knees?.forEach((b,i)=>b.rotation.x=Math.max(0,(i?-1:1)*stride)*.65);g.arms?.forEach((b,i)=>b.rotation.x=(i?-1:1)*stride*.35);if(g.head)g.head.rotation.y=-.35*Math.sin(ease(.4,2.5)*Math.PI);
   boss.updateMatrixWorld(true);hero.updateMatrixWorld(true);
   const face=g.head?.getWorldPosition(new T.Vector3())||boss.position.clone().add(new T.Vector3(0,2.2,0)),heroFace=hero.userData.glbRig?.head?.getWorldPosition(new T.Vector3())||hero.position.clone().add(new T.Vector3(0,2,0));
   const target=face.clone().lerp(portal.clone().add(new T.Vector3(0,1.8,0)),ease(3,6.5));
   const close=face.clone().add(new T.Vector3(2,1,4)),wide=base.clone().add(new T.Vector3(9,5,8));camera.position.copy(close.lerp(wide,ease(1.3,4)));target.lerp(heroFace,ease(6.6,8));camera.up.set(0,1,0);camera.lookAt(target);
   escapeText.textContent=a<2.5?'MR. MISFIT: “You’re too late!”':a<6.5?'He opens a rift and retreats into the frost.':'MR. MISFIT ESCAPED · FOLLOW HIM';
   return;
  }

  frame.style.display=tr?.stage==='uppercut'?'block':'none';if(effects){effects.root.visible=tr?.stage==='uppercut';if(effects.beam)effects.beam.visible=false;}
  if(!tr){
   if(state.intro||state.finale||state.radioScene)return;
   const p=Object.values(state.players).find(p=>p.hero==='guardian'&&p.action==='punch'&&p.actionTime>0),r=p&&rigs.get(p.id);if(!r)return;
   const offset=new T.Vector3(2.2,2.6,3.7).applyAxisAngle(new T.Vector3(0,1,0),r.rotation.y);
   camera.position.lerp(r.position.clone().add(offset),.09);camera.lookAt(r.position.clone().add(new T.Vector3(0,2.4,0)));return;
  }
  if(tr.stage!=='uppercut')return;
  const hero=rigs.get(tr.hero.id),boss=rigs.get('ashen-king');if(!hero||!boss)return;
  const rawAge=tr.age,a=Math.max(0,rawAge-4),base=new T.Vector3((state.bossX-500)*.055,0,(state.bossY-300)*.055),portal=new T.Vector3((tr.x-500)*.055,0,(tr.y-300)*.055);
  const ease=(x,l,h)=>T.MathUtils.smoothstep(x,l,h);
  const drop=-2.8*ease(a,1.65,2.15)*(1-ease(a,2.2,2.65));
  const rise=a<2.2?drop:a<4.5?drop+ease(a,2.2,4.5)*12:12*(1-ease(a,5.8,8.5));
  const launch=Math.sin(ease(a,2.2,4.5)*Math.PI),strike=ease(a,4.9,5.3)*(1-ease(a,5.55,6.6)),land=Math.sin(ease(a,8,9)*Math.PI);
  hero.position.copy(base).add(new T.Vector3(Math.sin(a*4)*.22*launch,rise,1.7-strike*.65));hero.rotation.set(-launch*.22+land*.18,Math.PI+Math.sin(strike*Math.PI)*.38,-launch*.12);
  const helmet=ease(a,.2,1.15);tr.hero.helmet=a>=1.15;
  const ud=hero.userData;ud.maskProgress=helmet;
  if(ud.glbRig?.mask){const m=ud.glbRig.mask;m.bone.position.lerpVectors(m.home,m.face,helmet);m.bone.rotation.x=-.12*helmet;}
  if(ud.helmetedModel){ud.helmetedModel.visible=helmet>=.985;if(ud.glbModel)ud.glbModel.visible=helmet<.985;}
  for(const g of [ud.glbRig,ud.helmetedRig].filter(Boolean)){
    const hand=Math.sin(helmet*Math.PI),brace=Math.sin(ease(a,1.4,2.3)*Math.PI);
    if(!g.arms?.[0]||!g.arms?.[1]||!g.forearms?.[0]||!g.forearms?.[1])continue;
    g.arms[0].rotation.x=-.45-strike*2.1-hand*.8;g.forearms[0].rotation.x=-1.2+strike*.85-hand*.3;
    g.arms[1].rotation.x=-.4-launch*.5-hand*1.2;g.forearms[1].rotation.x=-.9-hand*.55;
    g.arms.forEach((v,i)=>v.rotation.z=(i?-1:1)*(.12+brace*.28));
    g.thighs?.forEach((v,i)=>v.rotation.x=-brace*.8-launch*(i?.5:1.1)-land*.7);
    g.knees?.forEach((v,i)=>v.rotation.x=brace*1.2+launch*(i?1.3:.7)+land*1.1);
    if(g.chest){g.chest.rotation.x=brace*.2-launch*.12;g.chest.rotation.y=-.25*launch+strike*.4;}
  }
  // Preserve facial proportions and animate the whole body's recoil.
  const flight=ease(a,5.3,7.8);boss.visible=a<8.45;boss.position.copy(base).lerp(portal,flight);
  boss.position.y=a<5.3?rise:12*(1-flight)+Math.sin(flight*Math.PI)*10;
  boss.rotation.set(a<5.3?-.1*Math.sin(a*3):-.6*Math.sin(flight*Math.PI)-flight*Math.PI*2,flight*.75,a<5.3?0:Math.sin(flight*Math.PI)*.55);
  for(const b of [boss.userData.glbRig,boss.userData.helmetedRig].filter(Boolean)){
    const recoil=Math.sin(flight*Math.PI),flail=Math.sin(flight*19)*recoil;
    b.arms?.forEach((v,i)=>{v.rotation.x=-.4+recoil*(i?.8:-.7)+flail*.25;v.rotation.z=(i?-1:1)*(.2+recoil*.7);});
    b.forearms?.forEach((v,i)=>v.rotation.x=-.5-recoil*.7+(i?flail:-flail)*.3);
    b.thighs?.forEach((v,i)=>v.rotation.x=-recoil*(i?1.15:.4)+flail*.2);
    b.knees?.forEach((v,i)=>v.rotation.x=recoil*(i?.7:1.3));
    if(b.chest)b.chest.rotation.y=flail*.2;
  }
  if(a>7.8)boss.position.y=-ease(a,7.8,8.45)*6;
  for(const b of [boss.userData.glbRig,boss.userData.helmetedRig].filter(Boolean))if(b.head){b.head.rotation.x=-.07*Math.sin(flight*Math.PI);b.head.rotation.z=0;}
  // Wildclaw is not part of this cinematic, including a selected player rig.
  for(const rig of rigs.values())if(rig.userData.source?.hero==='wildclaw')rig.visible=false;
  const ecal=tr.ecal&&rigs.get(tr.ecal.id);
  if(ecal){ecal.visible=true;const dodge=rawAge<4?Math.sin(ease(rawAge,.4,1.5)*Math.PI)*2.3-Math.sin(ease(rawAge,2,3.2)*Math.PI)*1.7:0;ecal.position.copy(base).add(new T.Vector3(4+dodge,0,4));ecal.rotation.set(0,Math.PI+.6,-dodge*.07);
    const e=ecal.userData.glbRig;if(e){e.arms?.forEach(b=>b.rotation.x=-1);e.forearms?.forEach(b=>b.rotation.x=-.45);e.thighs?.forEach((b,i)=>b.rotation.x=(i?-.25:.25)*Math.abs(dodge));e.knees?.forEach(b=>b.rotation.x=.25+Math.abs(dodge)*.2);}
    if(!effects?.beam){atmosphere(T,hero,boss,tr);const beam=new T.Mesh(new T.CylinderGeometry(.055,.055,1,8),new T.MeshBasicMaterial({color:0x55ddff,transparent:true,blending:T.AdditiveBlending}));hero.parent.add(beam);effects.beam=beam;}
    const beam=effects.beam;beam.visible=rawAge>1&&rawAge<5&&((rawAge-1)%.65)<.18;
    const start=ecal.position.clone().add(new T.Vector3(-.4,2.2,-.7)),end=boss.position.clone().add(new T.Vector3(0,2.4,0)),delta=end.clone().sub(start);beam.position.copy(start).add(end).multiplyScalar(.5);beam.scale.y=delta.length();beam.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  }
  // Keep necks aligned with the chest throughout the team-up and recoil.
  for(const actor of [hero,boss].filter(Boolean))for(const r of [actor.userData.glbRig,actor.userData.helmetedRig].filter(Boolean)){if(r.head)r.head.rotation.set(0,0,0);}
  atmosphere(T,hero,boss,tr);
  // Track the action in profile, keeping both fighters inside the frame.
  const points=[hero.position.clone().add(new T.Vector3(0,2.3,0))];
  if(boss.visible)points.push(boss.position.clone().add(new T.Vector3(0,2.3,0)));
  if(rawAge<4&&ecal)points.push(ecal.position.clone().add(new T.Vector3(0,2,0)));
  if(a>7.2)points.push(portal.clone().add(new T.Vector3(0,1,0)));
  const bounds=new T.Box3().setFromPoints(points),target=bounds.getCenter(new T.Vector3()),span=bounds.getSize(new T.Vector3());
  const halfFov=Math.tan(T.MathUtils.degToRad(camera.fov||50)*.5);
  const distance=Math.max(12,(span.y+7)/(2*halfFov),(span.z+8)/(2*halfFov*Math.max(.5,camera.aspect)))*1.15;
  const eye=target.clone().add(new T.Vector3(distance,1.2,0));
  camera.position.copy(eye);camera.up.set(0,1,0);camera.lookAt(target);
  const hit=Math.max(0,1-Math.abs(a-5.3)/.55)*.28,impact=Math.max(0,1-(a-8.0)/2.2)*(a>=8.0?1:0)*.65,shake=hit+impact+Math.max(0,1-Math.abs(a-1.9)/.5)*.32;
  camera.position.x+=Math.sin(a*91)*shake;camera.position.y+=Math.sin(a*113)*shake*.7;camera.rotateZ(Math.sin(a*71)*shake*.022);
 };
})();
