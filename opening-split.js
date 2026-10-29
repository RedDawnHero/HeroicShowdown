(()=>{
 let kit;
 const ease=(t,a,b)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
 window.openingPortalSplit=(T,scene,hero,villain,eye,target,t)=>{
  if(!kit){const root=new T.Group();scene.add(root);const rifts=[0x45dfff,0xa342ff].map(color=>{const g=new T.Group(),m=new T.MeshBasicMaterial({color,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false});const ring=new T.Mesh(new T.TorusGeometry(2.8,.15,12,80),m);g.add(ring);const core=new T.Mesh(new T.CircleGeometry(2.65,64),new T.MeshBasicMaterial({color,transparent:true,opacity:.28,side:T.DoubleSide}));g.add(core);root.add(g);return g;});const realm=new T.Group();realm.position.set(600,0,0);root.add(realm);const stone=new T.MeshStandardMaterial({color:0x181528,roughness:.9});for(let i=0;i<18;i++){const rock=new T.Mesh(new T.IcosahedronGeometry(1+i%3,0),stone);rock.position.set(Math.sin(i*2.4)*(4+i*.6),i%4-2,Math.cos(i*2.4)*(4+i*.6));realm.add(rock);}const floor=new T.Mesh(new T.CylinderGeometry(5,3,2,12),stone);floor.position.y=-1.2;realm.add(floor);const lamp=new T.PointLight(0x9b4fff,35,60);lamp.position.set(0,7,2);realm.add(lamp);kit={root,rifts,realm,background:scene.background?.clone(),fogColor:scene.fog?.color.clone()};}
  const {root,rifts,realm}=kit;root.visible=t>=90;realm.visible=t>=125;if(t>=125){scene.background=new T.Color(0x080817);if(scene.fog)scene.fog.color.setHex(0x080817);}else{if(kit.background)scene.background=kit.background;if(scene.fog&&kit.fogColor)scene.fog.color.copy(kit.fogColor);}if(t<90)return;
  hero.visible=t<124;villain.visible=t<122||t>=125;hero.scale.setScalar(1.6);villain.scale.setScalar(2);
  const pull=ease(t,103,114),split=ease(t,114,121),recover=ease(t,125,129);
  hero.position.set(-2-8*split,18.3+split*3,-100-6*pull-8*split);villain.position.set(2+10*split,18.3+split*4,-104-4*pull-8*split);hero.rotation.set(-.2*pull,Math.PI, -.3*split);villain.rotation.set(-.2*pull,0,.4*split);
  rifts.forEach((r,i)=>{r.visible=t>=99&&t<125;r.position.set((i?1:-1)*(2+9*ease(t,113,117)),21,-112);r.scale.setScalar(ease(t,99,103)*(1+.08*Math.sin(t*23)));r.rotation.z=t*(i?2:-2);});
  for(const actor of [hero,villain]){const g=actor.userData.glbRig;if(!g)continue;g.thighs.forEach((b,i)=>b.rotation.x=-pull*(i?.35:.7));g.knees.forEach(b=>b.rotation.x=pull*.9);g.arms.forEach((b,i)=>{b.rotation.x=-pull*(i?.8:1.3);b.rotation.z=(i?1:-1)*pull*.4;});g.forearms.forEach(b=>b.rotation.x=-.45*pull);g.chest.rotation.x=.2*pull;g.head.rotation.y=(actor===hero?1:-1)*.3*split;}
  const face=actor=>{actor.updateMatrixWorld(true);return actor.userData.glbRig.head.getWorldPosition(new T.Vector3());};
  const close=actor=>{target.copy(face(actor));eye.copy(target).add(new T.Vector3(.7,.2,3).applyQuaternion(actor.quaternion));};
  if(t<94)close(hero);
  else if(t<98)close(villain);
  else if(t<103){target.set(0,21,-106);eye.set(12,26,-90);}
  else if(t<107){target.copy(hero.position).add(new T.Vector3(0,1,-3));eye.copy(hero.position).add(new T.Vector3(2,3,4));}
  else if(t<110){target.copy(hero.position).add(new T.Vector3(0,.3,0));eye.copy(target).add(new T.Vector3(2,.6,2.5));}
  else if(t<114){target.set(0,22,-111);eye.set(Math.sin(t)*6,31,-99);}
  else if(t<118){target.copy(face(hero)).lerp(face(villain),.5);eye.copy(target).add(new T.Vector3(0,5,13));}
  else if(t<122){target.copy(face(villain));eye.copy(villain.position).add(new T.Vector3(1.5,3,5));}
  else if(t<125){target.copy(hero.position);eye.copy(target).add(new T.Vector3(-3,2,5));}
  else{villain.position.set(600,(1-recover)*5,0);villain.rotation.set(.3*(1-recover),Math.PI,0);const g=villain.userData.glbRig;g.thighs.forEach(b=>b.rotation.x=-.7*Math.sin(recover*Math.PI));g.knees.forEach(b=>b.rotation.x=1.2*Math.sin(recover*Math.PI));target.set(600,2,0);eye.set(606,4,8);}
  return t<99?'':t<114?'THE RIFT IS UNSTABLE':t<125?'TWO RIFTS. TWO UNKNOWN WORLDS.':'SEPARATED · NEITHER KNOWS WHERE THE OTHER LANDED';
 };
})();
