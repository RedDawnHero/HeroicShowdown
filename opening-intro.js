(() => {
 const overlay=document.querySelector('#openingIntro'),prompt=document.querySelector('#openingPrompt'),status=document.querySelector('#openingStatus'),progress=document.querySelector('#openingProgress'),sound=document.querySelector('#openingSound');
 const video=document.querySelector('#openingVideo');video.removeAttribute('src');video.hidden=true;document.querySelector('#playOpeningIntro').hidden=true;
 const caption=document.createElement('div');caption.style.cssText='position:absolute;bottom:13%;left:8%;right:8%;text-align:center;color:#fff2d5;font:700 clamp(14px,2vw,24px) sans-serif;text-shadow:0 2px 12px #000;pointer-events:none;z-index:3';overlay.appendChild(caption);
 const curtain=document.createElement('div');curtain.style.cssText='position:absolute;inset:0;background:black;pointer-events:none;z-index:2';overlay.appendChild(curtain);
 const openingSong=new Audio('assets/opening-toooonie.m4a');openingSong.preload='none';openingSong.volume=.65;
 let songReady=false,songPending=false,songBlocked=false;
 function stopSong(){songReady=false;openingSong.pause();openingSong.currentTime=0;}
 function playSong(){if(!active||!songReady||muted||document.hidden||songPending||songBlocked||!openingSong.paused||openingSong.ended)return;
  songPending=true;const attempt=openingSong.play();Promise.resolve(attempt).then(()=>{if(!active||!songReady||muted||document.hidden)openingSong.pause();}).catch(()=>{songBlocked=true;sound.textContent='ENABLE SOUND';}).finally(()=>{songPending=false;});
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)openingSong.pause();else playSong();});
 let editedCamera=null,editedLook=null;
 let active=false,age=0,last=0,raf,renderer,scene,camera,ecal,dark,beam,flash,audio,master,windGain,musicGain,muted=false,delivered=false;
 const traffic=[],walkers=[],dust=[],sparks=[],page=[...document.querySelectorAll('body > header,body > main,body > footer')];let previous=[];
 const ease=(x,a,b)=>{const v=Math.max(0,Math.min(1,(x-a)/(b-a)));return v*v*(3-2*v);};
 window.heroOpeningIntroActive=()=>active;
 function audioStart(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();audio.resume();if(master){master.gain.value=muted?0:.22;return;}
  master=audio.createGain();master.gain.value=muted?0:.22;master.connect(audio.destination);
  const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.35;
  const noise=audio.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=500;windGain=audio.createGain();windGain.gain.value=.22;noise.connect(filter).connect(windGain).connect(master);noise.start();
  musicGain=audio.createGain();musicGain.gain.value=0;musicGain.connect(master);
  for(const [i,hz] of [65.41,98,130.81,155.56,196,261.63].entries()){const osc=audio.createOscillator(),gain=audio.createGain();osc.type=i<2?'sine':'triangle';osc.frequency.value=hz;gain.gain.value=.09;osc.connect(gain).connect(musicGain);osc.start();}
 }catch(e){console.warn('Opening audio unavailable',e);}}
 sound.hidden=false;sound.textContent='SOUND ON';sound.onclick=()=>{if(songBlocked){songBlocked=false;muted=false;}else muted=!muted;sound.textContent=muted?'SOUND OFF':'SOUND ON';sound.setAttribute('aria-pressed',String(!muted));if(master)master.gain.value=muted?0:.22;if(muted)openingSong.pause();else playSong();};
 function boom(){if(!audio||!master)return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(25,t+1);g.gain.setValueAtTime(.6,t);g.gain.exponentialRampToValueAtTime(.001,t+1);o.connect(g).connect(master);o.start();o.stop(t+1);}
 function setup(){const T=window.THREE;if(!T||!window.createOpeningActor)return false;if(renderer)return true;
  renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:0';overlay.prepend(renderer.domElement);overlay.style.backgroundImage='none';prompt.style.zIndex=4;
  scene=new T.Scene();window.addConnectedCity?.(T,scene,true);scene.background=new T.Color(0xe7aa77);scene.fog=new T.Fog(0xe7aa77,130,520);camera=new T.PerspectiveCamera(52,1,.1,900);
  scene.add(new T.HemisphereLight(0xffe2ad,0x4d5061,2));const sunLight=new T.DirectionalLight(0xffc879,3);sunLight.position.set(-80,120,-180);scene.add(sunLight);
  const mat=(color)=>new T.MeshStandardMaterial({color,roughness:.6,metalness:.3});
  const box=(w,h,d,m,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);scene.add(o);return o;};
  box(600,1,650,mat(0x99795c),0,-.6,-100);
  const facade=document.createElement('canvas');facade.width=128;facade.height=256;const c=facade.getContext('2d');c.fillStyle='#283947';c.fillRect(0,0,128,256);for(let y=5;y<256;y+=12)for(let x=4;x<128;x+=12){c.fillStyle=(x+y)%5?'#adbac1':'#fbd394';c.fillRect(x,y,6,7);}const texture=new T.CanvasTexture(facade);texture.colorSpace=T.SRGBColorSpace;
  const towerMat=new T.MeshStandardMaterial({map:texture,metalness:.65,roughness:.3});
  for(let row=0;row<15;row++)for(let col=-5;col<=5;col++){if(Math.abs(col)<1)continue;const h=22+((row*31+col*17+200)%70);box(13,h,15,towerMat,col*25,h/2,50-row*27);}
  for(let i=0;i<25;i++){const mountain=new T.Mesh(new T.ConeGeometry(30+i%4*10,65+i%5*14,5),mat(0x827061));mountain.position.set(-330+i*28,20,-430-Math.sin(i)*30);scene.add(mountain);}
  const sun=new T.Mesh(new T.SphereGeometry(15,20,16),new T.MeshBasicMaterial({color:0xffedb2}));sun.position.set(-170,105,-400);scene.add(sun);
  box(24,38,22,mat(0x344b5c),0,19,-45);box(25,.4,23,mat(0x8b9ca3),0,38,-45);
  box(30,18,30,mat(0x344b5c),0,9,-104);box(31,.4,31,mat(0x8b9ca3),0,18,-104);
  for(let i=0;i<32;i++){const vehicle=new T.Group(),body=new T.Mesh(new T.BoxGeometry(2.6,.7,1.2),mat(i%2?0x376377:0xcab899));vehicle.add(body);const glow=new T.Mesh(new T.BoxGeometry(.12,.2,1),new T.MeshBasicMaterial({color:0x55ddff}));glow.position.x=-1.35;vehicle.add(glow);scene.add(vehicle);traffic.push(vehicle);}
  for(let i=0;i<45;i++){const o=new T.Mesh(new T.CapsuleGeometry(.22,.9,3,5),mat([0x344655,0x945e42,0x607662][i%3]));scene.add(o);walkers.push(o);}
  for(let i=0;i<12;i++){const panel=box(3,5,.12,new T.MeshBasicMaterial({color:i%2?0x52cbd7:0xffae64,transparent:true,opacity:.6}),i%2?16:-16,6,-i*20);panel.rotation.y=i%2?-.5:.5;}
  const dustGeometry=new T.BufferGeometry(),positions=new Float32Array(450*3);for(let i=0;i<450;i++){positions[i*3]=Math.sin(i*13)*160;positions[i*3+1]=(i%30)*2;positions[i*3+2]=-i%330;}dustGeometry.setAttribute('position',new T.BufferAttribute(positions,3));const cloud=new T.Points(dustGeometry,new T.PointsMaterial({color:0xffddb0,size:.18,transparent:true,opacity:.4}));scene.add(cloud);dust.push(cloud);
  ecal=window.createOpeningActor('ecal','opening-ecal-city');dark=window.createOpeningActor('darkwarrior','opening-dark-city');scene.add(ecal,dark);ecal.scale.setScalar(1.6);dark.scale.setScalar(2);
  beam=new T.Mesh(new T.CylinderGeometry(.07,.12,1,8),new T.MeshBasicMaterial({color:0x73eaff}));scene.add(beam);
  flash=new T.PointLight(0xff8e38,0,65);flash.position.set(10,22,-110);scene.add(flash);
  for(let i=0;i<55;i++){const p=new T.Mesh(new T.SphereGeometry(.055,4,3),new T.MeshBasicMaterial({color:i%2?0xffb149:0x96eaff}));scene.add(p);sparks.push(p);}
  return true;
 }
 function deliver(){if(delivered)return;delivered=true;window.dispatchEvent(new Event('heroic-opening-finished'));}
 function finish(){if(!active)return;active=false;stopSong();cancelAnimationFrame(raf);deliver();overlay.hidden=true;overlay.style.opacity=1;document.body.classList.remove('opening-intro-active');page.forEach((p,i)=>p.inert=previous[i]);if(master)master.gain.setTargetAtTime(0,audio.currentTime,.2);}
 window.playHeroOpeningIntro=()=>{if(active)return;active=true;stopSong();songBlocked=false;delivered=false;age=0;editedCamera=null;editedLook=null;last=performance.now();overlay.hidden=false;overlay.style.opacity=1;curtain.style.opacity=1;prompt.hidden=false;status.textContent='Preparing Ecal’s opening…';previous=page.map(p=>p.inert);page.forEach(p=>p.inert=true);document.body.classList.add('opening-intro-active');overlay.focus();audioStart();window.dispatchEvent(new Event('heroic-opening-started'));raf=requestAnimationFrame(frame);};
 function frame(now){if(!active)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;if(document.hidden)return;
  try{if(!setup())return;if(!ecal.userData.glbRig||!dark.userData.glbRig){status.textContent='Loading Ecal and Dark Armored…';return;}
  window.resetCharacterPose?.(ecal);window.resetCharacterPose?.(dark);
  prompt.hidden=true;age+=dt;
  // Short editorial cut: preserve the flip's physical timing, trim travel and repeated combat.
  const cuts=[[0,0],[6,15],[10,30],[13,34],[15,35.8],[18,47.8],[20,50],[26,56],[26,90],[29,99],[33,114],[39,125],[43,132]];
  let ci=0;while(ci<cuts.length-2&&age>=cuts[ci+1][0])ci++;
  const a=cuts[ci][1]+(cuts[ci+1][1]-cuts[ci][1])*Math.min(1,(age-cuts[ci][0])/Math.max(.001,cuts[ci+1][0]-cuts[ci][0])),T=window.THREE;
  progress.value=age/43;curtain.style.opacity=1-ease(age,.25,1.25);if(age>=43){finish();return;}
  if(musicGain)musicGain.gain.value=0;if(windGain)windGain.gain.value=.2+.18*Math.sin(ease(a,6,15)*Math.PI);
  traffic.forEach((v,i)=>{v.position.set(((a*(8+i%4)+i*23)%240)-120,8+(i%6)*9,-10-(i%12)*24);});walkers.forEach((p,i)=>{p.position.set(i%2?10:-10,1,-((i*9+a*(.8+i%3*.2))%330));p.rotation.z=Math.sin(a*5+i)*.03;});dust[0].position.x=Math.sin(a*.04)*8;
  const e=ecal.userData.glbRig,d=dark.userData.glbRig;
  for(const rig of [e,d])for(const key of ['arms','forearms','thighs','knees'])rig[key]?.forEach(b=>b.rotation.set(0,0,0));
  ecal.position.set(0,38.3,-47);ecal.rotation.set(0,Math.PI,0);dark.position.set(0,18.3,-109);dark.rotation.set(0,0,0);dark.scale.setScalar(2);ecal.visible=true;dark.visible=a>=27;beam.visible=false;
  const eye=new T.Vector3(),target=new T.Vector3();let roll=0;
  if(a<15){const keys=[[0,0,3,90],[4,0,130,45],[7,0,120,-5],[10,4,35,-30],[12,-7,8,-56],[13.5,9,16,-65],[15,5,42,-38]];let k=0;while(k<keys.length-2&&a>keys[k+1][0])k++;const u=ease(a,keys[k][0],keys[k+1][0]);eye.set(...keys[k].slice(1)).lerp(new T.Vector3(...keys[k+1].slice(1)),u);target.set(0,a<7?65:38,-65);roll=Math.sin(ease(a,9,14)*Math.PI)*-.16;}
  else if(a<30){const u=ease(a,15,25),angle=1.1-u*2.7;target.copy(ecal.position).add(new T.Vector3(0,2.6,0));eye.copy(target).add(new T.Vector3(Math.sin(angle)*(8-u*4),.8,Math.cos(angle)*(8-u*4)));if(a>27){e.head.rotation.y=-ease(a,27,28)*.65;flash.intensity=60*(1-ease(a,27,29));if(a-dt<=27)boom();}}
  else if(a<50){
    const run=ease(a,30,34),u=Math.max(0,Math.min(1,(age-13)/5.1));
    // A falling somersault, with no glider geometry attached to the character.
    ecal.position.set(0,38.3+Math.sin(u*Math.PI)*3-20*u*u,-47-run*8-u*47);
    e.arms.forEach((b,i)=>{b.rotation.z=(i?-1:1)*.2;b.rotation.x=-.35;});
    e.thighs.forEach((b,i)=>b.rotation.x=a<34?Math.sin(a*10+i*Math.PI)*.65:-.2);
    e.knees.forEach(b=>b.rotation.x=.25);
    target.copy(ecal.position).add(new T.Vector3(0,2,0));eye.copy(target).add(new T.Vector3(5,2,9));
  }
  else if(a<75){const fight=a-50,slow=a>=62&&a<67,phase=slow?12+(a-62)*.25:fight;ecal.position.set(Math.sin(phase*.65)*1.2,18.3,-102+Math.sin(phase*.8)*.6);dark.position.x=Math.sin(phase*.65)*.7;d.chest.rotation.y=Math.sin(phase*3)*.18;d.head.rotation.x=Math.max(0,Math.sin(phase*4))*.12;d.arms.forEach((b,i)=>{b.rotation.x=-.8+Math.sin(phase*3+i)*.6;});e.arms.forEach((b,i)=>b.rotation.x=-1.25+Math.sin(phase*4+i)*.22);e.forearms.forEach(b=>b.rotation.x=-.3);e.knees.forEach((b,i)=>b.rotation.x=.3+Math.max(0,Math.sin(phase*4+i*Math.PI))*.7);ecal.rotation.y=Math.atan2(dark.position.x-ecal.position.x,dark.position.z-ecal.position.z);beam.visible=(phase%.6)<.16;const start=ecal.position.clone().add(new T.Vector3(.4,2,0)),end=dark.position.clone().add(new T.Vector3(0,2,0)),delta=end.clone().sub(start);beam.position.copy(start).add(end).multiplyScalar(.5);beam.scale.y=delta.length();beam.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());target.copy(ecal.position).lerp(dark.position,.4).add(new T.Vector3(0,2,0));const orbit=slow?ease(a,62,67)*Math.PI*2:.8;eye.copy(target).add(new T.Vector3(Math.sin(orbit)*11,4,Math.cos(orbit)*11));}
  else if(a<90){ecal.position.set(0,18.3,-100);dark.position.set(0,0,-145);dark.scale.setScalar(2+ease(a,75,83)*16);target.copy(ecal.position).add(new T.Vector3(0,2.7,0));eye.copy(target).add(new T.Vector3(2,.4,-4));if(a>79){const reveal=ease(a,79,87);target.lerp(new T.Vector3(0,23,-127),reveal);eye.lerp(new T.Vector3(27,32,-78),reveal);}e.arms.forEach(b=>b.rotation.x=-.7);}
  else{ecal.position.set(-2,18.3,-100);dark.position.set(2,18.3,-104);}

  if(age>=12.3&&age<20){
    const crouch=ease(age,12.3,12.65)*(1-ease(age,12.65,13.1));
    const tuck=ease(age,13.3,13.65)*(1-ease(age,15.1,15.7));
    const rotation=ease(age,13.5,15.65),land=ease(age,18.1,18.3)*(1-ease(age,18.5,19.7));
    ecal.position.y-=crouch*.4;
    ecal.rotation.x=-rotation*Math.PI*2+land*.15;
    ecal.rotation.z=Math.sin(rotation*Math.PI)*.1;
    e.thighs.forEach((b,i)=>b.rotation.x=-crouch*.8-tuck*(i?1.35:1.6)-land*(i?.8:1.2));
    e.knees.forEach((b,i)=>b.rotation.x=crouch*1.2+tuck*(i?1.85:2.05)+land*1.5);
    e.arms.forEach((b,i)=>{b.rotation.x=.6*crouch-tuck*(i?.8:1.1)-land*(i?.4:1);b.rotation.z=(i?-1:1)*(.15+.2*tuck+.2*land);});
    e.forearms.forEach((b,i)=>b.rotation.x=-.25-tuck*(i?1.2:1.4));
    e.spine.rotation.x=.2*tuck+.2*land;e.chest.rotation.x=.25*tuck+.3*land;e.head.rotation.x=-.15*tuck;
    if(age>=18.1){ecal.updateMatrixWorld(true);const feetY=Math.min(...e.feet.map(f=>f.getWorldPosition(new T.Vector3()).y));ecal.position.y+=18.32-feetY;}
    if(age>=18.1&&age-dt<18.1)boom();
    target.copy(ecal.position).add(new T.Vector3(0,2,0));eye.copy(target).add(new T.Vector3(5,2,9));
  }else{e.spine.rotation.x=0;e.chest.rotation.x=0;e.head.rotation.x=0;}
  e.tail?.forEach((b,i)=>b.rotation.y=Math.sin(a*4-i*.6)*.15);if(e.chest)e.chest.rotation.y=Math.sin(a*3)*.04;
  sparks.forEach((p,i)=>{p.visible=(a>50&&a<75)||(a>=48.35&&a<49);if(a>=48.35&&a<49){const t=a-48.35;p.position.set(ecal.position.x+Math.sin(i*2.4)*t*8,18.4+Math.sin(i)*t*2,ecal.position.z+Math.cos(i*2.4)*t*8);return;}const burst=(a*2+i*.03)%1;p.position.copy(dark.position).add(new T.Vector3(Math.sin(i*2.4)*burst*4,2+Math.cos(i)*burst*3-burst*burst*2,Math.cos(i*2.4)*burst*4));});
  caption.textContent=a>27&&a<30?'Dark Armored is attacking the city.':a>75&&a<80?'His power is still growing.':a>89?'ECAL · THE FIGHT CONTINUES':'';
  const splitCaption=window.openingPortalSplit?.(T,scene,ecal,dark,eye,target,a);if(a>=90){caption.textContent=splitCaption||'';roll=0;curtain.style.opacity=ease(a,130,132);}
  if(!editedCamera){editedCamera=eye.clone();editedLook=target.clone();}
  editedCamera.lerp(eye,1-Math.exp(-dt*12));editedLook.lerp(target,1-Math.exp(-dt*14));
  camera.position.copy(editedCamera);camera.up.set(0,1,0);camera.lookAt(editedLook);camera.rotateZ(roll);const w=overlay.clientWidth||innerWidth,h=overlay.clientHeight||innerHeight;if(renderer.domElement.width!==Math.floor(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.floor(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();window.stabilizeCharacterPose?.(ecal);window.stabilizeCharacterPose?.(dark);renderer.render(scene,camera);if(age>.25){songReady=true;playSong();}
  }catch(error){stopSong();console.error('Opening cinematic:',error);prompt.hidden=false;status.textContent='The opening could not render. Use Skip Intro to continue.';}
 }
 document.querySelector('#skipOpeningIntro').onclick=finish;
 window.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape')finish();if(e.key!=='Tab')e.preventDefault();e.stopImmediatePropagation();},true);
 window.addEventListener('keyup',e=>{if(active)e.stopImmediatePropagation();},true);
})();
