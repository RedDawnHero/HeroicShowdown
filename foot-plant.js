(()=>{
 window.plantHeroFeet=(T,rig,t)=>{
  const u=rig.userData,p=u.source,g=u.helmetedModel?.visible?u.helmetedRig:u.glbRig;
  if(!u.isPlayer||!g?.feet?.length)return;
  const active=!(u.landingWeight>.01)&&!p.seated&&!p.knockdown&&!p.jump&&!p.villageAirborne&&!p.flying&&!p.climbing&&!p.ecalSkill&&!p.finStunt&&!(p.dodge>0)&&!(p.actionTime>0);
  if(!active){u.plantedFeet=null;return;}
  const yaw=rig.rotation.y,turn=u.footPlantYaw===undefined?0:Math.atan2(Math.sin(yaw-u.footPlantYaw),Math.cos(yaw-u.footPlantYaw));u.footPlantYaw=yaw;
  // Idle feet follow the relaxed pose; do not fight breathing or a turn in place.
  if((u.walkBlend||0)<.08||Math.abs(turn)>.035){u.plantedFeet=null;return;}
  const feet=u.plantedFeet||(u.plantedFeet=[null,null]);rig.updateMatrixWorld(true);
  for(let i=0;i<2;i++){
   const foot=g.feet[i],hip=g.thighs[i],knee=g.knees[i];if(!foot||!hip||!knee)continue;
   const current=foot.getWorldPosition(new T.Vector3());
   const stance=(u.walkBlend||0)<.08||Math.cos((u.walkPhase||0)+i*Math.PI)<-.1;
   if(!stance){feet[i]=null;continue;}
   if(!feet[i]||feet[i].distanceTo(current)>.45*rig.scale.x)feet[i]=current.clone();
   const target=feet[i];
   // Correct only the forward/backward stance drift, with bounded hinge adjustments.
   for(let iteration=0;iteration<2;iteration++)for(const joint of [knee,hip]){
    rig.updateMatrixWorld(true);
    const origin=joint.getWorldPosition(new T.Vector3());
    const inverse=joint.parent.getWorldQuaternion(new T.Quaternion()).invert();
    const a=foot.getWorldPosition(new T.Vector3()).sub(origin).applyQuaternion(inverse);
    const b=target.clone().sub(origin).applyQuaternion(inverse);
    const angle=Math.atan2(a.y*b.z-a.z*b.y,a.y*b.y+a.z*b.z);
    joint.rotation.x+=T.MathUtils.clamp(angle,-.1,.1);
    joint.rotation.x=T.MathUtils.clamp(joint.rotation.x,joint===knee?0:-1.1,joint===knee?1.9:1.1);
   }
  }
 };
})();
