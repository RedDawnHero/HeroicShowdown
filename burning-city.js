/* Full-volume ruined buildings: inset windows, exposed rooms and roof equipment. */
(() => {
  window.createBurningCityFactory=(T,makeFire)=>{
    const rand=n=>{const v=Math.sin(n*91.7+18.3)*43758.5453;return v-Math.floor(v);};
    const cube=new T.BoxGeometry(1,1,1),dummy=new T.Object3D();
    function masonry(seed,brick){
      const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
      g.fillStyle=brick?'#51413a':'#817b6e';g.fillRect(0,0,256,256);
      for(let y=0;y<256;y+=brick?12:64)for(let x=-30;x<256;x+=brick?38:64){
        const v=rand(seed+x*7+y),xx=x+(brick&&(y/12)%2?19:0);
        g.fillStyle=brick?`rgb(${88+v*48},${61+v*33},${46+v*30})`:`rgb(${116+v*35},${112+v*34},${100+v*31})`;
        g.fillRect(xx+1,y+1,brick?36:62,brick?10:62);
      }
      for(let i=0;i<4000;i++){const v=rand(seed+i*3);g.fillStyle=i%2?'#00000014':'#ffffff10';g.fillRect(rand(i+seed)*256,rand(i+17)*256,1+v*3,1);}
      for(let i=0;i<13;i++){const x=rand(seed+i*11)*256,gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#19130f00');gr.addColorStop(.7,'#19130f2c');gr.addColorStop(1,'#19130f00');g.fillStyle=gr;g.fillRect(x,0,2+rand(i)*10,256);}
      const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;
      return tex;
    }
    const palette={brick:new T.MeshStandardMaterial({map:masonry(7,true),color:0xb5a394,roughness:.96}),stone:new T.MeshStandardMaterial({map:masonry(28,false),color:0xc2bcb1,roughness:.9}),concrete:new T.MeshStandardMaterial({color:0x77736a,roughness:.94}),steel:new T.MeshStandardMaterial({color:0x3f4344,roughness:.58,metalness:.72}),glass:new T.MeshStandardMaterial({color:0x465b62,roughness:.25,metalness:.65}),dark:new T.MeshStandardMaterial({color:0x181b1c,roughness:.98}),trim:new T.MeshStandardMaterial({color:0xa4a498,roughness:.78}),roof:new T.MeshStandardMaterial({color:0x484b47,roughness:.98})};
    const tankGeo=new T.CylinderGeometry(.65,.65,1.1,12),capGeo=new T.ConeGeometry(.8,.35,12),ventGeo=new T.CylinderGeometry(.12,.12,.65,8);
    function buildBuilding(parent,side,z,seed){
      const group=new T.Group();group.name='Damaged masonry and glass building';
      const w=7.5+rand(seed)*3,d=7+rand(seed+1)*3,floors=5+Math.floor(rand(seed+2)*8),fh=2.05,h=floors*fh;
      const modern=rand(seed+4)>.52,damage=2+Math.floor(rand(seed+5)*(floors-3)),x=side*(28.5+d/2),yaw=side>0?-Math.PI/2:Math.PI/2;
      group.position.set(x,0,z);group.rotation.y=yaw;parent.add(group);
      const batches=new Map();
      function box(mat,a,b,c,px,py,pz,rx=0,ry=0,rz=0){
        if(!batches.has(mat))batches.set(mat,[]);dummy.position.set(px,py,pz);dummy.rotation.set(rx,ry,rz);dummy.scale.set(a,b,c);dummy.updateMatrix();batches.get(mat).push(dummy.matrix.clone());
      }
      const shell=modern?'steel':rand(seed+6)>.5?'brick':'stone';
      box('concrete',w+.8,.28,d+.8,0,.14,0);
      // Every storey has a physical floor; missing corners expose its interior.
      for(let row=0;row<floors;row++){
        const y=row*fh,broken=row>=damage;
        if(broken){box('concrete',w*.63,.22,d, w*.185,y+.25,0);box('concrete',w*.37,.22,d*.55,-w*.315,y+.25,-d*.225);}
        else box('concrete',w,.22,d,0,y+.25,0);
        box('dark',w*.24,fh-.22,d*.3,w*.15,y+fh*.5,-d*.1);
        for(let face=0;face<4;face++){
          const length=face%2?d:w,columns=Math.max(3,Math.floor(length/1.45)),cell=length/columns,angle=face*Math.PI/2;
          const at=(u,v,depth)=>face===0?[u,v,d/2+depth]:face===1?[w/2+depth,v,-u]:face===2?[-u,v,-d/2-depth]:[-w/2-depth,v,u];
          const place=(mat,bw,bh,bd,u,v,off)=>{const q=at(u,v,off);box(mat,bw,bh,bd,...q,0,angle);};
          for(let col=0;col<columns;col++){
            const u=-length/2+(col+.5)*cell;
            if(broken&&((face===0&&u<-w*.14)||(face===3&&u>d*.02)))continue;
            place(shell,cell,modern?.13:.38,.3,u,y+fh-.1,0);
            place(shell,modern?.12:.32,fh,.35,u-cell/2,y+fh*.5,0);
            // Dark room depth behind the window; recessed glass and protruding sills.
            place('dark',cell-.25,fh-.58,.07,u,y+fh*.49,-.2);
            if(rand(seed+row*17+col*3+face*41)>.19)place('glass',cell-.38,fh-.76,.035,u,y+fh*.49,-.08);
            place(modern?'steel':'trim',cell-.18,.09,.34,u,y+.35,.03);
            if(modern)place('steel',.045,fh-.58,.08,u,y+fh*.49,.02);
            else place('trim',cell-.14,.1,.29,u,y+fh-.35,.04);
          }
        }
        if(broken){
          // Torn columns and bent rebar follow the open corner, not a painted hole.
          for(let j=0;j<3;j++)box('steel',.04,1.1+rand(seed+j+row)*.7,.04,-w*.18+j*.22,y+.65,d*.18,.15,0,-.15+rand(j+row)*.3);
          box('steel',w*.5,.18,.18,-w*.15,y+.1,d*.24,0,0,-.12);
        }
      }
      box('roof',w*.65,.22,d,w*.175,h+.12,0);
      for(const back of [-1,1])box('trim',w*.64,.45,.17,w*.175,h+.34,back*d*.5);
      box('trim',.17,.45,d,w/2,h+.34,0);
      // Water tank legs, rooftop vents, HVAC boxes and pitched solar panels.
      for(const dx of [-.48,.48])for(const dz of [-.48,.48])box('steel',.07,.85,.07,w*.2+dx,h+.65,-d*.25+dz);
      const tank=new T.Mesh(tankGeo,palette.steel);tank.position.set(w*.2,h+1.6,-d*.25);tank.castShadow=true;tank.userData.sharedCityGeometry=true;group.add(tank);
      const cap=new T.Mesh(capGeo,palette.roof);cap.position.set(w*.2,h+2.31,-d*.25);cap.userData.sharedCityGeometry=true;group.add(cap);
      box('concrete',1.4,.65,.95,w*.24,h+.52,d*.17);
      for(let i=0;i<5;i++)box('steel',.08,.08,.8,w*.24-.48+i*.24,h+.88,d*.17);
      box('glass',1.6,.07,1.05,-w*.02,h+.8,-d*.27,-.38);
      for(let i=0;i<3;i++){const vent=new T.Mesh(ventGeo,palette.steel);vent.position.set(w*.38,h+.57,-d*.2+i*.65);vent.userData.sharedCityGeometry=true;group.add(vent);}
      if(modern){box('steel',.065,3,.065,w*.25,h+1.5,d*.28);box('steel',.9,.04,.04,w*.25,h+2.6,d*.28);}
      // Broken storefront, door recess and sidewalk rubble.
      box('dark',1.5,1.7,.35,w*.18,1.1,d/2+.04);
      box('steel',w*.65,.18,.85,w*.15,2.05,d/2+.35);
      for(let i=0;i<12;i++)box(i%3?'concrete':'brick',.3+rand(seed+i)*.7,.18+rand(i)*.3,.3+rand(seed+i*3)*.7,-w*.32+rand(i+7)*2,.3,d*.45+rand(seed+i*5),rand(i)*.6,rand(i+3)*4,rand(i+10)*.8);
      for(const [name,matrices] of batches){const inst=new T.InstancedMesh(cube,palette[name],matrices.length);matrices.forEach((m,i)=>inst.setMatrixAt(i,m));inst.castShadow=true;inst.receiveShadow=true;inst.userData.sharedCityGeometry=true;group.add(inst);}
      // Emit flames from the exposed storey; smoke rises above the roof.
      const fy=(damage+.2)*fh,localX=-w*.2,localZ=d*.35;
      const fire=makeFire(seed+92,.9+rand(seed+3)*.45);
      fire.root.position.set(x+localX*Math.cos(yaw)+localZ*Math.sin(yaw),fy,z-localX*Math.sin(yaw)+localZ*Math.cos(yaw));
      const updateFire=fire.update;
      fire.update=(t,viewer,worldZ)=>{updateFire(t,viewer,worldZ);for(const puff of fire.root.children)if(puff.isSprite){puff.position.y*=Math.max(1,Math.min(3.5,(h-fy+5)/7));puff.scale.multiplyScalar(1.15);}};
      parent.add(fire.root);parent.userData.fires.push(fire);
      return group;
    }
    return {addBlock(group,index){for(const side of [-1,1])buildBuilding(group,side,side<0?-5:6,index*173+side*53+7000);}};
  };
})();
