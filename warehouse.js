// Level 1's burned warehouse. Geometry stays outside the playable boundary;
// floor details and particles leave the fight and the clinic accessible.
window.createWarehouseArena = function (THREE) {
  const group = new THREE.Group();
  group.name = 'Level 1 — burned warehouse';
  let seed = 68194;
  const random = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
  const material = (color, roughness = .8, metalness = .12) => new THREE.MeshStandardMaterial({color, roughness, metalness, envMapIntensity: .35});
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const box = (parent, size, mat, position) => {
    const mesh = new THREE.Mesh(boxGeometry, mat);
    mesh.scale.set(...size); mesh.position.set(...position);
    mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const canvasTexture = (size, paint) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    paint(canvas.getContext('2d'), size);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4; return texture;
  };
  const concreteMap = canvasTexture(1024, (g, n) => {
    g.fillStyle = '#515c5c'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 18000; i++) {
      const v = Math.floor(45 + random() * 90);
      g.fillStyle = `rgba(${v},${v + 5},${v + 5},${.08 + random() * .3})`;
      g.fillRect(random() * n, random() * n, 1 + random() * 5, 1 + random() * 4);
    }
    for (let i = 0; i < 70; i++) {
      const x = random() * n, y = random() * n, radius = 15 + random() * 100;
      const stain = g.createRadialGradient(x, y, 1, x, y, radius);
      stain.addColorStop(0, i % 3 ? '#131d1c44' : '#51463355'); stain.addColorStop(1, '#17252600');
      g.fillStyle = stain; g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    for (let i = 0; i < 28; i++) {
      let x = random() * n, y = random() * n;
      g.strokeStyle = '#152020bb'; g.lineWidth = .7 + random() * 1.5;
      g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 9; j++) { x += (random() - .45) * 29; y += random() * 23; g.lineTo(x, y); }
      g.stroke();
    }
  });
  concreteMap.wrapS = concreteMap.wrapT = THREE.RepeatWrapping; concreteMap.repeat.set(8, 9);
  const concrete = material(0xabb7b5, .83, .14); concrete.map = concreteMap;
  concrete.bumpMap = concreteMap; concrete.bumpScale = .035;
  const wallMap = canvasTexture(512, (g, n) => {
    g.fillStyle = '#42433e'; g.fillRect(0, 0, n, n);
    for (let y = 0; y < n; y += 25) for (let x = -60; x < n; x += 86) {
      const v = 48 + Math.floor(random() * 32);
      g.fillStyle = `rgb(${v + 20},${v + 6},${v})`;
      g.fillRect(x + (y % 50 ? 43 : 0), y, 82, 22);
    }
    for (let i = 0; i < 120; i++) {
      g.fillStyle = `rgba(8,19,20,${random() * .4})`;
      g.fillRect(random() * n, 0, 2 + random() * 24, random() * n);
    }
  });
  wallMap.wrapS = wallMap.wrapT = THREE.RepeatWrapping; wallMap.repeat.set(2, 2);
  const brick = material(0x9a9992); brick.map = wallMap; brick.bumpMap = wallMap; brick.bumpScale = .075;
  const steel = material(0x283b3d, .68, .72), rust = material(0x694538, .9, .35);
  const black = material(0x151d1c, .93), rail = material(0x6b6560, .4, .8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(66, 74), concrete);
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -.055, -10);
  floor.receiveShadow = true; group.add(floor);

  // Flush rail grooves and expansion joints continue into the far end of the hall.
  for (const x of [-10.6, -8.3, -1.15, 1.15, 8.3, 10.6]) {
    box(group, [.16, .018, 71], black, [x, -.038, -10]);
    box(group, [.055, .024, 71], rail, [x + .045, -.022, -10]);
  }
  for (let z = -43; z < 25; z += 7) box(group, [64, .008, .024], black, [0, -.044, z]);
  for (const x of [-24, -16, 16, 24]) box(group, [.021, .008, 72], black, [x, -.044, -10]);

  // Daylit panes are instanced; broken sections remain dark among the mullions.
  const panes = new THREE.InstancedMesh(boxGeometry, new THREE.MeshBasicMaterial({color: 0xd2e6e7, transparent: true, opacity: .58}), 1200);
  const dummy = new THREE.Object3D(); let paneCount = 0;
  const frame = (parent, width, height) => {
    box(parent, [width + .18, .14, .18], steel, [0, -height / 2, 0]);
    box(parent, [width + .18, .14, .18], steel, [0, height / 2, 0]);
    for (let x = -width / 2; x <= width / 2 + .01; x += width / 4) box(parent, [.065, height, .13], steel, [x, 0, 0]);
    for (let y = -height / 2; y <= height / 2 + .01; y += height / 5) box(parent, [width, .055, .13], steel, [0, y, 0]);
    parent.updateMatrixWorld(true);
    for (let col = 0; col < 4; col++) for (let row = 0; row < 5; row++) {
      if (random() < .22) continue;
      dummy.position.set((col - 1.5) * width / 4, (row - 2) * height / 5, -.055);
      dummy.rotation.set(0, 0, 0); dummy.scale.set(width / 4 - .08, height / 5 - .07, .025);
      dummy.updateMatrix(); dummy.matrix.premultiply(parent.matrixWorld);
      panes.setMatrixAt(paneCount, dummy.matrix);
      panes.setColorAt(paneCount++, new THREE.Color().setHSL(.49 + random() * .05, .12, .56 + random() * .32));
    }
  };
  for (const side of [-1, 1]) {
    box(group, [.7, 2.4, 72], brick, [side * 32.2, 1.15, -10]);
    box(group, [.7, 2.1, 72], brick, [side * 32.2, 10.2, -10]);
    box(group, [.7, 1.1, 72], black, [side * 32.2, 14.6, -10]);
    for (let z = -42; z <= 22; z += 8) {
      // Steel I columns and corroded masonry between each pair of windows.
      box(group, [.45, 14.8, .45], steel, [side * 31.8, 7.4, z]);
      box(group, [.8, 14.8, .12], steel, [side * 31.8, 7.4, z - .25]);
      box(group, [.8, .25, .95], rust, [side * 31.8, .14, z]);
      if (z === 22) continue;
      box(group, [.7, 7, 1.6], brick, [side * 32.2, 5.8, z]);
      const lower = new THREE.Group(); lower.position.set(side * 31.76, 5.85, z + 4);
      lower.rotation.y = -side * Math.PI / 2; group.add(lower); frame(lower, 5.6, 6.5);
      const upper = new THREE.Group(); upper.position.set(side * 31.76, 12.55, z + 4);
      upper.rotation.y = -side * Math.PI / 2; group.add(upper); frame(upper, 5.6, 1.9);
    }
    box(group, [.45, .55, 72], steel, [side * 31.4, 11.3, -10]);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, 69, 10), rust);
    pipe.rotation.x = Math.PI / 2; pipe.position.set(side * 31, 2.45, -10); group.add(pipe);
  }
  box(group, [65, 8.5, .65], brick, [0, 4.2, -46]);
  box(group, [65, 3, .65], black, [0, 13.5, -46]);
  for (const x of [-24, -12, 0, 12, 24]) {
    const rearWindow = new THREE.Group(); rearWindow.position.set(x, 10.1, -45.6); group.add(rearWindow); frame(rearWindow, 9.4, 2.5);
  }
  // The opposite end remains visible when the player turns around.
  box(group, [65, 2.5, .6], brick, [0, 1.2, 26]);
  box(group, [65, 3, .6], black, [0, 13.5, 26]);
  for (const x of [-26, -13, 0, 13, 26]) {
    const nearWindow = new THREE.Group(); nearWindow.position.set(x, 7, 25.65);
    nearWindow.rotation.y = Math.PI; group.add(nearWindow); frame(nearWindow, 10.6, 8.5);
    box(group, [.65, 14, .8], steel, [x - 6.1, 7, 25.7]);
  }
  panes.count = paneCount; panes.instanceMatrix.needsUpdate = true; group.add(panes);
  box(group, [10, 5, .22], black, [0, 2.5, -45.5]);
  for (let y = .2; y < 5; y += .27) box(group, [9.7, .07, .08], steel, [0, y, -45.3]);
  // High trusses and broken roof panels leave room for flight and every camera view.
  for (let z = -42; z < 24; z += 11) {
    box(group, [64, .36, .45], steel, [0, 14.1, z]);
    for (let x = -28; x <= 28; x += 8) {
      const brace = box(group, [8.15, .15, .17], rust, [x, 14.75, z]); brace.rotation.z = x % 16 ? -.14 : .14;
    }
  }
  for (const x of [-25, -12, 12, 25]) box(group, [9.5, .18, 73], black, [x, 15.2, -10]);

  const puddleMap = canvasTexture(256, (g, n) => {
    const glow = g.createRadialGradient(n / 2, n / 2, 12, n / 2, n / 2, n / 2);
    glow.addColorStop(0, '#ffffffbb'); glow.addColorStop(.68, '#ffffff88'); glow.addColorStop(1, '#ffffff00');
    g.fillStyle = glow; g.beginPath();
    for (let i = 0; i <= 32; i++) { const a = i / 32 * Math.PI * 2, r = 90 + random() * 30; g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); }
    g.closePath(); g.fill();
  });
  const puddleMat = new THREE.MeshStandardMaterial({color: 0x657c7c, map: puddleMap, transparent: true, opacity: .35, roughness: .17, metalness: .75, depthWrite: false, envMapIntensity: .7});
  const plane = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < 42; i++) {
    const puddle = new THREE.Mesh(plane, puddleMat);
    puddle.rotation.set(-Math.PI / 2, 0, random() * Math.PI);
    puddle.position.set((random() - .5) * 58, -.029, random() * 65 - 43);
    puddle.scale.set(1.8 + random() * 5, 1 + random() * 3, 1); group.add(puddle);
  }
  const debris = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), material(0x8c8b80), 310);
  let debrisCount = 0;
  for (let i = 0; i < 310; i++) {
    const x = (random() - .5) * 61, z = random() * 67 - 44;
    if (Math.hypot(x + 17.6, z - 11.55) < 4) continue;
    const edge = Math.abs(x) > 27 || z < -17;
    const size = edge ? .15 + random() * .65 : .025 + random() * .13;
    dummy.position.set(x, size * .24 - .025, z); dummy.scale.set(size, size * .35, size * .7);
    dummy.rotation.set(random(), random() * 6, random()); dummy.updateMatrix();
    debris.setMatrixAt(debrisCount, dummy.matrix); debris.setColorAt(debrisCount++, new THREE.Color().setHSL(.1, .08, .2 + random() * .28));
  }
  debris.count = debrisCount; debris.receiveShadow = true; group.add(debris);
  const shards = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(1), material(0x8ebbb9, .2, .5), 150);
  for (let i = 0; i < 150; i++) {
    dummy.position.set((i % 2 ? -1 : 1) * (27 + random() * 4), .005, random() * 66 - 43);
    dummy.rotation.set(0, random() * 6, 0); dummy.scale.set(.04 + random() * .2, .012, .08 + random() * .25); dummy.updateMatrix(); shards.setMatrixAt(i, dummy.matrix);
  }
  group.add(shards);
  for (const [x, z] of [[-27, -22], [26, -8], [-28, 18], [18, -35]]) {
    const scrap = box(group, [2.8, .12, 1.5], rust, [x, .35, z]); scrap.rotation.set(.22, random() * 4, .28);
    box(group, [.16, 1.3, .15], steel, [x + .7, .65, z]);
    box(group, [1.8, .8, 1.2], black, [x - 1, .4, z - 1.4]);
  }

  const glowMap = canvasTexture(128, (g, n) => {
    const fade = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    fade.addColorStop(0, '#ffffff'); fade.addColorStop(.3, '#ffffffaa'); fade.addColorStop(1, '#ffffff00'); g.fillStyle = fade; g.fillRect(0, 0, n, n);
  });
  const flameMap = canvasTexture(128, (g, n) => {
    for (let i = 0; i < 12; i++) {
      const x = 36 + random() * 56, y = 58 + random() * 55;
      const fire = g.createRadialGradient(x, y, 1, x, y, 18 + random() * 20);
      fire.addColorStop(0, '#fff6bbee'); fire.addColorStop(.3, '#ffba45cc'); fire.addColorStop(.62, '#f9481288'); fire.addColorStop(1, '#e82e0000');
      g.fillStyle = fire; g.fillRect(0, 0, n, n);
    }
    const tongue = g.createLinearGradient(0, 0, 0, n); tongue.addColorStop(0, '#ffbe4200'); tongue.addColorStop(.65, '#ffae3977'); tongue.addColorStop(1, '#fff2aacc');
    g.fillStyle = tongue; g.beginPath(); g.moveTo(42, 115); g.quadraticCurveTo(81, 66, 64, 5); g.quadraticCurveTo(101, 68, 85, 116); g.fill();
  });
  const fires = [];
  for (const [x, z, size] of [[-8, -7, 1.35], [8, -19, 1.7], [-23, -28, 1.15], [23, 5, 1.05], [-7, 17, .7]]) {
    const root = new THREE.Group(); root.position.set(x, 0, z); group.add(root);
    const scorch = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({map: glowMap, color: 0x080807, transparent: true, opacity: .85, depthWrite: false}));
    scorch.rotation.x = -Math.PI / 2; scorch.position.y = -.018; scorch.scale.set(5 * size, 4 * size, 1); root.add(scorch);
    const tongues = [], smoke = [];
    for (let i = 0; i < 6; i++) {
      const flame = new THREE.Sprite(new THREE.SpriteMaterial({map: flameMap, color: 0xffc67d, transparent: true, opacity: .82, blending: THREE.AdditiveBlending, depthWrite: false}));
      flame.position.set((random() - .5) * 1.8 * size, .7 * size, (random() - .5) * size);
      flame.userData.phase = random() * 6; root.add(flame); tongues.push(flame);
    }
    for (let i = 0; i < 7; i++) {
      const puff = new THREE.Sprite(new THREE.SpriteMaterial({map: glowMap, color: i % 2 ? 0x343c3a : 0x252d2c, transparent: true, opacity: .22, depthWrite: false}));
      puff.userData.phase = i / 7; root.add(puff); smoke.push(puff);
    }
    const light = new THREE.PointLight(0xff8a39, 17 * size, 12, 2); light.position.set(0, 1.5, 0); root.add(light);
    fires.push({root, tongues, smoke, light, size, phase: random() * 10});
  }
  // Soft daylight shafts cross the haze without blocking characters.
  const beams = [];
  for (const side of [-1, 1]) for (const z of [-30, -9, 12]) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([side * 31, 9, z - 1, side * 31, 9, z + 1, side * 16, .1, z + 12, side * 16, .1, z + 5], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2)); geo.setIndex([0, 1, 2, 0, 2, 3]); geo.computeVertexNormals();
    const beam = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({map: glowMap, color: 0xb9d8d8, transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide})); group.add(beam); beams.push(beam);
    const pool = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({map: glowMap, color: 0xc6dede, transparent: true, opacity: .12, depthWrite: false}));
    pool.rotation.x = -Math.PI / 2; pool.position.set(side * 17, -.012, z + 8); pool.scale.set(7, 9, 1); group.add(pool);
  }
  const emberCount = 150, positions = new Float32Array(emberCount * 3), emberData = [];
  for (let i = 0; i < emberCount; i++) emberData.push({fire: fires[i % fires.length], phase: random(), drift: random() * 5, speed: .08 + random() * .12});
  const emberGeometry = new THREE.BufferGeometry(); emberGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const embers = new THREE.Points(emberGeometry, new THREE.PointsMaterial({map: glowMap, color: 0xffa44d, size: .095, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false}));
  embers.frustumCulled = false; group.add(embers);
  // Batch hundreds of static window bars, rails and beams by material.
  group.updateMatrixWorld(true);
  const batches = new Map();
  group.traverse(object => {
    if (!object.isMesh || object.isInstancedMesh || object.geometry !== boxGeometry) return;
    if (!batches.has(object.material)) batches.set(object.material, []);
    batches.get(object.material).push(object);
  });
  for (const [mat, parts] of batches) {
    const batch = new THREE.InstancedMesh(boxGeometry, mat, parts.length);
    parts.forEach((part, i) => { batch.setMatrixAt(i, part.matrixWorld); part.parent.remove(part); });
    batch.receiveShadow = true; batch.instanceMatrix.needsUpdate = true; group.add(batch);
  }
  group.visible = false;
  return {group, update(t) {
    if (!group.visible) return;
    for (const fire of fires) {
      const phase = t * 7 + fire.phase;
      fire.light.intensity = fire.size * (16 + Math.sin(phase) * 2.5 + Math.sin(phase * 2.3));
      fire.tongues.forEach(flame => {
        const f = phase + flame.userData.phase, h = (1.6 + Math.sin(f) * .32) * fire.size;
        flame.scale.set((1.1 + Math.cos(f * .7) * .14) * fire.size, h, 1);
        flame.position.y = h * .43; flame.material.rotation = Math.sin(f * .6) * .12;
      });
      fire.smoke.forEach(puff => {
        const p = (t * .095 + puff.userData.phase + fire.phase * .1) % 1;
        puff.position.set(Math.sin(t * .45 + p * 4) * p * 2, 1.2 + p * 10, p * 1.6);
        puff.scale.setScalar((1.3 + p * 4) * fire.size);
        puff.material.opacity = Math.sin(p * Math.PI) * .24; puff.material.rotation = p * .6;
      });
    }
    emberData.forEach((ember, i) => {
      const p = (t * ember.speed + ember.phase) % 1, base = ember.fire.root.position;
      positions[i * 3] = base.x + Math.sin(t + ember.drift) * p * 1.6;
      positions[i * 3 + 1] = .4 + p * 6;
      positions[i * 3 + 2] = base.z + Math.cos(t * .4 + ember.drift) * p * 1.8;
    });
    emberGeometry.attributes.position.needsUpdate = true;
    beams.forEach((beam, i) => { beam.material.opacity = .065 + Math.sin(t * .3 + i) * .008; });
  }};
};
