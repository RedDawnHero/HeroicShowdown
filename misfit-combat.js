/* Host-controlled pursuit for Mr. Misfit. */
(() => {
  let lastState=null,lastRound=0;
  window.misfitCombat={update(s,dt,say){
    if(s.finale||s.ashenTransition||s.boss<=0)return;
    if(lastState!==s||lastRound!==s.round){lastState=s;lastRound=s.round;s.misfitTarget=null;s.misfitMelee=null;s.misfitRouteGoal=null;s.misfitRouteTime=0;s.bossAttack=1.2;}
    const living=Object.values(s.players).filter(p=>p.hp>0&&!p.buried);
    if(!living.length){s.bossWalking=false;return;}
    let target=living.find(p=>p.id===s.misfitTarget);
    if(!target){target=living.sort((a,b)=>Math.hypot(a.x-s.bossX,a.y-s.bossY)-Math.hypot(b.x-s.bossX,b.y-s.bossY))[0];s.misfitTarget=target.id;}
    const dx=target.x-s.bossX,dy=target.y-s.bossY,d=Math.hypot(dx,dy)||1;
    s.bossFace=Math.atan2(dx,dy);s.bossBlock=Math.max(0,(s.bossBlock||0)-dt);s.bossAttack=Math.max(0,(s.bossAttack||0)-dt);
    if(s.misfitMelee){
      const hit=s.misfitMelee;hit.age+=dt;s.bossWalking=false;
      if(hit.age>=.62&&!hit.done){
        hit.done=true;const victim=s.players[hit.target];
        if(victim&&victim.hp>0&&Math.hypot(victim.x-s.bossX,victim.y-s.bossY)<112&&victim.dodge<=0&&victim.jump<.25&&!victim.flying){
          victim.hp=Math.max(0,victim.hp-(victim.blocking?7:23));victim.smashHit=.45;s.danger=Math.min(100,s.danger+4);
          say(victim.blocking?'MR. MISFIT’S STRIKE BLOCKED!':'MR. MISFIT HITS! DODGE HIS NEXT STRIKE!');
        }
      }
      if(hit.age>1.05)s.misfitMelee=null;
      return;
    }
    s.bossWalking=d>78;
    if(s.bossWalking){
      let vx=dx/d,vy=dy/d;
      if(s.round===2&&window.heroIceTerrain){
        s.misfitRouteTime-=dt;
        if(!s.misfitRouteGoal||s.misfitRouteTime<=0){s.misfitRouteGoal={x:target.x,y:target.y};s.misfitRouteTime=.65;}
        const heading=window.heroIceTerrain.direction({id:'mr-misfit-boss',x:s.bossX,y:s.bossY},s.misfitRouteGoal);
        if(!heading.done){vx=heading.x;vy=heading.y;}else if(d>110){vx=0;vy=0;s.bossWalking=false;}
      }
      const speed=s.giant?155:138;
      s.bossX=Math.max(34,Math.min(966,s.bossX+vx*speed*dt));
      // The frozen-city terrain script is optional; keep the boss moving if it fails to load.
      const iceBounds=s.round===2?window.heroIceTerrain?.bounds:null;
      const minY=Number.isFinite(iceBounds?.minY)?iceBounds.minY:-18000;
      const maxY=Number.isFinite(iceBounds?.maxY)?iceBounds.maxY:574;
      s.bossY=Math.max(minY,Math.min(maxY,s.bossY+vy*speed*dt));
    }
    if(s.bossAttack<=0){
      if(d<105){s.misfitMelee={age:0,target:target.id,done:false};s.bossAttack=1.8;s.bossWalking=false;say('MR. MISFIT IS WINDING UP!');}
      else if(d<430){s.bossAttack=2.4;s.shots.push({x:s.bossX,y:s.bossY,target:target.id,age:0,type:'misfit',damage:21});}
    }
  }};
})();
