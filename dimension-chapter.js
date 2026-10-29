/* Level Four: clue-led arrival, ordered encounters, and an escape rather than a false victory. */
(() => {
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const ease=(x,a,b)=>{const u=clamp((x-a)/(b-a),0,1);return u*u*(3-2*u);};
 window.dimensionGround=(x,z)=>{
  for(const [cx,cz,w,d] of [[0,4,48,30],[0,-34,48,38],[-22,-12,4,8],[22,-12,4,8],[-20,-62,8,18],[20,-62,8,18]])if(Math.abs(x-cx)<=w/2&&Math.abs(z-cz)<=d/2)return 0;
  return null;
 };
 window.DimensionChapter={
  begin(state){const hero=state.players.host||Object.values(state.players)[0];state.dimension={stage:'arrival',age:0,spawned:0,spawnClock:0,companion:hero.hero==='wildclaw'?'guardian':'wildclaw'};state.hammerers=[];state.goons=[];state.shots=[];state.caster={x:500,y:-130,hp:90,attack:3,casting:0,summons:2,dead:true};state.boss=180;state.bossMax=180;state.bossX=100000;state.bossY=100000;state.burialDone=true;state.time=600;state.roundEnded=false;for(const p of Object.values(state.players)){p.x=500;p.y=470;p.fx=p.fy=0;p.jump=0;p.portalEntered=false;p.dimensionSafe={x:p.x,y:p.y};}},
  cinematic(s){return s?.round===4&&['arrival','escape'].includes(s.dimension?.stage);},
  step(s,dt,ready,spawn){const q=s.dimension;if(!q)return;
   if(q.stage==='arrival'){if(ready)q.age+=dt;if(q.age>=43){q.stage='hammers';q.age=0;}return;}
   if(q.stage==='escape'){q.age+=dt;if(q.age>=9){s.roundEnded=true;s.roundReason='MR. MISFIT ESCAPED · TO BE CONTINUED';s.phase='results';}return;}
   q.age+=dt;
   if(q.stage==='hammers'){
    q.spawnClock-=dt;if(q.spawned<6&&q.spawnClock<=0){const i=q.spawned++;const h=spawn(i%2?790:210,330-Math.floor(i/2)*160,1.5+i*.3,true);h.portalAge=0;s.hammerers.push(h);q.spawnClock=1.1;}
    if(q.spawned===6&&s.hammerers.every(h=>h.dead)){q.stage='wand';q.age=0;s.caster.dead=false;s.caster.hp=90;}
   }else if(q.stage==='wand'&&s.caster.dead){q.stage='misfit';q.age=0;s.boss=180;s.bossX=500;s.bossY=-360;}
   else if(q.stage==='misfit'&&(s.boss<180||Object.values(s.players).some(p=>Math.hypot(p.x-s.bossX,p.y-s.bossY)<150))){q.stage='escape';q.age=0;s.boss=Math.max(1,s.boss);s.roundEnded=false;s.shots=[];}
   for(const h of s.hammerers)h.portalAge=(h.portalAge||0)+dt;
  }
 };
 window.createDimensionScene=(T,scene)=>{
  const root=new T.Group();root.visible=false;scene.add(root);let hero,partner,identity,city;
  const wrap=document.querySelector('.arena-wrap');const caption=document.createElement('div');caption.hidden=true;caption.style.cssText='position:absolute;left:8%;right:8%;bottom:15%;z-index:20;color:#eff7ff;text-align:center;font:600 20px sans-serif;text-shadow:0 2px 8px black;pointer-events:none';wrap.appendChild(caption);
  const skip=document.createElement('button');skip.textContent='Skip arrival →';skip.hidden=true;skip.style.cssText='position:absolute;right:18px;bottom:25px;z-index:25;padding:12px;background:#111d30;color:white;border:1px solid #92dfff';skip.onclick=()=>document.querySelector('[data-action="skipDimension"]')?.click();wrap.appendChild(skip);
  const stone=new T.MeshStandardMaterial({color:0x394757,roughness:.75,metalness:.25}),glow=new T.MeshBasicMaterial({color:0x68dfff});
  function box(w,h,d,x,y,z){const m=new T.Mesh(new T.BoxGeometry(w,h,d),stone);m.position.set(x,y,z);root.add(m);return m;}
  for(const [x,z,w,d] of [[0,4,48,30],[0,-34,48,38],[-22,-12,4,8],[22,-12,4,8],[-20,-62,8,18],[20,-62,8,18]]){box(w,1,d,x,-.5,z);for(const side of [-1,1]){const line=new T.Mesh(new T.BoxGeometry(.09,.04,d-1),glow);line.position.set(x+side*(w/2-.3),.03,z);root.add(line);}}
  const islands=[];for(let i=0;i<36;i++){const a=i*2.399,r=45+i%5*14;const m=box(5+i%4*3,12+i%7*5,7,Math.cos(a)*r,15+i%6*7,Math.sin(a)*r-30);m.rotation.z=(i%2?1:-1)*.12;m.userData.base=m.position.y;islands.push(m);}
  const debris=[];const rockGeo=new T.IcosahedronGeometry(1,0);for(let i=0;i<85;i++){const r=new T.Mesh(rockGeo,stone);const a=i*2.399;r.position.set(Math.cos(a)*(26+i%9*4),4+i%17*2,Math.sin(a)*65-25);r.scale.setScalar(.3+i%5*.35);r.userData.base=r.position.y;root.add(r);debris.push(r);}
  const portals=[];function portal(x,y,z,color,size){const g=new T.Group();g.position.set(x,y,z);const m=new T.MeshBasicMaterial({color,transparent:true,opacity:.75,side:T.DoubleSide});const ring=new T.Mesh(new T.TorusGeometry(size,.12,8,64),m);g.add(ring);const core=new T.Mesh(new T.CircleGeometry(size-.14,48),m.clone());core.material.opacity=.12;g.add(core);root.add(g);portals.push(g);return g;}
  const blue=portal(-9,4,-3,0x4dcfff,3.3),red=portal(9,4,-3,0xff4466,3.3),escape=portal(0,3,-41,0xc14fff,2.7);
  for(let i=0;i<8;i++)portal(Math.sin(i*2)*85,30+i%3*15,-60-Math.cos(i)*55,i%2?0x994dff:0x59cfff,7+i%4*3);
  const cracks=new T.Group();root.add(cracks);for(let i=0;i<14;i++){const points=[];for(let k=0;k<9;k++)points.push(new T.Vector3(-100+i*15+Math.sin(k*4+i)*4,50+Math.sin(k*.9+i)*7,-100+k*11));cracks.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:i%2?0xc170ff:0x8adfff})));}
  const wave=new T.Mesh(new T.TorusGeometry(1,.1,6,60),glow);wave.rotation.x=Math.PI/2;root.add(wave);
  const enemyRifts=Array.from({length:6},(_,i)=>portal((i%2?790:210)*.055-27.5,2.5,(330-Math.floor(i/2)*160-300)*.055,0xe57cff,2.5));
  const kind=p=>p==='guardian'?'golden':p;
  function pose(actor,t,run=0,tuck=0,land=0){const g=actor.userData.glbRig;if(!g)return;for(const b of [g.pelvis,g.spine,g.chest,g.head,...g.arms,...g.forearms,...g.thighs,...g.knees].filter(Boolean))b.rotation.set(0,0,0);g.thighs.forEach((b,i)=>b.rotation.x=Math.sin(t*10+i*Math.PI)*.55*run-1.15*tuck-.55*land);g.knees.forEach((b,i)=>b.rotation.x=Math.max(0,-Math.sin(t*10+i*Math.PI))*.85*run+1.9*tuck+1.05*land);g.arms.forEach((b,i)=>{b.rotation.x=-Math.sin(t*10+i*Math.PI)*.6*run-.8*tuck;b.rotation.z=(i?1:-1)*(.12+.15*tuck);});g.forearms.forEach(b=>b.rotation.x=-.5-.65*tuck);g.spine.rotation.x=.23*tuck+.2*land;g.head.rotation.y=Math.sin(t*.5)*.12;}
  return {update(s,t,camera,rigs,local){const active=s?.phase==='game'&&s.round===4;root.visible=active;caption.hidden=!active;skip.hidden=true;if(!active){if(city)city.visible=false;window.dimensionCastReady=false;return;}const q=s.dimension;if(!q)return;
   if(!identity&&window.createOpeningActor){identity=local.hero;hero=window.createOpeningActor(kind(identity),'dimension-lead');partner=window.createOpeningActor(kind(q.companion),'dimension-companion');root.add(hero,partner);window.addConnectedCity?.(T,root).then(c=>{city=c;if(c)c.position.y=28;});}
   const ready=!!hero?.userData.glbRig&&!!partner?.userData.glbRig;window.dimensionCastReady=ready;
   scene.background=new T.Color(0x131c38);scene.fog.color.setHex(0x222844);scene.fog.near=80;scene.fog.far=260;
   islands.forEach((m,i)=>m.position.y=m.userData.base+Math.sin(t*.3+i)*1.4);debris.forEach((m,i)=>{m.position.y=m.userData.base+Math.sin(t*.6+i)*.6;m.rotation.y=t*.12+i;});portals.forEach((p,i)=>{p.rotation.z=t*(i%2?-.12:.12);p.children[0].material.opacity=.65+.2*Math.sin(t*2+i);});
   enemyRifts.forEach((r,i)=>r.visible=q.stage==='hammers'&&i<q.spawned&&(s.hammerers[i]?.portalAge||0)<3);blue.visible=red.visible=q.stage==='arrival';escape.visible=['misfit','escape'].includes(q.stage);wave.visible=q.stage==='arrival'&&q.age>=18&&q.age<30;
   if(hero)hero.visible=q.stage==='arrival';if(partner)partner.visible=q.stage==='arrival';
   if(q.stage==='arrival'){
    skip.hidden=false;for(const r of rigs.values())r.visible=false;
    if(!ready){caption.textContent='Preparing the heroes and the world between worlds…';return;}
    const a=q.age;hero.position.set(-1.4,0,8);partner.position.set(1.4,0,8);hero.rotation.set(0,Math.PI,0);partner.rotation.set(0,Math.PI,0);
    let target=new T.Vector3(0,1.6,8),eye=new T.Vector3(10,6,22);caption.textContent='THE WORLD BETWEEN WORLDS';
    if(a<8){const fall=1-ease(a,0,2.4),land=Math.sin(ease(a,2.4,4)*Math.PI);for(const [i,r] of [hero,partner].entries()){r.position.y=fall*7-land*.3;r.rotation.x=-Math.PI*2*ease(a,0,2.2);pose(r,a,0,Math.sin(ease(a,0,2.2)*Math.PI),land);}eye.set(Math.sin(a*.18)*12,5,8+Math.cos(a*.18)*12);}
    else if(a<18){pose(hero,a);pose(partner,a);const u=ease(a,11,18);eye.set(-1.4+u*25,2.1+u*22,11+u*35);target.set(-1.4*(1-u),2+u*12,8-u*20);caption.textContent='The clues led here. Mr. Misfit is hiding between dimensions.';}
    else if(a<30){const u=ease(a,18,30),jump=Math.sin(ease(a,23,27)*Math.PI);[hero,partner].forEach((r,i)=>{r.position.z=8-u*28;r.position.y=jump*4;pose(r,a,1-jump,jump*.7,0);r.rotation.x=-Math.PI*2*ease(a,23.3,26.5);});wave.scale.setScalar(1+(a-18)*12);wave.position.set(0,.15,10);target.copy(hero.position).add(new T.Vector3(0,1.4,0));eye.copy(target).add(new T.Vector3(a<23?2:8,a<23?1.2:4,7));caption.textContent='The highway is breaking—keep moving!';}
    else{const pull=ease(a,32,41);[hero,partner].forEach((r,i)=>{r.position.set((i?1:-1)*(1.4+pull*7.6),pull*3, -20+pull*17);r.visible=a<(i?40.5:42);pose(r,a,0,pull*.4,0);r.userData.glbRig.arms[i].rotation.x=-1.25*pull;});eye.set(Math.sin(a*.15)*16,6,12);target.set(0,2,-7);caption.textContent='Two rifts. Two destinations. Find your ally—stop Mr. Misfit.';}
    camera.position.copy(eye);camera.lookAt(target);
   }else if(q.stage==='escape'){
    const boss=rigs.get('ashen-king'),a=q.age;for(const r of rigs.values())r.visible=r===boss||r.userData.isPlayer;
    if(boss){boss.visible=a<6.8;boss.position.set(0,0,-19-ease(a,1,6.8)*22);boss.rotation.y=Math.PI;const g=boss.userData.glbRig;if(g){g.head.rotation.y=-.35*(1-ease(a,0,2));g.arms.forEach((b,i)=>b.rotation.x=Math.sin(a*9+i*Math.PI)*.55);}const target=boss.position.clone().add(new T.Vector3(0,1.8,0));camera.position.copy(target).add(new T.Vector3(5,2,7));camera.lookAt(target);}
    escape.scale.setScalar(1-ease(a,7,8.5));caption.textContent=a<3?'Mr. Misfit tears open an escape rift.':a<7?'He is getting away!':'MR. MISFIT ESCAPED · TO BE CONTINUED';
   }else{caption.textContent=q.stage==='hammers'?`Defeat the portal guards · ${s.hammerers.filter(h=>h.dead).length}/6`:q.stage==='wand'?'Defeat the wand wielder to reach Mr. Misfit.':'Mr. Misfit is exposed. Close in before he escapes!';for(const r of rigs.values())if(r.userData.kind==='ashen')r.visible=q.stage==='misfit';}
  },hide(){root.visible=false;caption.hidden=true;skip.hidden=true;}};
 };
})();
