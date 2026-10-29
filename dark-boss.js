/* Final-level combat is advanced only by the host's simulation. */
(() => {
  window.darkFinaleTiming={shot:4.6,impact:5.3,white:8.3,end:11.4};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
  // One sustained white finish, after the fireball has had time to expand.
  const whiteout=document.createElement('div');
  whiteout.setAttribute('aria-hidden','true');
  whiteout.style.cssText='position:fixed;inset:0;z-index:2000;background:#fff;opacity:0;pointer-events:none;display:none';
  document.body.appendChild(whiteout);
  let whiteState=null,resultsFadeAt=null,whiteFrame=0;
  function drawWhiteout(now){
    whiteFrame=0;
    const s=whiteState,active=s?.round===5&&s.finale;
    if(!active){whiteout.style.display='none';resultsFadeAt=null;return;}
    let alpha=smooth((s.finale.age-window.darkFinaleTiming.white)/1.05);
    if(s.phase==='results'){
      if(resultsFadeAt===null)resultsFadeAt=now;
      alpha=1-smooth((now-resultsFadeAt-400)/1000);
    }else resultsFadeAt=null;
    whiteout.style.display=alpha>0?'block':'none';whiteout.style.opacity=String(alpha);
    if(s.phase==='game'||alpha>0)whiteFrame=requestAnimationFrame(drawWhiteout);
  }
  window.updateFinalWhiteout=s=>{whiteState=s;if(!whiteFrame)whiteFrame=requestAnimationFrame(drawWhiteout);};
  const explosionImage=new Image();explosionImage.src=window.heroFinalExplosionTexture||'assets/final-villain-explosion.png';
  window.darkBossCombat={
    update(s,dt,say){
      if(s.round!==5||s.boss<=0||s.finale)return;
      const enraged=s.boss<=(s.bossMax||420)*.5;
      s.darkEnraged=enraged;
      const targets=Object.values(s.players).filter(p=>p.hp>0);
      const target=targets.sort((a,b)=>Math.hypot(a.x-s.bossX,a.y-s.bossY)-Math.hypot(b.x-s.bossX,b.y-s.bossY))[0];
      if(!target)return;
      if(enraged&&!s.darkRageAnnounced){s.darkRageAnnounced=true;say('DARK ARMORED ENRAGED! WATCH HIS ATTACK WARNINGS!');}
      s.bossBlock=Math.max(0,(s.bossBlock||0)-dt);
      s.bossAttack=(s.bossAttack||0)-dt;
      const dx=target.x-s.bossX,dy=target.y-s.bossY,d=Math.hypot(dx,dy)||1;
      s.bossWalking=!s.darkStrike&&d>115;
      s.bossFace=Math.atan2(dx,dy);
      if(s.bossWalking){const speed=enraged?112:86;s.bossX=clamp(s.bossX+dx/d*speed*dt,34,966);s.bossY=clamp(s.bossY+dy/d*speed*dt,window.heroTravelProjection?-18000:82,574);}
      if(s.darkStrike){
        const hit=s.darkStrike;hit.age+=dt;
        if(hit.age>=hit.windup&&!hit.done){
          hit.done=true;
          if(hit.kind==='charge'){s.bossX=hit.x;s.bossY=hit.y;}
          for(const p of targets){
            if(Math.hypot(p.x-hit.x,p.y-hit.y)>hit.radius||p.dodge>0||p.jump>.22||p.flying)continue;
            p.hp=Math.max(0,p.hp-(p.blocking?8:enraged?34:27));p.smashHit=.65;s.danger=Math.min(100,s.danger+4);
          }
          say(hit.kind==='charge'?'DARK ARMORED CHARGES!':'DARK ARMORED UNLEASHES A SHOCKWAVE!');
        }
        if(hit.age>hit.windup+.65)s.darkStrike=null;
      }
      if(s.bossAttack<=0&&!s.darkStrike){
        const turn=(s.darkAttackTurn||0)+1;s.darkAttackTurn=turn;
        s.bossAttack=enraged?2.05:2.9;
        if(turn%3===1){
          // A short guard then a volley: projectiles remain dodgeable and expire.
          s.bossBlock=.65;
          targets.slice(0,3).forEach(p=>s.shots.push({x:s.bossX,y:s.bossY,target:p.id,age:0,type:'dark',damage:enraged?29:23}));
          say('DARK ARMORED · SHADOW BOLTS!');
        }else{
          const charge=turn%3===0;
          s.darkStrike={kind:charge?'charge':'shockwave',x:target.x,y:target.y,age:0,windup:enraged?.9:1.2,radius:charge?100:145,done:false};
          say(charge?'DARK CHARGE! MOVE OUT OF THE RED CIRCLE!':'SHOCKWAVE INCOMING! DODGE OR JUMP!');
        }
      }
    }
  };

  const style=document.createElement('style');style.textContent=`
    .dark-boss-hud{position:absolute;z-index:12;left:50%;bottom:16px;transform:translateX(-50%);width:min(560px,82%);padding:10px 14px;background:#100b13e8;border:1px solid #ff674e70;border-radius:5px;pointer-events:none;color:#fff}
    .dark-boss-hud[hidden],.boss-finale-caption[hidden]{display:none}
    .dark-boss-hud header{display:flex;justify-content:space-between;gap:10px;font:bold 11px sans-serif;letter-spacing:1px}.dark-boss-hud small{display:block;color:#ffc092;font:10px sans-serif;margin:5px 0}
    .dark-boss-track{height:11px;background:#ffffff20;border-radius:3px;overflow:hidden}.dark-boss-track i{display:block;height:100%;background:linear-gradient(90deg,#b92b55,#ff6245,#ffd798);transition:width .12s}
    .arena-wrap.boss-finale:before,.arena-wrap.boss-finale:after{content:'';position:absolute;left:0;right:0;height:7%;background:#030306;z-index:16;pointer-events:none}.arena-wrap.boss-finale:before{top:0}.arena-wrap.boss-finale:after{bottom:0}
    .boss-finale-caption{position:absolute;z-index:17;bottom:9%;left:0;right:0;text-align:center;color:#ffe8c3;text-shadow:0 2px 10px #000;font:bold clamp(12px,2vw,22px) sans-serif;letter-spacing:3px;pointer-events:none}
    #game.boss-finale-active .controls{opacity:.35;pointer-events:none}
  `;document.head.appendChild(style);
  const hud=document.createElement('section');hud.className='dark-boss-hud';hud.hidden=true;
  hud.innerHTML='<header><span>DARK ARMORED</span><b></b></header><small>TRUE MAIN VILLAIN</small><div class="dark-boss-track" role="progressbar" aria-label="Dark Armored health"><i></i></div>';
  const caption=document.createElement('div');caption.className='boss-finale-caption';caption.hidden=true;
  document.querySelector('.arena-wrap').append(hud,caption);
  window.updateDarkBossHUD=s=>{
    const active=s?.phase==='game'&&s.round===5&&!s.intro;
    hud.hidden=!active||!!s?.finale;
    const finale=s?.phase==='game'&&!s.intro&&(s.round===2||s.round===5)&&!!s.finale;
    document.querySelector('.arena-wrap').classList.toggle('boss-finale',finale);
    document.querySelector('#game').classList.toggle('boss-finale-active',finale);
    caption.hidden=!finale;
    if(finale)caption.textContent=s.round===2?'Red Dawn’s Finishing Blow':s.finale.age<3.35?'SOMETHING IS BUILDING…':s.finale.age<window.darkFinaleTiming.impact?'ECAL · THE FINAL SHOT':'DARK ARMORED DEFEATED';
    if(!active)return;
    const hp=Math.max(0,Math.ceil(s.boss)),max=s.bossMax||420;
    hud.querySelector('b').textContent=hp+' / '+max;
    hud.querySelector('i').style.width=clamp(hp/max*100,0,100)+'%';
    const bar=hud.querySelector('[role]');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',max);bar.setAttribute('aria-valuenow',hp);
    hud.querySelector('small').textContent=s.darkStrike&&!s.darkStrike.done?'INCOMING '+s.darkStrike.kind.toUpperCase()+' · DODGE!':s.darkEnraged?'ENRAGED · POWER INCREASED':s.bossBlock>0?'DARK GUARD':'TRUE MAIN VILLAIN';
  };

  window.drawDarkBossEffects=(g,s,w,h)=>{
    if(!s||s.round!==5)return;
    if(document.querySelector('.arena-wrap').classList.contains('playing3d'))return;
    if(s.finale){
      const age=s.finale.age,timing=window.darkFinaleTiming,e=age-timing.impact;
      const q=window.heroGround?.sample(5,s.bossX,s.bossY,w,h)||{x:s.bossX,y:s.bossY,height:100};
      const shooter=s.players[s.finale.finisherId]||s.finale.ecal;
      if(shooter){
        const a=window.heroGround?.sample(5,shooter.x,shooter.y,w,h)||{x:shooter.x,y:shooter.y,height:100};
        if(s.finale.ecal)window.drawEcalCharacter?.(g,shooter,a.x,a.y,a.height,performance.now()/1000);
        if(age>=timing.shot&&age<timing.impact){
          const u=clamp((age-timing.shot)/(timing.impact-timing.shot),0,1);
          g.save();g.strokeStyle='#c7ffff';g.shadowColor='#2edcff';g.shadowBlur=24;g.lineWidth=7;
          g.beginPath();g.moveTo(a.x,a.y-a.height*.55);g.lineTo(a.x+(q.x-a.x)*u,a.y-a.height*.55+(q.y-q.height*.6-a.y+a.height*.55)*u);g.stroke();g.restore();
        }
      }
      if(e>=0&&explosionImage.complete&&explosionImage.naturalWidth){
        const size=(.08+smooth(e/.65)*.65+Math.max(0,e-.65)*.06)*w;
        g.save();g.globalAlpha=Math.min(1,e*12)*Math.max(0,1-(e-2.5)/3);g.translate(q.x,q.y-q.height*.6);
        g.rotate(Math.sin(e*2)*.035);g.drawImage(explosionImage,-size/2,-size*.29,size,size*.58);g.restore();
      }
    }
    const strike=s.darkStrike;
    if(strike){const q=window.heroGround?.sample(5,strike.x,strike.y,w,h)||{x:strike.x,y:strike.y,height:100,visible:true};
      if(q.visible!==false){const r=q.height*strike.radius/45;g.save();g.strokeStyle=strike.done?'#ffc58c':'#ff3657';g.fillStyle='#ff244322';g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,r*.5,r*.17,0,0,Math.PI*2);g.fill();g.stroke();g.restore();}}
  };

  window.createDarkBossPresentation=(T,scene)=>{
    const warning=new T.Mesh(new T.RingGeometry(.94,1,64),new T.MeshBasicMaterial({color:0xff3154,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false}));
    warning.rotation.x=-Math.PI/2;warning.visible=false;scene.add(warning);
    const blast=new T.Group();scene.add(blast);blast.visible=false;
    const glowMat=new T.MeshBasicMaterial({color:0xffaa50,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending});
    const core=new T.Mesh(new T.SphereGeometry(1,24,16),glowMat);blast.add(core);
    const ring=new T.Mesh(new T.TorusGeometry(1,.035,6,64),new T.MeshBasicMaterial({color:0xffd69c,transparent:true,depthWrite:false}));ring.rotation.x=-Math.PI/2;blast.add(ring);
    const debris=new T.InstancedMesh(new T.IcosahedronGeometry(.13,0),new T.MeshStandardMaterial({color:0x322837,metalness:.8,roughness:.4,emissive:0x842716,emissiveIntensity:.6}),70);blast.add(debris);
    const dummy=new T.Object3D();
    const light=new T.PointLight(0xff9b62,0,35,2);blast.add(light);
    const haze=document.createElement('canvas');haze.width=haze.height=96;const hc=haze.getContext('2d'),grad=hc.createRadialGradient(48,48,2,48,48,47);grad.addColorStop(0,'rgba(85,75,83,.75)');grad.addColorStop(.5,'rgba(68,61,70,.3)');grad.addColorStop(1,'rgba(50,45,53,0)');hc.fillStyle=grad;hc.fillRect(0,0,96,96);
    const smokeMap=new T.CanvasTexture(haze),smoke=[];
    for(let i=0;i<12;i++){const puff=new T.Sprite(new T.SpriteMaterial({map:smokeMap,transparent:true,depthWrite:false,opacity:0}));blast.add(puff);smoke.push(puff);}
    const photoTexture=new T.TextureLoader().load(window.heroFinalExplosionTexture||'assets/final-villain-explosion.png');photoTexture.colorSpace=T.SRGBColorSpace;
    const photoBlast=new T.Sprite(new T.SpriteMaterial({map:photoTexture,transparent:true,depthWrite:false,opacity:0}));photoBlast.visible=false;blast.add(photoBlast);
    const shotGroup=new T.Group();scene.add(shotGroup);shotGroup.visible=false;
    const beam=new T.Mesh(new T.CylinderGeometry(.075,.075,1,10),new T.MeshBasicMaterial({color:0xc8ffff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));shotGroup.add(beam);
    const beamHalo=new T.Mesh(new T.CylinderGeometry(.19,.19,1,10),new T.MeshBasicMaterial({color:0x24cfff,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false}));shotGroup.add(beamHalo);
    const muzzle=new T.Mesh(new T.SphereGeometry(.18,12,8),new T.MeshBasicMaterial({color:0xabffff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));shotGroup.add(muzzle);
    const chargeLight=new T.PointLight(0x69cfff,0,10,2);shotGroup.add(chargeLight);
    const heroHit=new T.Mesh(new T.SphereGeometry(.25,16,12),new T.MeshBasicMaterial({color:0xffce67,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));scene.add(heroHit);heroHit.visible=false;
    let previousAge=null,shotStart=null;
    return {hide(){heroHit.visible=false;blast.visible=false;warning.visible=false;shotGroup.visible=false;photoBlast.visible=false;previousAge=null;},update(s,camera,local,boss,heroes){
      const strike=s.round===5?s.darkStrike:null;warning.visible=!!strike&&!s.finale;
      if(strike){warning.position.set((strike.x-500)*.055,.045,(strike.y-300)*.055);warning.scale.setScalar(strike.radius*.055);warning.material.color.setHex(strike.done?0xffcc94:0xff3154);warning.material.opacity=strike.done?Math.max(0,1-(strike.age-strike.windup)/.65):.6+.3*Math.sin(strike.age*18);}
      const defeat=(s.round===2||s.round===5)?s.finale:null;
      blast.visible=!!defeat;shotGroup.visible=false;photoBlast.visible=false;heroHit.visible=false;
      if(!defeat){previousAge=null;if(boss){boss.visible=true;boss.rotation.x=0;boss.rotation.z=0;}return;}
      if(!boss)return;
      const age=defeat.age,enemy=boss.position.clone(),lastVillain=s.round===5,timing=window.darkFinaleTiming;
      if(previousAge===null||age<previousAge)shotStart=camera.position.clone();
      previousAge=age;
      // Find the head from the displayed model, then rise above the villain.
      boss.updateMatrixWorld(true);
      const bounds=new T.Box3().setFromObject(boss),height=Math.max(2,bounds.max.y-bounds.min.y);
      const face=enemy.clone();face.y=bounds.max.y-height*.13;
      const front=new T.Vector3(0,0,1).applyQuaternion(boss.quaternion);
      front.y=0;front.normalize();
      const close=face.clone().addScaledVector(front,Math.max(2.25,height*.88));
      close.y=face.y+.12;
      const pan=smooth(age/.95),pull=smooth((age-(lastVillain?2.3:1.9))/2.1);
      const overhead=enemy.clone().add(new T.Vector3(.3,Math.max(26,height*8),1.8));
      camera.position.copy(shotStart.clone().lerp(close,pan).lerp(overhead,pull));
      camera.lookAt(face.clone().lerp(enemy.clone().add(new T.Vector3(0,.6,0)),pull));
      if(local)local.visible=true;
      const elapsed=age-(lastVillain?timing.impact:4.2);boss.visible=elapsed<0;
      if(s.round===2){
        const hero=heroes.find(r=>r.userData.source?.id===(defeat.guardianId||defeat.redDawn?.id));
        if(hero){
          hero.visible=true;
          const direction=enemy.clone().sub(hero.position);direction.y=0;direction.normalize();
          if(age<5.4)hero.rotation.y=Math.atan2(direction.x,direction.z);
          const side=new T.Vector3(direction.z,0,-direction.x),mid=hero.position.clone().lerp(enemy,.5);mid.y=(hero.position.y+enemy.y)/2+1.35*hero.scale.y;
          const duel=mid.clone().addScaledVector(side,4.8*Math.max(1,hero.scale.y)).addScaledVector(direction,-.8);duel.y+=1.1;
          const reveal=smooth((age-.8)/.7),rise=smooth((age-2.85)/1.35);
          camera.position.lerp(duel,reveal*(1-rise));camera.lookAt(face.clone().lerp(mid,reveal*(1-rise)));
          const wind=smooth((age-1.4)/.75),strike=smooth((age-2.25)/.4),recover=smooth((age-2.85)/.6);
          for(const g of (age<3.5?[hero.userData.glbRig,hero.userData.helmetedRig]:[]).filter(Boolean)){
            g.arms[0].rotation.x=(-.4*wind-1.15*strike)*(1-recover);
            g.arms[0].rotation.z=-.16*strike*(1-recover);
            g.forearms[0].rotation.x=(-1.15*wind+.97*strike)*(1-recover)-.2;
            g.arms[1].rotation.x=-.5*wind*(1-recover);g.forearms[1].rotation.x=-.55;
            if(g.chest){g.chest.rotation.y=(-.3*wind+.52*strike)*(1-recover);g.chest.rotation.x=-.1*strike*(1-recover);}
            g.knees.forEach(b=>b.rotation.x=.16+.12*wind*(1-recover));
          }
          heroHit.visible=age>=2.45&&age<3.35;
          heroHit.position.copy(enemy).y+=1.55*boss.scale.y;
          heroHit.scale.setScalar(.5+smooth((age-2.45)/.2)*2.2);heroHit.material.opacity=Math.max(0,1-(age-2.65)/.7);
          if(age>=2.65&&age<4.2){boss.rotation.z=Math.sin((age-2.65)*6)*.08;boss.rotation.x=-.10*smooth((age-2.65)/.3);}
        }
      }

      if(s.round===2){
        blast.visible=false;photoBlast.visible=false;heroHit.visible=false;boss.visible=true;
        const fall=smooth((age-2.65)/1.1);
        boss.rotation.x=-Math.PI*.48*fall;boss.position.y-=.12*fall;
        const hero=heroes.find(r=>r.userData.source?.id===(defeat.guardianId||defeat.redDawn?.id));
        if(hero&&age>=3.8){
          const head=hero.position.clone().add(new T.Vector3(0,2.05*hero.scale.y,0));
          const pull=smooth((age-5.4)/3.8);
          const close=head.clone().add(new T.Vector3(0,.12,2.5));
          const wide=head.clone().add(new T.Vector3(5,5,12));
          camera.position.lerp(close.lerp(wide,pull),smooth((age-3.8)/.8));camera.lookAt(head);
          caption.textContent=age>5.4?'MISSION COMPLETE':'Red Dawn’s Finishing Blow';
        }
        if(age>=5.4){
          for(const walker of heroes.filter(r=>[defeat.guardianId||defeat.redDawn?.id,defeat.wildClaw?.id].includes(r.userData.source?.id))){
            walker.rotation.x=0;walker.rotation.z=0;
            for(const g of [walker.userData.glbRig,walker.userData.helmetedRig].filter(Boolean)){
              for(const bone of [g.pelvis,g.spine,g.chest,g.head].filter(Boolean)){bone.rotation.x=0;bone.rotation.z=0;}
            }
          }
        }
        return;
      }

      if(lastVillain){
        const buildup=smooth((age-.9)/3.5)*(elapsed<0?1:Math.max(0,1-elapsed/2.2));
        const shake=.018+buildup*.13+(elapsed>=0?Math.max(0,.38-elapsed*.19):0);
        camera.position.x+=(Math.sin(age*47)+Math.sin(age*73)*.35)*shake;
        camera.position.z+=Math.sin(age*59)*shake*.7;
        camera.position.y+=Math.cos(age*67)*shake*.45;
        boss.rotation.z=elapsed<0?Math.sin(age*42)*buildup*.018:0;
        const shooter=heroes.find(r=>r.userData.source?.id===(defeat.finisherId||defeat.ecal?.id));
        if(shooter){
          shooter.visible=true;
          const origin=shooter.position.clone();origin.y+=1.5*shooter.scale.y;
          const delta=face.clone().sub(origin),direction=delta.clone().normalize();origin.addScaledVector(direction,.5);
          shooter.rotation.y=Math.atan2(direction.x,direction.z);
          shotGroup.visible=age>=3.35&&age<timing.impact;
          const u=clamp((age-timing.shot)/(timing.impact-timing.shot),0,1);
          const tip=origin.clone().lerp(face,u),tail=origin.clone().lerp(face,Math.max(0,u-.48));
          const segment=tip.clone().sub(tail),length=segment.length();
          for(const mesh of [beam,beamHalo]){mesh.visible=age>=timing.shot;mesh.position.copy(tail).lerp(tip,.5);mesh.scale.y=Math.max(.001,length);if(length>.001)mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),segment.normalize());}
          const charge=smooth((age-3.35)/(timing.shot-3.35));muzzle.position.copy(origin);muzzle.scale.setScalar(.3+charge*1.8);muzzle.visible=age<timing.shot+.18;
          chargeLight.position.copy(origin);chargeLight.intensity=charge*5;
        }
        if(elapsed>=0){
          photoBlast.visible=true;photoBlast.position.y=.8+elapsed*.35;
          const size=.8+smooth(elapsed/.6)*15+Math.max(0,elapsed-.6)*2;
          photoBlast.scale.set(size*1.55,size,1);
          photoBlast.material.opacity=Math.min(1,elapsed*15)*Math.max(0,1-(elapsed-2.5)/3);
          photoBlast.material.rotation=Math.sin(elapsed*1.7)*.035;
        }
      }
      blast.position.copy(enemy).y=enemy.y+1.25;
      core.visible=elapsed>=-.6;
      const radius=elapsed<0?.3+smooth((elapsed+.6)/.6)*.65:1+Math.min(3,elapsed*7);
      core.scale.setScalar(radius);glowMat.opacity=elapsed<0?.45:Math.max(0,1-elapsed/1.2);
      ring.visible=elapsed>=0;ring.position.y=-1.15;ring.scale.setScalar(1+Math.max(0,elapsed)*9);ring.material.opacity=Math.max(0,1-elapsed/2.4);
      debris.visible=elapsed>=0;
      for(let i=0;i<70;i++){const a=i*2.39996,speed=2+(i%9)*.8,e=Math.max(0,elapsed);dummy.position.set(Math.cos(a)*speed*e,Math.max(-1.2,(2+i%5)*e-3*e*e),Math.sin(a)*speed*e);dummy.rotation.set(e*(i%7),a+e*3,e*2);dummy.scale.setScalar(Math.max(.05,1-e/4));dummy.updateMatrix();debris.setMatrixAt(i,dummy.matrix);}debris.instanceMatrix.needsUpdate=true;
      smoke.forEach((p,i)=>{const e=Math.max(0,elapsed),a=i*2.4;p.position.set(Math.cos(a)*e*1.8,e*(.7+i%3*.3),Math.sin(a)*e*1.8);p.scale.setScalar(1+e*2.7);p.material.opacity=elapsed>0?Math.min(.6,e*1.5)*Math.max(0,1-e/5):0;});
      light.intensity=elapsed<0?Math.max(0,(elapsed+.6)*12):Math.max(0,35-elapsed*30);
      if(elapsed>=0&&elapsed<.5){camera.position.x+=Math.sin(elapsed*85)*.09*(1-elapsed*2);camera.position.y+=Math.sin(elapsed*65)*.06*(1-elapsed*2);}
      camera.updateMatrixWorld(true);
    }};
  };
})();
