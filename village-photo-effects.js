(() => {
 const cache={};
 window.villagePhotoMaterial=(T,key,rect=[0,0,1,1])=>{
  const id=key+rect.join(',');if(cache[id])return cache[id];const source=window.villagePhotoSources?.[key];if(!source)return null;
  const map=new T.TextureLoader().load(source);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.offset.set(rect[0],rect[1]);map.repeat.set(rect[2],rect[3]);map.anisotropy=4;
  return cache[id]=new T.MeshStandardMaterial({map,roughness:.88,side:T.DoubleSide});
 };
 window.createVillagePhotoEffects=(T,root)=>{
  const time={value:0};
  const skyMap=new T.TextureLoader().load(window.villageNightPhotos.sky),fogMap=new T.TextureLoader().load(window.villageNightPhotos.fog);
  const sky=new T.Mesh(new T.SphereGeometry(650,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{time,skyMap:{value:skyMap},fogMap:{value:fogMap}},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform float time;uniform sampler2D skyMap;uniform sampler2D fogMap;varying vec3 v;
  void main(){vec3 d=normalize(v);vec2 uv=vec2(fract(.5+atan(d.x,-d.z)/6.283185),clamp(.12+asin(d.y)*.55,0.,1.));vec3 clear=texture2D(skyMap,uv).rgb;vec3 haze=texture2D(fogMap,uv+vec2(sin(time*.035)*.006,0.)).rgb;float cloud=.22+.18*sin(time*.07+uv.x*12.);vec3 c=mix(clear,haze,cloud);float star=smoothstep(.65,.95,max(clear.r,max(clear.g,clear.b)));c+=star*.06*sin(time*1.7+uv.x*400.+uv.y*530.);gl_FragColor=vec4(c,1.);}` }));root.add(sky);
  const treeMap=new T.TextureLoader().load(window.villageNightPhotos.tree);
  const treeMat=new T.ShaderMaterial({side:T.DoubleSide,uniforms:{time,map:{value:treeMap}},vertexShader:`uniform float time;varying vec2 uvTree;void main(){uvTree=uv;vec3 p=position;p.x+=sin(time*.65+position.y*.23)*.12*uv.y*uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform sampler2D map;varying vec2 uvTree;void main(){vec3 c=texture2D(map,uvTree).rgb;float bright=max(c.r,max(c.g,c.b));bool sky=c.b>c.g*.96&&bright>.38;bool sunset=c.r>.56&&c.g>.47&&c.b>.32;if(sky||sunset||uvTree.y<.23||(uvTree.y<.41&&abs(uvTree.x-.5)>.16))discard;gl_FragColor=vec4(c*vec3(.28,.38,.48),1.);}`});
  const forest=new T.Group();root.add(forest);
  for(let i=0;i<96;i++){const side=i%2?1:-1,x=side*(38+(i%7)*5),z=35-Math.floor(i/2)*6;const tree=new T.Group();tree.position.set(x,-5,z);const scale=.8+(i%5)*.12;tree.scale.setScalar(scale);for(let j=0;j<2;j++){const panel=new T.Mesh(new T.PlaneGeometry(22,24,1,12),treeMat);panel.position.y=12;panel.rotation.y=j*Math.PI/2+(i%4)*.13;tree.add(panel);}forest.add(tree);}
  const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=64;const c=haloCanvas.getContext('2d'),grad=c.createRadialGradient(32,32,1,32,32,32);grad.addColorStop(0,'rgba(255,214,135,.7)');grad.addColorStop(.25,'rgba(255,164,60,.25)');grad.addColorStop(1,'rgba(255,146,40,0)');c.fillStyle=grad;c.fillRect(0,0,64,64);const haloTexture=new T.CanvasTexture(haloCanvas),halos=[];
  for(let i=0;i<22;i++){const side=i%2?1:-1,z=10-Math.floor(i/2)*12;const material=new T.SpriteMaterial({map:haloTexture,transparent:true,depthWrite:false,blending:T.AdditiveBlending});const h=new T.Sprite(material);h.position.set(side*9,3.45,z);h.scale.set(2.4,2.4,1);root.add(h);halos.push(h);}
  const lights=Array.from({length:3},()=>{const l=new T.PointLight(0xffb65c,9,13,2);root.add(l);return l;});
  return {update(t,p){time.value=t;sky.position.copy(p);forest.position.z=Math.floor(p.z/120)*120;halos.forEach((h,i)=>h.material.opacity=.72+.1*Math.sin(t*3+i)+.04*Math.sin(t*8+i));const near=[...halos].sort((a,b)=>a.position.distanceToSquared(p)-b.position.distanceToSquared(p));lights.forEach((l,i)=>{l.position.copy(near[i].position);l.intensity=8+Math.sin(t*3+i)*.6;});}};
 };
})();
