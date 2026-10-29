/* Authoritative meteor impacts and their shared canvas/3D overlay. */
(() => {
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),TAU=Math.PI*2;
  const rockImage=new Image();rockImage.src='assets/level-one-meteor.jpg';
  let rock=null;
  rockImage.onload=()=>{
    const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
    g.beginPath();for(let i=0;i<15;i++){const a=i/15*TAU,r=37+Math.sin(i*13)*5;const x=48+Math.cos(a)*r,y=48+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.clip();
    g.drawImage(rockImage,434/1376*rockImage.naturalWidth,110/768*rockImage.naturalHeight,49/1376*rockImage.naturalWidth,49/768*rockImage.naturalHeight,0,0,96,96);rock=c;
  };
  function update(state,dt,onHit){
    if(!state||state.phase!=='game'||state.intro)return;
    if(state.round!==1){state.meteorHazards=[];state.meteorScars=[];state.meteorTimer=3;return;}
    const hazards=state.meteorHazards||(state.meteorHazards=[]),scars=state.meteorScars||(state.meteorScars=[]);
    state.meteorTimer=(state.meteorTimer??4)-dt;
    const players=Object.values(state.players).filter(p=>!p.buried&&p.hp>0);
    if(state.meteorTimer<=0&&players.length&&hazards.length<4){
      const target=players[(state.meteorCount||0)%players.length];state.meteorCount=(state.meteorCount||0)+1;
      // Snapshot the position: players have time to leave the warning zone.
      hazards.push({x:clamp(target.x+(Math.random()-.5)*50,80,920),y:clamp(target.y+(Math.random()-.5)*50,window.heroTravelProjection?-17900:110,550),age:0,radius:53,seed:state.meteorCount,hit:false});
      state.meteorTimer=2.8+Math.random()*1.2;
    }
    for(const m of hazards){m.age+=dt;if(!m.hit&&m.age>=2.1){m.hit=true;scars.push({x:m.x,y:m.y,age:0});if(scars.length>8)scars.shift();
      for(const p of players){if(Math.hypot(p.x-m.x,p.y-m.y)>m.radius||p.dodge>0||p.flying||p.climbing||p.jump>.1)continue;
        p.hp=Math.max(0,p.hp-(p.blocking?5:14));p.smashHit=.24;onHit?.(p);
      }
    }}
    state.meteorHazards=hazards.filter(m=>m.age<3.8);for(const s of scars)s.age+=dt;state.meteorScars=scars.filter(s=>s.age<18);
  }
  function glow(g,x,y,r,color,opacity){g.save();g.globalAlpha=clamp(opacity);const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,color);a.addColorStop(1,'rgba(255,90,10,0)');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
  function draw(g,state,w,h){
    if(state?.round!==1||state.intro||!window.heroGround)return;
    const point=(x,y)=>window.heroGround.sample(1,x,y,w,h);
    g.save();
    for(const scar of state.meteorScars||[]){const p=point(scar.x,scar.y);if(p.visible===false)continue;g.save();g.translate(p.x,p.y);g.scale(1,.4);g.globalAlpha=clamp(1-scar.age/18)*.65;const r=p.height*.25,a=g.createRadialGradient(0,0,0,0,0,r);a.addColorStop(0,'#17100c');a.addColorStop(.65,'#382015');a.addColorStop(1,'rgba(35,18,8,0)');g.fillStyle=a;g.fillRect(-r,-r,r*2,r*2);g.restore();}
    for(const m of state.meteorHazards||[]){
      const p=point(m.x,m.y),edge=point(m.x+m.radius,m.y),rx=Math.max(16,Math.abs(edge.x-p.x)),edgeY=point(m.x,m.y+m.radius),ry=Math.max(9,Math.abs(edgeY.y-p.y)),size=p.height*.24;
      if(p.visible===false)continue;
      if(m.age<2.1){
        const progress=clamp(m.age/2.1),fall=progress*progress;
        g.save();g.translate(p.x,p.y);g.strokeStyle='#ffbc73';g.lineWidth=2;g.globalAlpha=.5+Math.sin(m.age*16)*.22;g.fillStyle='rgba(255,76,15,.13)';g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.fill();g.stroke();g.globalAlpha=.95;g.beginPath();g.ellipse(0,0,rx,ry,0,-Math.PI/2,-Math.PI/2+progress*TAU);g.stroke();g.restore();
        const drift=(m.seed%2?1:-1)*w*.16,x=p.x+drift*(1-fall),y=p.y-h*.95*(1-fall);
        // Layered hot trail, sparks and tumbling photo-textured stone.
        for(let i=18;i>0;i--){const t=clamp(progress-i*.016),q=t*t,tx=p.x+drift*(1-q),ty=p.y-h*.95*(1-q);glow(g,tx,ty,size*(.45+i*.035),'#ff802a',(.5-i*.02)*progress);}
        glow(g,x,y,size*.85,'#ffd18b',.9);
        if(rock){g.save();g.translate(x,y);g.rotate(m.age*(m.seed%2?2:-2));g.drawImage(rock,-size/2,-size/2,size,size);g.restore();}
        g.fillStyle='#ffdc9e';for(let i=0;i<12;i++){const a=i*2.4+m.age*5,r=size*(.5+i*.1);g.globalAlpha=.6*(1-i/14);g.fillRect(x+Math.sin(a)*r,y-size-i*4,2,4);}g.globalAlpha=1;
      }else{
        const age=m.age-2.1,q=age/1.7;
        glow(g,p.x,p.y,size*(1+q*5),'#ffe1aa',Math.pow(1-q,4));
        g.strokeStyle='rgba(255,159,74,'+((1-q)*.7)+')';g.lineWidth=3*(1-q);g.beginPath();g.ellipse(p.x,p.y,rx*(.6+q*2.8),ry*(.6+q*2.8),0,0,TAU);g.stroke();
        for(let i=0;i<20;i++){const a=i*2.399,velocity=25+(i%5)*13,dx=Math.cos(a)*velocity*age,dy=-Math.abs(Math.sin(a))*velocity*age+age*age*55;g.globalAlpha=1-q;if(rock)g.drawImage(rock,p.x+dx-3,p.y+dy-3,5+i%4,5+i%4);}
        g.globalAlpha=1;
        for(let i=0;i<7;i++){const radius=size*(.55+q*1.7),x=p.x+Math.sin(i*2.4)*q*rx*1.4,y=p.y-age*28+Math.cos(i*1.8)*ry;g.save();g.globalAlpha=Math.sin(q*Math.PI)*.16;const dust=g.createRadialGradient(x,y,0,x,y,radius);dust.addColorStop(0,'#bda185');dust.addColorStop(1,'rgba(130,105,78,0)');g.fillStyle=dust;g.fillRect(x-radius,y-radius,radius*2,radius*2);g.restore();}
      }
    }
    g.restore();
  }
  window.heroMeteorHazards={update,draw};
})();
