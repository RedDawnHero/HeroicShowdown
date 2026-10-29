/* Shared photo-ground coordinates for actors, pickups, attacks and pointer input. */
(() => {
  'use strict';
  // Keep Ecal compact beside the taller cast, with all actors easier to see.
  window.heroCharacterSize = actor => 1.6896;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const lanes = {
    1: { far: [260, 1116, 478], near: [68, 1308, 748] },
    2: { far: [510, 810, 535], near: [245, 1115, 740] },
    3: { far: [230, 1146, 635], near: [90, 1286, 740] },
    4: { far: [540, 855, 555], near: [160, 1175, 740] },
    5: { far: [530, 845, 550], near: [160, 1170, 740] }
  };
  function frame(level, width, height) {
    const lane = lanes[level] || lanes[5];
    const cover = Math.max(width / 1376, height / 768);
    const ox = (width - 1376 * cover) / 2, oy = (height - 768 * cover) / 2;
    const margin = Math.min(width * .12, 82 * height / 610);
    const row = r => [clamp(ox + r[0] * cover, margin, width - margin), clamp(ox + r[1] * cover, margin, width - margin), clamp(oy + r[2] * cover, height * .57, height * .96)];
    return { far: row(lane.far), near: row(lane.near) };
  }
  function sample(level, gameX, gameY, width = 1000, height = 610) {
    if(window.heroTravelProjection)return window.heroTravelProjection(gameX,gameY,width,height);
    const rows = frame(level, width, height), depth = clamp((gameY - 82) / 492, 0, 1);
    const left = lerp(rows.far[0], rows.near[0], depth), right = lerp(rows.far[1], rows.near[1], depth);
    return { x: lerp(left, right, clamp((gameX - 34) / 932, 0, 1)), y: lerp(rows.far[2], rows.near[2], depth), depth, scale: lerp(.76, 1.12, depth), height: lerp(113, 167, depth) * height / 610 };
  }
  function unsample(level, x, y, width = 1000, height = 610) {
    if(window.heroTravelUnproject)return window.heroTravelUnproject(x,y,width,height);
    const rows = frame(level, width, height), depth = clamp((y - rows.far[2]) / Math.max(1, rows.near[2] - rows.far[2]), 0, 1);
    const left = lerp(rows.far[0], rows.near[0], depth), right = lerp(rows.far[1], rows.near[1], depth);
    return { x: 34 + clamp((x - left) / Math.max(1, right - left), 0, 1) * 932, y: 82 + depth * 492 };
  }
  function lift(actor, height) {
    const jump = actor.jump > 0 ? Math.sin(clamp((.76 - actor.jump) / .76, 0, 1) * Math.PI) * .44 : 0;
    const flight = actor.flying ? Math.min(2.4, (actor.flightHeight || 4.5) / 3) : 0;
    const climb = actor.climbing ? Math.min(110, actor.climbHeight || 0) / 110 * 1.5 : 0;
    return height * (jump + flight + climb);
  }
  function shadow(ctx, point, height, airLift = 0) {
    const alpha = .28 / (1 + airLift / Math.max(1, height));
    ctx.save(); ctx.translate(point.x, point.y); ctx.scale(height * .24, height * .065);
    const g = ctx.createRadialGradient(0, 0, .04, 0, 0, 1); g.addColorStop(0, 'rgba(4,7,10,' + alpha + ')'); g.addColorStop(.45, 'rgba(4,7,10,' + alpha * .7 + ')'); g.addColorStop(1, 'rgba(4,7,10,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function bolts(ctx, actor, level, width, height) {
    if(actor.hero==='ecal')for(const hit of actor.ecalImpacts||[]){
      const u=(Date.now()-hit.at)/750;if(u<0||u>=1)continue;
      const q=sample(level,hit.x,hit.y,width,height),r=q.height*(.12+u*.8),cy=q.y-q.height*.42;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-u;
      const glow=ctx.createRadialGradient(q.x,cy,0,q.x,cy,r);glow.addColorStop(0,'#ffffff');glow.addColorStop(.18,'#b5f8ff');glow.addColorStop(.4,'#ffb443');glow.addColorStop(1,'rgba(255,65,10,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(q.x,cy,r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#66eaff';ctx.lineWidth=3*(1-u);ctx.beginPath();ctx.ellipse(q.x,cy,r,r*.65,0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<16;i++){const a=i*2.399,dist=r*(.4+(i%4)*.22),x=q.x+Math.cos(a)*dist,y=cy+Math.sin(a)*dist+u*u*25;ctx.fillStyle=i%2?'#ffb45d':'#c9ffff';ctx.fillRect(x,y,Math.max(1,4*(1-u)),Math.max(1,4*(1-u)));}ctx.restore();
    }
    if (actor.hero !== 'ecal' || actor.action !== 'ecalBlast' || !(actor.actionTime > 0)) return;
    const from = sample(level, actor.x, actor.y, width, height), rise = lift(actor, from.height);
    const targets = actor.ecalBolts || (actor.ecalAim ? [actor.ecalAim, actor.ecalAim] : []);
    const progress = clamp(1 - actor.actionTime / (actor.ecalSkill?.duration||.34), 0, 1);
    ctx.save(); ctx.globalAlpha = Math.sin(progress * Math.PI) * .9; ctx.strokeStyle = '#8bf5ff'; ctx.shadowColor = '#00aaff'; ctx.shadowBlur = 12; ctx.lineWidth = Math.max(2, height / 300);
    targets.forEach((target, i) => { const to = sample(level, target.x, target.y, width, height); const sx = from.x + (i ? 1 : -1) * from.height * .19, sy = from.y - from.height * .32 - rise, ex = to.x, ey = to.y - to.height * .42; const head = clamp(progress * 2.5, 0, 1), tail = Math.max(0, head - .22); ctx.beginPath(); ctx.moveTo(lerp(sx, ex, tail), lerp(sy, ey, tail)); ctx.lineTo(lerp(sx, ex, head), lerp(sy, ey, head)); ctx.stroke(); });
    ctx.restore();
  }
  window.heroGround = { sample, unsample, lift, shadow, bolts };
})();
