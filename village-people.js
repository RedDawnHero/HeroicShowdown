(() => {
 window.createVillagePeople=(T,model,parent,heightAt,bridgeY,bridgeZ,options={})=>{
  const people=[],sources=[];model.traverse(o=>{if(o.isMesh)sources.push(o);});
  const routes=[];
  // Twelve bridge walkers share two lanes with staggered starting positions.
  for(const lane of [-.75,.75])routes.push([new T.Vector3(-7.5,bridgeY+.04,bridgeZ+lane),new T.Vector3(7.5,bridgeY+.04,bridgeZ+lane)]);
  const candidates=[];
  for(let x=-48;x<=48;x+=1.6)for(let z=-50;z<=48;z+=1.6){
    if(Math.abs(x)<12&&Math.abs(z-bridgeZ)<4)continue;
    const base=heightAt(x,z);if(!Number.isFinite(base)||base<bridgeY-2)continue;
    let found=null;
    for(const halfLength of [2,1.2,.8]){
      for(const alongX of [true,false]){
        const path=[];let valid=true,min=Infinity,max=-Infinity;
        for(let i=-4;i<=4&&valid;i++)for(const side of [-.6,-.3,0,.3,.6]){
          const xx=x+(alongX?i*halfLength/4:side),zz=z+(alongX?side:i*halfLength/4),h=heightAt(xx,zz);
          if(!Number.isFinite(h)||h<bridgeY-2){valid=false;break;}
          min=Math.min(min,h);max=Math.max(max,h);
          if(side===0)path.push(new T.Vector3(xx,h+.04,zz));
        }
        if(valid&&max-min<.08){found={x,z,path};break;}
      }
      if(found)break;
    }
    if(found)candidates.push(found);
  }
  // Select widely spaced paths across both sides, instead of filling one scan row.
  const selected=[];
  while(candidates.length&&selected.length<67){
    let best=0,score=-1;
    candidates.forEach((c,i)=>{const separation=selected.length?Math.min(...selected.map(s=>Math.hypot(c.x-s.x,c.z-s.z))):Math.hypot(c.x,c.z-bridgeZ);if(separation>score){score=separation;best=i;}});
    selected.push(candidates.splice(best,1)[0]);
  }
  selected.forEach(c=>routes.push(c.path));
  const palettes=[0x476f9c,0x9a483e,0x54815b,0xb18a46,0x725283,0xc4b49a,0x3c8287,0x343c60];
  function outfit(original,index){const m=original.clone();m.onBeforeCompile=shader=>{
    shader.uniforms.shirtTint={value:new T.Color(palettes[(index*3)%8])};shader.uniforms.pantsTint={value:new T.Color([0x293b50,0x554639,0x666b6e,0x30352e][Math.floor(index/8)%4])};
    shader.uniforms.shoesTint={value:new T.Color([0x28221e,0x806042,0xb8b7ad,0x393c46][Math.floor(index/3)%4])};shader.uniforms.hairTint={value:new T.Color([0x221c18,0x603a23,0xb68b48,0x777573,0x833b23][Math.floor(index/4)%5])};
    shader.vertexShader='varying vec3 outfitPoint;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n outfitPoint=position;');
    shader.fragmentShader='varying vec3 outfitPoint;uniform vec3 shirtTint;uniform vec3 pantsTint;uniform vec3 shoesTint;uniform vec3 hairTint;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float y=outfitPoint.y;float shade=clamp(dot(diffuseColor.rgb,vec3(.299,.587,.114))*1.8,.22,1.3);
      vec3 tint=diffuseColor.rgb;float mask=0.0;
      if(y<.16){tint=shoesTint;mask=.86;}
      else if(y<.96&&abs(outfitPoint.x)<.27){tint=pantsTint;mask=.85;}
      else if(y>1.03&&y<1.57){tint=shirtTint;mask=.82;}
      else if(y>1.96||(y>1.75&&outfitPoint.z<-.025)){tint=hairTint;mask=.72;}
      diffuseColor.rgb=mix(diffuseColor.rgb,tint*shade,mask);
    `);
   };m.customProgramCacheKey=()=> 'village-outfit-v1';return m;}
  if(!sources.length)return {update(){}};
  const geometryCache=new Map();
  Array.from({length:options.count??79},(_,index)=>options.companions?(routes.length>2?routes[2+(index*7+3)%(routes.length-2)]:routes[index%2]):index<12?routes[index%2]:routes.length>2?routes[2+(index-12)%(routes.length-2)]:routes[index%2]).forEach((route,index)=>{
   const source=sources[index%sources.length];
   const geometry=source.geometry,positions=geometry.attributes.position,bones=[];
   const bone=(x,y,z,parentBone)=>{const b=new T.Bone();b.position.set(x,y,z);bones.push(b);if(parentBone)parentBone.add(b);return b;};
   const rootBone=bone(0,0,0),head=bone(0,1.73,0,rootBone);
   const ll=bone(-.14,.96,0,rootBone),lk=bone(0,-.46,0,ll),rl=bone(.14,.96,0,rootBone),rk=bone(0,-.46,0,rl);
   const la=bone(-.27,1.65,0,rootBone),le=bone(0,-.32,0,la),ra=bone(.27,1.65,0,rootBone),re=bone(0,-.32,0,ra);
   let feet=geometryCache.get(geometry);
   if(!feet){
   const ids=new Uint16Array(positions.count*4),weights=new Float32Array(positions.count*4);
   feet=[];
   for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),influences=new Map();
    const put=(id,w)=>{if(w>0)influences.set(id,(influences.get(id)||0)+w);};
    const headWeight=T.MathUtils.smoothstep(y,1.67,1.86);
    const armWeight=T.MathUtils.smoothstep(Math.abs(x),.22,.34)*(1-T.MathUtils.smoothstep(y,1.55,1.74))*T.MathUtils.smoothstep(y,.72,.94);
    const legWeight=(1-T.MathUtils.smoothstep(y,.86,1.06))*(1-armWeight);
    const elbow=T.MathUtils.smoothstep(1.4-y,0,.24),knee=T.MathUtils.smoothstep(.61-y,0,.22);
    const arm=x<0?6:8,leg=x<0?2:4;
    put(1,headWeight);put(arm,armWeight*(1-elbow));put(arm+1,armWeight*elbow);
    put(leg,legWeight*(1-knee));put(leg+1,legWeight*knee);
    put(0,Math.max(0,1-headWeight-armWeight-legWeight));
    const sorted=[...influences].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=sorted.reduce((total,v)=>total+v[1],0);
    sorted.forEach(([bone,weight],j)=>{ids[i*4+j]=bone;weights[i*4+j]=weight/sum;});
    if(y<.055&&i%20===0)feet.push(i);
   }
   geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(ids,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
   geometryCache.set(geometry,feet);
   }
   const materials=options.originalColors?source.material:Array.isArray(source.material)?source.material.map(m=>outfit(m,index)):outfit(source.material,index);
   const mesh=new T.SkinnedMesh(geometry,materials);mesh.add(rootBone);
   // Capture the full rest pose after all bones have their correct world transforms.
   mesh.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);skeleton.calculateInverses();mesh.bind(skeleton,mesh.matrixWorld.clone());mesh.computeBoundingSphere();mesh.boundingSphere.radius+=.6;mesh.frustumCulled=true;
   const actor=new T.Group();actor.name=(options.companions?'Fin New companion ':'Village pedestrian ')+(index+1);actor.add(mesh);parent.add(actor);
   // Match the same 0.68 village scale used by Red Dawn's player rig.
   const redDawnHeight=2.32*1.06*(window.heroCharacterSize?.({hero:'guardian'})??1.6896)*.68;
   actor.scale.setScalar(redDawnHeight/2.05);
   const direction=index%2?-1:1;
   const progress=((index*.61803398875)%1)*(route.length-1);
   const low=Math.floor(progress),high=Math.min(route.length-1,low+1);
   const segment=direction===1?low:high;
   actor.position.copy(route[low]).lerp(route[high],progress-low);
   actor.rotation.y=direction*Math.PI/2;
   people.push({actor,mesh,feet,bones,route,segment,direction,speed:.48+(index%5)*.08,phase:index*1.91});
  });
  let previous=null;
  return {update(t,player){const dt=previous===null?0:Math.min(.05,Math.max(0,t-previous));previous=t;
   for(const p of people){
    const moving=true;
    if(moving){
     const target=p.route[p.segment+p.direction],delta=target.clone().sub(p.actor.position),distance=delta.length();
     if(distance<=p.speed*dt){p.actor.position.copy(target);p.segment+=p.direction;if(p.segment===0||p.segment===p.route.length-1){p.direction*=-1;}}
     else{p.actor.position.addScaledVector(delta,p.speed*dt/distance);const yaw=Math.atan2(delta.x,delta.z);p.actor.rotation.y+=Math.atan2(Math.sin(yaw-p.actor.rotation.y),Math.cos(yaw-p.actor.rotation.y))*(1-Math.exp(-dt*12));}
    }
    // Opposite arm/leg timing, soft elbows, and a steady forward gaze.
    p.phase+=dt*(2.8+p.speed*2.2);
    const cycle=Math.sin(p.phase),stride=cycle*.24;
    p.bones[2].rotation.x=stride;p.bones[4].rotation.x=-stride;
    p.bones[3].rotation.x=Math.pow(Math.max(0,-cycle),2)*.32;
    p.bones[5].rotation.x=Math.pow(Math.max(0,cycle),2)*.32;
    const armSwing=Math.sin(p.phase-.12)*.24;
    p.bones[6].rotation.x=-armSwing;p.bones[8].rotation.x=armSwing;
    p.bones[6].rotation.z=-.035;p.bones[8].rotation.z=.035;
    p.bones[7].rotation.x=-.16-.07*(.5+.5*Math.sin(p.phase-.32));
    p.bones[9].rotation.x=-.16-.07*(.5-.5*Math.sin(p.phase-.32));
    p.bones[0].rotation.y=cycle*.018;
    p.bones[1].rotation.y=-cycle*.018;
    p.bones[1].rotation.x=Math.sin(p.phase*2)*.008;
    p.bones[0].position.y=0;
    // Correct animated feet to the deck so a bent knee never sinks half the body.
    p.mesh.position.y=0;p.actor.updateMatrixWorld(true);p.mesh.skeleton.update();
    let low=Infinity;const foot=new T.Vector3();
    for(const index of p.feet){foot.fromBufferAttribute(p.mesh.geometry.attributes.position,index);p.mesh.applyBoneTransform(index,foot);low=Math.min(low,foot.y);}
    if(Number.isFinite(low))p.mesh.position.y=-low;

   }
  }};
 };
})();
