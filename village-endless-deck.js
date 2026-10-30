(() => {
 window.createVillageEndlessDeck=(T,root)=>{
  const wood=window.villageWarmMaterials(T).wood.clone();wood.color.setHex(0xcda878);
  const map=wood.map.clone();map.repeat.set(90,90);map.needsUpdate=true;wood.map=map;
 
const lampSource = window.villagePhotoSources?.lamp;

const lampPhoto = lampSource
  ? new T.TextureLoader().load(lampSource)
  : null;

if (lampPhoto) {
  lampPhoto.colorSpace = T.SRGBColorSpace;
}

const photoMaterial = new T.MeshBasicMaterial({
  map: lampPhoto,
  side: T.DoubleSide,
  transparent: !lampPhoto,
  opacity: lampPhoto ? 1 : 0
});

if (lampPhoto) {
  photoMaterial.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      '#include <map_fragment>\nif(min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b))>.84)discard;'
    );
  };
}

  const floors=[-1,1].map(side=>{const floor=new T.Mesh(new T.PlaneGeometry(1800,1800),wood);floor.rotation.x=-Math.PI/2;floor.position.set(side*907,-.055,-55);floor.receiveShadow=true;root.add(floor);return floor;});
  const brass=new T.MeshStandardMaterial({color:0x503723,metalness:.45,roughness:.45}),bulb=new T.MeshStandardMaterial({color:0xffedb3,emissive:0xffc55b,emissiveIntensity:5});
  const stations=[];
  function add(g,geo,m,x,y,z){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
  for(let i=0;i<26;i++){
   const g=new T.Group();root.add(g);g.position.set(i%2?10:-10,0,15-Math.floor(i/2)*12);
   add(g,new T.BoxGeometry(.9,.2,.9),wood,0,.1,0);
   add(g,new T.CylinderGeometry(.23,.38,.6,8),wood,0,.5,0);
   add(g,new T.CylinderGeometry(.13,.27,2.3,8),wood,0,1.95,0);
   for(const y of [.8,3.1,3.25])add(g,new T.CylinderGeometry(.31,.31,.1,16),wood,0,y,0);
   add(g,new T.CylinderGeometry(.31,.24,.85,4),new T.MeshStandardMaterial({color:0xffd99b,transparent:true,opacity:.3,roughness:.2,depthWrite:false}),0,3.85,0);
   add(g,new T.SphereGeometry(.17,16,12),bulb,0,3.8,0).scale.y=1.4;
   for(const x of [-.25,.25])for(const z of [-.25,.25])add(g,new T.CylinderGeometry(.025,.03,.9,8),brass,x,3.85,z);
   add(g,new T.ConeGeometry(.48,.35,4),brass,0,4.45,0);
   add(g,new T.SphereGeometry(.07,10,8),wood,0,4.69,0);
   for(const side of [-1,1]){const curve=new T.CatmullRomCurve3([new T.Vector3(0,2.8,0),new T.Vector3(side*.35,3,0),new T.Vector3(side*.43,3.35,0),new T.Vector3(side*.29,3.43,0)]);add(g,new T.TubeGeometry(curve,14,.035,6,false),wood,0,0,0);}
   // Crossed photo panels retain the carved reference detail around the solid lamp.
   for(const angle of [0,Math.PI/2]){const geo=new T.PlaneGeometry(1.15,4.7),uv=geo.attributes.uv;for(let j=0;j<uv.count;j++)uv.setX(j,.42+uv.getX(j)*.16);const photo=new T.Mesh(geo,photoMaterial);photo.position.y=2.35;photo.rotation.y=angle;g.add(photo);}
   stations.push(g);
  }
  const lights=Array.from({length:4},()=>{const l=new T.PointLight(0xffcf83,35,19,2);root.add(l);return l;});
  return {update(p,t){floors.forEach(floor=>floor.position.z=Math.floor(p.z/100)*100);const near=[...stations].sort((a,b)=>a.position.distanceToSquared(p)-b.position.distanceToSquared(p));lights.forEach((l,i)=>{l.position.copy(near[i].position);l.position.y=3.8;l.intensity=35+Math.sin(t*2+i)*1.5;});}};
 };
})();
