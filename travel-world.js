/* A streamed 3D ruin avenue. All nearby architecture has volume and parallax. */
(() => {
  window.createTravelWorld=(T,scene)=>{
    const root=new T.Group();root.name='Explorable ruined route';scene.add(root);
    const frozen=window.createFrozenLandscape?.(T,scene);
    const home=window.createHomeVillage?.(T,scene);
    const chunks=new Map(),textures={},skies={},materials={};
    const random=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
    function texture(image,crop,repeat){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.drawImage(image,crop[0]*image.width,crop[1]*image.height,crop[2]*image.width,crop[3]*image.height,0,0,512,512);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);}return t;}
    for(const [name,src] of Object.entries(window.heroTravelImages||{})){const image=new Image();image.onload=()=>{textures[name]=texture(image,[.32,.77,.36,.2],[3,3]);const sky=texture(image,[.08,0,.84,.42]);skies[name]=sky;};image.src=src;}
    const names={1:'plaza',2:'snow-road',3:'red-mountains',4:'ruin-arches',5:'red-ruin-arches'};
    const road=new T.MeshStandardMaterial({color:0x60574e,roughness:.96,metalness:.08});
    const stone=new T.MeshStandardMaterial({color:0x5c5148,roughness:.92,metalness:.1});
    const steel=new T.MeshStandardMaterial({color:0x3c3532,roughness:.62,metalness:.72});
    const edge=new T.MeshStandardMaterial({color:0x777069,roughness:.94});
    const makeFire=window.createAnimatedFireFactory(T);
    const burningCity=window.createBurningCityFactory?.(T,makeFire);
    // A fixed light budget keeps travelling through many fires affordable.
    const fireLights=Array.from({length:2},()=>{const light=new T.PointLight(0xff812b,5,12,2);root.add(light);return light;});
    const geometry=new T.IcosahedronGeometry(1,1),barGeo=new T.CylinderGeometry(.035,.045,1,5);
    const dummy=new T.Object3D(),falling=[];
    function mesh(group,geo,mat,x,y,z){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
    function beam(group,a,b,r=.09){const d=new T.Vector3().subVectors(b,a),m=new T.Mesh(barGeo,steel);m.position.copy(a).add(b).multiplyScalar(.5);m.scale.set(r/.04,d.length(),r/.04);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());group.add(m);return m;}
    function brokenWall(group,x,z,seed){
      const h=7+random(seed)*13,w=3+random(seed+2)*4,shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);
      for(let i=0;i<=7;i++)shape.lineTo(w/2-w*i/7,h*(.65+random(seed+i*17)*.35));shape.closePath();
      for(let y=2;y<h*.57;y+=2.2){const hole=new T.Path();hole.moveTo(-w*.27,y);hole.lineTo(-w*.27,y+1.2);hole.lineTo(w*.27,y+1.2);hole.lineTo(w*.27,y);hole.closePath();shape.holes.push(hole);}
      const geo=new T.ExtrudeGeometry(shape,{depth:.7,bevelEnabled:true,bevelSize:.12,bevelThickness:.13,bevelSegments:1});
      const wall=mesh(group,geo,stone,x,0,z);wall.rotation.set(0,(random(seed+3)-.5)*.8,(random(seed+4)-.5)*.23);
      for(let i=0;i<4;i++)beam(wall,new T.Vector3(-w*.4+i*w*.25,h*.68,0),new T.Vector3(-w*.4+i*w*.25+.2,h+.4+random(seed+i),.2),.025);
      return wall;
    }
    function build(index,level){
      const group=new T.Group();group.position.z=index*28;root.add(group);group.userData.fires=[];const seed=index*113+level*701;
      const floor=mesh(group,new T.PlaneGeometry(62,28,8,8),road,0,-.012,0);floor.rotation.x=-Math.PI/2;
      // Road edges and broken structures leave a continuous central walking lane.
      if(level===1&&burningCity)burningCity.addBlock(group,index);
      if(level!==1)for(const side of [-1,1]){
        for(let i=0;i<3;i++){const x=side*(29+random(seed+i+side)*5),z=-12+i*9;brokenWall(group,x,z,seed+i*19+side*7);}
        const column=mesh(group,new T.CylinderGeometry(1.1,1.5,10,10,3),stone,side*28,5,3);column.rotation.z=side*.11;
        const arch=new T.Mesh(new T.TorusGeometry(6,.5,6,22,Math.PI*.72),edge);arch.position.set(side*28,9,3);arch.rotation.y=Math.PI/2;arch.rotation.z=side*.3;group.add(arch);
        for(let i=0;i<5;i++)beam(group,new T.Vector3(side*20,.2,-10+i*5),new T.Vector3(side*(22+random(seed+i)*2),2+random(seed+5+i)*3,-8+i*5),.05);
      }
      const rubble=new T.InstancedMesh(geometry,stone,70);rubble.castShadow=true;rubble.receiveShadow=true;
      for(let i=0;i<70;i++){const side=i%2?1:-1,scale=.15+random(seed+i*3)*1.2;dummy.position.set(side*(24+random(seed+i)*7),scale*.35,random(seed+i*7)*28-14);dummy.rotation.set(random(i)*3,random(seed+i)*6,random(i+10)*3);dummy.scale.set(scale*1.4,scale*.55,scale);dummy.updateMatrix();rubble.setMatrixAt(i,dummy.matrix);}group.add(rubble);
      for(let i=0;i<3;i++){
        const fire=makeFire(seed+i*31,.8+random(seed+i*19)*.65);
        fire.root.position.set((i%2?1:-1)*(8+random(seed+i*7)*10),.02,-10+i*9);
        group.add(fire.root);group.userData.fires.push(fire);
      }
      const chunksGeo=new T.InstancedMesh(geometry,stone,12);group.add(chunksGeo);group.userData.falling=chunksGeo;group.userData.seed=seed;
      chunks.set(index,group);
    }
    function release(group){group.userData.fires?.forEach(f=>f.dispose());group.traverse(o=>{if(o.geometry&&!o.userData.sharedCityGeometry&&![geometry,barGeo].includes(o.geometry))o.geometry.dispose();});root.remove(group);}
    let lastLevel=0;
    function update(level,position,t){
      if(lastLevel!==level){for(const group of chunks.values())release(group);chunks.clear();lastLevel=level;}
      frozen?.update(level===2,position,t);
      home?.update(level===3,position,t);
      if(level===3&&home){root.visible=false;return;}
      if(level===2&&frozen){root.visible=false;return;}
      root.visible=true;
      const name=names[level],map=textures[name];if(map&&road.map!==map){road.map=map;road.needsUpdate=true;stone.map=map;stone.needsUpdate=true;}
      road.color.setHex(level===2?0xc1c8ca:level===3?0x6d4e43:0x88796c);stone.color.setHex(level===2?0xa2acb1:0x8c7b68);
      const skyName=level===2?'snow-road':level===3?'red-lake':level===5?'red-ruin-arches':'red-mountains';
      if(skies[skyName])scene.background=skies[skyName];
      const center=Math.floor(position.z/28);for(let i=center-4;i<=center+2;i++)if(!chunks.has(i))build(i,level);
      const nearbyFires=[];
      for(const [i,g] of chunks){if(i<center-4||i>center+2){release(g);chunks.delete(i);continue;}
        for(const fire of g.userData.fires){
          const z=g.position.z+fire.root.position.z;
          fire.update(t,position,z);
          nearbyFires.push({x:fire.root.position.x,y:fire.root.position.y,z,d:(position.x-fire.root.position.x)**2+(position.z-z)**2});
        }
        const falling=g.userData.falling;for(let j=0;j<12;j++){const q=(t*.15+random(i*23+j))%1;dummy.position.set((j%2?1:-1)*(24+random(j+i)*4),18*(1-q*q),j*2-11);dummy.rotation.set(q*4,j,q*3);dummy.scale.setScalar(.12+random(j+3)*.27);dummy.updateMatrix();falling.setMatrixAt(j,dummy.matrix);}falling.instanceMatrix.needsUpdate=true;
      }
      nearbyFires.sort((a,b)=>a.d-b.d);
      fireLights.forEach((light,i)=>{const fire=nearbyFires[i];light.visible=!!fire;if(fire){light.position.set(fire.x,fire.y+.8,fire.z);light.intensity=5+Math.sin(t*9+i)*.6+Math.sin(t*17+i)*.3;}});
      scene.fog.color.setHex(level===2?0x81929d:0x623b38);scene.fog.near=32;scene.fog.far=118;
    }
    return {root,update,hide(){home?.update(false,new T.Vector3(),0);root.visible=false;if(frozen)frozen.update(false,new T.Vector3(),0);}};
  };
})();
