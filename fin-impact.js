(()=>{
 const smooth=(t,a,b)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
 let shot;
 window.finImpactCamera=(T,state,camera,rigs,dt)=>{
  const c=state.finImpact;if(!c){shot=null;return;}
  const hero=rigs.get(c.player),enemy=rigs.get('ashen-king'),g=hero?.userData.helmetedModel?.visible?hero.userData.helmetedRig:hero?.userData.glbRig,e=enemy?.userData.glbRig;
  if(!g||!e)return;
  if(!shot||shot.id!==c.id)shot={id:c.id,pos:camera.position.clone(),q:camera.quaternion.clone()};
  const t=c.age,a=t<1.1?t:t<1.21?1.1:t-.11;
  const wind=smooth(a,.25,.75),drive=smooth(a,.8,1.1),release=1-smooth(a,1.25,1.74),impact=drive*release;
  const set=(b,x,y=0,z=0)=>{if(b)b.rotation.set(x,y,z);};
  set(g.pelvis,.1*wind,-.3*wind+.65*drive);set(g.spine,.1*wind,-.18*wind+.25*drive);set(g.chest,.1*wind,-.35*wind+.65*drive);
  set(g.head,-.1*impact,-.2*impact);set(g.arms[0],(.3*wind-1.85*drive)*release,0,-.2*impact);set(g.forearms[0],(-1.3*wind+1.15*drive)*release);
  set(g.arms[1],-.4*release,0,-.18);set(g.forearms[1],-1*release);
  g.thighs.forEach((b,i)=>set(b,-(i?.12:.4)*impact));g.knees.forEach((b,i)=>set(b,(i?.25:.65)*impact));
  const direction=enemy.position.clone().sub(hero.position);direction.y=0;direction.normalize();hero.rotation.y=Math.atan2(direction.x,direction.z);
  hero.updateMatrixWorld(true);enemy.updateMatrixWorld(true);
  const face=e.head.getWorldPosition(new T.Vector3()),fist=g.hands[0].getWorldPosition(new T.Vector3());
  const correction=face.clone().sub(fist);correction.clampLength(0,2);hero.position.addScaledVector(correction,impact);hero.updateMatrixWorld(true);
  const recoil=Math.sin(smooth(a,1.1,1.74)*Math.PI);set(e.head,-.22*recoil,.45*recoil,.18*recoil);set(e.chest,-.3*recoil,-.3*recoil,.12*recoil);e.knees?.forEach(b=>b.rotation.x+=.35*recoil);enemy.position.addScaledVector(direction,recoil*.7);
  const midpoint=face.clone().lerp(g.hands[0].getWorldPosition(new T.Vector3()),.35);
  const side=new T.Vector3(-direction.z,0,direction.x),orbit=smooth(t,.4,1.6);
  const desired=midpoint.clone().addScaledVector(side,3.8-1.1*Math.sin(orbit*Math.PI)).addScaledVector(direction,-2+orbit*2.5);desired.y-=.55*(1-smooth(t,1.3,1.8));
  const normalPos=camera.position.clone(),normalQ=camera.quaternion.clone();
  if(!(t>=1.1&&t<1.21))shot.pos.lerp(desired,1-Math.exp(-dt*9));
  camera.position.copy(shot.pos);camera.lookAt(midpoint);const actionQ=camera.quaternion.clone();
  const enter=smooth(t,0,.35),exit=smooth(t,1.48,1.85),blend=enter*(1-exit);
  camera.position.copy(normalPos).lerp(shot.pos,blend);camera.quaternion.copy(normalQ).slerp(actionQ,blend);
 };
})();
