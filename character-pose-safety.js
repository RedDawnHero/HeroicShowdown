/* Keep each imported character's original proportions while animation rotates joints. */
(() => {
 const rest=new WeakMap(),displayed=new WeakMap(),clocks=new WeakMap();
 function joints(g){return [...new Set([g.pelvis,g.spine,g.chest,g.neck,g.head,...(g.arms||[]),...(g.forearms||[]),...(g.hands||[]),...(g.thighs||[]),...(g.knees||[]),...(g.shins||[]),...(g.feet||[]),...(g.ears||[])].filter(Boolean))];}
 function capture(b){let pose=rest.get(b);if(!pose){pose={position:b.position.clone(),scale:b.scale.clone(),quaternion:b.quaternion.clone(),relative:b.quaternion.clone(),rotation:b.rotation.clone()};rest.set(b,pose);}return pose;}
 window.resetCharacterPose=actor=>{
  for(const g of [actor.userData.glbRig,actor.userData.helmetedRig].filter(Boolean))for(const b of joints(g)){
   const pose=capture(b);b.position.copy(pose.position);b.scale.copy(pose.scale);b.quaternion.copy(pose.quaternion);
  }
 };
 window.stabilizeCharacterPose=actor=>{
  const now=performance.now()/1000,last=clocks.get(actor);clocks.set(actor,now);
  const dt=last===undefined?1:Math.max(0,now-last),seen=new Set();

  for(const g of [actor.userData.glbRig,actor.userData.helmetedRig].filter(Boolean)){
   for(const b of joints(g)){const pose=capture(b);b.position.copy(pose.position);b.scale.copy(pose.scale);if(![b.quaternion.x,b.quaternion.y,b.quaternion.z,b.quaternion.w].every(Number.isFinite))b.quaternion.copy(pose.quaternion);}
   for(const [b,x,y,z] of [[g.head,.65,1,.45],[g.neck,.35,.6,.35],[g.spine,1.1,1,.65],[g.chest,1.1,1.1,.7]])if(b){const pose=capture(b);pose.relative.copy(pose.quaternion).invert().multiply(b.quaternion);pose.rotation.setFromQuaternion(pose.relative,b.rotation.order);pose.rotation.x=Math.max(-x,Math.min(x,pose.rotation.x));pose.rotation.y=Math.max(-y,Math.min(y,pose.rotation.y));pose.rotation.z=Math.max(-z,Math.min(z,pose.rotation.z));pose.relative.setFromEuler(pose.rotation);b.quaternion.copy(pose.quaternion).multiply(pose.relative);}
  }
  // Blend the completed pose once, after combat, acting and foot correction.
  const source=actor.userData.source||{},rate=(source.actionTime>0||source.jump>0||source.ecalSkill||source.finStunt)?24:12;
  for(const g of [actor.userData.glbRig,actor.userData.helmetedRig].filter(Boolean))for(const b of joints(g)){
   if(seen.has(b))continue;seen.add(b);let q=displayed.get(b);
   if(!q||dt>.25){q=b.quaternion.clone();displayed.set(b,q);}else q.slerp(b.quaternion,1-Math.exp(-dt*rate));
   b.quaternion.copy(q);
  }
 };
})();
