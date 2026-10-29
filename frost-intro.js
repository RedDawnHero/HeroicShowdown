/* Level two: choreography in the existing frost scene, using its actual terrain. */
(() => {
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = (t,a,b) => { const v=clamp((t-a)/(b-a)); return v*v*(3-2*v); };
  const wave = (t,a,b) => Math.sin(ease(t,a,b)*Math.PI);
  const overlay=document.createElement('div');
  overlay.style.cssText='position:absolute;inset:0;z-index:35;display:none;pointer-events:auto;box-shadow:inset 0 30px #020710,inset 0 -44px #020710';
  overlay.setAttribute('aria-label','Frozen Future cinematic');
  const shade=document.createElement('div');shade.style.cssText='position:absolute;inset:0;background:#000;pointer-events:none';overlay.appendChild(shade);
  const subtitle=document.createElement('div');subtitle.style.cssText='position:absolute;left:8%;right:8%;bottom:11%;text-align:center;color:#f0f8ff;font:600 clamp(16px,2vw,25px)/1.4 sans-serif;text-shadow:0 2px 8px #000;white-space:pre-line';subtitle.setAttribute('aria-live','polite');overlay.appendChild(subtitle);
  const chapter=document.createElement('div');chapter.style.cssText='position:absolute;left:24px;top:38px;color:#c1e9ff;font:600 12px sans-serif;letter-spacing:3px';overlay.appendChild(chapter);
  const skip=document.createElement('button');skip.textContent='SKIP CINEMATIC';skip.style.cssText='position:absolute;right:20px;bottom:8px;background:#0a1525;color:#e5f6ff;border:1px solid #a5dbef;padding:8px 14px;border-radius:5px';skip.onclick=()=>window.dispatchEvent(new Event('heroic-frost-skip'));overlay.appendChild(skip);
  document.querySelector('.arena-wrap').appendChild(overlay);
  document.addEventListener('keydown',e=>{if(overlay.style.display==='none')return;if(e.code==='Escape'){e.preventDefault();window.dispatchEvent(new Event('heroic-frost-skip'));}});
  let kit, hidden=[],audio,master,hum,noise,muted=false,lastBeat=-1;
  const sound=document.createElement('button');sound.textContent='SOUND ON';sound.style.cssText=skip.style.cssText+';right:180px';sound.onclick=()=>{muted=!muted;sound.textContent=muted?'SOUND OFF':'SOUND ON';if(master)master.gain.value=muted?0:.15;startAudio();};overlay.appendChild(sound);
  let score,wind,rumble,noiseBuffer,soundAge=-1;
  function startAudio(){try{
    if(!audio){
      audio=new (window.AudioContext||window.webkitAudioContext)();master=audio.createGain();master.gain.value=0;
      const limiter=audio.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=5;master.connect(limiter).connect(audio.destination);
      noiseBuffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      noise=audio.createBufferSource();noise.buffer=noiseBuffer;noise.loop=true;const f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=650;wind=audio.createGain();wind.gain.value=.15;noise.connect(f).connect(wind).connect(master);noise.start();
      hum=audio.createOscillator();hum.frequency.value=43;rumble=audio.createGain();rumble.gain.value=.2;hum.connect(rumble).connect(master);hum.start();
      score=audio.createGain();score.gain.value=0;score.connect(master);
      [65.41,98,130.81,155.56,196].forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type=i<2?'sine':'triangle';o.frequency.value=hz;o.detune.value=i%2?3:-3;g.gain.value=.09;o.connect(g).connect(score);o.start();});
    }
    audio.resume().catch(()=>{});
  }catch{sound.textContent='SOUND UNAVAILABLE';}}
  // Unlock on the player's existing interaction, before automatic level transitions.
  for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{if(!audio||audio.state==='suspended')startAudio();},{capture:true});
  sound.onclick=()=>{if(!audio||audio.state!=='running'){muted=false;startAudio();}else muted=!muted;sound.textContent=muted?'SOUND OFF':'SOUND ON';};
  function tone(from,to,length,volume=.5,type='sine'){
    if(!audio||audio.state!=='running'||muted||document.hidden)return;
    const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.type=type;o.frequency.setValueAtTime(from,now);o.frequency.exponentialRampToValueAtTime(Math.max(15,to),now+length);g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(volume,now+.015);g.gain.exponentialRampToValueAtTime(.001,now+length);o.connect(g).connect(master);o.start();o.stop(now+length+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  function air(length,frequency,volume){if(!audio||audio.state!=='running'||muted||document.hidden)return;const n=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain(),now=audio.currentTime;n.buffer=noiseBuffer;f.type='bandpass';f.frequency.setValueAtTime(frequency,now);f.frequency.exponentialRampToValueAtTime(150,now+length);g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(volume,now+length*.15);g.gain.exponentialRampToValueAtTime(.001,now+length);n.connect(f).connect(g).connect(master);n.start();n.stop(now+length);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};}
  const cues=[[2,'boom'],[18,'pulse'],[29,'clang'],[32,'clang'],[35,'clang'],[49,'charge'],[52,'laser'],[55,'boom'],[56,'whoosh'],[61,'land'],[63,'whoosh'],[68,'whoosh'],[73,'slide'],[79,'land'],[95,'charge'],[99,'whoosh'],[103,'blast'],[104,'blast'],[106,'boom'],[109,'whoosh'],[114,'land'],[115,'blast'],[116,'blast'],[118,'blast'],[120,'thunder'],[123,'land'],[132,'powerdown'],[137,'pulse'],[145,'charge']];
  function cinematicSound(t){
    if(!audio)return;
    sound.textContent=muted?'SOUND OFF':audio.state!=='running'?'ENABLE SOUND':'SOUND ON';
    master.gain.setTargetAtTime(muted||document.hidden?0:.42*(1-ease(t,147,150)),audio.currentTime,.08);
    score.gain.setTargetAtTime(t<25?.12:t<55?.3:t<90?.65:t<96?0:t<125?.8:t<132?.08:.22,audio.currentTime,.65);
    wind.gain.setTargetAtTime(t>55&&t<90?.22:.12,audio.currentTime,.3);
    rumble.gain.setTargetAtTime(t>132?.35:.14,audio.currentTime,.3);
    for(const [at,kind] of cues)if(at>soundAge&&at<=t){
      if(kind==='clang'){tone(390,210,.65,.25,'triangle');tone(713,690,.45,.12);}
      else if(kind==='charge')tone(110,1200,1.5,.23,'triangle');
      else if(kind==='blast'||kind==='laser'){tone(1600,70,.35,.45,'sawtooth');air(.4,2300,.4);}
      else if(kind==='whoosh'||kind==='slide')air(kind==='slide'?1.1:.65,1300,.55);
      else if(kind==='powerdown')tone(350,18,2,.5,'triangle');
      else if(kind==='pulse')tone(90,45,1.4,.35);
      else {tone(kind==='land'?95:65,20,kind==='thunder'?2:.85,.7);air(kind==='thunder'?2.5:.8,kind==='land'?450:850,.65);}
    }
    soundAge=t;
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&master)master.gain.setTargetAtTime(0,audio.currentTime,.04);});
  function build(T,scene){
    const root=new T.Group();root.name='Frost cinematic effects';scene.add(root);
    const hero=window.createOpeningActor('ecal','frost-cinematic-ecal');root.add(hero);hero.scale.setScalar(1.6);
    const red=new T.MeshBasicMaterial({color:0xff2739});const blue=new T.MeshBasicMaterial({color:0x51dfff,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false});
    function enemy(kind,scale,id){
      const r=new T.Group();root.add(r);
      const actor=window.createOpeningActor(kind,'frost-enemy-'+id);r.add(actor);actor.scale.setScalar(scale);
      if(actor.userData.body)actor.userData.body.visible=false;
      return {r,actor,get body(){return actor.userData.glbModel||actor;},get arms(){return actor.userData.glbRig?.arms||[];},get legs(){return actor.userData.glbRig?.thighs||[];}};
    }
    const bots=[enemy('hammerer',2.3,0),enemy('darkwarrior',2.5,1),enemy('hammerer',2.2,2)],giant=enemy('darkwarrior',10,3);
    const beam=new T.Mesh(new T.CylinderGeometry(.12,.25,1,10),red);root.add(beam);
    const shots=[0,1].map(()=>{const b=new T.Mesh(new T.CylinderGeometry(.07,.12,1,8),blue);root.add(b);return b;});
    const ring=new T.Mesh(new T.TorusGeometry(1,.08,8,64),blue.clone());ring.rotation.x=-Math.PI/2;root.add(ring);
    const glow=new T.PointLight(0x50cfff,0,40,2);root.add(glow);
    const search=new T.SpotLight(0xff2233,50,100,.2,.75,1.2);root.add(search,search.target);
    const eyes=new T.Group();for(const side of [-1,1]){const e=new T.Mesh(new T.SphereGeometry(.9,12,8),red);e.scale.set(1.8,.55,1);e.position.x=side*2.6;eyes.add(e);}root.add(eyes);
    const snowGeo=new T.BufferGeometry(),snowPos=new Float32Array(700*3);for(let i=0;i<700;i++){snowPos[i*3]=(Math.random()-.5)*100;snowPos[i*3+1]=Math.random()*45;snowPos[i*3+2]=(Math.random()-.5)*100;}snowGeo.setAttribute('position',new T.BufferAttribute(snowPos,3));const snow=new T.Points(snowGeo,new T.PointsMaterial({color:0xe0f5ff,size:.12,transparent:true,opacity:.7}));root.add(snow);
    const burst=[];for(let i=0;i<36;i++){const p=new T.Mesh(new T.IcosahedronGeometry(.08+i%3*.035,0),blue);root.add(p);burst.push(p);}
    return {root,hero,bots,giant,beam,shots,ring,glow,search,eyes,snow,burst,origin:null,id:null};
  }
  function bonePose(g,t){
    if(!g)return;for(const list of [[g.pelvis,g.spine,g.chest,g.neck,g.head],g.arms,g.forearms,g.hands,g.thighs,g.knees,g.shins,g.feet,g.tail,g.ears])for(const b of list||[])b?.rotation.set(0,0,0);
    const breath=Math.sin(t*2.3)*.013;g.chest.rotation.x=breath;g.head.rotation.y=Math.sin(t*.6)*.045;
    const surprise=wave(t,49,54),look=ease(t,28,31)*(1-ease(t,50,54));
    g.head.rotation.y+=look*.55;g.neck.rotation.y=look*.18;g.chest.rotation.y=look*.1;
    g.head.rotation.x=-.15*surprise-.25*ease(t,133,140);g.neck.rotation.x=-.07*surprise;
    (g.ears||[]).forEach((b,i)=>{b.rotation.z=(i?1:-1)*(.04*Math.sin(t*2.8+i)+.19*surprise);b.rotation.x=.1*Math.sin(t*1.8+i)-.14*look;});
    (g.tail||[]).forEach((b,i)=>{b.rotation.y=Math.sin(t*3-i*.55)*.09;b.rotation.z=Math.sin(t*2-i*.5)*.06;});
    const run=(t>61&&t<71)||(t>93&&t<99),cycle=t*13;
    for(let i=0;i<2;i++){const s=i?1:-1;g.arms[i].rotation.x=run?Math.sin(cycle+i*Math.PI)*.6:.1;g.arms[i].rotation.z=s*.1;g.forearms[i].rotation.x=-.35;g.thighs[i].rotation.x=run?Math.sin(cycle+i*Math.PI)*.8:0;g.knees[i].rotation.x=run?Math.max(0,-Math.sin(cycle+i*Math.PI))*1.15:.08;}
    const flip=(a,b,side=0)=>{const u=clamp((t-a)/(b-a)),tuck=ease(u,.1,.27)*(1-ease(u,.6,.8)),crouch=wave(u,0,.15)+wave(u,.8,1);g.pelvis.rotation.x=-Math.PI*2*ease(u,.15,.78);g.pelvis.rotation.z=side*wave(u,.1,.9)*.5;g.spine.rotation.x=.4*tuck+.3*crouch;g.chest.rotation.x=.25*tuck+.22*crouch;g.chest.rotation.y=.3*side*tuck;g.head.rotation.x=-.25*tuck+.15*crouch;for(let i=0;i<2;i++){g.thighs[i].rotation.x=-(i?1.35:1.6)*tuck-.75*crouch;g.knees[i].rotation.x=(i?1.8:2.05)*tuck+1.3*crouch;g.arms[i].rotation.x=-(i?1.1:.7)*tuck+.5*crouch;g.forearms[i].rotation.x=-1.3*tuck-.4;} };
    if(t>=55&&t<62)flip(55,62,-1);
    if(t>=72&&t<80){const w=wave(t,72,80);g.pelvis.rotation.z=-w*.35;g.thighs[0].rotation.x=-w*1.2;g.knees[0].rotation.x=w*1.8;g.thighs[1].rotation.x=-w*.3;g.spine.rotation.x=w*.5;g.arms[0].rotation.x=-w;}
    if(t>=98&&t<104)flip(98,104,1);
    if(t>=108&&t<114)flip(108,114,-1);
    const aim=wave(t,102,108)+wave(t,114,121);for(let i=0;i<2;i++){g.arms[i].rotation.x-=aim*1.4;g.forearms[i].rotation.x-=aim*.25;g.arms[i].rotation.z+=(i?1:-1)*aim*.18;}
    const landing=wave(t,121,125);g.spine.rotation.x+=landing*.45;g.head.rotation.x+=landing*.2;g.thighs.forEach(b=>b.rotation.x-=landing*.8);g.knees.forEach(b=>b.rotation.x+=landing*1.4);
  }
  const lines=[[18,24,'ECAL','Something’s not right here.'],[41,48,'ECAL','Oh. So that’s the welcoming committee.'],[51,54,'ECAL','Whoa!'],[91,96,'ECAL','All right. Let’s do this.'],[134,140,'MYSTERIOUS VOICE','You should never have come here.'],[141,147,'ECAL','Yeah? Well, I’m not leaving.']];
  window.hideFrostIntro=()=>{overlay.style.display='none';hidden.forEach(([r,v])=>r.visible=v);hidden=[];if(kit)kit.root.visible=false;if(master)master.gain.value=0;};
  window.heroFrostIntroReady=false;
  window.updateFrostIntro=(T,state,scene,camera,rigs,local,dt)=>{
    hidden.forEach(([r,v])=>r.visible=v);hidden=[];
    const tr=state.frostIntro;
    if(state.round!==2||!tr){overlay.style.display='none';if(kit)kit.root.visible=false;if(master)master.gain.value=0;window.heroFrostIntroReady=false;return;}
    if(tr.done&&!kit){overlay.style.display="none";if(master)master.gain.value=0;return;}
    if(!kit)kit=build(T,scene);
    const k=kit;k.root.visible=true;
    if(tr.done){overlay.style.display='none';k.hero.visible=false;k.bots.forEach(b=>b.r.visible=false);k.giant.r.visible=false;k.beam.visible=false;k.shots.forEach(o=>o.visible=false);k.ring.visible=false;k.glow.intensity=0;k.search.intensity=0;k.burst.forEach(o=>o.visible=false);k.eyes.visible=!!k.origin;if(master)master.gain.value=0;return;}
    overlay.style.display='block';
    for(const b of [...k.bots,k.giant])if(b.actor.userData.body)b.actor.userData.body.visible=false;
    if(!k.hero.userData.glbRig||[...k.bots,k.giant].some(b=>!b.actor.userData.glbRig)||window.heroIceLandscapeStatus!=='ready'){subtitle.textContent='Preparing the frost cinematic…';shade.style.opacity='1';return;}
    window.heroFrostIntroReady=true;
    if(k.id!==tr.id){k.id=tr.id;k.origin=new T.Vector3((local.x-500)*.055,0,(local.y-300)*.055);k.origin.y=window.heroIceTerrain?.height(k.origin.x,k.origin.z)||0;lastBeat=-1;soundAge=-1;startAudio();}

    const t=tr.age,base=k.origin,hero=k.hero;
    for(const r of rigs.values()){hidden.push([r,r.visible]);r.visible=false;}
    k.hero.visible=true;const ground=(x,z)=>window.heroIceTerrain?.height(x,z)??base.y;
    const at=(x,y,z)=>new T.Vector3(base.x+x,base.y+y,base.z+z);
    // Travel stays around the frozen spawn ridge, then returns to its gameplay foot point.
    let x=0,z=0,y=0;
    if(t>=55&&t<62){x=-6*ease(t,55,62);y=4.5*wave(t,55,62);}
    else if(t<72&&t>=62){x=-6;z=-12*ease(t,62,72);y=2.5;}
    else if(t<90&&t>=72){x=-6+6*ease(t,72,84);z=-12+12*ease(t,72,90);}
    else if(t>=98&&t<108){x=5*wave(t,98,108);z=-5*wave(t,98,108);y=5*wave(t,98,108);}
    else if(t>=108&&t<121){x=-5*wave(t,108,121);y=5.5*wave(t,108,121);z=-3*wave(t,108,121);}
    hero.position.set(base.x+x,ground(base.x+x,base.z+z)+y,base.z+z);hero.rotation.set(0,Math.PI+.25*Math.sin(t*.3)*(t>55&&t<125?1:.15),t>=62&&t<72?-.55:0);
    bonePose(hero.userData.glbRig,t);hero.updateMatrixWorld(true);
    // Sole correction only during contact phases; never pins a spinning character to the floor.
    if(y===0){const feet=hero.userData.glbRig.feet,low=Math.min(...feet.map(b=>b.getWorldPosition(new T.Vector3()).y));hero.position.y+=ground(hero.position.x,hero.position.z)-low+.08;}
    k.snow.position.copy(base);k.snow.rotation.y=t*.012;
    k.giant.r.visible=t>=27&&t<90;k.giant.r.position.copy(at(14,-6+8*ease(t,27,39),-30));k.giant.body.rotation.y=-.35+Math.sin(t*.15)*.15;if(k.giant.arms[0])k.giant.arms[0].rotation.x=-.8*ease(t,45,52);
    k.search.intensity=t>28&&t<55?70:0;k.search.position.copy(at(14,17,-28));k.search.target.position.copy(at(Math.sin(t*.4)*18,1,-2));
    const line=(mesh,a,b)=>{mesh.position.copy(a).add(b).multiplyScalar(.5);const v=b.clone().sub(a);mesh.scale.y=v.length();mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());};
    k.beam.visible=t>=52&&t<56;if(k.beam.visible)line(k.beam,at(14,17,-28),at(0,1,0));
    k.bots.forEach((b,i)=>{b.r.visible=t>=88&&t<131;const angle=i*Math.PI*2/3,r=7-3*ease(t,96,101);b.r.position.copy(at(Math.cos(angle)*r,0,Math.sin(angle)*r-2));b.r.position.y=ground(b.r.position.x,b.r.position.z);b.r.rotation.y=-angle-Math.PI/2;b.body.rotation.z=(i?1:-1)*ease(t,119+i*.45,123+i*.45)*1.3;b.arms.forEach((a,j)=>a.rotation.x=-.4+Math.sin(t*2+i+j)*.35);b.legs.forEach((a,j)=>a.rotation.x=t<104?Math.sin(t*5+j*Math.PI)*.18:0);});
    k.shots.forEach((b,i)=>{b.visible=(t>103&&t<107||t>115&&t<120)&&t%.22<.13;if(b.visible){const hand=hero.userData.glbRig.hands[i].getWorldPosition(new T.Vector3());line(b,hand,k.bots[i].r.position.clone().add(new T.Vector3(0,2,0)));}});
    const burstTime=t<90?t-55:t-120;k.ring.visible=burstTime>=0&&burstTime<3;k.ring.position.copy(at(0,.2,0));k.ring.scale.setScalar(1+Math.max(0,burstTime)*8);k.ring.material.opacity=Math.max(0,.9-burstTime*.3);k.glow.position.copy(hero.position).add(new T.Vector3(0,2,0));k.glow.intensity=k.ring.visible?40*Math.max(0,1-burstTime/3):2;
    k.burst.forEach((p,i)=>{p.visible=burstTime>=0&&burstTime<2;const a=i*2.399,r=Math.max(0,burstTime)*(3+i%6);p.position.copy(at(Math.cos(a)*r,Math.max(0,burstTime*(4+i%4)-burstTime*burstTime*5),Math.sin(a)*r));});
    cinematicSound(t);
    k.eyes.visible=t>=133;k.eyes.position.copy(at(0,32,-35));k.eyes.scale.setScalar(ease(t,133,138));
    const current=lines.find(l=>t>=l[0]&&t<l[1]);subtitle.textContent=current?current[2]+'\n“'+current[3]+'”':'';
    chapter.textContent=t<25?'FROZEN FUTURE · THE SILENT RIDGE':t<55?'SOMETHING IS WATCHING':t<90?'THE FROST ESCAPE':t<125?'BLUE THUNDER':'THE REAL ENEMY';
    shade.style.opacity=String(t<6?1-ease(t,2,6):t>147&&t<148?wave(t,147,148):0);
    const target=hero.position.clone().add(new T.Vector3(0,2.4,0));let eye;
    if(t<15)eye=at(25-23*ease(t,4,15),35-26*ease(t,4,15),30-20*ease(t,4,15));
    else if(t<25){const a=ease(t,15,25)*1.5;eye=target.clone().add(new T.Vector3(Math.sin(a)*5,1,Math.cos(a)*5));}
    else if(t<50){eye=target.clone().add(new T.Vector3(3+3*ease(t,25,40),1.4,6));target.lerp(k.giant.r.position.clone().add(new T.Vector3(0,14,0)),ease(t,29,40)*.5);}
    else if(t<55)eye=target.clone().add(new T.Vector3(1.4,.1,3.6));
    else if(t<90)eye=target.clone().add(new T.Vector3(4+Math.sin(t*.4)*1.5,1.3,7));
    else if(t<98)eye=target.clone().add(new T.Vector3(3,-1.2,6));
    else if(t<125){const a=ease(t,108,120)*Math.PI*2;eye=target.clone().add(new T.Vector3(Math.sin(a)*8,2,Math.cos(a)*8));}
    else {eye=target.clone().add(new T.Vector3(1.5,1,5));target.y+=ease(t,132,140)*7;}
    // Frame the real face joint from the front, respecting the hero's facing direction.
    hero.updateMatrixWorld(true);
    const face=hero.userData.glbRig.head.getWorldPosition(new T.Vector3());
    const faceView=(distance,side=.25,height=.12)=>face.clone().add(new T.Vector3(side,height,distance).applyQuaternion(hero.quaternion));
    // Dialogue shots dolly in, hold for the line, then pull back to reveal the threat.
    if(t>=15&&t<27){
      const close=ease(t,15,18)*(1-ease(t,24,27));
      target.lerp(face,close);eye.lerp(faceView(2.05,.45),close);
    }else if(t>=40&&t<55){
      const close=ease(t,40,42)*(1-ease(t,47,50));
      const surprise=ease(t,50,51)*(1-ease(t,53.5,55));
      const amount=Math.max(close,surprise);target.lerp(face,amount);eye.lerp(faceView(surprise>close?1.85:2.25,-.38),amount);
    }else if(t>=90&&t<99){
      const close=ease(t,90,91.5)*(1-ease(t,96,99));target.lerp(face,close);eye.lerp(faceView(2.15,.4),close);
    }else if(t>=125&&t<146){
      const close=ease(t,125,128)*(1-ease(t,131,135));
      const resolve=ease(t,140,142)*(1-ease(t,144,146));
      const amount=Math.max(close,resolve);target.lerp(face,amount);eye.lerp(faceView(2.05,-.35),amount);
    }
    // Blend each shot's desired framing; preserve the normal gameplay camera for the handoff.
    if(!k.cameraPos||t<.1)k.cameraPos=eye.clone();k.cameraPos.lerp(eye,1-Math.exp(-dt*3.8));
    if(!k.look)k.look=target.clone();k.look.lerp(target,1-Math.exp(-dt*5));
    const gameplayPos=camera.position.clone(),gameplayQ=camera.quaternion.clone();camera.position.copy(k.cameraPos);camera.lookAt(k.look);
    const handoff=ease(t,146,150);camera.position.lerp(gameplayPos,handoff);camera.quaternion.slerp(gameplayQ,handoff);
    if(t>148){hidden.forEach(([r,v])=>r.visible=v);hero.visible=false;overlay.style.opacity=String(1-handoff);}else overlay.style.opacity='1';
  };
})();
