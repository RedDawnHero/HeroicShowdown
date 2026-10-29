(() => {
 window.heroCombatCamera=(T,camera,rig,p)=>{if(!rig||!['ecal','wildclaw'].includes(p?.hero))return;const motion=rig.userData.performance;if(!motion||!motion.duration)return;const u=(motion.last-motion.at)/motion.duration;if(u<0||u>1)return;if(!['punch','kick','firePunch','ecalHeavy','ecalAirKick'].includes(motion.action))return;const w=Math.sin(u*Math.PI);camera.position.x+=motion.side*w*.18;camera.position.z+=w*.2;};
 const previous=window.heroStuntPose;
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 window.heroStuntPose=(rig,p,t)=>{
  previous?.(rig,p,t);const g=rig.userData.glbRig;if(!g)return;
  const ud=rig.userData,old=ud.performance||(ud.performance={at:t,last:t,hp:p.hp,action:'',remaining:0,side:1,pose:new Map()});
  const dt=Math.min(.05,Math.max(0,t-old.last));old.last=t;
  if(Number.isFinite(p.hp)&&Number.isFinite(old.hp)&&p.hp<old.hp){old.hit=t;old.side=-old.side;}old.hp=p.hp;
  if(old.hit&&t-old.hit<.65){const u=(t-old.hit)/.65,w=Math.sin(smooth(u)*Math.PI);g.chest.rotation.x-=w*.26;g.chest.rotation.z+=old.side*w*.18;g.head.rotation.x-=w*.12;g.knees.forEach(b=>b.rotation.x+=w*.22);g.arms.forEach(b=>b.rotation.x-=w*.25);}
  if(!['ecal','wildclaw'].includes(p.hero))return;
  const kind=p.ecalSkill?.kind||p.action,remaining=p.ecalSkill?Math.max(0,p.ecalSkill.duration-p.ecalSkill.age):p.actionTime||0;
  if(remaining>0&&(kind!==old.action||remaining>old.remaining+.03)){old.at=t;old.action=kind;old.duration=Math.max(.48,remaining+.16);old.side=-old.side;}
  old.remaining=remaining;
  const u=(t-old.at)/old.duration,side=old.side;
  if(u>=0&&u<1&&['punch','firePunch','kick','ecalHeavy','ecalAirKick','dodge'].includes(old.action)){
   const wind=Math.sin(smooth(u/.26)*Math.PI)*(1-smooth((u-.26)/.01)),strike=smooth((u-.16)/.18)*(1-smooth((u-.48)/.52));
   const kick=['kick','ecalAirKick'].includes(old.action),duck=old.action==='dodge';
   const set=(b,x,y=0,z=0)=>{if(b)b.rotation.set(x,y,z);};
   set(g.pelvis,.1*strike,side*(-.22*wind+.32*strike),side*.06*strike);
   set(g.spine,.12*strike,side*(-.2*wind+.24*strike));set(g.chest,.16*strike,side*(-.35*wind+.48*strike));
   set(g.head,-.08*strike,-side*.22*strike,.04*side*wind);
   for(let i=0;i<2;i++){set(g.thighs[i],-(i?.12:.3)*strike);set(g.knees[i],(i?.22:.48)*strike);set(g.arms[i],-.3,0,(i?1:-1)*.15);set(g.forearms[i],-1.05);}
   const arm=side>0?0:1;
   if(kick){set(g.thighs[0],-1.5*strike,side*.15*strike,.35*strike);set(g.knees[0],1.3*wind+.12*strike);set(g.feet[1],0,side*.4*strike);set(g.chest,.2*strike,-side*.5*strike,-.2*strike);}
   else if(duck){set(g.pelvis,.12*strike,side*.5*strike,side*.2*strike);set(g.spine,.55*strike);g.thighs.forEach(b=>b.rotation.x=-.7*strike);g.knees.forEach(b=>b.rotation.x=1.2*strike);}
   else{set(g.arms[arm],.25*wind-1.55*strike,0,-side*.22*strike);set(g.forearms[arm],-1.3*(1-strike));}
  }
  (g.ears||[]).forEach((b,i)=>{b.rotation.x=Math.sin(t*2+i)*.035;b.rotation.z=(i?1:-1)*Math.sin(t*1.3+i)*.04;});
 };
})();
