// Level 1's burning forest dimension. The supplied art remains the cinematic
// horizon while lightweight geometry and particles give the arena real motion.
window.createMeteorLevel = function (THREE) {
  const group = new THREE.Group();
  group.name = 'Level 1 — meteor forest dimension';
  group.visible = false;

  let seed = 16080453;
  const random = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
  const material = (color, roughness = .9, metalness = .04) => new THREE.MeshStandardMaterial({color, roughness, metalness});
  const darkRock = material(0x302a27, .96), hotRock = new THREE.MeshStandardMaterial({color: 0x2b1710, emissive: 0xff4b12, emissiveIntensity: 1.8, roughness: .86});
  const charred = material(0x171b18, 1), bark = material(0x241b17, 1), pine = material(0x17251d, .98);
  const dummy = new THREE.Object3D();

  function canvasTexture(size, draw) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    draw(canvas.getContext('2d'), size);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const glowMap = canvasTexture(128, (g, n) => {
    const fade = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    fade.addColorStop(0, '#fffbe8'); fade.addColorStop(.16, '#ffd178ee'); fade.addColorStop(.42, '#ff5a18aa'); fade.addColorStop(1, '#ee240000');
    g.fillStyle = fade; g.fillRect(0, 0, n, n);
  });
  const smokeMap = canvasTexture(128, (g, n) => {
    g.clearRect(0, 0, n, n);
    for (let i = 0; i < 18; i++) {
      const x = 30 + random() * 68, y = 28 + random() * 75, radius = 13 + random() * 27;
      const puff = g.createRadialGradient(x, y, 1, x, y, radius);
      puff.addColorStop(0, '#1c1716bb'); puff.addColorStop(.45, '#2b242399'); puff.addColorStop(1, '#28201f00');
      g.fillStyle = puff; g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  });

  // Dark earth and lava-lit patches frame the arena without raising collision obstacles.
  const groundMap = canvasTexture(512, (g, n) => {
    g.fillStyle = '#292823'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 2100; i++) {
      const shade = 28 + Math.floor(random() * 35);
      g.fillStyle = `rgba(${shade + 12},${shade + 4},${shade},${.08 + random() * .24})`;
      g.beginPath(); g.ellipse(random() * n, random() * n, 1 + random() * 12, 1 + random() * 7, random() * 6, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 24; i++) {
      let x = random() * n, y = random() * n;
      g.strokeStyle = i % 3 ? '#151a18cc' : '#7b291599'; g.lineWidth = .7 + random() * 2;
      g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 8; j++) { x += (random() - .5) * 31; y += 10 + random() * 20; g.lineTo(x, y); }
      g.stroke();
    }
  });
  groundMap.wrapS = groundMap.wrapT = THREE.RepeatWrapping; groundMap.repeat.set(8, 11);
  const groundMaterial = material(0x4d4940, .98); groundMaterial.map = groundMap; groundMaterial.bumpMap = groundMap; groundMaterial.bumpScale = .055;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(76, 102), groundMaterial);
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -.075, -16); floor.receiveShadow = true; group.add(floor);

  // Low mountain silhouettes and two swaying forest banks keep the central combat lane open.
  const mountainGeometry = new THREE.ConeGeometry(1, 2.1, 5);
  for (let i = 0; i < 18; i++) {
    const mountain = new THREE.Mesh(mountainGeometry, darkRock);
    const x = -44 + i * 5.2, height = 8 + random() * 12;
    mountain.position.set(x, height * .42 - .2, -55 - random() * 7);
    mountain.scale.set(5 + random() * 5, height, 3 + random() * 4);
    mountain.rotation.y = random() * .45; group.add(mountain);
  }
  const forestBanks = [];
  const trunkGeometry = new THREE.CylinderGeometry(.09, .18, 1, 6);
  const crownGeometry = new THREE.ConeGeometry(1, 2.8, 7);
  for (const side of [-1, 1]) {
    const bank = new THREE.Group(); bank.userData.side = side; group.add(bank); forestBanks.push(bank);
    const count = 52, trunks = new THREE.InstancedMesh(trunkGeometry, bark, count), crowns = new THREE.InstancedMesh(crownGeometry, pine, count);
    for (let i = 0; i < count; i++) {
      const rear = i > 39, x = rear ? side * (17 + random() * 18) : side * (28 + random() * 8);
      const z = rear ? -45 - random() * 10 : 23 - random() * 78;
      const height = 3.2 + random() * 4.2;
      dummy.position.set(x, height * .26, z); dummy.rotation.set(0, random() * 6, 0); dummy.scale.set(1, height * .52, 1); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, height * .69, z); dummy.scale.set(1.05 + random() * .85, height * .52, 1.05 + random() * .85); dummy.updateMatrix(); crowns.setMatrixAt(i, dummy.matrix);
    }
    trunks.receiveShadow = crowns.receiveShadow = true; bank.add(trunks, crowns);
  }

  // Scattered rocks live along the boundaries and subtly tremble during impacts.
  const edgeRocks = new THREE.Group(); group.add(edgeRocks);
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const rockMeshes = [];
  for (let i = 0; i < 76; i++) {
    const rock = new THREE.Mesh(rockGeometry, darkRock);
    const side = i % 2 ? -1 : 1, size = .18 + random() * .75;
    rock.position.set(side * (26.5 + random() * 8.5), size * .28, 24 - random() * 79);
    rock.scale.set(size, size * (.35 + random() * .35), size * (.65 + random() * .55));
    rock.rotation.set(random(), random() * 6, random()); rock.userData.baseY = rock.position.y; rock.userData.phase = random() * 8;
    rock.receiveShadow = true; edgeRocks.add(rock); rockMeshes.push(rock);
  }

  const meteors = [];
  const meteorGeometry = new THREE.DodecahedronGeometry(.56, 1);
  const impactGeometry = new THREE.RingGeometry(.45, .76, 32);
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? -1 : 1;
    const end = new THREE.Vector3(side * (22.5 + random() * 9), .35, 20 - random() * 71);
    const start = new THREE.Vector3(end.x - side * (10 + random() * 18), 23 + random() * 15, end.z - 18 - random() * 18);
    const root = new THREE.Group(); group.add(root);
    const body = new THREE.Mesh(meteorGeometry, hotRock); body.castShadow = true; root.add(body);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({map: glowMap, color: 0xff7a2d, transparent: true, opacity: .88, blending: THREE.AdditiveBlending, depthWrite: false}));
    halo.scale.set(3.1, 3.1, 1); root.add(halo);
    const trails = [];
    for (let j = 0; j < 8; j++) {
      const fiery = j < 3;
      const trail = new THREE.Sprite(new THREE.SpriteMaterial({map: fiery ? glowMap : smokeMap, color: fiery ? 0xff7a2c : 0x342a27, transparent: true, opacity: fiery ? .55 - j * .09 : .24, blending: fiery ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false}));
      const size = fiery ? 2.5 - j * .35 : 2.1 + j * .38; trail.scale.set(size, size, 1); group.add(trail); trails.push(trail);
    }
    const impactMaterial = new THREE.MeshBasicMaterial({color: 0xff6a25, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide});
    const ring = new THREE.Mesh(impactGeometry, impactMaterial); ring.rotation.x = -Math.PI / 2; ring.position.copy(end); ring.position.y = .015; group.add(ring);
    const impactGlow = new THREE.Sprite(new THREE.SpriteMaterial({map: glowMap, color: 0xff5a20, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false}));
    impactGlow.position.copy(end); impactGlow.position.y = .4; group.add(impactGlow);
    let light = null;
    if (i < 6) { light = new THREE.PointLight(0xff5722, 0, 10, 2); light.position.copy(end); light.position.y = 1.1; group.add(light); }
    meteors.push({root, body, halo, trails, ring, impactGlow, light, start, end, phase: random(), speed: .035 + random() * .025, spin: (random() - .5) * 2.6});
  }

  // Smaller rock fragments keep falling between the large meteor strikes.
  const fragments = [];
  for (let i = 0; i < 34; i++) {
    const mesh = new THREE.Mesh(rockGeometry, i % 4 ? darkRock : hotRock);
    const side = i % 2 ? -1 : 1;
    mesh.scale.setScalar(.07 + random() * .18); group.add(mesh);
    fragments.push({mesh, x: side * (20 + random() * 15), z: 20 - random() * 74, height: 9 + random() * 15, phase: random(), speed: .09 + random() * .12, drift: (random() - .5) * 6});
  }

  // Embers rise from edge fires and make the whole dimension feel alive.
  const emberCount = 260, emberPositions = new Float32Array(emberCount * 3), emberData = [];
  for (let i = 0; i < emberCount; i++) emberData.push({x: (i % 2 ? -1 : 1) * (21 + random() * 13), z: 23 - random() * 76, y: random() * 12, speed: .35 + random() * .75, phase: random() * 9});
  const emberGeometry = new THREE.BufferGeometry(); emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
  const embers = new THREE.Points(emberGeometry, new THREE.PointsMaterial({map: glowMap, color: 0xff843f, size: .13, transparent: true, opacity: .82, blending: THREE.AdditiveBlending, depthWrite: false}));
  embers.frustumCulled = false; group.add(embers);

  let backdrop = new THREE.Color(0x4a2119);
  new THREE.TextureLoader().load('assets/level-one-meteor.jpg', loaded => {
    loaded.colorSpace = THREE.SRGBColorSpace;
    backdrop = loaded;
  });

  const pointOnFlight = (meteor, progress, target) => {
    target.lerpVectors(meteor.start, meteor.end, progress);
    target.y += Math.sin(progress * Math.PI) * 2.2;
    return target;
  };
  const scratch = new THREE.Vector3();

  return {
    group,
    get background() { return backdrop; },
    update(t, aspect) {
      if (backdrop.isTexture && backdrop.image) {
        const imageAspect = backdrop.image.width / backdrop.image.height;
        backdrop.repeat.set(Math.min(1, aspect / imageAspect), Math.min(1, imageAspect / aspect));
        backdrop.offset.set((1 - backdrop.repeat.x) / 2, (1 - backdrop.repeat.y) / 2);
      }

      forestBanks.forEach((bank, i) => { bank.rotation.z = Math.sin(t * .42 + i * 1.7) * .0025; });
      const quake = Math.max(0, Math.sin(t * 1.18) - .91) * .06;
      rockMeshes.forEach(rock => { rock.position.y = rock.userData.baseY + Math.sin(t * 11 + rock.userData.phase) * quake; });

      meteors.forEach((meteor, index) => {
        const progress = (t * meteor.speed + meteor.phase) % 1;
        pointOnFlight(meteor, progress, meteor.root.position);
        meteor.body.rotation.set(t * meteor.spin, t * meteor.spin * .73, t * meteor.spin * .41);
        const flightFade = Math.min(1, (1 - progress) * 10);
        meteor.root.scale.setScalar(.72 + index % 4 * .12); meteor.halo.material.opacity = .88 * flightFade;
        meteor.trails.forEach((trail, j) => {
          const trailProgress = progress - (j + 1) * .018;
          trail.visible = trailProgress > 0;
          if (trail.visible) {
            pointOnFlight(meteor, trailProgress, trail.position);
            trail.position.y += Math.sin(t * 1.7 + index + j) * .12;
            trail.material.rotation = Math.sin(t * .3 + j) * .16;
          }
        });
        const impact = Math.max(0, (progress - .875) / .125);
        meteor.ring.visible = meteor.impactGlow.visible = impact > 0;
        if (impact > 0) {
          const fade = 1 - impact;
          meteor.ring.scale.setScalar(1 + impact * 5.8); meteor.ring.material.opacity = fade * .82;
          meteor.impactGlow.scale.setScalar(2.3 + Math.sin(impact * Math.PI) * 5.3); meteor.impactGlow.material.opacity = Math.sin(impact * Math.PI) * .92;
          if (meteor.light) meteor.light.intensity = Math.sin(impact * Math.PI) * 34;
        } else if (meteor.light) meteor.light.intensity = 0;
      });

      fragments.forEach((fragment, i) => {
        const progress = (t * fragment.speed + fragment.phase) % 1;
        fragment.mesh.position.set(fragment.x + fragment.drift * progress, fragment.height * (1 - progress) + .12, fragment.z + progress * 7);
        fragment.mesh.rotation.set(t * (1.3 + i % 3), t * (.9 + i % 4), progress * 8);
      });

      emberData.forEach((ember, i) => {
        emberPositions[i * 3] = ember.x + Math.sin(t * .7 + ember.phase) * 1.4;
        emberPositions[i * 3 + 1] = ((ember.y + t * ember.speed) % 12) + .15;
        emberPositions[i * 3 + 2] = ember.z + Math.cos(t * .33 + ember.phase) * .7;
      });
      emberGeometry.attributes.position.needsUpdate = true;
      scratch.set(0, 0, 0);
    }
  };
};
