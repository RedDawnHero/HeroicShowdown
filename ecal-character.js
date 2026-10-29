/* Ecal: a transparent portrait with a small articulated canvas deformation. */
(() => {
  'use strict';

  const image = new Image();
  const art = { source: null, width: 0, height: 0, top: .005, feet: .973, ready: false };
  const poses = new Map();
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const smooth = (low, high, value) => {
    const t = clamp((value - low) / (high - low), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const bell = (value, center, radius) => {
    const t = clamp(1 - Math.abs(value - center) / radius, 0, 1);
    return t * t * (3 - 2 * t);
  };

  image.onload = () => {
    const source = document.createElement('canvas');
    source.height = Math.min(768, image.naturalHeight);
    source.width = Math.round(source.height * image.naturalWidth / image.naturalHeight);
    const context = source.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    context.drawImage(image, 0, 0, source.width, source.height);
    // The cutout's actual boots establish the baseline. Local file browsers can
    // deny pixel reads; the known portrait proportions are the safe fallback.
    try {
      const pixels = context.getImageData(0, 0, source.width, source.height).data;
      let top = source.height, feet = 0;
      for (let y = 0; y < source.height; y++) {
        for (let x = 0; x < source.width; x++) {
          if (pixels[(y * source.width + x) * 4 + 3] < 160) continue;
          top = Math.min(top, y);
          if (x > source.width * .17 && x < source.width * .93) feet = Math.max(feet, y);
        }
      }
      if (feet > source.height * .8 && top < source.height * .2) {
        art.top = top / source.height;
        art.feet = (feet + 1) / source.height;
      }
    } catch (_) { /* A file URL still supports drawing the transparent PNG. */ }
    art.source = source;
    art.width = source.width;
    art.height = source.height;
    art.ready = true;
  };
  image.src = new URL('assets/ecal-character.png', document.currentScript?.src || location.href).href;

  function poseFor(player, time) {
    const key = String(player.id || 'ecal');
    let pose = poses.get(key);
    if (!pose) {
      pose = { time, phase: 0, motion: 0, face: 1, lean: 0 };
      poses.set(key, pose);
    }
    const dt = clamp(time - pose.time, 0, .06);
    pose.time = time;
    const fx = Number(player.fx) || 0, fy = Number(player.fy) || 0;
    const move = clamp(Number.isFinite(player.moveSpeed)?player.moveSpeed/110:Math.hypot(fx,fy),0,1);
    const blend = 1 - Math.exp(-dt * 10);
    pose.motion += (move - pose.motion) * blend;
    pose.phase += dt * (player.run ? 12 : 8) * pose.motion;
    pose.lean += (clamp(fx, -1, 1) - pose.lean) * blend;
    if (Math.abs(fx) > .05) pose.face = fx < 0 ? -1 : 1;
    else if (player.facing === 'left') pose.face = -1;
    else if (player.facing === 'right') pose.face = 1;
    else if (Number.isFinite(player.facing) && Math.abs(player.facing) > .05) {
      const side = player.facing === -1 || player.facing === 1 ? player.facing : Math.sin(player.facing);
      if (Math.abs(side) > .1) pose.face = side < 0 ? -1 : 1;
    }
    if (poses.size > 16) {
      for (const [id, old] of poses) if (time - old.time > 10) poses.delete(id);
    }
    return pose;
  }

  function triangle(context, a, b, c) {
    const determinant = (b.sx - a.sx) * (c.sy - a.sy) - (c.sx - a.sx) * (b.sy - a.sy);
    if (Math.abs(determinant) < .00001) return;
    const aa = ((b.x - a.x) * (c.sy - a.sy) - (c.x - a.x) * (b.sy - a.sy)) / determinant;
    const bb = ((b.y - a.y) * (c.sy - a.sy) - (c.y - a.y) * (b.sy - a.sy)) / determinant;
    const cc = ((c.x - a.x) * (b.sx - a.sx) - (b.x - a.x) * (c.sx - a.sx)) / determinant;
    const dd = ((c.y - a.y) * (b.sx - a.sx) - (b.y - a.y) * (c.sx - a.sx)) / determinant;
    const ee = a.x - aa * a.sx - cc * a.sy, ff = a.y - bb * a.sx - dd * a.sy;
    const cx = (a.x + b.x + c.x) / 3, cy = (a.y + b.y + c.y) / 3;
    const expanded = point => {
      const dx = point.x - cx, dy = point.y - cy, length = Math.hypot(dx, dy) || 1;
      return { x: point.x + dx / length * .22, y: point.y + dy / length * .22 };
    };
    const pa = expanded(a), pb = expanded(b), pc = expanded(c);
    context.save();
    context.beginPath();context.moveTo(pa.x, pa.y);context.lineTo(pb.x, pb.y);context.lineTo(pc.x, pc.y);context.closePath();context.clip();
    context.transform(aa, bb, cc, dd, ee, ff);
    const sx = Math.max(0, Math.floor(Math.min(a.sx, b.sx, c.sx)) - 1);
    const sy = Math.max(0, Math.floor(Math.min(a.sy, b.sy, c.sy)) - 1);
    const width = Math.min(art.width - sx, Math.ceil(Math.max(a.sx, b.sx, c.sx)) - sx + 1);
    const height = Math.min(art.height - sy, Math.ceil(Math.max(a.sy, b.sy, c.sy)) - sy + 1);
    context.drawImage(art.source, sx, sy, width, height, sx, sy, width, height);
    context.restore();
  }

  function glow(context, x, y, radius, intensity) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(226,255,255,' + intensity + ')');
    gradient.addColorStop(.2, 'rgba(89,237,255,' + intensity * .9 + ')');
    gradient.addColorStop(.5, 'rgba(0,159,255,' + intensity * .4 + ')');
    gradient.addColorStop(1, 'rgba(0,119,255,0)');
    context.fillStyle = gradient;
    context.beginPath();context.arc(x, y, radius, 0, Math.PI * 2);context.fill();
  }

  window.drawEcalCharacter = function drawEcalCharacter(context, player, x, y, height, time) {
    if (!art.ready || !context || !Number.isFinite(height) || height <= 0) return false;
    time = Number.isFinite(time) ? time : performance.now() / 1000;
    const pose = poseFor(player, time);
    const unit = height / Math.max(.7, art.feet - art.top);
    const aspect = art.width / art.height;
    const firing = player.action === 'ecalBlast' && player.actionTime > 0;
    const fireProgress = firing ? clamp(1 - player.actionTime / .34, 0, 1) : 1;
    const recoil = firing ? Math.sin(fireProgress * Math.PI) * Math.exp(-fireProgress * 2) : 0;
    const kick = player.action === 'kick' && player.actionTime > 0 ? Math.sin(clamp(1 - player.actionTime / .38, 0, 1) * Math.PI) : 0;
    const jumpProgress = clamp((.76 - (player.jump || 0)) / .76, 0, 1);
    const jump = player.jump > 0 ? Math.sin(jumpProgress * Math.PI) * height * .4 : 0;
    const block = player.blocking ? 1 : 0;
    const raised = player.ecalRaised || firing ? 1 : 0;
    const dodge = clamp((player.dodge || 0) / .55, 0, 1);
    const leftStep = Math.sin(pose.phase), rightStep = -leftStep;
    const breathe = Math.sin(time * 2.2) * .0017;
    const bounce = Math.sin(pose.phase * 2) * .0025 * pose.motion;

    // Every vertex shares the same smooth displacement field. The clipped
    // triangles keep the detailed armor continuous at elbows and knees.
    function point(u, v) {
      const upper = 1 - smooth(.52, .9, v);
      const torso = bell(u, .52, .28) * bell(v, .45, .28);
      let ox = (.008 * pose.lean + dodge * .018 * pose.face) * upper;
      let oy = -(breathe + bounce) * upper + dodge * .014 * upper;
      ox += (u - .52) * breathe * 2 * torso;
      const legWeight = smooth(.53, .75, v);
      const kneeWeight = bell(v, .74, .19);
      for (const [side, step, center] of [[-1, leftStep, .34], [1, rightStep, .7]]) {
        const lateral = bell(u, center, v > .84 ? .24 : .18);
        const leg = lateral * legWeight;
        const lift = Math.pow(Math.max(0, step), 1.4) * pose.motion;
        ox += leg * step * pose.motion * (.033 + kneeWeight * .026);
        oy -= leg * lift * .075;
        if (side === 1) { ox += leg * kick * .055; oy -= leg * kick * (.035 + kneeWeight * .028); }
      }
      const armBand = smooth(.33, .48, v) * (1 - smooth(.68, .77, v));
      for (const [side, step, center] of [[-1, rightStep, .265], [1, leftStep, .755]]) {
        const arm = bell(u, center, .125) * armBand;
        const reach = smooth(.39, .64, v);
        ox += arm * reach * (step * pose.motion * .038 - side * block * .016 - side * recoil * .012);
        oy += arm * reach * (Math.cos(pose.phase + (side > 0 ? Math.PI : 0)) * pose.motion * .018 - recoil * .018 - block * .018 - raised * .14);
      }
      // Ecal's tail gets a travelling wave from its root to its free tip.
      const tailMask=bell(u,.14,.13)*smooth(.61,.72,v)*(1-smooth(.91,.96,v));
      const tailPhase=(v-.61)*12;
      ox+=tailMask*Math.sin(time*(1.7+pose.motion*1.8)-tailPhase)*(.018+.019*pose.motion);
      oy+=tailMask*Math.cos(time*1.5-tailPhase)*.006;
      // The cloak, scarf and tail have a quieter wind motion than the limbs.
      const edge = smooth(.22, .42, Math.abs(u - .5)) * bell(v, .56, .4);
      ox += Math.sin(time * 2.7 + v * 9) * edge * .004;
      return { sx: u * art.width, sy: v * art.height, x: ((u - .5) * aspect + ox) * unit, y: (v - art.feet + oy) * unit };
    }

    context.save();
    if (player.ecalShadow !== false) {
      context.save();context.translate(x, y);
      const spread = height * (.145 + jump / height * .035);
      context.scale(1, .22);
      const shadow = context.createRadialGradient(0, 0, 0, 0, 0, spread);
      shadow.addColorStop(0, 'rgba(4,8,11,' + (.34 * (1 - jump / height)) + ')');
      shadow.addColorStop(1, 'rgba(4,8,11,0)');
      context.fillStyle = shadow;context.beginPath();context.arc(0, 0, spread, 0, Math.PI * 2);context.fill();context.restore();
    }
    context.translate(x, y - jump);
    context.scale(pose.face * (1 - Math.abs(pose.lean) * .045), 1);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.globalAlpha *= player.buried ? .5 : 1;
    const columns = 12, rows = 26, grid = [];
    for (let row = 0; row <= rows; row++) {
      const line = [];
      for (let col = 0; col <= columns; col++) line.push(point(col / columns, row / rows));
      grid.push(line);
    }
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const a = grid[row][col], b = grid[row][col + 1], c = grid[row + 1][col], d = grid[row + 1][col + 1];
      triangle(context, a, b, c);triangle(context, b, d, c);
    }
    context.globalCompositeOperation = 'screen';
    const chest = point(.55, .337);
    glow(context, chest.x, chest.y, height * .025, .16 + .06 * Math.sin(time * 3));
    if (firing) {
      for (const [index, u, v] of [[0, .197, .678], [1, .821, .701]]) {
        const muzzle = point(u, v);
        const pulse = .5 + .5 * Math.sin(fireProgress * 18 + index * .7);
        glow(context, muzzle.x, muzzle.y, height * (.036 + pulse * .027), (1 - fireProgress) * .95);
      }
    }
    context.restore();
    return true;
  };
  Object.defineProperties(window.drawEcalCharacter, {
    ready: { get: () => art.ready },
    image: { get: () => image },
    feet: { get: () => art.feet }
  });
})();
