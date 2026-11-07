/* Main campaign: authoritative village transport and its 3D presentation. */
(()=>{
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  window.VillageDeparture={
    canStart:s=>s?.phase==='game'&&s.round===3&&!s.clueScene&&!s.radioScene&&s.homeStudy?.cinematicSeen&&s.homeStudy.found.length===4&&s.homeStudy.found.every(Boolean),
    begin(s){if(s.villageDeparture||!this.canStart(s))return false;const landing={x:500+3/.055,y:300-4/.055};s.villageDeparture={id:Date.now(),stage:s.homeStudy.transportLanded?'waiting':'landing',age:0,x:landing.x,y:landing.y,starts:Object.fromEntries(Object.entries(s.players).map(([id,p])=>[id,{x:p.x,y:p.y}]))};for(const p of Object.values(s.players)){p.heldPhoto=null;p.inspectingPhoto=false;p.seated=null;p.fx=p.fy=p.moveSpeed=0;}return true;},
    board(s){const c=s.villageDeparture;if(c?.stage!=='waiting')return false;c.stage='boarding';c.age=0;return true;},
    step(s,dt,ready){const c=s.villageDeparture;if(!c)return false;for(const p of Object.values(s.players)){p.run=false;p.jump=0;p.fx=p.fy=p.moveSpeed=0;}if(!ready)return false;c.age+=Math.min(.05,Math.max(0,dt));if(c.stage==='landing'&&c.age>=6){c.stage='waiting';c.age=0;}if(c.stage==='boarding'){const u=ease(c.age/5);for(const [id,p]of Object.entries(s.players)){const a=c.starts[id]||c.starts.host,slot=Object.keys(s.players).indexOf(id);p.x=a.x+(c.x+45-a.x)*u;p.y=a.y+(c.y+18+slot*2-a.y)*u;p.fx=c.age<5?.5:0;p.fy=c.age<5?-.5:0;p.moveSpeed=c.age<5?70:0;}if(c.age>=6){c.stage='takeoff';c.age=0;}}if(c.stage==='takeoff'&&c.age>=5)return true;return false;}
  };
  window.createVillageDeparture=(T,scene)=>{
    const root=new T.Group();root.name='Village transport · reference-inspired rescue ship';root.visible=false;scene.add(root);
    const hull=new T.Group();root.add(hull);
    const landingDust=new T.Mesh(new T.RingGeometry(1.1,1.8,64),new T.MeshBasicMaterial({color:0xc4b18c,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));landingDust.rotation.x=-Math.PI/2;landingDust.position.y=.08;root.add(landingDust);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const g=canvas.getContext('2d');g.fillStyle='#777970';g.fillRect(0,0,256,256);for(let i=0;i<3000;i++){const r=n=>{const f=Math.sin(n*73.17)*43758.545;return f-Math.floor(f);};g.fillStyle=i%2?'#292e2b33':'#e6d8bc33';g.fillRect(r(i)*256,r(i+17)*256,r(i+31)*5+.4,1);}for(let y=16;y<256;y+=48){g.fillStyle='#202622';g.fillRect(0,y,256,2);for(let x=8;x<256;x+=24){g.fillStyle='#c5bba1';g.fillRect(x,y+5,2,2);}}
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
    const metal=new T.MeshStandardMaterial({color:0xe3e5d6,map,bumpMap:map,bumpScale:.025,roughness:.67,metalness:.28});const dark=new T.MeshStandardMaterial({color:0x525c58,map,roughness:.65,metalness:.4});const glass=new T.MeshStandardMaterial({color:0x1b4652,roughness:.18,metalness:.65,transparent:true,opacity:.78});const trim=new T.MeshStandardMaterial({color:0x817655,roughness:.58,metalness:.8});const glow=new T.MeshBasicMaterial({color:0x9cecff});
    function mesh(geo,mat,p,parent=hull){const m=new T.Mesh(geo,mat);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
    function pipe(points,r=.07,mat=trim){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),28,r,7,false),mat,[0,0,0]);}
    function plate(points,depth,y,mat=metal){const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const m=mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.1,bevelSize:.1,bevelSegments:2}),mat,[0,y,0]);m.rotation.x=Math.PI/2;return m;}
    // Tapered, multi-section aircraft fuselage: the nose narrows and slopes up into the cockpit.
    const sections=[[-5.5,.65,1.8,.9],[-4.6,1.25,2.45,.65],[-2.3,1.7,3.22,.65],[-.7,1.9,3.05,.7],[2.8,1.85,2.65,.8],[4.65,1.2,2.2,1.05]];
    const vertices=[],indices=[];for(const [z,w,top,low]of sections){const mid=(top+low)/2;for(const [x,y]of [[0,top],[w*.7,top-.06],[w,mid+.22],[w*.95,low+.15],[w*.6,low],[-w*.6,low],[-w*.95,low+.15],[-w,mid+.22],[-w*.7,top-.06]])vertices.push(x,y,z);}
    for(let k=0;k<sections.length-1;k++)for(let j=0;j<9;j++){const a=k*9+j,b=k*9+(j+1)%9,c=b+9,d=a+9;indices.push(a,c,b,a,d,c);}
    for(let j=1;j<8;j++){indices.push(0,j,j+1);const n=(sections.length-1)*9;indices.push(n,n+j+1,n+j);}
    const fuselage=new T.BufferGeometry();fuselage.setAttribute('position',new T.Float32BufferAttribute(vertices,3));fuselage.setIndex(indices);fuselage.computeVertexNormals();mesh(fuselage,metal,[0,0,0]).material.side=T.DoubleSide;
    // Individual sloped cockpit panes and metal window frames, rather than a flat picture.
    for(const side of [-1,1]){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([side*.08,2.45,-5.12,side*1.3,2.45,-4.65,side*1.12,3.25,-2.55,side*.08,3.3,-2.3],3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const pane=mesh(geo,glass,[0,0,0]);pane.material.side=T.DoubleSide;pipe([[side*.08,2.46,-5.13],[side*1.31,2.46,-4.66],[side*1.13,3.26,-2.55],[side*.08,3.31,-2.3]],.055,dark);pipe([[side*.08,2.46,-5.13],[side*.08,3.31,-2.3]],.05,dark);}
    for(const side of [-1,1]){
      plate([[side*1.5,-1.4],[side*4.8,.7],[side*5.2,3.2],[side*1.5,3.7]],.34,1.9);
      const engine=mesh(new T.CylinderGeometry(.82,.95,3.4,28,1,true),dark,[side*2.6,2.1,3]);engine.rotation.x=Math.PI/2;
      for(const z of [1.35,2,3.8,4.65])mesh(new T.TorusGeometry(.88,.09,8,32),trim,[side*2.6,2.1,z]);
      mesh(new T.CircleGeometry(.73,32),glow,[side*2.6,2.1,4.72]);
      for(let j=0;j<3;j++)pipe([[side*(1.6+j*.15),2.4+j*.16,-1],[side*(2+j*.15),2.6+j*.16,.2],[side*(2+j*.15),2.6+j*.16,3.8]],.06);
      for(let i=0;i<9;i++)mesh(new T.CylinderGeometry(.045,.045,1,6),dark,[side*3.3,1.9,1+i*.23]).rotation.z=Math.PI/2;
      const foot=mesh(new T.CylinderGeometry(.12,.2,1.2,10),dark,[side*1.8,.6,side>0?2.5:-2]);mesh(new T.SphereGeometry(.4,16,8),dark,[side*1.8,.1,side>0?2.5:-2]).scale.set(1,.2,1.4);
      mesh(new T.SphereGeometry(.1,10,8),glow,[side*1.1,1.8,-5]);
    }
    for(const side of [-1,1]){for(let i=0;i<5;i++)pipe([[side*1.65,1.15,-2+i*1.25],[side*1.85,2,-1.8+i*1.25],[side*1.3,2.82,-1.6+i*1.25]],.018,dark);const pane=mesh(new T.PlaneGeometry(1.5,.72),glass,[side*1.67,2.25,-2.25]);pane.rotation.y=side*Math.PI/2;pane.rotation.z=side*.2;pane.material.side=T.DoubleSide;}
    for(const z of [-.5,1.7]){mesh(new T.CylinderGeometry(.48,.55,.22,24),dark,[0,2.66,z]);mesh(new T.TorusGeometry(.43,.045,7,28),trim,[0,2.8,z]).rotation.x=Math.PI/2;}
    pipe([[.8,2.5,3],[.9,3.5,3.4],[1.1,4.6,4]],.025,dark);
    const door=mesh(new T.PlaneGeometry(.95,1.65),dark,[2.13,1.65,.15]);door.rotation.y=Math.PI/2;door.material=dark.clone();door.material.side=T.DoubleSide;
    const ramp=mesh(new T.PlaneGeometry(2.7,1.15),metal,[3.15,.52,.15]);ramp.rotation.set(-Math.PI/2,0,Math.PI/2);ramp.rotation.y=-.35;
    const flames=[];for(const side of [-1,1]){const flame=mesh(new T.ConeGeometry(.65,5,24,1,true),new T.MeshBasicMaterial({color:0x5acfff,transparent:true,opacity:.65,depthWrite:false,side:T.DoubleSide}),[side*2.6,2.1,7.2]);flame.rotation.x=Math.PI/2;flames.push(flame);}
    const label=document.createElement('div');label.id='villageTransportCaption';label.hidden=true;label.style.cssText='position:absolute;left:15%;right:15%;bottom:10%;padding:16px;background:#07131bd9;color:#f3dfb7;text-align:center;font:700 15px sans-serif;z-index:45;pointer-events:none';document.querySelector('.arena-wrap').appendChild(label);
    let sceneId=null;
    return {root,parts:{ramp,door,flames,landingDust},update(s,camera,rigs,localKey,t){const c=s.villageDeparture,arrival=s.canyonArrival;const active=s.phase==='game'&&!!c&&s.round===3;root.visible=active;label.hidden=!active&&!arrival;if(!active){if(arrival&&s.round===4){const hero=rigs.get(localKey);if(hero)hero.visible=false;label.textContent='SHATTERED FUTURE · THE STARSHIP CANYON';const u=ease(arrival.age/5),p=s.players[localKey]||s.players.host,x=(p.x-500)*.055,z=(p.y-300)*.055;camera.position.set(x+.6,2.1,z+6-u*5);camera.lookAt(x,2,z-25);camera.fov=60;camera.updateProjectionMatrix();}return;}
      if(sceneId!==c.id)sceneId=c.id;
      window.villageDepartureReady=c.id;const x=(c.x-500)*.055,z=(c.y-300)*.055,floor=window.modelVillageHeight?.(x,z)??0;const a=c.age;const lift=c.stage==='landing'?24*(1-ease(a/6)):c.stage==='takeoff'?ease(a/5)*35:0;root.position.set(x,floor+lift,z);const landingAge=c.stage==='landing'?a-5.7:c.stage==='waiting'?a+.3:100,spread=Math.max(0,Math.min(1,landingAge/1.2));landingDust.visible=landingAge>=0&&landingAge<1.2;landingDust.scale.setScalar(1+spread*8);landingDust.material.opacity=(1-spread)*.34;root.rotation.y=-.22;ramp.visible=['waiting','boarding'].includes(c.stage);door.visible=ramp.visible;flames.forEach((f,i)=>{f.visible=['landing','takeoff'].includes(c.stage);f.scale.y=.8+Math.sin(t*25+i)*.14;});
      const origin=s.players[localKey]||s.players.host;const h=rigs.get(localKey);if(h){h.visible=c.stage!=='takeoff'&&!(c.stage==='boarding'&&a>4.7);}
      for(const [id,p]of Object.entries(s.players)){const r=rigs.get(id);if(!r)continue;r.visible=c.stage!=='takeoff'&&!(c.stage==='boarding'&&a>4.7);if(c.stage==='boarding'){const u=ease(a/5),start=c.starts[id]||c.starts.host,sx=(start.x-500)*.055,sz=(start.y-300)*.055,sy=window.modelVillageHeight?.(sx,sz)??floor;const hatch=new T.Vector3(2.1,0,.15).applyAxisAngle(new T.Vector3(0,1,0),root.rotation.y).add(new T.Vector3(x,0,z)),approach=new T.Vector3(5.7,0,.15).applyAxisAngle(new T.Vector3(0,1,0),root.rotation.y).add(new T.Vector3(x,0,z));const v=ease(a/3),q=ease((a-3)/2);r.position.set(a<3?T.MathUtils.lerp(sx,approach.x,v):T.MathUtils.lerp(approach.x,hatch.x,q),a<3?T.MathUtils.lerp(sy,floor,v):floor+.9*q,a<3?T.MathUtils.lerp(sz,approach.z,v):T.MathUtils.lerp(approach.z,hatch.z,q));r.rotation.y=a<3?Math.atan2(approach.x-sx,approach.z-sz):-Math.PI/2+root.rotation.y;}}
      if(c.stage==='boarding'){camera.position.set(x+10,floor+4.1,z-6);camera.lookAt(x+2,floor+1.9,z);label.textContent='ALL HEROES ABOARD · DESTINATION: SHATTERED FUTURE';}
      else if(c.stage==='takeoff'){camera.position.set(x+15,floor+5+lift*.3,z-15);camera.lookAt(root.position.clone().add(new T.Vector3(0,2,0)));label.textContent='LEAVING THE VILLAGE · FOLLOWING THE CLUES';}
      else{const u=ease(a/6);camera.position.set(x+15-u*3,floor+6,z-15+u*4);camera.lookAt(x,floor+2+lift*.65,z);label.textContent=c.stage==='waiting'?'TRANSPORT LANDED · BOARD THE SHIP TO CONTINUE':'A TRANSPORT APPROACHES THE VILLAGE';}if(landingAge>=0&&landingAge<.3){camera.position.x+=Math.sin(t*72)*.045*(1-landingAge/.3);camera.position.y+=Math.cos(t*81)*.035*(1-landingAge/.3);}camera.fov=50;camera.updateProjectionMatrix();}
    };
  };
})();


