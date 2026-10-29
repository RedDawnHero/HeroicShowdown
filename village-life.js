(() => {
  window.createVillageLife=(T,root)=>{
    const people=[];const wood=new T.MeshStandardMaterial({color:0x49301e,roughness:.9}),lamp=new T.MeshStandardMaterial({color:0xffd290,emissive:0xff9b35,emissiveIntensity:2});
    function mesh(geo,mat,parent,x,y,z){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
    for(let i=0;i<22;i++){
      const side=i%2?1:-1,z=10-Math.floor(i/2)*12;
      mesh(new T.CylinderGeometry(.07,.1,3.8,10),wood,root,side*9,1.9,z);
      mesh(new T.CylinderGeometry(.22,.22,.55,12),lamp,root,side*9,3.45,z);
      mesh(new T.ConeGeometry(.35,.2,12),wood,root,side*9,3.83,z);
    }
    const skin=new T.MeshStandardMaterial({color:0xb98d6d,roughness:.9}),hair=new T.MeshStandardMaterial({color:0x26221f,roughness:1});
    for(let i=0;i<14;i++){
      const g=new T.Group(),side=i%2?1:-1;root.add(g);const cloth=new T.MeshStandardMaterial({color:[0x566d65,0x80604d,0x4b596d,0x817951][i%4],roughness:1});
      mesh(new T.CylinderGeometry(.23,.31,.85,12),cloth,g,0,1.16,0);
      mesh(new T.SphereGeometry(.22,16,12),skin,g,0,1.85,0);
      const cap=mesh(new T.SphereGeometry(.226,16,10,0,Math.PI*2,0,Math.PI*.54),hair,g,0,1.88,0);
      const limbs=[];for(const s of [-1,1]){const arm=new T.Group();arm.position.set(s*.3,1.5,0);g.add(arm);mesh(new T.CapsuleGeometry(.075,.45,4,8),cloth,arm,0,-.27,0);mesh(new T.SphereGeometry(.08,8,6),skin,arm,0,-.57,0);limbs.push(arm);const leg=new T.Group();leg.position.set(s*.14,.78,0);g.add(leg);mesh(new T.CapsuleGeometry(.095,.49,4,8),cloth,leg,0,-.3,0);mesh(new T.SphereGeometry(.12,10,6),hair,leg,0,-.68,.06).scale.set(1,.6,1.5);limbs.push(leg);}
      people.push({g,limbs,x:side*(11.3+i%3*1.5),z:3-Math.floor(i/2)*18,phase:i*1.7});
    }
    // Layered distant mountain silhouettes are actual irregular meshes.
    for(const side of [-1,1])for(let i=0;i<8;i++){const geo=new T.ConeGeometry(15+i%3*3,30+i%4*7,32,10);const p=geo.attributes.position;for(let j=0;j<p.count;j++){const x=p.getX(j),y=p.getY(j),z=p.getZ(j);p.setXYZ(j,x*(1+.11*Math.sin(y+z)),y+Math.sin(x*.6+z)*1.2,z*(1+.1*Math.cos(x+y)));}geo.computeVertexNormals();mesh(geo,new T.MeshStandardMaterial({color:0x344e45,roughness:1}),root,side*(65+i%2*13),9,25-i*25);}
    return {update(t){people.forEach((p,i)=>{const f=t*.22+p.phase,walking=i%4!==0;p.g.position.set(p.x,0,p.z+(walking?Math.sin(f)*5:0));p.g.rotation.y=walking?(Math.cos(f)>0?0:Math.PI):p.x>0?-Math.PI/2:Math.PI/2;const stride=walking?Math.sin(t*4+p.phase)*.35:Math.sin(t+p.phase)*.025;p.limbs.forEach((l,j)=>l.rotation.x=stride*(j<2?1:-1)*(j%2?-1:1));});}};
  };
  window.updateVillageRoomCamera=(T,state,camera)=>{
    if(state?.round!==3||state.radioScene)return;
    const r=window.villageActiveRoom;if(!r)return;
    const target=new T.Vector3(r.x,1.5,r.z);
    camera.position.lerp(new T.Vector3(r.x-r.side*6.8,5.1,r.z+5.6),.12);camera.lookAt(target);
  };
})();
