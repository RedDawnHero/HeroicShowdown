(() => {
 let material;
 window.addVillagePhotoSkin=(T,house,room)=>{
  if(!window.villageSceneryImage)return;
  if(!material){const texture=new T.TextureLoader().load(window.villageSceneryImage);texture.colorSpace=T.SRGBColorSpace;material=new T.MeshStandardMaterial({map:texture,roughness:.95,side:T.DoubleSide});}
  const group=new T.Group();house.add(group);room.covers.push(group);
  function panel(w,h,x,y,z,ry,u0,u1){const geo=new T.PlaneGeometry(w,h);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i),uv.getY(i));const o=new T.Mesh(geo,window.villagePhotoMaterial(T,'wood')||material);o.position.set(x,y,z);o.rotation.y=ry;o.receiveShadow=true;group.add(o);}
  // Reference facade projected onto wall surfaces, with an open central doorway.
  for(const z of [-3.4,3.4])panel(2,5.1,-room.side*4.18,2.65,z,-room.side*Math.PI/2,z<0?.11:.23,z<0?.21:.33);
  panel(4.65,.85,-room.side*4.18,4.87,0,-room.side*Math.PI/2,.11,.33);
  panel(8,5.1,0,2.65,4.67,0,.10,.36);panel(8,5.1,0,2.65,-4.67,Math.PI,.10,.36);
  const windowMat=window.villagePhotoMaterial(T,'window',[.54,.15,.44,.67]);
  for(const z of [-3.35,3.35]){const w=new T.Mesh(new T.PlaneGeometry(1.28,1.65),windowMat);w.position.set(-room.side*4.23,3.05,z);w.rotation.y=-room.side*Math.PI/2;group.add(w);}
  const doorMat=window.villagePhotoMaterial(T,'door',[.08,.22,.24,.64]);
  for(const z of [-2.28,2.28]){const post=new T.Mesh(new T.BoxGeometry(.28,4.3,.25),doorMat);post.position.set(-room.side*4.2,2.15,z);group.add(post);}
  const inside=new T.Mesh(new T.PlaneGeometry(7.6,4.6),window.villagePhotoMaterial(T,'inside',[0,.25,.43,.7]));inside.position.set(0,2.5,-4.27);house.add(inside);
 };
})();
