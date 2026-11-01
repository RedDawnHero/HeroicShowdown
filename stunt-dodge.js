/* Stunt timing on the existing character bones; meshes and textures stay intact. */
(() => {
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  const envelope=(u,a,b,c)=>smooth((u-a)/(b-a))*(1-smooth((u-b)/(c-b)));
  const beforePose=window.heroStuntPose;
  function motion(rig,p,t){
    const ud=rig.userData;
    if(!p||p.seated||p.knockdown||p.ecalSkill||(p.finStunt&&p.finStunt.kind!=='dodge')){ud.stuntDodge=null;return null;}
    let m=ud.stuntDodge;
    const active=p.action==='dodge'&&p.actionTime>0;
    if(active&&(!m||p.actionTime>m.remaining+.04)){
      m=ud.stuntDodge={at:t,remaining:p.actionTime,side:(ud.stuntDodgeSide=-(ud.stuntDodgeSide||-1))};
    }
    if(!m)return null;
    m.remaining=active?p.actionTime:0;
    if(p.actionTime>0&&p.action!=='dodge'){ud.stuntDodge=null;return null;}
    const u=p.finStunt?.kind==='dodge'?clamp(p.finStunt.age/p.finStunt.duration):(t-m.at)/.72;
    if(u>=1){ud.stuntDodge=null;return null;}
    return {u,side:p.finStunt?.side||m.side};
  }
  window.heroStuntPose=(rig,p,t)=>{
    beforePose?.(rig,p,t);
    const m=motion(rig,p,t);if(!m)return;
    const {u,side}=m;
    const load=envelope(u,0,.16,.36),drive=envelope(u,.12,.32,.7);
    const absorb=envelope(u,.48,.67,1),trail=envelope(u,.26,.53,1);
    const set=(b,x=0,y=0,z=0)=>{if(b)b.rotation.set(x,y,z);};
    for(const g of [rig.userData.glbRig,rig.userData.helmetedRig].filter(Boolean)){
      // The core leads; arms follow later and settle over the longer recovery.
      set(g.pelvis,.12*load+.14*absorb,-side*.16*drive,side*(-.08*load+.24*drive));
      set(g.spine,.2*load+.3*drive+.18*absorb,side*.1*trail);
      set(g.chest,.16*load+.18*drive+.2*absorb,-side*.23*drive,-side*.1*trail);
      set(g.head,-.1*load-.12*absorb,side*.16*drive,-side*.06*drive);
      for(let i=0;i<2;i++){
        const lead=(i===0)===(side>0),s=i?1:-1;
        set(g.thighs?.[i],-(lead?.62:.4)*load-(lead?.45:.22)*drive-.48*absorb,0,s*.12*drive);
        set(g.knees?.[i],(lead?1:.7)*load+(lead?.7:.45)*drive+.8*absorb);
        set(g.feet?.[i],-.16*load-.12*absorb);
        set(g.arms?.[i],-.25*load-(lead?.65:.35)*trail,0,s*(.12*load+.3*trail));
        set(g.forearms?.[i],-.7*load-.95*trail-.25*absorb);
      }
      if(p.finStunt?.kind==='dodge'&&g.pelvis){
        // Preserve Fin New's full side roll and its articulated tuck.
        g.pelvis.rotation.z=side*Math.PI*2*smooth((u-.18)/.42);
        const tuck=envelope(u,.12,.36,.75);
        g.thighs?.forEach(b=>b.rotation.x-=tuck*.8);
        g.knees?.forEach(b=>b.rotation.x+=tuck*.8);
      }
    }
    rig.userData.stuntDodgeCompression=.13*load+.16*absorb;
  };
  const beforeFinish=window.heroStuntFinish;
  window.heroStuntFinish=(rig,p)=>{
    beforeFinish?.(rig,p);
    if(rig.userData.stuntDodge)rig.position.y-=rig.userData.stuntDodgeCompression||0;
  };
})();
