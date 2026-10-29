/* Joint-driven performance layered over locomotion; no changes to facial topology. */
(()=>{
const clamp=x=>Math.max(0,Math.min(1,x)), smooth=x=>{x=clamp(x);return x*x*(3-2*x)},pulse=(u,a,b)=>Math.sin(clamp((u-a)/(b-a))*Math.PI);
window.heroStuntPose=(rig,p,t)=>{
 const g=rig.userData.glbRig;if(!g||p.seated)return;
 const k=p.finStunt,u=k?clamp(k.age/k.duration):0;
 const set=(b,x=0,y=0,z=0)=>{if(b)b.rotation.set(x,y,z)};
 if(k){
 const aerial=['jump','smash','dodge'].includes(k.kind), wind=pulse(u,0,.2),tuck=smooth((u-.13)/.13)*(1-smooth((u-.57)/.18)),land=pulse(u,.76,1),strike=pulse(u,.18,.78),side=k.side||1;
 set(g.pelvis,-.18*wind+.18*tuck,-side*.24*strike,side*.06*land);
 set(g.spine,.28*wind+.42*tuck+.28*land,side*.3*strike);
 set(g.chest,.2*wind+.24*tuck+.32*land,-side*.45*strike,side*.08*strike);
 set(g.head,-.14*wind-.23*tuck-.18*land,side*.15*strike);
 for(let i=0;i<2;i++){const s=i?1:-1;
 set(g.thighs[i],-.7*wind-(i?1.4:1.65)*tuck-.85*land,0,s*(.1+.13*land));
 set(g.knees[i],1.2*wind+(i?1.85:2.05)*tuck+1.45*land);
 set(g.feet[i],-.25*wind-.35*tuck-.28*land);
 set(g.arms[i],.65*wind-(i?1.15:.8)*tuck-(i?.25:1)*land, s*.2*strike,s*(.18+.2*land));
 set(g.forearms[i],-.3-1.3*tuck-.5*land);
 }
 if(aerial){
 // Rotate the articulated pelvis about its anatomical pivot, not the whole mesh.
 const spin=smooth((u-.2)/.39);g.pelvis.rotation.x-=Math.PI*2*spin;
 if(k.kind==='dodge'){g.pelvis.rotation.z=side*Math.PI*2*spin;g.pelvis.rotation.x=-.35*tuck;}
 }else{
 const kick=k.kind==='kick';set(g.pelvis,.12*strike,side*(-.35*wind+.6*strike));set(g.chest,.14*strike,side*(-.45*wind+.8*strike));
 if(kick){set(g.thighs[0],-1.45*strike,0,.35*strike);set(g.knees[0],.9*wind+.2*strike);set(g.thighs[1],-.18*strike);set(g.knees[1],.3*strike);set(g.feet[1],0,-.4*strike);}
 else {const i=side>0?0:1;set(g.arms[i],-1.55*strike,0,-side*.25*strike);set(g.forearms[i],-1.3*(1-strike));set(g.thighs[i],-.35*strike);set(g.knees[i],.55*strike);}
 }
 }
 // Small overlapping head and neck reactions apply to every rigged actor.
 const effort=p.actionTime>0?1:0,turn=Math.sin(t*.67+(p.x||0)*.01)*.035;
 if(g.neck){g.neck.rotation.y=turn*.45;g.neck.rotation.x=Math.sin(t*1.8)*.012;}
 if(g.head){g.head.rotation.y+=turn+effort*.045;g.head.rotation.z=Math.sin(t*.91)*.025;}
 if(g.chest)g.chest.rotation.x+=Math.sin(t*2.2)*.008;
};
window.heroStuntFinish=(rig,p)=>{
 const k=p?.finStunt;if(!k)return;const u=clamp(k.age/k.duration);
 // Village jump height is already provided by the terrain physics.
 if(!k.terrainJump&&['jump','smash','dodge'].includes(k.kind)){
 const rise=smooth((u-.12)/.25),fall=smooth((u-.53)/.23);
 rig.position.y+=Math.max(0,rise-fall)*(k.kind==='dodge'?.55:2.8);
 }
};
window.heroStuntCamera=(T,camera,rig,p)=>{const k=p?.finStunt;if(!k||!rig)return;const u=clamp(k.age/k.duration),w=Math.sin(u*Math.PI);camera.position.x+=Math.sin(u*Math.PI*2)*.28;camera.position.z+=w*.8;camera.position.y-=w*.22;camera.lookAt(rig.position.clone().add(new T.Vector3(0,1.35,0)));};
})();
