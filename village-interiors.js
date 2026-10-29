(() => {
  const rooms=[];window.villageRooms=rooms;
  window.createVillageHouse=(T,parent,side,row,materials)=>{
    const {moss,glow}=materials;
    const warm=window.villageWarmMaterials(T),wood=warm.wood,beam=warm.beam,plaster=warm.brick;
    const house=new T.Group();house.position.set(side*26,0,12-row*14);parent.add(house);
    const room={x:house.position.x,z:house.position.z,side,obstacles:[],covers:[]};rooms.push(room);
    const box=(w,h,d,x,y,z,m,cover=false)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;house.add(o);if(cover)room.covers.push(o);return o;};
    const cylinder=(r,h,x,y,z,m)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,32),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;house.add(o);return o;};
    const leg=(a,b,r,m)=>{const va=new T.Vector3(...a),vb=new T.Vector3(...b),delta=vb.clone().sub(va);const o=new T.Mesh(new T.CylinderGeometry(r*.75,r,delta.length(),10),m);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());house.add(o);return o;};
    function cushion(w,h,d,x,y,z,m){const shape=new T.Shape();shape.moveTo(-w/2+.08,-h/2);shape.lineTo(w/2-.08,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+.08);shape.lineTo(w/2,h/2-.08);shape.quadraticCurveTo(w/2,h/2,w/2-.08,h/2);shape.lineTo(-w/2+.08,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-.08);shape.lineTo(-w/2,-h/2+.08);shape.quadraticCurveTo(-w/2,-h/2,-w/2+.08,-h/2);const geo=new T.ExtrudeGeometry(shape,{depth:d-.12,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:3,steps:1,curveSegments:6});geo.translate(0,0,-(d-.12)/2);const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;house.add(o);return o;}
    const textileCanvas=document.createElement('canvas');textileCanvas.width=textileCanvas.height=128;const ctx=textileCanvas.getContext('2d');ctx.fillStyle='#e8e1cd';ctx.fillRect(0,0,128,128);for(let i=0;i<128;i+=3){ctx.fillStyle=i%2?'#c9c1ac':'#f5efdf';ctx.fillRect(i,0,1,128);ctx.fillRect(0,i,128,1);}const texture=new T.CanvasTexture(textileCanvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(3,3);
    const fabric=new T.MeshStandardMaterial({color:0xe0c29b,map:wood.map,bumpMap:wood.map,bumpScale:.012,roughness:.65});const olive=fabric.clone();olive.color.setHex(0x666c48);const charcoal=fabric.clone();charcoal.color.setHex(0x474744);const metal=new T.MeshStandardMaterial({color:0x252623,metalness:.75,roughness:.5});
    box(8,.18,9,0,-.09,0,wood);box(.2,5.4,9,side*3.9,2.7,0,plaster,true);
    box(8,5.4,.2,0,2.7,-4.4,plaster,true);box(8,5.4,.2,0,2.7,4.4,plaster,true);
    // River-facing doorway is four units tall and wide enough for every hero.
    for(const z of [-3.35,3.35])box(.2,5.4,2.1,-side*3.9,2.7,z,plaster,true);
    box(.25,1.1,4.6,-side*3.9,4.85,0,wood,true);
    for(const z of [-2.25,2.25])box(.3,4.3,.18,-side*3.85,2.15,z,beam,true);
    box(4,.16,4.2,-side*6,-.08,0,wood); // Level entrance deck joins the bank.
    for(let i=0;i<12;i++)box(7.8,.025,.035,0,.012,-4+i*.72,beam);

    for(const z of [-3.3,3.3]){box(.06,1.1,1,-side*4.02,3.2,z,glow,true);for(let i=0;i<4;i++)box(.08,1.15,.04,-side*4.07,3.2,z-.4+i*.27,beam,true);}
    box(5.3,.035,5.8,0,.02,0,fabric);
    // Sofa, separate cushions, pillows and draped knitted throw.
    cushion(3.9,.42,1.45,0,.6,-2.9,fabric);
    for(const x of [-1.7,1.7])for(const z of [-3.4,-2.4])leg([x,.05,z],[x,.5,z],.055,metal);
    for(const x of [-.88,.88])cushion(1.72,1.2,.35,x,1.32,-3.5,fabric).rotation.x=-.1;
    for(const x of [-1.85,1.85])cushion(.3,.92,1.55,x,1.03,-2.9,fabric);
    for(const x of [-.9,.9])cushion(1.72,.25,1.28,x,.94,-2.82,fabric);
    for(const [x,m] of [[-1.25,charcoal],[-.55,fabric],[1.2,olive]]){const pillow=cushion(.65,.67,.22,x,1.39,-3.13,m);pillow.rotation.z=x*.12;pillow.rotation.x=-.16;}
    // A continuous knitted throw follows the back, seat and front of the sofa.
    const drape=new T.PlaneGeometry(.73,1,20,60),dp=drape.attributes.position;
    const path=new T.CatmullRomCurve3([new T.Vector3(.65,1.96,-3.53),new T.Vector3(.65,1.75,-3.29),new T.Vector3(.65,1.08,-3.04),new T.Vector3(.65,1.09,-2.29),new T.Vector3(.65,.88,-2.16),new T.Vector3(.65,.19,-2.13)]);
    for(let i=0;i<dp.count;i++){const u=dp.getX(i),t=.5-dp.getY(i),v=path.getPoint(t);dp.setXYZ(i,v.x+u,v.y+.025*Math.sin(u*57+t*5),v.z+.018*Math.cos(u*43+t*8));}drape.computeVertexNormals();const knit=fabric.clone();knit.side=T.DoubleSide;knit.bumpScale=.025;const blanket=new T.Mesh(drape,knit);blanket.castShadow=blanket.receiveShadow=true;house.add(blanket);
    // Thin stitched piping follows the seat edges instead of painted-on lines.
    const seamMat=new T.MeshStandardMaterial({color:0xb5af9e,roughness:1});
    for(const center of [-.9,.9]){const points=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;points.push(new T.Vector3(center+.82*Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.25),.985,-2.82+.59*Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.25)));}const seam=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points,true),64,.008,4,true),seamMat);house.add(seam);}

    room.obstacles.push({x:0,z:-2.95,w:4.2,d:1.8});
    // Round oak coffee table with metal ring and books, cup and vase.
    cylinder(1.05,.12,0,.78,.05,wood);const ring=new T.Mesh(new T.TorusGeometry(.99,.035,8,40),metal);ring.rotation.x=Math.PI/2;ring.position.set(0,.08,.05);house.add(ring);
    for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])leg([Math.cos(a)*.99,.08,Math.sin(a)*.99+.05],[Math.cos(a)*.99,.74,Math.sin(a)*.99+.05],.035,metal);
    box(.52,.07,.37,-.24,.88,.05,fabric);box(.49,.06,.34,-.22,.945,.04,olive);cylinder(.12,.23,.42,.96,.06,fabric);cylinder(.16,.03,.42,.855,.06,fabric);room.obstacles.push({x:0,z:.05,w:2.25,d:2.25});
    // Wooden chair with shaped seat, open back and splayed legs, plus round side table.
    const cx=2.45,cz=1.5;
    cushion(1.12,.13,1.05,cx,.9,cz,wood);cushion(1.1,.43,.13,cx,1.85,cz-.46,wood);
    for(const x of [-.43,.43])for(const z of [-.38,.38])leg([cx+x*1.2,.04,cz+z*1.25],[cx+x,.88,cz+z],.065,wood);
    for(const x of [-.45,.45])leg([cx+x,.85,cz-.42],[cx+x,2.05,cz-.49],.055,wood);
    room.obstacles.push({x:cx,z:cz,w:1.35,d:1.35});
    cylinder(.61,.09,2.5,.86,3.1,wood);for(const a of [0,2.094,4.188])leg([2.5+Math.cos(a)*.52,.03,3.1+Math.sin(a)*.52],[2.5+Math.cos(a)*.38,.82,3.1+Math.sin(a)*.38],.06,wood);room.obstacles.push({x:2.5,z:3.1,w:1.3,d:1.3});
    // Upholstered armchair opposite the sofa.
    cushion(1.15,.28,1.05,-2.35,.8,1.85,fabric);cushion(1.12,1,.22,-2.35,1.3,2.35,fabric).rotation.x=.13;
    for(const x of [-2.95,-1.75]){box(.1,.12,1.3,x,1.2,1.9,beam);for(const z of [1.4,2.35])leg([x,.04,z],[x,1.2,z],.06,beam);}room.obstacles.push({x:-2.35,z:1.9,w:1.45,d:1.45});
    const lamp=new T.PointLight(0xffd9a0,10,12);lamp.position.set(0,4.4,0);house.add(lamp);room.lamp=lamp;lamp.visible=false;
    window.decorateVillageTimber?.(T,house,room,row);
    window.addVillagePhotoSkin?.(T,house,room);
    return house;
  };
  window.villageInteriorWalkable=(x,z)=>{
    for(const r of rooms){const dx=x-r.x,dz=z-r.z;
      const deck=dx*r.side>=-8&&dx*r.side<=-3.5&&Math.abs(dz)<1.75;
      if(deck)return true;
      if(Math.abs(dx)<3.55&&Math.abs(dz)<4.05)return !r.obstacles.some(o=>Math.abs(dx-o.x)<o.w/2+.28&&Math.abs(dz-o.z)<o.d/2+.28);
    }return false;
  };
  window.updateVillageInteriors=(position)=>{window.villageActiveRoom=rooms.find(r=>Math.abs(position.x-r.x)<3.7&&Math.abs(position.z-r.z)<4.1)||null;const lit=[...rooms].sort((a,b)=>Math.hypot(a.x-position.x,a.z-position.z)-Math.hypot(b.x-position.x,b.z-position.z)).slice(0,2);for(const r of rooms){r.lamp.visible=lit.includes(r);const near=Math.abs(position.x-r.x)<4.6&&Math.abs(position.z-r.z)<4.7;r.covers.forEach(o=>o.visible=!near);}};
})();
