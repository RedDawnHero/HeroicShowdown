(() => {
 const data=window.level3Terrain;const bridgeY=data.spawn[1],bridgeZ=data.spawn[2],waterY=bridgeY-2.5;
 const cell=(x,z)=>{const ix=Math.round((x-data.min)/data.step),iz=Math.round((z-data.min)/data.step);return ix>=0&&iz>=0&&ix<data.n&&iz<data.n?iz*data.n+ix:-1;};
 window.modelVillageHeight=(x,z)=>{
  if(Math.abs(x)<10&&Math.abs(z-bridgeZ)<1.6)return bridgeY;
  const i=cell(x,z);if(i<0||data.heights[i]<=-998)return null;
  const gx=(x-data.min)/data.step,gz=(z-data.min)/data.step,ix=Math.floor(gx),iz=Math.floor(gz);
  if(ix<0||iz<0||ix>=data.n-1||iz>=data.n-1)return data.heights[i];
  const a=iz*data.n+ix,h=[data.heights[a],data.heights[a+1],data.heights[a+data.n],data.heights[a+data.n+1]];
  // Smooth stairs and hills, but preserve roof edges and vertical walls.
  if(h.every(v=>v>-998)&&Math.max(...h)-Math.min(...h)<=1.25){const tx=gx-ix,tz=gz-iz;return (h[0]*(1-tx)+h[1]*tx)*(1-tz)+(h[2]*(1-tx)+h[3]*tx)*tz;}
  return data.heights[i];
 };
 window.homeVillageWalkable=(x,y)=>{const wx=(x-500)*.055,wz=(y-300)*.055,h=window.modelVillageHeight(wx,wz);return h!==null&&h>waterY+.45;};
 window.modelVillageSpawn={x:500,y:300+data.spawn[2]/.055};
 window.homeClues.forEach((c,i)=>{c.x=500+data.clues[i][0]/.055;c.y=300+data.clues[i][2]/.055;});
 window.createHomeVillage=(T,scene)=>{
  const root=new T.Group();root.visible=false;scene.add(root);let water;const riverTiles=[];const flowTime={value:0};const clueProps=[],cluePlaceholders=[];const markers=[];const surfaces=[];
  const loader=new window.GLTFLoader();
  function load(key){return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error(key+' loading timed out')),45000);const success=value=>{clearTimeout(timeout);resolve(value);};const script=document.createElement('script');script.src='assets/level3-'+key+'-data.js'+(key==='villagers'?'?v=crowd79-lod-3':'');script.onerror=reject;script.onload=()=>{try{const raw=atob(window.level3ModelData[key]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);delete window.level3ModelData[key];loader.parse(bytes.buffer,'',g=>success(g.scene),reject);}catch(e){reject(e);}script.remove();};document.head.appendChild(script);});}
  const status=document.createElement('div');status.style.cssText='position:absolute;top:55px;left:20px;color:white;background:#102235dd;padding:10px;z-index:5;display:none';status.textContent='Loading hillside village…';document.querySelector('.arena-wrap').appendChild(status);
  function gradeVillage(material){
    material.roughness=.78;material.metalness=0;
    material.onBeforeCompile=shader=>{
      shader.uniforms.villageLightTime=flowTime;
      shader.fragmentShader="uniform float villageLightTime;\n"+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec3 original=diffuseColor.rgb;
        float foliage=smoothstep(0.005,0.07,original.g-max(original.r,original.b));
        float warm=smoothstep(0.02,0.18,original.r-original.b)*(1.0-foliage);
        float lantern=warm*smoothstep(0.48,0.85,original.r)*smoothstep(0.12,0.3,original.r-original.g);
        vec3 coolWood=original*vec3(1.12,.84,.58);
        vec3 forest=original*vec3(.76,.90,.61);
        diffuseColor.rgb=mix(coolWood,forest,foliage);
        diffuseColor.rgb=mix(diffuseColor.rgb,original*vec3(1.02,.84,.68),warm*.65);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.0,.39,.075),lantern*.6);
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        totalEmissiveRadiance+=vec3(1.0,.48,.09)*lantern*3.1*(1.0+.025*sin(villageLightTime*2.3));
      `);
    };material.customProgramCacheKey=()=> 'village-warm-timber-v3';material.needsUpdate=true;
  }
  function loadClueProps(){
    data.clues.forEach(([x,y,z],i)=>load('clue-'+i).then(model=>{
      const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
      const scale=.95/Math.max(size.x,size.y,size.z);model.scale.setScalar(scale);model.position.copy(center).multiplyScalar(-scale);
      const prop=new T.Group();prop.add(model);prop.rotation.x=-Math.PI/2;prop.position.set(x,y+.04,z);root.add(prop);
      clueProps[i]=prop;if(cluePlaceholders[i])cluePlaceholders[i].visible=false;
    }).catch(error=>console.warn('Clue prop could not load',i,error)));
  }
  let villagers=null,companions=null;
  let ready=false,failed=false;
  let started=false;function startLoading(){if(started)return;started=true;
  load('village').then(model=>{model.scale.setScalar(120);root.add(model);model.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=true;o.castShadow=false;surfaces.push(o);for(const m of (Array.isArray(o.material)?o.material:[o.material]))gradeVillage(m);}});ready=true;loadClueProps();load('villagers').then(crowd=>{villagers=window.createVillagePeople(T,crowd,root,window.modelVillageHeight,bridgeY,bridgeZ);load('finnew-companions').then(group=>{companions=window.createVillagePeople(T,group,root,window.modelVillageHeight,bridgeY,bridgeZ,{count:4,companions:true,originalColors:true});}).catch(error=>console.warn('Companions could not load',error));}).catch(e=>console.warn('Villagers could not load',e));status.textContent='Village ready · loading water…';return load('water');}).then(model=>{
    // Retain the supplied water's texture on a flat, horizon-sized surface.
    let waterMap=null;
    model.traverse(o=>{if(o.isMesh&&!waterMap){for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m.map){waterMap=m.map;break;}}});
    if(waterMap){waterMap.wrapS=waterMap.wrapT=T.RepeatWrapping;waterMap.needsUpdate=true;riverMaterial.uniforms.waterMap.value=waterMap;riverMaterial.uniforms.hasWaterMap.value=1;}
    water=riverSurface;
    ready=true;status.style.display='none';
  }).catch(e=>{failed=true;if(!ready)fallback();ready=true;status.textContent=ready?'Village loaded · optional water is unavailable':'Village preview · original 3D terrain needs uploading';console.error(e);});}
  // Flat water extends beyond the fog horizon in every direction.
  // Animate world-space flow rather than moving tiles, so the river never resets visibly.
  const riverGeometry=new T.PlaneGeometry(4000,4000,1,1);
  riverGeometry.rotateX(-Math.PI/2);
  const riverMaterial=new T.ShaderMaterial({
    uniforms:{riverTime:flowTime,riverLevel:{value:waterY+.08},waterMap:{value:null},hasWaterMap:{value:0}},
    side:T.DoubleSide,
    vertexShader:`
      uniform float riverLevel;
      varying vec3 riverPoint;
      void main(){
        vec3 p=position;p.y=riverLevel;
        riverPoint=(modelMatrix*vec4(p,1.0)).xyz;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }`,
    fragmentShader:`
      uniform float riverTime;uniform sampler2D waterMap;uniform float hasWaterMap;varying vec3 riverPoint;
      void main(){
        vec2 p=riverPoint.xz;
        float flow=p.y-riverTime*2.5;
        float ribbon=sin(p.x*3.2+sin(flow*.7)*.7);
        float ripple=sin(flow*4.8+sin(p.x*1.4)*2.0);
        float fine=sin(flow*11.0+p.x*4.0);
        float glint=pow(max(0.0,ripple*.65+fine*.35),9.0);
        vec3 water=mix(vec3(.035,.115,.15),vec3(.16,.30,.34),.5+.5*sin(flow*.45+p.x*.18));
        water+=vec3(.28,.39,.43)*glint*.65;
        float streak=pow(max(0.0,ribbon),12.0)*smoothstep(.15,.95,ripple);
        float foam=clamp(streak*.22,0.0,.9);
        water=mix(water,vec3(.79,.89,.9),foam);
        if(hasWaterMap>.5)water=mix(water,texture2D(waterMap,vec2(p.x,flow)*.035).rgb,.22);
        float distanceFog=smoothstep(70.0,190.0,length(cameraPosition-riverPoint));
        water=mix(water,vec3(.5686,.6667,.7098),distanceFog);
        gl_FragColor=vec4(water,1.0);
      }`
  });
  const riverSurface=new T.Mesh(riverGeometry,riverMaterial);
  riverSurface.frustumCulled=false;root.add(riverSurface);
  const timber=new T.MeshStandardMaterial({color:0x79502f,roughness:.9});
  const bridge=new T.Mesh(new T.BoxGeometry(20,.22,3.2),timber);bridge.position.set(0,bridgeY-.11,bridgeZ);root.add(bridge);
  for(const side of [-1,1])for(let x=-9.5;x<=9.5;x+=1){const post=new T.Mesh(new T.BoxGeometry(.09,1,.09),timber);post.position.set(x,bridgeY+.5,bridgeZ+side*1.52);root.add(post);}
  const daySky=new T.Mesh(new T.SphereGeometry(650,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;void main(){float h=clamp(normalize(v).y,0.,1.);gl_FragColor=vec4(mix(vec3(.94,.68,.40),vec3(.43,.35,.36),sqrt(h)),1.);}'}));root.add(daySky);const skyEffects={update(t,p){daySky.position.copy(p);}};
  root.add(new T.HemisphereLight(0xffdfb5,0x695033,1.15));
  const light=new T.DirectionalLight(0xffd3a0,2.0);light.position.set(-30,45,20);root.add(light);
  const heroFill=new T.DirectionalLight(0xffdfad,1.15);
  root.add(heroFill,heroFill.target);
  const lampCanvas=document.createElement('canvas');lampCanvas.width=lampCanvas.height=64;
  const lampContext=lampCanvas.getContext('2d'),gradient=lampContext.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(255,244,199,0.8)');gradient.addColorStop(.2,'rgba(255,185,65,0.4)');gradient.addColorStop(1,'rgba(255,135,20,0)');
  lampContext.fillStyle=gradient;lampContext.fillRect(0,0,64,64);
  const lampGlow=new T.CanvasTexture(lampCanvas);
  const lamps=[];
  function addVillageLamp(x,y,z,illuminate){
    const lamp=new T.Group();lamp.position.set(x,y,z);root.add(lamp);
    const frame=new T.MeshStandardMaterial({color:0x39291b,roughness:.7});
    const glass=new T.MeshStandardMaterial({color:0xffd67e,emissive:0xffad32,emissiveIntensity:3.2,roughness:.35});
    const core=new T.Mesh(new T.BoxGeometry(.27,.43,.27),glass);lamp.add(core);
    for(const h of [-.25,.25]){const cap=new T.Mesh(new T.BoxGeometry(.4,.08,.4),frame);cap.position.y=h;lamp.add(cap);}
    for(const x of [-.16,.16])for(const z of [-.16,.16]){const bar=new T.Mesh(new T.BoxGeometry(.035,.48,.035),frame);bar.position.set(x,0,z);lamp.add(bar);}
    const glow=new T.Sprite(new T.SpriteMaterial({map:lampGlow,color:0xffc275,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));glow.scale.set(1.8,1.8,1);lamp.add(glow);
    let source=null;if(illuminate){source=new T.PointLight(0xffb54f,3.5,13,1.5);lamp.add(source);}
    lamps.push({glass,glow,source,phase:lamps.length*1.73});
  }
  // Warm divided windows on the clue houses, with visible timber mullions.
  const windowLights=[];
  data.clues.forEach(([x,y,z],index)=>{
    const paneMaterial=new T.MeshStandardMaterial({color:0xffd495,emissive:0xffad49,emissiveIntensity:2.4,roughness:.6});
    const trim=new T.MeshStandardMaterial({color:0x382c20,roughness:.85});
    for(const side of [-1,1]){
      const frame=new T.Group();frame.position.set(x+side*1.57,y+1.7,z-.1);frame.rotation.y=side*Math.PI/2;root.add(frame);
      const pane=new T.Mesh(new T.BoxGeometry(.95,1.15,.025),paneMaterial);frame.add(pane);
      for(const xx of [-.5,0,.5]){const beam=new T.Mesh(new T.BoxGeometry(.06,1.27,.065),trim);beam.position.set(xx,0,.02);frame.add(beam);}
      for(const yy of [-.6,-.22,.22,.6]){const beam=new T.Mesh(new T.BoxGeometry(1.06,.055,.065),trim);beam.position.set(0,yy,.02);frame.add(beam);}
      const glow=new T.Sprite(new T.SpriteMaterial({map:lampGlow,color:0xffbc6a,transparent:true,opacity:.3,depthWrite:false,blending:T.AdditiveBlending}));glow.position.z=.045;glow.scale.set(1.8,2,1);frame.add(glow);
    }
    windowLights.push({material:paneMaterial,phase:index*1.8});
  });
  data.clues.forEach(([x,y,z])=>addVillageLamp(x-1.25,y+2.05,z+1.3,true));
  for(const x of [-8,-3,3,8])addVillageLamp(x,bridgeY+1.35,bridgeZ+1.52,false);

  data.clues.forEach(([x,y,z],i)=>{const room=new T.Group();room.position.set(x,y,z);root.add(room);for(const [w,h,depth,rx,ry,rz] of [[3,.12,3,0,-.06,0],[.12,2.8,3,-1.5,1.4,0],[.12,2.8,3,1.5,1.4,0],[3,2.8,.12,0,1.4,-1.5],[3.2,.12,3.2,0,2.85,0]]){const wall=new T.Mesh(new T.BoxGeometry(w,h,depth),timber);wall.position.set(rx,ry,rz);room.add(wall);}const photo=new T.Mesh(new T.PlaneGeometry(.9,.55),new T.MeshBasicMaterial({map:window.homePhotoTexture(T,i),side:T.DoubleSide}));photo.rotation.x=-Math.PI/2;photo.position.set(x,y+.025,z);root.add(photo);cluePlaceholders[i]=photo;const ring=new T.Mesh(new T.TorusGeometry(.8,.045,8,40),new T.MeshBasicMaterial({color:0xffcb70}));ring.rotation.x=-Math.PI/2;ring.position.set(x,y+.1,z);root.add(ring);markers.push(ring);});
  function fallback(){
    // Missing original village GLB: show walkable low ground without rendering
    // towering high-altitude cliff walls in front of the third-person camera.
    const positions=[],indices=[],limit=bridgeY+12;
    for(let z=0;z<data.n;z++)for(let x=0;x<data.n;x++){
      const h=data.heights[z*data.n+x];
      positions.push(data.min+x*data.step,h>-998?h:waterY-3,data.min+z*data.step);
    }
    for(let z=0;z<data.n-1;z++)for(let x=0;x<data.n-1;x++){
      const a=z*data.n+x,b=a+1,c=a+data.n,d=c+1;
      if([a,b,c,d].every(i=>data.heights[i]>-998&&data.heights[i]<=limit))indices.push(a,c,b,b,c,d);
    }
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const ground=new T.MeshStandardMaterial({color:0x877965,roughness:1,side:T.DoubleSide});
    root.add(new T.Mesh(geometry,ground));
  }
  window.modelVillageCamera=(camera,focus)=>{
    // Keep the lens outside the actor; scenery must not push it into his body.
    const delta=camera.position.clone().sub(focus);
    const horizontal=Math.hypot(delta.x,delta.z);
    if(horizontal<6){
      if(horizontal>.001){delta.x*=6/horizontal;delta.z*=6/horizontal;}
      else {delta.x=.9;delta.z=6;}
    }
    delta.y=Math.max(delta.y,2.2);
    // Lift over village surfaces instead of collapsing follow distance.
    for(let i=8;i<=16;i++){
      const f=i/16,x=focus.x+delta.x*f,z=focus.z+delta.z*f;
      const h=window.modelVillageHeight(x,z);
      if(h!==null)delta.y=Math.max(delta.y,((failed?Math.min(h,bridgeY+12):h)+.65-focus.y)/f);
    }
    camera.position.copy(focus).add(delta);
  };
  window.modelVillageReady=()=>ready;
  return {update(active,p,t){root.visible=active;status.style.display=active&&(!ready||failed)?'block':'none';if(!active)return;startLoading();scene.background=new T.Color(0xd6ac79);scene.fog.color.setHex(0xb99a79);scene.fog.near=38;scene.fog.far=190;skyEffects.update(t,p);if(villagers){try{villagers.update(t,{x:p.x,y:window.modelVillageHeight(p.x,p.z)??bridgeY,z:p.z});}catch(error){console.error('Villager animation paused:',error);villagers=null;}}riverSurface.position.set(p.x,0,p.z);
    const heroGround=window.modelVillageHeight(p.x,p.z)??bridgeY;
    heroFill.position.set(p.x+4,heroGround+7,p.z+6);heroFill.target.position.set(p.x,heroGround+1.3,p.z);
    windowLights.forEach(w=>{w.material.emissiveIntensity=2.4*(1+.025*Math.sin(t*2+w.phase));});
    lamps.forEach(lamp=>{const flicker=1+Math.sin(t*2.3+lamp.phase)*.035+Math.sin(t*5.7+lamp.phase)*.015;lamp.glass.emissiveIntensity=3.2*flicker;lamp.glow.material.opacity=.85*flicker;if(lamp.source)lamp.source.intensity=3.5*flicker;});
    if(companions){try{companions.update(t,{x:p.x,y:window.modelVillageHeight(p.x,p.z)??bridgeY,z:p.z});}catch(error){console.error('Companion animation paused',error);companions=null;}}flowTime.value=t;clueProps.forEach((prop,i)=>{prop.visible=!window.heroArena3DState?.()?.state?.homeStudy?.found?.[i];});cluePlaceholders.forEach((photo,i)=>{photo.visible=!clueProps[i]&&!window.heroArena3DState?.()?.state?.homeStudy?.found?.[i];});markers.forEach((m,i)=>{m.visible=!window.heroArena3DState?.()?.state?.homeStudy?.found?.[i];m.rotation.z=t*.2;});}};
 };
})();
