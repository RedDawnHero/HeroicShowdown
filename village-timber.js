(() => {
  let palette;
  function materials(T){
    if(palette)return palette;
    function texture(kind){
      const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
      g.fillStyle=kind==='wood'?'#66594a':'#394137';g.fillRect(0,0,512,512);
      let seed=71;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      for(let i=0;i<6500;i++){
        const x=rand()*512,y=rand()*512,v=rand();g.strokeStyle=kind==='wood'?`rgba(${v>.5?'182,163,130':'20,22,18'},${.05+rand()*.24})`:`rgba(${v>.5?'126,141,73':'13,25,21'},.25)`;
        g.lineWidth=.3+rand()*1.6;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+rand()*8,y+15,x-3,y+40,x+rand()*6,y+(kind==='wood'?80:5));g.stroke();
      }
      if(kind==='wood')for(let i=0;i<14;i++){const x=rand()*512,y=rand()*512;for(let j=1;j<9;j++){g.strokeStyle='rgba(26,23,18,.18)';g.beginPath();g.ellipse(x,y,j*1.7,j*5,0,0,Math.PI*2);g.stroke();}}
      const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;return tex;
    }
    const timber=texture('wood'),roof=texture('roof');
    palette={wood:new T.MeshStandardMaterial({map:timber,bumpMap:timber,bumpScale:.065,roughness:.88,color:0xb0a18b}),roof:new T.MeshStandardMaterial({map:roof,bumpMap:roof,bumpScale:.09,roughness:.93}),iron:new T.MeshStandardMaterial({color:0x252821,roughness:.65,metalness:.6}),amber:new T.MeshStandardMaterial({color:0xffcf79,emissive:0xff9a2c,emissiveIntensity:1.4}),stone:new T.MeshStandardMaterial({color:0x65685a,roughness:1}),moss:new T.MeshStandardMaterial({color:0x52623b,roughness:1})};return palette;
  }
  const geometryCache={};
  function detailGeometry(T,kind){
    if(geometryCache[kind])return geometryCache[kind];
    let geo;
    if(kind==='stone'||kind==='moss'){
      geo=new T.IcosahedronGeometry(.6,kind==='stone'?1:2);const p=geo.attributes.position;
      for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),v=1+.13*Math.sin(x*31+y*23+z*17);p.setXYZ(i,x*v,y*v,z*v);}geo.computeVertexNormals();
    }else if(kind==='roof'){
      geo=new T.PlaneGeometry(1,1,4,8);const p=geo.attributes.position;
      for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i);p.setXYZ(i,x,.35*Math.cos(z*Math.PI*2)+.08*Math.sin(x*8),z);}geo.computeVertexNormals();
    }else{
      const shape=new T.Shape(),r=.025;shape.moveTo(-.5+r,-.5);shape.lineTo(.5-r,-.5);shape.quadraticCurveTo(.5,-.5,.5,-.5+r);shape.lineTo(.5,.5-r);shape.quadraticCurveTo(.5,.5,.5-r,.5);shape.lineTo(-.5+r,.5);shape.quadraticCurveTo(-.5,.5,-.5,.5-r);shape.lineTo(-.5,-.5+r);shape.quadraticCurveTo(-.5,-.5,-.5+r,-.5);
      geo=new T.ExtrudeGeometry(shape,{depth:.95,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,curveSegments:2,steps:1});geo.translate(0,0,-.475);
    }
    return geometryCache[kind]=geo;
  }
  window.decorateVillageTimber=(T,house,room,row)=>{
    const m={...materials(T),wood:window.villageWarmMaterials(T).wood},group=new T.Group();house.add(group);room.covers.push(group);
    const batches={wood:[],roof:[],iron:[],amber:[],moss:[],stone:[]};
    function part(kind,x,y,z,w,h,d,rz=0){batches[kind].push({x,y,z,w,h,d,rz});}
    // Individual weathered siding, recessed seams and substantial corner posts.
    for(let i=0;i<26;i++){const z=-4.35+i*.345;part('wood',room.side*4.025,2.65,z,.13,5.25,.328);if(Math.abs(z)>2.36)part('wood',-room.side*4.025,2.65,z,.13,5.25,.328);}
    for(const z of [-4.53,4.53])for(let i=0;i<23;i++)part('wood',-3.85+i*.35,2.65,z,.333,5.25,.13);
    for(const x of [-4.12,4.12])for(const z of [-4.58,4.58])part('wood',x,2.7,z,.25,5.5,.25);
    for(const y of [.28,1.7,4.5,5.25]){for(const x of [-4.13,4.13]){if(x*room.side<0){for(const z of [-3.45,3.45])part('wood',x,y,z,.2,.16,2.1);}else part('wood',x,y,0,.2,.16,9.1);}for(const z of [-4.62,4.62])part('wood',0,y,z,8.3,.16,.2);}
    // Swept roof silhouette with a rising eave, overlapping curved clay tiles.
    const roofHeight=x=>6.95-Math.abs(x)*.53+Math.pow(Math.abs(x)/4.9,6)*.48;
    for(const side of [-1,1]){
      const geom=new T.PlaneGeometry(5.05,10.8,20,12),pos=geom.attributes.position;
      for(let i=0;i<pos.count;i++){const x=side*(pos.getX(i)+2.525);const z=pos.getY(i);pos.setXYZ(i,x,roofHeight(x)-.08,z);}geom.computeVertexNormals();
      const under=new T.Mesh(geom,m.roof);under.material.side=T.DoubleSide;under.castShadow=under.receiveShadow=true;group.add(under);
      for(let band=0;band<12;band++)for(let tile=0;tile<25;tile++){
        const x=side*(.15+band*.42),z=-5.2+tile*.43,y=roofHeight(x);
        const slope=side*(-.53+6*.48*Math.pow(Math.abs(x)/4.9,5)/4.9);
        part('roof',x,y,z,.53,.14,.44,Math.atan(slope));
        if((tile*7+band*3+row)%5===0)part('moss',x,y+.07,z,.36,.055,.3,Math.atan(slope));
      }
      for(let k=0;k<16;k++){const x=side*(k+.5)*.316;for(const z of [-5.45,5.45])part('wood',x,roofHeight(x)-.12,z,.36,.22,.17,Math.atan(side*(-.53+6*.48*Math.pow(Math.abs(x)/4.9,5)/4.9)));}
    }
    // Closed triangular timber gables and projecting rafters.
    for(const z of [-4.56,4.56])for(let i=0;i<23;i++){const x=-3.85+i*.35,h=Math.max(.05,roofHeight(x)-5.25);part('wood',x,5.25+h/2,z,.33,h,.16);}
    for(const side of [-1,1])for(let z=-5.15;z<5.2;z+=.65)part('wood',side*4.3,roofHeight(4.3)-.23,z,1.35,.15,.12,-side*.25);
    // Irregular masonry under the timber frame, kept below the walkable floor.
    for(const x of [-3.9,3.9])for(let level=0;level<3;level++)for(let k=0;k<13;k++)part('stone',x,-.22-level*.34,-4.3+k*.69+(level%2)*.15,.52,.4,.77);
    for(const z of [-4.35,4.35])for(let level=0;level<3;level++)for(let k=0;k<11;k++)part('stone',-3.65+k*.72,-.22-level*.34,z,.8,.4,.5);
    // Forged strap brackets and bolt heads at the exposed doorway joints.
    for(const z of [-2.25,2.25])for(const y of [.65,3.75]){
      const x=-room.side*4.19;part('iron',x,y,z,.055,.48,.16);
      for(const dy of [-.15,.15])part('iron',x-room.side*.045,y+dy,z,.07,.065,.065);
    }
    // Deep porch joinery: columns, knee braces and layered carved lintels.
    for(const z of [-2.4,2.4]){
      part('wood',-room.side*5.6,2.25,z,.24,4.5,.24);
      part('stone',-room.side*5.6,.12,z,.48,.24,.48);
      for(const y of [4.15,4.34,4.52])part('wood',-room.side*4.8,y,z,2,.13,.27);
      part('wood',-room.side*5.22,3.72,z,1.18,.16,.19,room.side*.6);
      for(let j=0;j<5;j++)part('wood',-room.side*(4.05+j*.3),4.6+j*.04,z,.32,.11,.42);
    }
    // Balcony rails and upper facade panels give selected houses a second storey.
    if(row%3!==1){
      const upper=new T.Group();upper.position.y=4.65;group.add(upper);
      // Keep the existing roof profile, lift it with its fascia and gables.
      for(const kind of ['roof','moss'])for(const item of batches[kind])item.y+=2.5;
      for(const item of batches.wood)if(item.y>5.2)item.y+=2.5;
      for(const z of [-4.53,4.53])for(let i=0;i<23;i++)part('wood',-3.85+i*.35,6.55,z,.33,2.65,.16);
      for(let i=0;i<26;i++)part('wood',room.side*4.03,6.55,-4.35+i*.345,.16,2.65,.33);
      part('wood',-room.side*4.1,5.35,0,1.4,.2,9.2);
      for(const z of [-4.4,-2.2,0,2.2,4.4])part('wood',-room.side*4.65,6.5,z,.16,2.55,.16);
      for(let z=-4.3;z<4.4;z+=.25)part('wood',-room.side*4.65,5.94,z,.065,1.05,.065);
      part('wood',-room.side*4.65,6.5,0,.18,.14,9);
      part('wood',-room.side*4.65,5.45,0,.15,.13,9);
      for(const z of [-3.3,0,3.3]){part('amber',-room.side*3.98,6.65,z,.06,1.35,1.1);for(const dz of [-.58,0,.58])part('wood',-room.side*4.04,6.65,z+dz,.12,1.5,.07);for(const y of [5.93,6.65,7.37])part('wood',-room.side*4.06,y,z,.15,.07,1.3);}
      // Move the roof underlay with the raised upper floor.
      for(const child of group.children)if(child.isMesh)child.position.y+=2.5;
    }
    // Warm paper windows, projecting sills and inset rectangular lattice.
    for(const z of [-3.35,3.35]){
      const x=-room.side*4.15;part('amber',x,3.05,z,.05,1.65,1.28);
      for(const dz of [-.73,.73])part('wood',x-room.side*.07,3.05,z+dz,.16,1.95,.12);
      for(const y of [2.13,3.97])part('wood',x-room.side*.1,y,z,.26,.14,1.62);
      for(const dz of [-.43,0,.43])part('wood',x-room.side*.12,3.05,z+dz,.1,1.7,.045);
      for(const y of [2.48,3.53])part('wood',x-room.side*.13,y,z,.11,.045,1.3);
      for(const dz of [-.24,.24])part('wood',x-room.side*.14,3.02,z+dz,.11,.78,.045);
      for(const y of [2.63,3.41])part('wood',x-room.side*.14,y,z,.11,.045,.48);
    }
    for(const z of [-2.7,2.7]){const x=-room.side*4.55;part('amber',x,2.8,z,.32,.56,.32);for(const y of [2.48,3.12])part('iron',x,y,z,.47,.1,.47);for(const dx of [-.18,.18])for(const dz of [-.18,.18])part('iron',x+dx,2.8,z+dz,.035,.6,.035);}
    const dummy=new T.Object3D();for(const [kind,items] of Object.entries(batches)){const mesh=new T.InstancedMesh(detailGeometry(T,kind),m[kind],items.length);items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,0,p.rz);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(kind!=='amber'){const shade=.73+((i*37+row*19)%31)/100;mesh.setColorAt(i,new T.Color(shade,shade,shade));}});mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);}
  };
})();
