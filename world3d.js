(() => {
  const wrap = document.querySelector('.arena-wrap');
  const fallback = document.querySelector('#arena');
  if (!wrap || !window.THREE || !window.heroArena3DState) return;

  const THREE = window.THREE;
  const backdropCanvas = document.createElement('canvas');
  backdropCanvas.id = 'cinematicBackdrop';
  backdropCanvas.setAttribute('aria-hidden', 'true');
  const backdropContext = backdropCanvas.getContext('2d');
  wrap.insertBefore(backdropCanvas, wrap.firstChild);
  const details = document.createElement('canvas'); details.id='actorDetails'; details.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none'; wrap.appendChild(details); const detailContext=details.getContext('2d');
  const canvas = document.createElement('canvas');
  canvas.id = 'arena3d';
  canvas.setAttribute('aria-label', 'Third-person 3D superhero city');
  wrap.insertBefore(canvas, wrap.firstChild);
  const css = document.createElement('style');
  css.textContent = '.arena-wrap{position:relative}.arena-wrap #arena3d{position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;pointer-events:none}.arena-wrap.playing3d #arena{opacity:0}.arena-wrap #storyPanel,.arena-wrap .danger,.arena-wrap .toast{z-index:3}';
  document.head.appendChild(css);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.warn('3D display unavailable; keeping the illustrated arena.', error);
    window.heroModelLoadError?.('The browser could not start the 3D display.');
    canvas.remove();
    backdropCanvas.remove(); details.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const contactFloor = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), new THREE.ShadowMaterial({ opacity: .24 }));
  contactFloor.rotation.x = -Math.PI / 2; contactFloor.position.y = 0;
  contactFloor.receiveShadow = true; contactFloor.visible = false; scene.add(contactFloor);
  scene.background = new THREE.Color(0x15111c);
  scene.fog = new THREE.Fog(0x251a25, 24, 112);
  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 180);
  const hemi = new THREE.HemisphereLight(0x746376, 0x1e1618, 1.35); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xffc1a0, 1.65);
  moon.position.set(-12, 24, 7); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); scene.add(moon);
  const cityGlow = new THREE.PointLight(0xff3b3b, 45, 54); cityGlow.position.set(0, 10, -10); scene.add(cityGlow);
  const magentaGlow = new THREE.PointLight(0x8e43ff, 24, 42); magentaGlow.position.set(12, 8, -19); scene.add(magentaGlow);
  const envFaces = Array.from({ length: 6 }, (_, face) => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const fill = g.createLinearGradient(0, 0, 0, 128); fill.addColorStop(0, face % 2 ? '#b9e8fa' : '#83c7ed'); fill.addColorStop(.48, '#75b4d8'); fill.addColorStop(1, '#d1e8ed'); g.fillStyle = fill; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 8; i++) { const x = (i * 37 + face * 19) % 128; g.fillStyle = i % 3 ? 'rgba(43,210,255,.13)' : 'rgba(255,213,133,.26)'; g.fillRect(x, 19 + (i % 4) * 21, 5 + i % 3 * 3, 42); }
    return c;
  });
  const environment = new THREE.CubeTexture(envFaces); environment.colorSpace = THREE.SRGBColorSpace; environment.needsUpdate = true; scene.environment = environment;

  const mat = (color, roughness = .58, metalness = .15, emissive = 0, intensity = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: intensity });
  const armorCanvas = document.createElement('canvas'); armorCanvas.width = armorCanvas.height = 256;
  const armorCtx = armorCanvas.getContext('2d');
  const armorGradient = armorCtx.createLinearGradient(0, 0, 256, 256); armorGradient.addColorStop(0, '#e0b75f'); armorGradient.addColorStop(.48, '#987037'); armorGradient.addColorStop(.7, '#d5ae5d'); armorGradient.addColorStop(1, '#74552b'); armorCtx.fillStyle = armorGradient; armorCtx.fillRect(0, 0, 256, 256);
  let textureSeed = 73; const rand = () => { textureSeed = (textureSeed * 16807) % 2147483647; return textureSeed / 2147483647; };
  for (let i = 0; i < 460; i++) { const x = rand() * 256, y = rand() * 256; armorCtx.strokeStyle = rand() > .52 ? 'rgba(255,226,153,.24)' : 'rgba(30,22,13,.22)'; armorCtx.lineWidth = rand() * 1.3 + .25; armorCtx.beginPath(); armorCtx.moveTo(x, y); armorCtx.lineTo(x + (rand() - .5) * 16, y + rand() * 3); armorCtx.stroke(); }
  for (let i = 0; i < 170; i++) { armorCtx.fillStyle = rand() > .5 ? 'rgba(255,240,190,.1)' : 'rgba(22,17,11,.12)'; armorCtx.beginPath(); armorCtx.arc(rand() * 256, rand() * 256, rand() * 2.6, 0, Math.PI * 2); armorCtx.fill(); }
  const armorTexture = new THREE.CanvasTexture(armorCanvas); armorTexture.colorSpace = THREE.SRGBColorSpace; armorTexture.wrapS = armorTexture.wrapT = THREE.RepeatWrapping; armorTexture.repeat.set(1.4, 1.4);
  const clothCanvas = document.createElement('canvas'); clothCanvas.width = clothCanvas.height = 128; const clothCtx = clothCanvas.getContext('2d');
  clothCtx.fillStyle = '#a8a49b'; clothCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1700; i++) { const v = 95 + Math.floor(rand() * 95); clothCtx.fillStyle = `rgba(${v},${v - 3},${v - 8},${rand() * .34})`; const x = rand() * 128, y = rand() * 128; clothCtx.fillRect(x, y, rand() * 10 + 1, 1); }
  const clothTexture = new THREE.CanvasTexture(clothCanvas); clothTexture.colorSpace = THREE.SRGBColorSpace; clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping; clothTexture.repeat.set(2, 2);
  const mats = {
    road: mat(0x111b29, .92), pavement: mat(0x182636, .9), stripe: mat(0x56dfff, .4, .3, 0x1ba3d2, 1.5),
    gold: new THREE.MeshStandardMaterial({ color: 0xffffff, map: armorTexture, roughness: .3, metalness: .8, envMapIntensity: 1.2 }), goldBright: new THREE.MeshStandardMaterial({ color: 0xf1d18a, map: armorTexture, roughness: .23, metalness: .76, emissive: 0x6b4310, emissiveIntensity: .16, envMapIntensity: 1.3 }), dark: mat(0x101827, .31, .58), blue: mat(0x1888c2, .34, .3, 0x0969a5, .3),
    cape: mat(0x202638, .8), finDark: mat(0x211d1b, .34, .62), finSkin: mat(0x704a36, .72, .04), finGold: mat(0xb88238, .27, .78), finVisor: mat(0x080d14, .16, .58, 0x101a28, .42), sentinelArmor: mat(0x111722, .25, .76), sentinelTrim: mat(0xc2d3df, .23, .72, 0x506a80, .36), skin: mat(0xd7ad88, .62), green: mat(0x3d5042, .38, .55), greenBright: mat(0xa23f32, .28, .25, 0xff271b, 2.2), bone: mat(0xe2d9c2, .7), robe: mat(0x100f1d, .8), red: mat(0xff402e, .26, .2, 0xff1c12, 2.2), cyan: mat(0x62ecff, .2, .2, 0x1acfff, 2.4), fire: mat(0xff632c, .22, .18, 0xff310b, 2.7), glass: mat(0x152d48, .25, .25, 0x087cb0, 1.25)
  };
  const box = (parent, size, material, pos, cast = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...pos); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const sphere = (parent, size, material, pos) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 12), material);
    mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const cylinder = (parent, radiusTop, radiusBottom, height, material, pos, segments = 10) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
    mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const armorPlate = (parent, points, material = mats.goldBright, z = .25) => {
    const shape = new THREE.Shape(); shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath(); const plateMat = material.clone(); plateMat.side = THREE.DoubleSide; const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), plateMat);
    mesh.position.z = z; mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const neonSeam = (parent, points, radius = .013, material = mats.cyan) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(12, points.length * 8), radius, 7, false), material); parent.add(mesh); return mesh;
  };

  // The future avenue is staged separately so the story battle can use its own setting.
  const futureStreetBase = new THREE.Group(); scene.add(futureStreetBase);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 180), mats.road);
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.06, -28); ground.receiveShadow = true; futureStreetBase.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(25, 170), mats.road);
  road.rotation.x = -Math.PI / 2; road.position.set(0, -.025, -27); road.receiveShadow = true; futureStreetBase.add(road);
  const futureStreetAccents = [];
  for (const x of [-13.3, 13.3]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(.45, .28, 165), mats.pavement); curb.position.set(x, .03, -27); curb.receiveShadow = true; futureStreetBase.add(curb);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(.07, .08, 160), mats.stripe); rail.position.set(x * .98, .24, -27); futureStreetAccents.push(rail); futureStreetBase.add(rail);
  }
  for (let z = 14; z > -108; z -= 9) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(.12, .025, 3.4), mats.stripe); dash.position.set(0, .005, z); futureStreetAccents.push(dash); futureStreetBase.add(dash);
  }
  const cityMats = [mat(0x11243a, .77, .22), mat(0x17283e, .72, .28), mat(0x18223b, .75, .22)];
  const winMats = [mat(0x4adfff, .25, .25, 0x15bce8, 2), mat(0x9c7cff, .25, .2, 0x6239ed, 1.7), mat(0xffcf71, .3, .1, 0xe99224, 1.1)];
  const futureCity = new THREE.Group(); scene.add(futureCity);
  const windowMeshes = winMats.map(m => new THREE.InstancedMesh(new THREE.BoxGeometry(.38, .62, .055), m, 1400));
  windowMeshes.forEach(mesh => futureCity.add(mesh));
  const windowCounts = [0, 0, 0], windowDummy = new THREE.Object3D();
  for (let side of [-1, 1]) for (let i = 0; i < 17; i++) {
    const z = 17 - i * 7.3, width = 4.2 + (i % 3) * .75, height = 10 + ((i * 37 + side * 11) % 17);
    const x = side * (17 + (i % 2) * 3.4);
    const tower = new THREE.Group(); tower.position.set(x, 0, z); futureCity.add(tower);
    box(tower, [width, height, 5.5], cityMats[i % cityMats.length], [0, height / 2, 0]);
    box(tower, [width + .12, .12, 5.7], mats.stripe, [0, height - .3, 0], false);
    const rows = Math.floor(height / 1.55);
    for (let row = 0; row < rows; row++) for (let col = 0; col < 3; col++) {
      const wx = (col - 1) * (width * .28), wy = 1.15 + row * 1.45;
      const materialIndex = (i + row + col) % 8 === 0 ? 2 : (i + row + col) % 5 === 0 ? 1 : 0;
      const n = windowCounts[materialIndex]++;
      windowDummy.position.set(x + wx, wy, z + 2.78); windowDummy.updateMatrix(); windowMeshes[materialIndex].setMatrixAt(n, windowDummy.matrix);
    }
    // Glowing sky bridges and tower crowns give the street a readable 3D horizon.
    if (i % 4 === 1) box(tower, [width + 2, .18, .45], mats.cyan, [0, height * .66, 3.1], false);
  }
  windowMeshes.forEach((mesh, i) => { mesh.count = windowCounts[i]; mesh.instanceMatrix.needsUpdate = true; });
  // Ruined pre-future battlefield: cracked asphalt, shattered facades, scattered skulls and fire.
  const battlefield = new THREE.Group(); scene.add(battlefield);
  const soot = mat(0x302c28, .98), rubbleMats = [mat(0x282724,.96),mat(0x49423a,.9),mat(0x343638,.95),mat(0x514338,.92)];
  const skullMat = mat(0xcac0a8,.86), socketMat = mat(0x171716,.98), boneMat = mat(0xb7ab93,.9);
  const charred = [mat(0x282522,.95),mat(0x3c322b,.9),mat(0x211f1d,.95)];
  const fireMats = [new THREE.MeshBasicMaterial({color:0xff4318}),new THREE.MeshBasicMaterial({color:0xff8a26}),new THREE.MeshBasicMaterial({color:0xffd06a})];
  const fireSystems = [];
  for (let i = 0; i < 62; i++) {
    const x = (rand() - .5) * 28, z = 25 - rand() * 112, sx = .25 + rand() * 1.25, sy = .18 + rand() * .52, sz = .25 + rand() * 1.25;
    const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rubbleMats[i % rubbleMats.length]);
    chunk.position.set(x, sy * .3, z); chunk.scale.set(sx, sy, sz); chunk.rotation.set(rand()*.55, rand()*3, rand()*.55); chunk.castShadow = true; chunk.receiveShadow = true; battlefield.add(chunk);
  }
  for (let side of [-1,1]) for (let i = 0; i < 6; i++) {
    const x = side * (16 + rand()*5), z = 15 - i*17 + rand()*5, h = 4 + rand()*8, w = 3 + rand()*3;
    const ruin = new THREE.Group(); ruin.position.set(x,0,z); battlefield.add(ruin);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w,h,1.3),charred[i%charred.length]); wall.position.set(0,h/2,0); wall.rotation.z = (rand()-.5)*.12; wall.castShadow=true; wall.receiveShadow=true; ruin.add(wall);
    for(let floor=0;floor<Math.floor(h/2);floor++) for(let col=0;col<2;col++) if(rand()>.28){
      const ember=new THREE.Mesh(new THREE.BoxGeometry(.34,.58,.035),floor%3===0?fireMats[1]:rubbleMats[2]); ember.position.set((col-.5)*w*.53,.9+floor*1.65,.68); ruin.add(ember);
    }
    for(let j=0;j<4;j++){const broken=new THREE.Mesh(new THREE.BoxGeometry(.25+rand()*.45,h*.18,.3),rubbleMats[j%4]);broken.position.set((rand()-.5)*w,h+rand()*.25,0);broken.rotation.z=(rand()-.5)*1.5;broken.castShadow=true;ruin.add(broken);}
    const leaning=new THREE.Mesh(new THREE.BoxGeometry(.25,h*.6,.3),charred[2]); leaning.position.set(side*1.2,h*.35,.8); leaning.rotation.z=side*.38; ruin.add(leaning);
  }
  const skulls = new THREE.Group(); battlefield.add(skulls);
  for(let i=0;i<32;i++){
    const g=new THREE.Group(), side=(rand()-.5)*2, x=side*(1.5+rand()*9.5), z=23-rand()*108;
    g.position.set(x,.04,z);g.rotation.set((rand()-.5)*.28,rand()*Math.PI*2,(rand()-.5)*.25);const scale=.48+rand()*.68;g.scale.setScalar(scale);skulls.add(g);
    const cranium=new THREE.Mesh(new THREE.SphereGeometry(.25,14,10),skullMat);cranium.position.set(0,.26,0);cranium.scale.set(1,.9,.82);cranium.castShadow=true;g.add(cranium);
    const jaw=new THREE.Mesh(new THREE.BoxGeometry(.29,.105,.18),boneMat);jaw.position.set(0,.11,.055);jaw.castShadow=true;g.add(jaw);
    for(const eye of [-1,1]){const socket=new THREE.Mesh(new THREE.SphereGeometry(.073,10,8),socketMat);socket.position.set(eye*.095,.275,.178);g.add(socket);}
    const nose=new THREE.Mesh(new THREE.ConeGeometry(.045,.09,3),socketMat);nose.position.set(0,.18,.187);nose.rotation.x=Math.PI/2;g.add(nose);
    for(let tooth=0;tooth<5;tooth++){const t=new THREE.Mesh(new THREE.BoxGeometry(.028,.045,.035),skullMat);t.position.set((tooth-2)*.05,.155,.16);g.add(t);}
  }
  for(let i=0;i<44;i++){
    const bone=new THREE.Group(),x=(rand()-.5)*22,z=20-rand()*105,len=.5+rand()*1.2;bone.position.set(x,.055,z);bone.rotation.set((rand()-.5)*.4,rand()*Math.PI*2,(rand()-.5)*.4);skulls.add(bone);
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,len,7),boneMat);shaft.rotation.z=Math.PI/2;shaft.castShadow=true;bone.add(shaft);
    for(const end of [-1,1]){const joint=new THREE.Mesh(new THREE.SphereGeometry(.085,8,7),boneMat);joint.position.x=end*len/2;joint.scale.set(1,.8,.8);bone.add(joint);}
  }
  for(let i=0;i<11;i++){
    const x=(i%2?1:-1)*(4.5+rand()*8),z=22-Math.floor(i/2)*17+rand()*5,fire=new THREE.Group();fire.position.set(x,.12,z);battlefield.add(fire);
    const base=new THREE.Mesh(new THREE.CircleGeometry(.68+rand()*.36,18),new THREE.MeshBasicMaterial({color:0x47190d,transparent:true,opacity:.68}));base.rotation.x=-Math.PI/2;base.position.y=.015;fire.add(base);
    const flames=[];for(let f=0;f<4;f++){const flame=new THREE.Mesh(new THREE.ConeGeometry(.2+rand()*.16,.65+rand()*.65,7),fireMats[f%3]);flame.position.set((rand()-.5)*.4,.4+rand()*.25,(rand()-.5)*.35);flame.rotation.z=(rand()-.5)*.32;fire.add(flame);flames.push(flame);}
    const light=new THREE.PointLight(0xff5a1f,5.5,8,2);light.position.set(0,1,.1);fire.add(light);
    const smoke=[];for(let j=0;j<3;j++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.28+j*.12,9,7),new THREE.MeshBasicMaterial({color:0x393b3c,transparent:true,opacity:.18,depthWrite:false}));puff.position.set((rand()-.5)*.45,1.1+j*.55,(rand()-.5)*.2);fire.add(puff);smoke.push(puff);}
    fireSystems.push({group:fire,light,smoke,flames,seed:rand()*8});
  }
  // Dark industrial fight bay, framed to read clearly from the raised three-quarter camera.
  const industrialArena = new THREE.Group(); scene.add(industrialArena);
  // Reachable field clinic beside the near-left edge of the arena (map position 180,510).
  const fieldClinic = new THREE.Group(); fieldClinic.position.set(-17.6, 0, 11.55); scene.add(fieldClinic);
  const clinicBase = mat(0x253d3c, .62, .25), clinicWhite = mat(0xd8fff1, .3, .12, 0x63f0cc, 1.2), clinicGreen = mat(0x35d9a9, .24, .18, 0x1bf0a8, 3.4);
  box(fieldClinic, [2.8, .16, 2.1], clinicBase, [0, .08, 0]);
  box(fieldClinic, [2.35, 1.18, .22], clinicBase, [0, .68, -.73]);
  box(fieldClinic, [2.5, .12, 2.2], clinicWhite, [0, 1.3, -.05]);
  box(fieldClinic, [.18, .88, .12], clinicGreen, [0, 2.02, -.76], false);
  box(fieldClinic, [.72, .18, .12], clinicGreen, [0, 2.02, -.76], false);
  const clinicLamp = new THREE.PointLight(0x52ffd0, 3.8, 8, 2); clinicLamp.position.set(0, 2.1, 0); fieldClinic.add(clinicLamp);
  const clinicRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.36, 48), new THREE.MeshBasicMaterial({ color: 0x46f0bf, transparent: true, opacity: .78, side: THREE.DoubleSide })); clinicRing.rotation.x = -Math.PI / 2; clinicRing.position.y = .11; fieldClinic.add(clinicRing);
  const factoryFloor = mat(0x202629, .92, .28), factoryPanel = mat(0x30373a, .79, .46), factorySteel = mat(0x3a4245, .68, .72), factoryShadow = mat(0x111719, .83, .58), factoryAmber = mat(0x76502a, .48, .5, 0x351d08, .45), factoryLamp = mat(0xb6d3dc, .24, .24, 0x8cc9dc, 2.2);
  const bayFloor = new THREE.Mesh(new THREE.PlaneGeometry(100, 130), factoryFloor); bayFloor.rotation.x = -Math.PI / 2; bayFloor.position.set(0, -.085, -14); bayFloor.receiveShadow = true; industrialArena.add(bayFloor);
  for (let x = -20; x <= 20; x += 4) { const seam = new THREE.Mesh(new THREE.BoxGeometry(.025, .012, 112), factorySteel); seam.position.set(x, -.073, -14); industrialArena.add(seam); }
  for (let z = -66; z <= 34; z += 5) { const seam = new THREE.Mesh(new THREE.BoxGeometry(45, .012, .022), factorySteel); seam.position.set(0, -.071, z); industrialArena.add(seam); }
  for (let i = 0; i < 18; i++) {
    const x = (i % 6 - 2.5) * 3.4, z = 23 - Math.floor(i / 6) * 31;
    const plate = box(industrialArena, [3.05, .035, 7.2], i % 4 === 0 ? factoryPanel : factoryFloor, [x, -.048, z], false);
    plate.rotation.y = i % 2 ? .012 : -.012;
  }
  box(industrialArena, [48, 12, 1.1], factoryShadow, [0, 5.9, -43]);
  for (let side of [-1, 1]) {
    box(industrialArena, [1.15, 12, 82], factoryShadow, [side * 22, 5.9, -14]);
    for (let z = -39; z <= 20; z += 13) {
      box(industrialArena, [.48, 10.5, .62], factorySteel, [side * 19.5, 5.25, z]);
      box(industrialArena, [4.5, .28, .32], factorySteel, [side * 17.25, 3.35, z + 5.2]);
    }
    for (let z = -33; z <= 15; z += 16) {
      const machine = new THREE.Group(); machine.position.set(side * (14 + (z % 2 ? 0 : .8)), 0, z); industrialArena.add(machine);
      box(machine, [2.5, 2.25, 3.2], factoryShadow, [0, 1.12, 0]);
      box(machine, [2.2, .12, 2.95], factoryPanel, [0, 2.3, 0]);
      box(machine, [1.55, .72, .07], factorySteel, [0, 1.45, 1.64], false);
      for (let dial = -1; dial <= 1; dial++) { const indicator = new THREE.Mesh(new THREE.SphereGeometry(.075, 8, 6), dial === 0 ? mats.cyan : factoryAmber); indicator.position.set(dial * .42, 1.48, 1.7); machine.add(indicator); }
    }
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, 74, 10), factorySteel); pipe.rotation.x = Math.PI / 2; pipe.position.set(side * 20.6, 7.7, -14); pipe.castShadow = true; industrialArena.add(pipe);
    box(industrialArena, [.13, .13, 73], factoryAmber, [side * 20.35, 8.3, -14], false);
  }
  for (let z = -37; z <= 18; z += 13) {
    box(industrialArena, [46, .48, .65], factorySteel, [0, 10.1, z]);
    for (const x of [-15, 0, 15]) {
      box(industrialArena, [2.8, .12, 1.05], factoryShadow, [x, 9.78, z + 1.1], false);
      box(industrialArena, [2.35, .045, .6], factoryLamp, [x, 9.69, z + 1.1], false);
      const workLight = new THREE.PointLight(0xc4e4ef, 13, 17, 2); workLight.position.set(x, 9.15, z + 1.1); industrialArena.add(workLight);
    }
  }
  for (let x = -18; x <= 18; x += 9) {
    box(industrialArena, [.5, 9.5, .65], factorySteel, [x, 4.72, -37]);
    box(industrialArena, [.5, 9.5, .65], factorySteel, [x, 4.72, 18]);
  }
  const warehouseArena = window.heroBackdrop ? null : window.createWarehouseArena?.(THREE);
  if (warehouseArena) scene.add(warehouseArena.group);
  const meteorLevel = window.heroBackdrop ? null : window.createMeteorLevel?.(THREE);
  if (meteorLevel) scene.add(meteorLevel.group);
  const snowStreet = window.heroBackdrop ? null : window.createSnowStreet?.(THREE);
  const sceneColor = scene.background;
  const dimensionBackdrops = { three: null, four: null, five: null };
  const backdropLoader = new THREE.TextureLoader();
  backdropLoader.load('assets/level-one-meteor-impact.jpg', texture => { texture.colorSpace = THREE.SRGBColorSpace; dimensionBackdrops.three = texture; });
  backdropLoader.load('assets/level-four-future-city.jpg', texture => { texture.colorSpace = THREE.SRGBColorSpace; dimensionBackdrops.four = texture; });
  backdropLoader.load('assets/level-five-final-city.jpg', texture => { texture.colorSpace = THREE.SRGBColorSpace; dimensionBackdrops.five = texture; });
  function coverBackdrop(texture, aspect) {
    if (!texture?.image) return;
    const imageAspect = texture.image.width / texture.image.height;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(Math.min(1, aspect / imageAspect), Math.min(1, imageAspect / aspect));
    texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
  }
  if (snowStreet) {
    scene.add(snowStreet.group);
    fireSystems.slice(0, 5).forEach((fire, i) => {
      snowStreet.group.add(fire.group);
      fire.group.position.set(i % 2 ? 23 : -23, .12, 14 - i * 13);
    });
  }
  // A full thousand distant residents, drawn with instanced 3D geometry to stay responsive.
  const residentMats = [mat(0x29465d), mat(0x343755), mat(0x31564f), mat(0x514063)];
  const futureResidents = new THREE.Group(); scene.add(futureResidents);
  const residentCount = 1000, residentBody = new THREE.InstancedMesh(new THREE.CylinderGeometry(.115, .17, .67, 7), residentMats[0], residentCount);
  const residentHeads = new THREE.InstancedMesh(new THREE.SphereGeometry(.125, 8, 6), mats.skin, residentCount);
  const residentLegs = new THREE.InstancedMesh(new THREE.BoxGeometry(.075, .37, .09), residentMats[0], residentCount * 2);
  residentBody.castShadow = false; residentHeads.castShadow = false; residentLegs.castShadow = false;
  futureResidents.add(residentBody, residentHeads, residentLegs);
  const residentLocations = Array.from({ length: residentCount }, (_, i) => {
    const side = i % 2 ? 1 : -1;
    const z = -102 + ((i * 37) % 124);
    const x = side * (13.7 + ((i * 17) % 57) / 10);
    const phase = i * 1.618;
    const shade = new THREE.Color([0x29465d, 0x343755, 0x31564f, 0x514063][i % 4]);
    residentBody.setColorAt(i, shade); residentLegs.setColorAt(i * 2, shade); residentLegs.setColorAt(i * 2 + 1, shade);
    return { x, z, phase };
  });
  const ships = [];
  for (let i = 0; i < 4; i++) {
    const ship = new THREE.Group(); ship.position.set(-30 + i * 19, 13 + (i % 2) * 5, -40 - i * 19); ship.visible = false; scene.add(ship);
    box(ship, [2.4, .42, .85], mat(0x20384c, .3, .6), [0, 0, 0]);
    box(ship, [1.1, .08, .96], mats.cyan, [0, -.04, .12], false);
    box(ship, [.7, .18, .25], mats.glass, [0, .26, 0]); ships.push(ship);
  }
  // Rain is an actual moving particle field in the 3D scene.
  const rainN = 1250, rainPositions = new Float32Array(rainN * 3), rainVelocity = new Float32Array(rainN);
  for (let i = 0; i < rainN; i++) { rainPositions[i * 3] = (Math.random() - .5) * 46; rainPositions[i * 3 + 1] = Math.random() * 24; rainPositions[i * 3 + 2] = (Math.random() - .5) * 70 - 22; rainVelocity[i] = 13 + Math.random() * 12; }
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x8beaff, size: .035, transparent: true, opacity: .64 })); rain.visible = false; scene.add(rain);

  const rigs = new Map();
  const characterModelFiles = {
    finalcreature: 'assets/finalcreature-model.glb',
    ecal: 'assets/ecal-model.glb',
    finnew: 'assets/finnew-model.glb',
    // The optional fantasy-creature GLB is not shipped; use the built-in twin-hammer enemy.
    hammerer: null,
    golden: 'assets/red-dawn-model.glb',
    wildclaw: 'assets/wildclaw-model.glb',
    lizard: 'assets/lizard-warrior.glb',
    ashen: 'assets/mr-misfit-rigged.glb',
    darkwarrior: 'assets/dark-armored-warrior.glb'
  };
  const characterModelLoads = new Map();
  window.loadFinalCity=()=>{if(!characterModelLoads.has('finalcity'))characterModelLoads.set('finalcity',loadPlayerModel('assets/finalcity-model.glb','finalcity'));return characterModelLoads.get('finalcity');};
  const frostCastNotice=document.createElement('div');frostCastNotice.hidden=true;
  frostCastNotice.style.cssText='position:absolute;left:20px;top:70px;z-index:30;background:#102235ee;color:white;padding:14px;border-radius:8px';
  frostCastNotice.textContent='Preparing Red Dawn and Wildclaw…';wrap.appendChild(frostCastNotice);
  let frostCastPreloaded=false, frostCastLoadsSettled=false;
  function preloadFrostCast(){
    if(frostCastPreloaded)return;frostCastPreloaded=true;
    const loading=[];
    for(const kind of ['golden','wildclaw']){
      if(!characterModelLoads.has(kind))characterModelLoads.set(kind,loadPlayerModel(characterModelFiles[kind],kind));
      loading.push(characterModelLoads.get(kind));
    }
    const helmet='assets/helmeted-red-dawn.glb';
    if(!helmetModelLoads.has(helmet))helmetModelLoads.set(helmet,loadPlayerModel(helmet,'helmeted'));
    loading.push(helmetModelLoads.get(helmet));
    // Once the optional models have finished attempting to load, never stall the
    // frozen finale: the existing procedural actors remain visible as stand-ins.
    Promise.allSettled(loading).then(()=>{frostCastLoadsSettled=true;});
  }
  window.frostFinaleActorsReady=f=>{
    const ids=[f.guardianId||f.redDawn?.id,f.wildClaw?.id];
    if(ids.every(id=>{const u=rigs.get(id)?.userData;return !!u?.glbRig&&!!u.glbModel&&(!u.source?.helmet||!!u.helmetedRig);}))return true;
    return frostCastPreloaded&&frostCastLoadsSettled;
  };
  const skinGeometryCache = new Map();
  // Keep the optional villain loader dormant until its dedicated GLB is available.
  const villainModelUrls = {};
  const villainModelLoads = new Map();
  const helmetModelLoads = new Map();
  const modelLoader = window.GLTFLoader ? new window.GLTFLoader() : null;
  function writePlayerSkinWeights(indices, weights, vertex, x, y, width, height, boneIndex) {
    const xn = Math.abs(x) / width, yn = y / height, side = x < 0 ? 'L' : 'R';
    let a = 'pelvis', b = 'spine', blend = 1 - THREE.MathUtils.smoothstep(yn, .51, .61);
    if (yn >= .61) { a = 'spine'; b = 'chest'; blend = 1 - THREE.MathUtils.smoothstep(yn, .61, .76); }
    if (yn >= .78) { a = 'chest'; b = 'neck'; blend = 1 - THREE.MathUtils.smoothstep(yn, .78, .81); }
    if (yn > .81) {
      a = 'head'; b = 'neck'; blend = THREE.MathUtils.smoothstep(yn, .81, .87);
    } else if (yn > .40 && yn < .81 && xn > .27) {
      // Hands belong to the arm even when they hang below the hips. Bend the
      // forearm around the elbow, with a short blend across the joint seam.
      if (yn > .72) {
        a = 'upperArm' + side; b = 'chest'; blend = 1 - THREE.MathUtils.smoothstep(yn, .76, .81);
      } else {
        a = 'elbow' + side; b = 'upperArm' + side; blend = 1 - THREE.MathUtils.smoothstep(yn, .61, .66);
      }
    } else if (yn < .51 && xn > .075) {
      if (yn > .42) {
        a = 'hip' + side; b = 'pelvis'; blend = 1 - THREE.MathUtils.smoothstep(yn, .43, .51);
      } else if (yn > .11) {
        a = 'hip' + side; b = 'knee' + side; blend = THREE.MathUtils.smoothstep(yn, .24, .29);
      } else {
        a = 'shin' + side; b = 'knee' + side; blend = 1 - THREE.MathUtils.smoothstep(yn, .065, .11);
      }
    }
    const k = vertex * 4;
    indices[k] = boneIndex.get(a); indices[k + 1] = boneIndex.get(b);
    weights[k] = blend; weights[k + 1] = 1 - blend;
  }
  function attachHelmetedRedDawn(root) {
    const kind = 'golden';
    if (!modelLoader || root.userData.helmetedModel) return;
    const url = 'assets/helmeted-red-dawn.glb';
    if (!helmetModelLoads.has(url)) helmetModelLoads.set(url, loadPlayerModel(url,'helmeted'));
    helmetModelLoads.get(url).then(sourceModel => {
      if (!sourceModel || !root.parent || root.userData.kind !== 'golden' || root.userData.helmetedModel) return;
      const model = sourceModel.clone(true), bounds = new THREE.Box3().setFromObject(model), size = bounds.getSize(new THREE.Vector3()), scale = 2.32 / Math.max(.01, size.y);
      model.scale.setScalar(scale);
      model.position.set(-(bounds.min.x + bounds.max.x) * .5 * scale, -bounds.min.y * scale, -(bounds.min.z + bounds.max.z) * .5 * scale);
      model.name = 'Red Dawn helmet-on pose';
      root.add(model); model.updateMatrixWorld(true); root.updateMatrixWorld(true);
      const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
      const skinnedRoot = new THREE.Group(); skinnedRoot.name = 'Red Dawn helmet-on runtime rig'; root.add(skinnedRoot);
      const width = Math.max(.35, size.x * scale), depth = Math.max(.18, size.z * scale), height = 2.32;
      const boneIndex = new Map(), bonePositions = new Map(), bones = [];
      const addBone = (name, parent, x, y, z) => {
        const bone = new THREE.Bone(); bone.name = name;
        const parentPos = parent ? bonePositions.get(parent.name) : { x: 0, y: 0, z: 0 };
        bone.position.set(x - parentPos.x, y - parentPos.y, z - parentPos.z);
        (parent || skinnedRoot).add(bone); boneIndex.set(name, bones.length); bonePositions.set(name, { x, y, z }); bones.push(bone); return bone;
      };
      const pelvis = addBone('pelvis', null, 0, height * .46, 0);
      const spine = addBone('spine', pelvis, 0, height * .61, 0);
      const chest = addBone('chest', spine, 0, height * .74, 0);
      const neck = addBone('neck', chest, 0, height * .83, 0);
      addBone('head', neck, 0, height * .89, 0);
      const rig = { arms: [], forearms: [], thighs: [], knees: [], shins: [], feet: [], chest };
      for (const side of [-1, 1]) {
        const suffix = side < 0 ? 'L' : 'R', shoulderX = side * width * .28, elbowX = side * width * .38, handX = side * width * .42;
        const upper = addBone('upperArm' + suffix, chest, shoulderX, height * .765, 0);
        const elbow = addBone('elbow' + suffix, upper, elbowX, height * .635, 0);
        const forearm = addBone('forearm' + suffix, elbow, handX, height * .50, 0);
        const hip = addBone('hip' + suffix, pelvis, side * width * .12, height * .445, 0);
        const knee = addBone('knee' + suffix, hip, side * width * .135, height * .265, 0);
        const shin = addBone('shin' + suffix, knee, side * width * .14, height * .085, 0);
        const foot = addBone('foot' + suffix, shin, side * width * .14, height * .035, .055);
        rig.arms.push(upper); rig.forearms.push(elbow); rig.thighs.push(hip); rig.knees.push(knee); rig.shins.push(shin); rig.feet.push(foot);
      }
      const skeleton = new THREE.Skeleton(bones), rigMeshes = [];
      model.traverse(node => {
        if (!node.isMesh) return;
        let geometry = node.geometry.clone();
        if(kind==='ecal'&&geometry.index)geometry=geometry.toNonIndexed();
        geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(rootInverse, node.matrixWorld));
        const position = geometry.getAttribute('position'), count = position.count;
        const skinIndex = new Uint16Array(count * 4), skinWeight = new Float32Array(count * 4);
        for (let i = 0; i < count; i++) {
          const x = position.getX(i), y = position.getY(i), ax = Math.abs(x), xn = ax / width, yn = y / height;
          const rearDepth = position.getZ(i) / depth + .5;
          // Keep the cape's rear, hanging panels attached at the neck. Without this
          // override their wide silhouette is mistaken for arms by the x-based rig.
          const capeVertex = (kind === 'golden' || kind === 'ashen') && yn > .08 && yn < .82 && xn > .17 && rearDepth < .30;
          if (capeVertex) {
            const k = i * 4; skinIndex[k] = boneIndex.get('neck'); skinWeight[k] = 1;
            continue;
          }
          writePlayerSkinWeights(skinIndex, skinWeight, i, x, y, width, height, boneIndex);
        }
        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
        geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
        const sourceMaterials = Array.isArray(node.material) ? node.material : [node.material];
        const materials = sourceMaterials.map(material => { const clone = material.clone(); clone.side = THREE.DoubleSide; return clone; });
        const mesh = new THREE.SkinnedMesh(geometry, Array.isArray(node.material) ? materials : materials[0]);
        mesh.name = node.name || 'Red Dawn helmet-on mesh'; mesh.castShadow = true; mesh.receiveShadow = true; skinnedRoot.add(mesh); rigMeshes.push(mesh);
      });
      root.remove(model); root.updateMatrixWorld(true); skeleton.calculateInverses();
      rigMeshes.forEach(mesh => mesh.bind(skeleton, mesh.matrixWorld));
      root.userData.helmetedModel = skinnedRoot; root.userData.helmetedRig = rig;
      skinnedRoot.visible = root.userData.maskProgress >= .985;
    });
  }
  function loadPlayerModel(url,kind) {
    return new Promise(resolve=>{
      const fail=error=>{console.warn('Character model could not be loaded:',url,error);window.heroModelLoadError?.('Unable to load '+kind+' model.');resolve(null);};
      if(location.protocol==='file:'){
        const parseEmbedded=()=>{try{const raw=atob(window.heroModelData[kind]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);delete window.heroModelData[kind];modelLoader.parse(bytes.buffer,'',gltf=>resolve(gltf.scene),fail);}catch(error){fail(error);}};
        if(window.heroModelData?.[kind]){parseEmbedded();return;}
        const script=document.createElement('script');script.src='assets/'+(kind==='ashen'?'mr-misfit-rigged':kind)+'-model-data.js'+(kind==='finnew'?'?v=imported-fin-2':'');
        script.onerror=fail;script.onload=()=>{parseEmbedded();script.remove();};document.head.appendChild(script);
      }else modelLoader.load(url,gltf=>resolve(gltf.scene),undefined,fail);
    });
  }
  function cloneSkinnedCharacter(source) {
    const clone=source.clone(true),originals=[],copies=[],mapping=new Map();
    source.traverse(node=>originals.push(node));clone.traverse(node=>copies.push(node));
    originals.forEach((node,i)=>mapping.set(node,copies[i]));
    originals.forEach(node=>{
      if(!node.isSkinnedMesh)return;
      const mesh=mapping.get(node);
      mesh.skeleton=new THREE.Skeleton(node.skeleton.bones.map(b=>mapping.get(b)),node.skeleton.boneInverses.map(m=>m.clone()));
      mesh.bindMatrix.copy(node.bindMatrix);mesh.bindMatrixInverse.copy(node.bindMatrixInverse);
      mesh.frustumCulled=false;mesh.castShadow=true;mesh.receiveShadow=true;
    });
    return clone;
  }
  function attachMisfitRig(root,sourceModel){
    const model=cloneSkinnedCharacter(sourceModel);
    model.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
    const scale=2.32/Math.max(.01,size.y);
    model.scale.setScalar(scale);
    model.position.set(-(bounds.min.x+bounds.max.x)*.5*scale,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*.5*scale);
    const bone=name=>model.getObjectByName(name);
    const pair=name=>['L','R'].map(side=>bone(name+side));
    const rig={pelvis:bone('pelvis'),spine:bone('spine'),chest:bone('chest'),neck:bone('neck'),head:bone('head'),
      arms:pair('upperArm'),forearms:pair('elbow'),hands:pair('forearm'),thighs:pair('hip'),knees:pair('knee'),shins:pair('shin'),feet:pair('foot')};
    // Preserve the imported skin weights and bind pose; a height-only reassignment
    // can pull facial triangles into the wrong part of a transformed mesh.
    model.traverse(mesh=>{
      if(!mesh.isMesh)return;
      const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      const restored=materials.map(original=>{const material=original.clone();material.side=THREE.DoubleSide;return material;});
      mesh.material=Array.isArray(mesh.material)?restored:restored[0];
      mesh.frustumCulled=false;
    });
    // Keep one skeleton per boss instance so level changes never share poses.
    root.add(model);root.remove(root.userData.body);
    root.userData.glbModel=model;root.userData.glbRig=rig;root.userData.nativeRig=true;
    root.updateMatrixWorld(true);
  }
  function attachCharacterModel(root, kind) {
    const url = characterModelFiles[kind];
    if (!url || !modelLoader) return;
    // Hide built-in placeholder rigs for both imported player models while their GLBs load.
    if ((kind === 'finalcreature' || kind === 'finnew' || kind === 'golden' || kind === 'wildclaw' || kind === 'lizard' || kind === 'ecal' || kind === 'hammerer' || kind === 'darkwarrior') && root.userData.body) root.userData.body.visible = false;
    // Mr. Misfit's detailed model is ~89 MB: show his procedural rig until loading finishes.
    if (!characterModelLoads.has(kind)) {
      characterModelLoads.set(kind, loadPlayerModel(url,kind));
    }
    characterModelLoads.get(kind).then(sourceModel => {
      if(!sourceModel){if(root.userData.body)root.userData.body.visible=kind!=='finnew';return;}
      if (!root.parent || root.userData.kind !== kind || root.userData.glbModel) return;
      if(kind==='ashen'&&sourceModel.getObjectByName('pelvis')){attachMisfitRig(root,sourceModel);return;}
      const model = sourceModel.clone(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const scale = 2.32 / Math.max(.01, size.y);
      model.scale.setScalar(scale);
      model.position.set(-(bounds.min.x + bounds.max.x) * .5 * scale, -bounds.min.y * scale, -(bounds.min.z + bounds.max.z) * .5 * scale);
      root.add(model); model.updateMatrixWorld(true); root.updateMatrixWorld(true);
      const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
      const skinnedRoot = new THREE.Group(); skinnedRoot.name = kind + '-runtime-rig'; root.add(skinnedRoot);
      const width = Math.max(.35, size.x * scale), depth = Math.max(.18, size.z * scale), height = 2.32, centerZ = 0;
      const boneIndex = new Map(), bonePositions = new Map(), bones = [];
      const addBone = (name, parent, x, y, z) => {
        const bone = new THREE.Bone(); bone.name = name;
        const parentPos = parent ? bonePositions.get(parent.name) : { x: 0, y: 0, z: 0 };
        bone.position.set(x - parentPos.x, y - parentPos.y, z - parentPos.z);
        (parent || skinnedRoot).add(bone); boneIndex.set(name, bones.length); bonePositions.set(name, { x, y, z }); bones.push(bone); return bone;
      };
      const pelvis = addBone('pelvis', null, 0, height * .46, centerZ);
      const spine = addBone('spine', pelvis, 0, height * .61, centerZ);
      const chest = addBone('chest', spine, 0, height * (kind==='ecal'?.60:.74), centerZ);
      const neck = addBone('neck', chest, 0, height * (kind==='ecal'?.69:.83), centerZ);
      const headBone = addBone('head', neck, 0, height * (kind==='ecal'?.79:.89), centerZ);
      const rigParts = { arms: [], forearms: [], hands: [], thighs: [], knees: [], shins: [], feet: [], pelvis, spine, chest, neck, head: headBone };
      for (const side of [-1, 1]) {
        const suffix = side < 0 ? 'L' : 'R', shoulderX = side * width * .28, elbowX = side * width * .38, handX = side * width * .42;
        const upper = addBone('upperArm' + suffix, chest, shoulderX, height * (kind==='ecal'?.65:.765), centerZ);
        const elbow = addBone('elbow' + suffix, upper, elbowX, height * (kind==='ecal'?.51:.635), centerZ);
        const forearm = addBone('forearm' + suffix, elbow, handX, height * (kind==='ecal'?.37:.50), centerZ);
        const hip = addBone('hip' + suffix, pelvis, side * width * .12, height * .445, centerZ);
        const knee = addBone('knee' + suffix, hip, side * width * .135, height * .265, centerZ);
        const shin = addBone('shin' + suffix, knee, side * width * .14, height * .085, centerZ);
        const foot = addBone('foot' + suffix, shin, side * width * .14, height * .035, centerZ + .055);
        rigParts.arms.push(upper); rigParts.forearms.push(elbow); rigParts.hands.push(forearm); rigParts.thighs.push(hip); rigParts.knees.push(knee); rigParts.shins.push(shin); rigParts.feet.push(foot);
      }
      if (kind === 'ecal') {
        rigParts.ears=[-1,1].map(side=>addBone(side<0?'earL':'earR',headBone,side*width*.22,height*.85,centerZ));
        const tail0=addBone('tail0',pelvis,-width*.04,height*.43,-depth*.16);
        const tail1=addBone('tail1',tail0,-width*.19,height*.32,-depth*.32);
        const tail2=addBone('tail2',tail1,-width*.29,height*.19,-depth*.40);
        const tail3=addBone('tail3',tail2,-width*.29,height*.075,-depth*.42);
        rigParts.tail=[tail0,tail1,tail2,tail3];
      }
      if (kind === 'golden') {
        const home = new THREE.Vector3(0, height * .61, depth * .42);
        const face = new THREE.Vector3(0, height * .88, depth * .22);
        const helmetBone = addBone('heldHelmet', null, home.x, home.y, home.z);
        rigParts.mask = { bone: helmetBone, home, face };
      }
      const skeleton = new THREE.Skeleton(bones);
      const rigMeshes = [];
      const cachedMeshes=skinGeometryCache.get(kind);let meshIndex=0;
      model.traverse(node => {
        if (!node.isMesh) return;
        const cached=cachedMeshes?.[meshIndex++];
        if(cached){const mesh=new THREE.SkinnedMesh(cached.geometry,cached.material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;skinnedRoot.add(mesh);rigMeshes.push(mesh);return;}
        let geometry = node.geometry.clone();
        if(kind==='ecal'&&geometry.index)geometry=geometry.toNonIndexed();
        geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(rootInverse, node.matrixWorld));
        const position = geometry.getAttribute('position'), count = position.count;
        const indices = new Uint16Array(count * 4), weights = new Float32Array(count * 4);
        for (let i = 0; i < count; i++) {
          const x = position.getX(i), y = position.getY(i), ax = Math.abs(x), xn = ax / width, yn = y / height;
          const maskVertex = kind === 'golden' && yn > .53 && yn < .72 && ax < width * .16 && position.getZ(i) / depth + .5 > .80;
          if (maskVertex) { indices[i * 4] = boneIndex.get('heldHelmet'); weights[i * 4] = 1; continue; }
          const rearDepth = position.getZ(i) / depth + .5;
          // Pin only the rear hanging panels to the neck so punches cannot pull
          // cape vertices along with the arm bones.
          const capeVertex = (kind === 'golden' || kind === 'ashen' || kind === 'darkwarrior') && yn > .08 && yn < .82 && xn > .17 && rearDepth < .30;
          if (capeVertex) { indices[i * 4] = boneIndex.get('neck'); weights[i * 4] = 1; continue; }
          if (kind === 'hammerer' && xn > .29 && yn > .16 && yn < .64) {
            // The low hanging hammer heads move rigidly with the forearms,
            // rather than being mistaken for thighs by their height.
            indices[i * 4] = boneIndex.get('elbow' + (x < 0 ? 'L' : 'R'));
            weights[i * 4] = 1;
            continue;
          }
          // The complete forward blaster silhouette belongs to one wrist.
          // Do this before leg and arm masks: low barrels are not shins.
          if(kind==='ecal'&&xn>.18&&yn>.17&&yn<.52&&rearDepth>.52){indices[i*4]=boneIndex.get('forearm'+(x<0?'L':'R'));weights[i*4]=1;continue;}
          // Legs take precedence over rear-cloth/gun masks: boots and knees
          // must not be pinned to the pelvis or dragged by the blaster bones.
          if(kind==='ecal'&&yn<.445&&xn<.23&&rearDepth>.31){
            const side=x<0?'L':'R';
            let a='hip'+side,b='knee'+side,mix=THREE.MathUtils.smoothstep(yn,.23,.31);
            if(yn<.12){a='shin'+side;b='knee'+side;mix=1-THREE.MathUtils.smoothstep(yn,.075,.12);}
            if(yn>.38){a='pelvis';b='hip'+side;mix=THREE.MathUtils.smoothstep(yn,.39,.445);}
            indices[i*4]=boneIndex.get(a);indices[i*4+1]=boneIndex.get(b);weights[i*4]=mix;weights[i*4+1]=1-mix;continue;
          }
          if (kind === 'ecal' && yn < .49 && ((rearDepth < .19 && x < width*.025)||(rearDepth < .29 && x < -width*.18))) {
            const along=THREE.MathUtils.clamp((.43-yn)/.355*3,0,3),a=Math.floor(along),b=Math.min(3,a+1),mix=along-a;
            indices[i*4]=boneIndex.get('tail'+a);indices[i*4+1]=boneIndex.get('tail'+b);weights[i*4]=1-mix;weights[i*4+1]=mix;continue;
          }
          if (kind === 'ecal') {
            const side = x < 0 ? 'L' : 'R';
            if(yn>.85&&xn>.16){const w=THREE.MathUtils.smoothstep(yn,.85,.95)*THREE.MathUtils.smoothstep(xn,.16,.25);indices[i*4]=boneIndex.get('ear'+side);indices[i*4+1]=boneIndex.get('head');weights[i*4]=w;weights[i*4+1]=1-w;continue;}
            if (yn > .70) { indices[i*4] = boneIndex.get('head'); weights[i*4] = 1; continue; }
            if(yn>.44&&yn<.70&&xn>.20&&rearDepth>.28){
              const upper=THREE.MathUtils.smoothstep(yn,.495,.535);
              indices[i*4]=boneIndex.get('upperArm'+side);indices[i*4+1]=boneIndex.get('elbow'+side);
              weights[i*4]=upper;weights[i*4+1]=1-upper;continue;
            }

            // Rear cloth and tail stay on the torso; guns follow their hands.
            if (rearDepth < .28 && yn > .44 && yn < .76) { indices[i*4] = boneIndex.get('pelvis'); weights[i*4] = 1; continue; }
            if(xn>.20&&yn>.30&&yn<=.44&&rearDepth>.28){indices[i*4]=boneIndex.get('elbow'+side);weights[i*4]=1;continue;}
            if(yn>=.44){indices[i*4]=boneIndex.get('chest');weights[i*4]=1;continue;}
          }
          writePlayerSkinWeights(indices, weights, i, x, y, width, height, boneIndex);
        }
        if(kind==='ecal'){
          // Never let a weapon triangle bridge a wrist and a leg/torso bone.
          // Nonindexed vertices let the entire hard-surface face share a bind.
          const wrists=[boneIndex.get('forearmL'),boneIndex.get('forearmR')];
          for(let v=0;v+2<count;v+=3){
            const gun=wrists.find(b=>[v,v+1,v+2].some(j=>indices[j*4]===b&&weights[j*4]===1));
            if(gun!==undefined)for(let j=v;j<v+3;j++){indices[j*4]=gun;indices[j*4+1]=0;weights[j*4]=1;weights[j*4+1]=0;}
          }
        }
        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4)); geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
        const material = Array.isArray(node.material) ? node.material.map(m => { const clone = m.clone(); clone.side = THREE.DoubleSide; return clone; }) : node.material.clone();
        const materialCopy = () => Array.isArray(material) ? material.map(m => m.clone()) : material.clone();
        if (kind === 'golden' && geometry.index) {
          const sourceIndices = geometry.index.array, maskCount = Math.floor(sourceIndices.length / 3);
          let selected = 0;
          const qualifies = (ia, ib, ic) => {
            const cx = (position.getX(ia) + position.getX(ib) + position.getX(ic)) / 3;
            const cy = (position.getY(ia) + position.getY(ib) + position.getY(ic)) / 3 / height;
            const cz = (position.getZ(ia) + position.getZ(ib) + position.getZ(ic)) / 3 / depth + .5;
            return cy > .53 && cy < .72 && Math.abs(cx) < width * .16 && cz > .84;
          };
          for (let tri = 0; tri < maskCount; tri++) { const j = tri * 3; if (qualifies(sourceIndices[j], sourceIndices[j + 1], sourceIndices[j + 2])) selected++; }
          if (selected > 250) {
            const bodyIndices = new Uint32Array((maskCount - selected) * 3), helmetIndices = new Uint32Array(selected * 3); let bi = 0, hi = 0;
            for (let tri = 0; tri < maskCount; tri++) { const j = tri * 3, a = sourceIndices[j], b = sourceIndices[j + 1], c = sourceIndices[j + 2]; if (qualifies(a, b, c)) { helmetIndices[hi++] = a; helmetIndices[hi++] = b; helmetIndices[hi++] = c; } else { bodyIndices[bi++] = a; bodyIndices[bi++] = b; bodyIndices[bi++] = c; } }
            geometry.setIndex(new THREE.BufferAttribute(bodyIndices, 1));
            const helmetGeometry = geometry.clone(); helmetGeometry.setIndex(new THREE.BufferAttribute(helmetIndices, 1));
            const helmetMesh = new THREE.SkinnedMesh(helmetGeometry, materialCopy()); helmetMesh.name = 'Red Dawn held helmet'; helmetMesh.castShadow = true; helmetMesh.receiveShadow = true; skinnedRoot.add(helmetMesh); rigMeshes.push(helmetMesh);
          }
        }
        const mesh = new THREE.SkinnedMesh(geometry, material); mesh.name = node.name || kind + '-skin'; mesh.castShadow = true; mesh.receiveShadow = true; skinnedRoot.add(mesh); rigMeshes.push(mesh);
      });
      root.updateMatrixWorld(true);
      skeleton.calculateInverses();
      rigMeshes.forEach(mesh => mesh.bind(skeleton, mesh.matrixWorld));
      root.remove(root.userData.body);
      model.removeFromParent();
      root.userData.glbModel = skinnedRoot;
      root.userData.glbRig = rigParts;
      if(kind!=='golden'&&!cachedMeshes)skinGeometryCache.set(kind,rigMeshes.map(mesh=>({geometry:mesh.geometry,material:mesh.material})));
      rigMeshes.forEach(mesh=>mesh.frustumCulled=false);
      if(kind==='hammerer')for(const hammer of root.userData.hammerPair||[])hammer.visible=false;
      if (kind === 'lizard') {
        const sword = new THREE.Group(); sword.name = 'Lizard ice sword';
        const gripMat = new THREE.MeshStandardMaterial({ color: 0x25282d, metalness: .58, roughness: .34 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xa98a42, metalness: .84, roughness: .23 });
        const iceMat = new THREE.MeshStandardMaterial({ color: 0x80eaff, emissive: 0x16aee9, emissiveIntensity: 3.2, metalness: .08, roughness: .12, transparent: true, opacity: .94, side: THREE.DoubleSide });
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(.034, .042, .28, 10), gripMat); grip.position.y = .08; grip.castShadow = true; sword.add(grip);
        const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(.075, 0), iceMat); pommel.position.y = .24; sword.add(pommel);
        const guard = new THREE.Mesh(new THREE.BoxGeometry(.34, .065, .09), goldMat); guard.position.y = -.075; guard.castShadow = true; sword.add(guard);
        for (const side of [-1, 1]) {
          const hook = new THREE.Mesh(new THREE.ConeGeometry(.055, .2, 6), goldMat);
          hook.position.set(side * .17, -.075, 0); hook.rotation.z = side * Math.PI / 2; sword.add(hook);
        }
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(-.075, -.08); bladeShape.lineTo(-.105, -.73); bladeShape.lineTo(-.045, -1.02);
        bladeShape.lineTo(0, -1.18); bladeShape.lineTo(.07, -1.01); bladeShape.lineTo(.12, -.69); bladeShape.lineTo(.075, -.08); bladeShape.closePath();
        const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(bladeShape, { depth: .045, bevelEnabled: true, bevelSegments: 2, bevelSize: .018, bevelThickness: .018 }), iceMat);
        blade.position.z = -.0225; blade.castShadow = true; sword.add(blade);
        sword.position.set(0, -.11, .045); sword.rotation.set(.08, 0, -.08);
        rigParts.hands[1].add(sword); rigParts.sword = sword;
        const trail = new THREE.Mesh(
          new THREE.RingGeometry(.55, 1.02, 56, 1, -.72, 2.12),
          new THREE.MeshBasicMaterial({ color: 0x69ddff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
        );
        trail.name = 'Lizard sword slice trail'; trail.position.set(.12, 1.35, .3); trail.renderOrder = 5; trail.visible = false; root.add(trail);
        root.userData.iceSword = sword; root.userData.swordTrail = trail;
      }
      if (kind === 'golden') attachHelmetedRedDawn(root);
    });
  }
  function attachVillainModel(root, kind) {
    if (!modelLoader || kind !== 'hammerer') return;
    const url = villainModelUrls[kind];
    if (!villainModelLoads.has(url)) villainModelLoads.set(url, new Promise(resolve => modelLoader.load(
      url,
      gltf => resolve(gltf.scene),
      undefined,
      error => { console.warn('Fantasy character model could not be loaded:', error); resolve(null); }
    )));
    villainModelLoads.get(url).then(sourceModel => {
      if (!sourceModel || !root.parent || root.userData.kind !== kind || root.userData.creatureModel) return;
      if(kind==='ashen'&&sourceModel.getObjectByName('pelvis')){attachMisfitRig(root,sourceModel);return;}
      const model = sourceModel.clone(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const fittedScale = 2.32 / Math.max(.01, size.y);
      model.scale.setScalar(fittedScale);
      model.position.set(
        -(bounds.min.x + bounds.max.x) * .5 * fittedScale,
        -bounds.min.y * fittedScale,
        -(bounds.min.z + bounds.max.z) * .5 * fittedScale
      );
      model.name = kind === 'hammerer' ? 'Twin hammer villain' : 'Fantasy creature enemy';
      model.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
      root.add(model);
      root.userData.body.visible = false;
      if (root.userData.weapon) root.userData.weapon.visible = false;
      root.userData.creatureModel = model;
      root.userData.creatureBaseY = model.position.y;
    });
  }
  function addBossHammers(root) {
    const darkSteel = new THREE.MeshStandardMaterial({ color: 0x202731, metalness: .82, roughness: .27 });
    const bronze = new THREE.MeshStandardMaterial({ color: 0x9b6840, metalness: .78, roughness: .3 });
    const rune = new THREE.MeshStandardMaterial({ color: 0xff6b38, emissive: 0xf04418, emissiveIntensity: 1.7, metalness: .24, roughness: .22 });
    const pivots = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group(); pivot.name = side < 0 ? 'Left war hammer' : 'Right war hammer';
      pivot.position.set(side * .56, 1.35, .46);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.035, .052, .83, 10), bronze);
      shaft.position.y = -.34; shaft.castShadow = true; pivot.add(shaft);
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(.057, .057, .2, 10), darkSteel);
      grip.position.y = -.08; pivot.add(grip);
      const head = new THREE.Mesh(new THREE.BoxGeometry(.53, .3, .36), darkSteel);
      head.position.y = -.73; head.castShadow = true; head.receiveShadow = true; pivot.add(head);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(.07, .25, .38), bronze);
      cap.position.set(-.24, -.73, 0); pivot.add(cap);
      const band = new THREE.Mesh(new THREE.BoxGeometry(.045, .23, .37), rune);
      band.position.set(.24, -.73, 0); pivot.add(band);
      root.add(pivot); pivots.push(pivot);
    }
    root.userData.hammerPair = pivots;
    const impact = new THREE.Mesh(new THREE.RingGeometry(.42, .78, 48), new THREE.MeshBasicMaterial({ color: 0xff793d, side: THREE.DoubleSide, transparent: true, opacity: .9, depthWrite: false }));
    impact.name = 'Twin hammer impact ring'; impact.rotation.x = -Math.PI / 2; impact.position.y = .045; impact.visible = false; impact.renderOrder = 3; scene.add(impact); root.userData.hammerImpact = impact;
  }
  function makeRig(kind, key) {
    const root = new THREE.Group(); root.name = key;
    if (kind === 'golden') {
      const groundShadow = new THREE.Mesh(new THREE.CircleGeometry(.48, 28), new THREE.MeshBasicMaterial({ color: 0x020711, transparent: true, opacity: .32, depthWrite: false }));
      groundShadow.name = 'Red Dawn soft ground shadow'; groundShadow.rotation.x = -Math.PI / 2; groundShadow.position.set(0, .018, 0); groundShadow.renderOrder = 1; root.add(groundShadow); root.userData.groundShadow = groundShadow;
    }
    if (kind === 'hammerer') addBossHammers(root);
    const body = new THREE.Group(); root.add(body);
    let bodyMat = kind === 'golden' ? mats.dark : mats.gold, limbMat = mats.dark, headMat = mats.skin, accent = mats.cyan, isHero = true;
    if (kind === 'wildclaw') { bodyMat = mats.blue; limbMat = mats.blue; headMat = mat(0xd6c8a8,.82,.02); accent = mats.goldBright; }
    if (kind === 'lizard') { bodyMat = mat(0x315641, .52, .16); limbMat = mat(0x263f33, .64, .12); headMat = mat(0x577b52, .48, .08); accent = mats.cyan; }
    if (kind === 'sentinel') { bodyMat = mats.sentinelArmor; limbMat = mats.dark; headMat = mats.sentinelArmor; accent = mats.sentinelTrim; }
    if (kind === 'finnew') { bodyMat = mats.finDark; limbMat = mats.finDark; headMat = mats.finSkin; accent = mats.finGold; }
    if (kind === 'ashen') { bodyMat = mats.green; limbMat = mats.dark; headMat = mats.green; accent = mats.red; isHero = false; }
    if (kind === 'darkwarrior') { bodyMat = mats.dark; limbMat = mats.dark; headMat = mats.dark; accent = mats.red; isHero = false; }
    if (kind === 'hammerer') { bodyMat = mat(0x44342e, .72, .35); limbMat = mats.dark; headMat = mat(0x9a765c, .76, .05); accent = mats.goldBright; isHero = false; }
    if (kind === 'bonecaller') { bodyMat = mats.robe; limbMat = mats.robe; headMat = mats.skin; accent = mats.fire; isHero = false; }
    if (kind === 'skeleton') { bodyMat = mats.bone; limbMat = mats.bone; headMat = mats.bone; accent = mats.red; isHero = false; }
    const torsoH = kind === 'skeleton' ? .76 : 1.05;
    box(body, [.78, torsoH, .4], bodyMat, [0, 1.34, 0]);
    box(body, [.88, .22, .46], kind === 'ashen' ? mats.green : bodyMat, [0, 1.83, 0]);
    box(body, [.48, .16, .035], accent, [0, 1.36, -.217], false);
    if (kind === 'sentinel') {
      armorPlate(body, [[-.37,1.79],[-.27,1.88],[0,1.77],[.27,1.88],[.37,1.79],[.22,1.57],[0,1.48],[-.22,1.57]], mats.sentinelArmor, .228);
      armorPlate(body, [[-.31,1.51],[-.25,1.31],[0,1.23],[.25,1.31],[.31,1.51],[.18,1.58],[0,1.49],[-.18,1.58]], mats.sentinelArmor, .232);
      neonSeam(body, [[-.3,1.84],[-.14,1.73],[0,1.57],[.14,1.73],[.3,1.84]], .018, mats.sentinelTrim);
      neonSeam(body, [[0,1.57],[0,1.43],[0,1.29]], .015, mats.sentinelTrim);
      for (const side of [-1,1]) { const pad=sphere(body,.29,mats.sentinelArmor,[side*.55,1.77,0]); pad.scale.set(1.2,.8,1); neonSeam(body,[[side*.37,1.9,.1],[side*.55,1.96,.14],[side*.73,1.87,.1]],.014,mats.sentinelTrim); }
    }
    if (kind === 'finnew') {
      armorPlate(body, [[-.39,1.86],[.39,1.86],[.32,1.57],[.27,1.25],[0,1.16],[-.27,1.25],[-.32,1.57]], mats.finGold, .226);
      armorPlate(body, [[-.22,1.45],[0,1.53],[.22,1.45],[.18,1.27],[0,1.22],[-.18,1.27]], mats.finDark, .238);
      neonSeam(body,[[-.31,1.82],[-.24,1.54],[-.2,1.28],[0,1.21],[.2,1.28],[.24,1.54],[.31,1.82]],.014,mats.goldBright);
      armorPlate(body,[[-.33,1.06],[-.28,.94],[.28,.94],[.33,1.06],[.24,1.2],[-.24,1.2]],mats.finGold,.228);
      for(const side of [-1,1]){const pad=sphere(body,.29,mats.finDark,[side*.55,1.74,0]);pad.scale.set(1.22,.82,1.02);neonSeam(body,[[side*.38,1.87,.1],[side*.55,1.93,.14],[side*.73,1.83,.1]],.012,mats.goldBright);}
    }
    if (kind === 'wildclaw') {
      // Sculpted chest plates and a bright claw crest make the blue suit read clearly at game distance.
      for (const side of [-1, 1]) { const pec=sphere(body,.235,mats.blue,[side*.2,1.58,.19]);pec.scale.set(1.04,.68,.44); }
      const stripe=mat(0x102944,.48,.16), trim=mat(0x96edff,.26,.22,0x2fbbef,.7);
      armorPlate(body,[[-.11,1.45],[-.04,1.5],[0,1.43],[.04,1.5],[.11,1.45],[.055,1.32],[0,1.29],[-.055,1.32]],mats.goldBright,.245);
      box(body,[.68,.13,.48],mats.dark,[0,.99,0]);box(body,[.62,.055,.49],mats.goldBright,[0,1.01,.015]);
      armorPlate(body,[[-.16,1.03],[-.12,.94],[0,.9],[.12,.94],[.16,1.03],[0,1.08]],mats.goldBright,.255);
      neonSeam(body,[[-.31,1.72,-.01],[-.25,1.67,.22],[-.1,1.63,.25]],.018,trim);
      neonSeam(body,[[.31,1.72,-.01],[.25,1.67,.22],[.1,1.63,.25]],.018,trim);
      // Bold curved tiger marks on the chest and flanks.
      for (const side of [-1,1]) {
        neonSeam(body,[[side*.32,1.74,.07],[side*.22,1.67,.2],[side*.13,1.58,.24]],.025,stripe);
        neonSeam(body,[[side*.38,1.57,.06],[side*.26,1.51,.2],[side*.18,1.43,.23]],.023,stripe);
        neonSeam(body,[[side*.39,1.38,.02],[side*.28,1.33,.18],[side*.2,1.25,.21]],.022,stripe);
        neonSeam(body,[[side*.31,1.72,-.04],[side*.22,1.64,-.2],[side*.12,1.55,-.22]],.022,stripe);
        neonSeam(body,[[side*.37,1.52,-.03],[side*.25,1.44,-.19],[side*.17,1.36,-.2]],.02,stripe);
      }
      body.userData.wildStripe=stripe;body.userData.wildTrim=trim;
    }
    if (kind === 'golden') {
      armorPlate(body, [[-.43,1.82],[-.18,1.88],[0,1.69],[-.05,1.48],[-.34,1.59]], mats.gold, .226);
      armorPlate(body, [[.43,1.82],[.18,1.88],[0,1.69],[.05,1.48],[.34,1.59]], mats.gold, .226);
      neonSeam(body, [[-.37,1.78,.246],[-.2,1.7,.251],[-.04,1.56,.25],[0,1.49,.247]], .016);
      neonSeam(body, [[.37,1.78,.246],[.2,1.7,.251],[.04,1.56,.25],[0,1.49,.247]], .016);
      box(body, [.075,.32,.045], mats.cyan, [0,1.67,.252], false);
      const reactor = sphere(body, .135, mats.cyan, [0,1.34,.255]); reactor.scale.set(.82,1.1,.38);
      armorPlate(body, [[-.34,1.37],[-.25,1.43],[0,1.4],[.25,1.43],[.34,1.37],[.26,1.22],[0,1.17],[-.26,1.22]], mats.gold, .23);
      armorPlate(body, [[-.29,1.16],[-.2,1.2],[0,1.17],[.2,1.2],[.29,1.16],[.22,1.02],[0,.98],[-.22,1.02]], mats.goldBright, .232);
      armorPlate(body, [[-.24,.96],[-.15,1],[0,.98],[.15,1],[.24,.96],[.17,.83],[0,.78],[-.17,.83]], mats.gold, .232);
      neonSeam(body, [[-.38,1.26,-.05],[-.32,1.1,-.04],[-.24,.95,-.03],[-.16,.79,-.02]], .015);
      neonSeam(body, [[.38,1.26,-.05],[.32,1.1,-.04],[.24,.95,-.03],[.16,.79,-.02]], .015);
      for (const side of [-1,1]) {
        const shoulder = sphere(body, .31, mats.goldBright, [side*.55,1.77,0]); shoulder.scale.set(1.25,.74,.95);
        neonSeam(body, [[side*.34,1.91,.12],[side*.52,1.98,.17],[side*.73,1.9,.11],[side*.76,1.79,.08]], .017);
      }
    }
    const head = new THREE.Group(); head.position.set(0, 2.12, 0); body.add(head);
    sphere(head, kind === 'ashen' || kind === 'darkwarrior' ? .34 : .29, headMat, [0, 0, 0]);
    if (kind === 'finnew') {
      const crown=sphere(head,.29,mats.finDark,[0,.11,-.005]);crown.scale.set(1.05,.9,.94);
      box(head,[.47,.16,.105],mats.finVisor,[0,.025,.235]);
      box(head,[.51,.035,.11],mats.finGold,[0,.115,.238]);
      armorPlate(head,[[-.19,.13],[-.16,.32],[0,.49],[.16,.32],[.19,.13],[.1,.1],[0,.21],[-.1,.1]],mats.finGold,.245);
      armorPlate(head,[[-.2,.08],[-.27,-.05],[-.18,-.17],[-.12,-.1]],mats.finDark,.19);
      armorPlate(head,[[.2,.08],[.27,-.05],[.18,-.17],[.12,-.1]],mats.finDark,.19);
      const neckSeal=cylinder(body,.25,.28,.22,mats.finDark,[0,1.97,0]);
    }
    if (kind === 'sentinel') {
      const shell=sphere(head,.31,mats.sentinelArmor,[0,.03,0]); shell.scale.set(.94,1.2,.94);
      const face=box(head,[.42,.52,.12],mats.sentinelArmor,[0,-.09,.235]); face.rotation.x=-.08;
      neonSeam(head,[[0,.34,.18],[0,.13,.285],[-.14,.02,.285],[-.12,-.16,.28]],.022,mats.sentinelTrim);
      neonSeam(head,[[0,.13,.285],[.14,.02,.285],[.12,-.16,.28]],.022,mats.sentinelTrim);
      neonSeam(head,[[0,.13,.29],[0,-.34,.24]],.019,mats.sentinelTrim);
      for (const side of [-1,1]) { const ear=sphere(head,.12,mats.sentinelArmor,[side*.27,.01,0]); ear.scale.set(.5,1,1); }
    }
    if (kind === 'bonecaller') { const hood = new THREE.Mesh(new THREE.ConeGeometry(.48, .78, 8), mats.robe); hood.position.set(0, .13, -.07); hood.castShadow = true; head.add(hood); }
    if (kind === 'wildclaw') {
      const stripe=body.userData.wildStripe,trim=body.userData.wildTrim;
      for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(.11, .43, 5), headMat); ear.position.set(s * .22, .37, 0); ear.rotation.z = -s * .28; ear.castShadow=true;head.add(ear);
        const cheek=sphere(head,.12,headMat,[s*.18,-.105,.16]);cheek.scale.set(1,.8,.8);
        sphere(head,.034,mat(0x42ffbd,.2,.05,0x13bb83,1.7),[s*.112,.035,.259]);
        sphere(head,.012,mat(0x0b1920,.28,.12),[s*.112,.035,.287]);
        neonSeam(head,[[s*.04,.24,.205],[s*.105,.17,.25],[s*.17,.11,.215]],.022,stripe);
        neonSeam(head,[[s*.22,.12,.15],[s*.19,.015,.239],[s*.13,-.055,.259]],.021,stripe);
        neonSeam(head,[[s*.25,-.025,.14],[s*.2,-.12,.207],[s*.1,-.15,.248]],.018,stripe);
        const claw=new THREE.Mesh(new THREE.ConeGeometry(.035,.16,6),mats.goldBright);claw.position.set(s*.115,-.27,.27);claw.rotation.x=Math.PI/2;head.add(claw);
      }
      const muzzle=sphere(head,.105,mat(0xe3d8c1,.82,.01),[0,-.13,.235]);muzzle.scale.set(1.4,.68,.75);
      const nose=new THREE.Mesh(new THREE.ConeGeometry(.052,.07,5),mat(0x17232a,.42,.12));nose.position.set(0,-.075,.298);nose.rotation.x=Math.PI/2;head.add(nose);
      neonSeam(head,[[0,.29,.17],[0,.2,.24],[0,.11,.285]],.022,trim);
      neonSeam(head,[[-.055,-.17,.282],[0,-.19,.3],[.055,-.17,.282]],.009,stripe);
    }
    let helmet = null, hair = null, beard = null;
    if (kind === 'golden' || kind === 'player') {
      // Human face and short dark hair remain visible until the helmet animation completes.
      hair = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 10, 0, Math.PI * 2, 0, Math.PI * .48), mats.dark);
      hair.position.set(0, .09, -.015); hair.castShadow = true; head.add(hair);
      beard = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), mat(0x292528, .95));
      beard.scale.set(1, .72, .72); beard.position.set(0, -.16, .13); beard.castShadow = true; head.add(beard);
      for (const side of [-1, 1]) {
        sphere(head, .034, mats.dark, [side * .105, -.015, .255]);
        sphere(head, .027, mat(0x365044), [side * .105, .005, .279]);
      }
      const nose = new THREE.Mesh(new THREE.ConeGeometry(.045, .13, 6), mats.skin); nose.position.set(0, -.075, .29); nose.rotation.x = Math.PI / 2; head.add(nose);
      helmet = new THREE.Group(); body.add(helmet);
      const helmetShell = sphere(helmet, .36, mats.dark, [0, .035, 0]); helmetShell.scale.set(.93,1.2,.9);
      const crown = sphere(helmet, .3, mats.gold, [0, .13, .025]); crown.scale.set(.92,.84,.86);
      armorPlate(helmet, [[-.22,.05],[-.17,.32],[0,.39],[.17,.32],[.22,.05],[.16,-.05],[0,-.1],[-.16,-.05]], mats.goldBright, .245);
      armorPlate(helmet, [[-.22,-.04],[-.2,-.2],[-.12,-.38],[0,-.45],[.12,-.38],[.2,-.2],[.22,-.04],[0,-.12]], mats.gold, .274);
      box(helmet, [.4,.1,.04], mats.red, [0,.015,.335], false);
      box(helmet, [.25,.05,.03], mats.cyan, [0,.017,.359], false);
      box(helmet, [.32,.2,.16], mats.gold, [0,-.3,.22]);
      for (const side of [-1, 1]) {
        sphere(helmet, .16, mats.gold, [side * .3, .03, 0]);
        box(helmet, [.06, .34, .22], mats.goldBright, [side * .235, -.25, .19]);
      }
      const neckSeal = cylinder(body, .28, .31, .32, mats.dark, [0, 1.91, 0]);
      for (let i = 0; i < 3; i++) cylinder(body, .285, .285, .025, mats.blue, [0, 1.82 + i * .07, .01]);
      helmet.userData.neckSeal = neckSeal;
      helmet.position.set(.72, 1.18, .32);
      hair.visible = false; beard.visible = false;
    }
    if (kind === 'ashen' || kind === 'darkwarrior') { sphere(head, .065, mats.red, [-.13, .03, .26]); sphere(head, .065, mats.red, [.13, .03, .26]); }
    if (kind === 'skeleton') { sphere(head, .055, mats.red, [-.1, .02, .24]); sphere(head, .055, mats.red, [.1, .02, .24]); }
    const arms = [], legs = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(side * .52, 1.72, 0); body.add(arm); arms.push(arm);
      cylinder(arm, .145, .19, .47, limbMat, [0, -.23, 0]);
      if (kind === 'sentinel') { const shoulderGuard=sphere(arm,.2,mats.sentinelArmor,[0,-.17,.06]); shoulderGuard.scale.set(1.08,.78,1.12); neonSeam(arm,[[-.14,-.05,.12],[-.04,.015,.17],[.12,-.035,.14]],.011,mats.sentinelTrim); }
      if (kind === 'golden') { const shoulderGuard=sphere(arm,.2,mats.gold,[0,-.17,.06]); shoulderGuard.scale.set(1.08,.78,1.12); neonSeam(arm,[[-.14,-.05,.12],[-.04,.015,.17],[.12,-.035,.14]],.012); }
      const fore = new THREE.Group(); fore.position.set(0, -.43, 0); arm.add(fore); arm.userData.fore = fore;
      cylinder(fore, .12, .145, .42, kind === 'ashen' ? mats.green : limbMat, [0, -.2, .015]);
      if (kind === 'finnew') { armorPlate(fore,[[-.13,-.03],[-.11,-.34],[0,-.44],[.11,-.34],[.13,-.03],[0,.04]],mats.finGold,.12); neonSeam(fore,[[0,-.03,.15],[0,-.22,.16],[0,-.4,.14]],.012,mats.goldBright); }
      if (kind === 'wildclaw') {
        const stripe=body.userData.wildStripe,trim=body.userData.wildTrim;
        neonSeam(arm,[[-.14,-.1,.06],[-.06,-.19,.145],[.02,-.28,.12]],.018,stripe);
        neonSeam(arm,[[.14,-.13,.06],[.07,-.22,.145],[-.02,-.31,.12]],.018,stripe);
        armorPlate(fore,[[-.12,-.04],[-.1,-.3],[0,-.4],[.1,-.3],[.12,-.04],[0,.015]],mats.blue,.13);
        neonSeam(fore,[[0,-.03,.15],[0,-.18,.17],[0,-.36,.14]],.012,trim);
        for(let c=-1;c<=1;c++) { const talon=new THREE.Mesh(new THREE.ConeGeometry(.032,.14,5),mats.goldBright);talon.position.set(c*.065,-.48,.18);talon.rotation.x=-.4;fore.add(talon); }
      }
      if (kind === 'sentinel') { armorPlate(fore,[[-.13,-.04],[-.1,-.35],[-.04,-.43],[.1,-.36],[.13,-.06],[.05,.02]],mats.sentinelArmor,.115); neonSeam(fore,[[0,-.04,.15],[0,-.2,.15],[0,-.39,.15]],.012,mats.sentinelTrim); }
      if (kind === 'golden') { armorPlate(fore,[[-.13,-.04],[-.1,-.35],[-.04,-.43],[.1,-.36],[.13,-.06],[.05,.02]],mats.goldBright,.115); neonSeam(fore,[[-.1,-.05,.145],[-.09,-.2,.15],[-.055,-.35,.15],[0,-.41,.15]],.012); }
      sphere(fore, kind === 'golden' ? .17 : .12, kind === 'golden' ? mats.goldBright : limbMat, [0, -.44, .09]);
      const leg = new THREE.Group(); leg.position.set(side * .22, .87, 0); body.add(leg); legs.push(leg);
      cylinder(leg, .13, .17, .48, limbMat, [0, -.25, 0]);
      if (kind === 'wildclaw') {
        const stripe=body.userData.wildStripe,trim=body.userData.wildTrim;
        const thigh=sphere(leg,.18,mats.blue,[0,-.2,.035]);thigh.scale.set(.95,1.18,.75);
        neonSeam(leg,[[-.12,-.04,.11],[-.05,-.13,.17],[.03,-.22,.16]],.019,stripe);
        neonSeam(leg,[[.12,-.1,.11],[.05,-.19,.17],[-.03,-.27,.15]],.018,stripe);
        box(leg,[.31,.17,.34],mats.dark,[0,-.48,.08]);
        armorPlate(leg,[[-.14,-.06],[-.1,-.34],[0,-.42],[.1,-.34],[.14,-.06],[0,.015]],mats.blue,.14);
        neonSeam(leg,[[0,-.02,.16],[0,-.18,.18],[0,-.35,.15]],.012,trim);
      }
      if (kind === 'finnew') { const thigh=sphere(leg,.18,mats.finDark,[0,-.22,.08]);thigh.scale.set(.83,1.15,.58); }
      if (kind === 'sentinel') { const thigh=sphere(leg,.19,mats.sentinelArmor,[0,-.22,.08]); thigh.scale.set(.83,1.2,.58); neonSeam(leg,[[0,.005,.17],[side*.05,-.15,.18],[0,-.42,.16]],.012,mats.sentinelTrim); }
      if (kind === 'golden') { const thigh=sphere(leg,.19,mats.gold,[0,-.22,.08]); thigh.scale.set(.83,1.2,.58); neonSeam(leg,[[0,.005,.17],[side*.08,-.12,.19],[side*.09,-.3,.17],[0,-.43,.16]],.013); }
      const shin = new THREE.Group(); shin.position.set(0, -.49, 0); leg.add(shin); leg.userData.shin = shin;
      cylinder(shin, .105, .13, .43, limbMat, [0, -.21, 0]); box(shin, [.27, .15, .4], kind === 'golden' ? mats.gold : limbMat, [0, -.44, .1]);
      if (kind === 'finnew') { armorPlate(shin,[[-.12,-.03],[-.1,-.32],[0,-.45],[.1,-.32],[.12,-.03],[0,.04]],mats.finDark,.135); neonSeam(shin,[[0,.01,.16],[0,-.18,.17],[0,-.4,.15]],.01,mats.finGold); }
      if (kind === 'sentinel') { armorPlate(shin,[[-.12,-.03],[-.1,-.32],[0,-.45],[.1,-.32],[.12,-.03],[0,.045]],mats.sentinelArmor,.135); neonSeam(shin,[[0,.015,.16],[0,-.14,.17],[0,-.32,.16],[0,-.41,.15]],.012,mats.sentinelTrim); }
      if (kind === 'golden') { armorPlate(shin,[[-.12,-.03],[-.1,-.32],[0,-.45],[.1,-.32],[.12,-.03],[0,.045]],mats.goldBright,.135); neonSeam(shin,[[0,.015,.16],[0,-.14,.17],[0,-.32,.16],[0,-.41,.15]],.014); }
    }
    if (kind === 'golden' || kind === 'ashen' || kind === 'darkwarrior') {
      const shape = new THREE.Shape(); shape.moveTo(-.43, 1.72); shape.quadraticCurveTo(0, 1.58, .43, 1.72); shape.lineTo(.57, .65); shape.quadraticCurveTo(.72, .05, .77, -.12); shape.lineTo(.37, -.2); shape.lineTo(0, -.12); shape.lineTo(-.38, -.22); shape.lineTo(-.76, -.1); shape.quadraticCurveTo(-.68, .42, -.57, .86); shape.closePath();
      const villainCape = kind === 'ashen' || kind === 'darkwarrior';
      const capeMaterial = new THREE.MeshStandardMaterial({ color: villainCape ? 0x171922 : 0xffffff, map: villainCape ? null : clothTexture, roughness: .96, metalness: .02, side: THREE.DoubleSide });
      let capeGeometry = new THREE.ShapeGeometry(shape, 12);
      if (kind === 'golden') {
        capeGeometry = new THREE.PlaneGeometry(1.54, 1.94, 18, 28);
        const capePositions = capeGeometry.attributes.position;
        for (let row = 0; row <= 28; row++) for (let column = 0; column <= 18; column++) {
          const index = row * 19 + column, u = column / 18, v = row / 28;
          const halfWidth = .43 + .34 * v;
          capePositions.setXYZ(index, (u - .5) * 2 * halfWidth, 1.72 - 1.94 * v - .14 * (1 - v) * Math.sin(Math.PI * u) - .075 * v * (.5 + .5 * Math.sin(u * Math.PI * 6)), 0);
        }
        capeGeometry.computeVertexNormals();
      }
      const cape = new THREE.Mesh(capeGeometry, capeMaterial);
      cape.position.set(0, .08, -.31); cape.castShadow = true; cape.receiveShadow = true; body.add(cape); root.userData.cape = cape;
      if (kind === 'golden') cape.userData.restVertices = Float32Array.from(cape.geometry.attributes.position.array);
    }
    if (kind === 'bonecaller') {
      const wand = cylinder(body, .035, .05, 1.6, mats.dark, [ .78, 1.05, .05]); wand.rotation.z = -.12;
      const wandGem=sphere(body, .17, mats.fire, [.78, 1.9, .05]); wandGem.material=mats.fire.clone(); root.userData.wand = wand; root.userData.wandGem = wandGem;
    }
    // Only the named caster needs an overhead title: six hammerer labels obscured the battle.
    if (kind === 'bonecaller') {
      const labelCanvas = document.createElement('canvas'); labelCanvas.width = 512; labelCanvas.height = 112;
      const labelCtx = labelCanvas.getContext('2d');
      const label = kind === 'bonecaller' ? 'THE BONECALLER' : 'TWIN HAMMERER', subtitle = kind === 'bonecaller' ? 'WAND MAGE' : 'DUAL HAMMER BRUTE';
      labelCtx.fillStyle = 'rgba(9,12,20,.86)'; labelCtx.strokeStyle = kind === 'bonecaller' ? '#ff526f' : '#ff9a55'; labelCtx.lineWidth = 5;
      labelCtx.beginPath(); labelCtx.roundRect(8, 8, 496, 96, 18); labelCtx.fill(); labelCtx.stroke();
      labelCtx.textAlign = 'center'; labelCtx.textBaseline = 'middle'; labelCtx.font = '900 43px sans-serif'; labelCtx.fillStyle = '#fff1f3'; labelCtx.fillText(label, 256, 48);
      labelCtx.font = '700 17px sans-serif'; labelCtx.fillStyle = kind === 'bonecaller' ? '#ff8498' : '#ffbd85'; labelCtx.fillText(subtitle, 256, 81);
      const labelTexture = new THREE.CanvasTexture(labelCanvas); labelTexture.colorSpace = THREE.SRGBColorSpace;
      const nameplate = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthTest: true, sizeAttenuation: true }));
      nameplate.scale.set(2.65, .58, 1); nameplate.position.set(0, 2.95, 0); root.add(nameplate); root.userData.nameplate = nameplate;
    }
    const weapon = new THREE.Group();
    cylinder(weapon, .035, .05, .53, mats.goldBright, [0, -.1, 0]);
    const blade = new THREE.Mesh(new THREE.ConeGeometry(.105, .62, 4), mats.cyan); blade.position.set(0, .47, 0); blade.rotation.z = Math.PI; weapon.add(blade);
    weapon.position.set(.02, -.34, .1); arms[0].userData.fore.add(weapon); root.userData.weapon = weapon;
    if (kind === 'skeleton') for (let i = 0; i < 3; i++) cylinder(body, .025, .025, .66, mats.bone, [0, 1.25 - i * .16, .22]);
    root.userData = { ...root.userData, body, arms, legs, kind, isHero, head, helmet, hair, beard, maskProgress: 0 };
    if (kind === 'hammerer' && root.userData.weapon) root.userData.weapon.visible = false;
    scene.add(root); rigs.set(key, root); attachCharacterModel(root, kind); return root;
  }
  function rigFor(key, kind) { let r = rigs.get(key); if (r && r.userData.kind !== kind) { scene.remove(r); rigs.delete(key); r = null; } if (!r) r = makeRig(kind, key); return r; }
  window.createOpeningActor=(kind,key)=>{const actor=makeRig(kind,key);rigs.delete(key);return actor;};
  function heroWalkPose(phase, amount, running) {
    const weight = THREE.MathUtils.clamp(amount, 0, 1), swing = Math.sin(phase);
    const lift = Math.pow(Math.max(0, Math.cos(phase)), 1.5) * weight;
    const settle = .035 + weight * (running ? .025 : .01);
    const thigh = -swing * (running ? .48 : .28) * weight;
    const knee = settle + lift * (running ? .64 : .38);
    return {
      thigh, knee,
      ankle: -thigh - knee + .055 + lift * .14,
      arm: -.09 + swing * (running ? .48 : .34) * weight,
      elbow: -.27 - weight * (running ? .18 : .1) - lift * .09
    };
  }
  function syncActor(key, kind, source, t, player = false, local = false) {
    const rig = rigFor(key, kind), ud = rig.userData;
    window.resetCharacterPose?.(rig);
    if(ud.radioHidden){rig.visible=true;delete ud.radioHidden;}
    ud.source = source; ud.isPlayer = player;
    const scale = source.giant ? 1.95 : (player ? (source.hero === 'wildclaw' ? 1.1 : source.hero === 'lizard' ? 1.09 : 1.07) : 1.06);
    rig.scale.setScalar(1.06 * window.heroCharacterSize(source)*((window.heroArena3DState?.()?.state?.round===3 && player) ? 0.68 : 1));
    const jumpProgress = source.jump > 0 ? THREE.MathUtils.clamp((.76 - source.jump) / .76, 0, 1) : 0;
    const jumpLift = source.jump > 0 ? Math.sin(jumpProgress * Math.PI) * 1.15 : 0;
    const x = ((source.x ?? 500) - 500) * .055;
    const z = ((source.y ?? 300) - 300) * .055;
    const climbLift = source.climbing ? Math.min(110, source.climbHeight || 0) * .045 : 0;
    rig.position.set(x, jumpLift + climbLift, z);
    if (ud.creatureModel) {
      const creatureMotion = t * 2.15 + key.length * .7;
      const striking = Number(source.attack) > 0 && Number(source.attack) < .42;
      ud.creatureModel.position.y = (ud.creatureBaseY || 0) + Math.sin(creatureMotion) * .025;
      ud.creatureModel.rotation.x = striking ? -.11 : Math.sin(creatureMotion * .7) * .012;
      ud.creatureModel.rotation.z = Math.sin(creatureMotion * .8) * .012;
    }
    if (kind === 'hammerer' && ud.hammerPair) {
      const timer = source.bossSmash || 0;
      if (timer > 0) {
        const progress = THREE.MathUtils.clamp(1 - timer / 1.1, 0, 1);
        for (let i = 0; i < ud.hammerPair.length; i++) {
          const hammer = ud.hammerPair[i], side = i ? 1 : -1;
          hammer.visible = !ud.glbModel;
          if (progress < .48) {
            const lift = THREE.MathUtils.smoothstep(progress / .48, 0, 1);
      hammer.position.set(side * .56, 1.35 + .62 * lift, .46);
            hammer.rotation.set(-2.72 * lift, 0, side * .08 * lift);
          } else if (progress < .76) {
            const slam = THREE.MathUtils.smoothstep((progress - .48) / .28, 0, 1);
            hammer.position.set(side * .56, 1.97 - .7 * slam, .46 + .48 * slam);
            hammer.rotation.set(-2.72 * (1 - slam) + .18 * slam, 0, side * .08 * (1 - slam));
          } else {
            const settle = THREE.MathUtils.smoothstep((progress - .76) / .24, 0, 1);
            hammer.position.set(side * .56, 1.27 + .08 * settle, .94 - .48 * settle);
            hammer.rotation.set(.18 * (1 - settle), 0, 0);
          }
        }
        if (ud.hammerImpact) {
          const impact = ud.hammerImpact, age = 1.1 - timer;
          impact.position.x = ((source.smashX ?? source.x ?? 700) - 500) * .055;
          impact.position.z = ((source.smashY ?? source.y ?? 285) - 300) * .055;
          impact.visible = age > .68 && age < 1.1;
          const pulse = Math.max(0, Math.sin((age - .68) * 7));
          impact.scale.setScalar(.65 + pulse * 1.35);
          impact.material.opacity = .82 * (1 - THREE.MathUtils.clamp((age - .68) / .42, 0, 1));
        }
      } else {
        for (let i = 0; i < ud.hammerPair.length; i++) {
          const hammer = ud.hammerPair[i], side = i ? 1 : -1;
          hammer.position.set(side * .56, 1.35 + Math.max(0, Math.sin(t * 2.4 + i * .6)) * .055, .46);
          hammer.rotation.set(Math.sin(t * 2 + i * .7) * .075, 0, side * Math.sin(t * 1.7 + i) * .045);
        }
        if (ud.hammerImpact) ud.hammerImpact.visible = false;
      }
    }
    if (ud.groundShadow && source.hero === 'guardian') {
      ud.groundShadow.position.y = .018 - jumpLift;
      ud.groundShadow.scale.setScalar(1 + jumpLift * .16);
      ud.groundShadow.material.opacity = Math.max(.13, .32 - jumpLift * .11);
    }
    const movementAmount=Number.isFinite(source.moveSpeed)?Math.min(1,source.moveSpeed/110):Math.min(1,Math.hypot(source.fx||0,source.fy||0));
    const moving = !source.buried && movementAmount > .025;
    if (player) {
      const motionDt = Math.min(.05, Math.max(0, t - (ud.motionTime ?? t)));
      ud.motionTime = t;
      const walking = moving && !source.climbing && !source.flying && !(source.jump > 0);
      ud.walkBlend = THREE.MathUtils.lerp(ud.walkBlend || 0, walking ? movementAmount : 0, 1 - Math.exp(-motionDt * 12));
      const travelled=ud.stepPosition?Math.hypot(x-ud.stepPosition.x,z-ud.stepPosition.z):0;
      ud.stepPosition={x,z};
      const stride=(source.run?2.5:1.7)*rig.scale.x;
      ud.walkPhase=(ud.walkPhase||0)+(walking&&travelled<3?travelled/stride*Math.PI*2:0);
      const cycle = ud.walkPhase, walkBlend = ud.walkBlend;
      const gait = [heroWalkPose(cycle, walkBlend, source.run), heroWalkPose(cycle + Math.PI, walkBlend, source.run)];
      if(kind==='ecal')for(const pose of gait){pose.thigh*=1.25;pose.knee=.13+(pose.knee-.11)*1.25;pose.arm*=1.2;pose.elbow-=.08;pose.ankle=-pose.thigh-pose.knee+.055;}
      const active = (source.actionTime || 0) > 0;
      const action = active ? source.action || '' : '';
      const hasDirection = Math.hypot(source.fx || 0, source.fy || 0) > .04;
      const previousWalk=ud.walkPosition;ud.walkPosition={x,z};
      const walkDx=previousWalk?x-previousWalk.x:0,walkDz=previousWalk?z-previousWalk.z:0;
      const displaced=Math.hypot(walkDx,walkDz)>.001;
      const targetYaw = displaced?Math.atan2(walkDx,walkDz):moving&&Number.isFinite(source.moveYaw)?source.moveYaw:hasDirection ? Math.atan2(source.fx || 0, source.fy || 0) : (Number.isFinite(rig.userData.facingYaw) ? rig.userData.facingYaw : Math.PI);
      if (!Number.isFinite(rig.userData.facingYaw)) rig.userData.facingYaw = targetYaw;
      const deltaYaw = Math.atan2(Math.sin(targetYaw - rig.userData.facingYaw), Math.cos(targetYaw - rig.userData.facingYaw));
      ud.turnLead=THREE.MathUtils.clamp(deltaYaw,-.75,.75);
      rig.userData.facingYaw += deltaYaw * (1-Math.exp(-motionDt*(source.run?10:7)));
      rig.rotation.y = rig.userData.facingYaw;
      if (ud.glbModel) {
        ud.glbModel.position.y = .018 + Math.abs(Math.sin(cycle)) * .012 * walkBlend;
        ud.glbModel.rotation.z = source.dodge > 0 ? Math.sin(t * 25) * .2 : Math.sin(cycle) * .008 * walkBlend;
        if (action === 'punch' || action === 'firePunch') ud.glbModel.rotation.x = -.055;
        else ud.glbModel.rotation.x = 0;
      }
      ud.weapon.visible = kind !== 'ecal' && !!source.weaponHeld;
      if (ud.helmet) {
        const target = source.helmet ? 1 : 0;
        if (source.action === 'helmet' && (source.actionTime || 0) > 0) { const remaining = THREE.MathUtils.clamp((source.actionTime || 0) / .8, 0, 1); ud.maskProgress = source.helmet ? 1 - remaining : remaining; }
        else ud.maskProgress = target;
        const eased = ud.maskProgress * ud.maskProgress * (3 - 2 * ud.maskProgress);
        ud.helmet.visible = true;
        ud.helmet.position.set(.72 * (1 - eased), 1.18 + .94 * eased, .32 * (1 - eased));
        ud.helmet.rotation.z = -.35 * (1 - eased);
        if (ud.hair) ud.hair.visible = ud.maskProgress < .96;
        if (ud.beard) ud.beard.visible = ud.maskProgress < .96;
        ud.arms[1].rotation.x = Math.min(0, -Math.sin(ud.maskProgress * Math.PI) * .85);
        ud.arms[1].rotation.z = -Math.sin(ud.maskProgress * Math.PI) * .5;
      }
      if (ud.glbRig?.mask) {
        const target = source.helmet ? 1 : 0;
        if (source.action === 'helmet' && (source.actionTime || 0) > 0) { const remaining = THREE.MathUtils.clamp((source.actionTime || 0) / .8, 0, 1); ud.maskProgress = source.helmet ? 1 - remaining : remaining; }
        else ud.maskProgress = target;
        const eased = ud.maskProgress * ud.maskProgress * (3 - 2 * ud.maskProgress), mask = ud.glbRig.mask;
        mask.bone.position.lerpVectors(mask.home, mask.face, eased);
        mask.bone.rotation.x = -.12 * eased;
      }
      if (ud.helmetedModel) {
        const helmetOnPose = ud.maskProgress >= .985;
        ud.glbModel.visible = !helmetOnPose;
        ud.helmetedModel.visible = helmetOnPose;
        ud.helmetedModel.position.y = .018 + Math.abs(Math.sin(cycle)) * .012 * walkBlend;
        ud.helmetedModel.rotation.z = source.dodge > 0 ? Math.sin(t * 25) * .18 : Math.sin(cycle) * .008 * walkBlend;
      }
      if (!ud.starboltOrb) { const material = new THREE.MeshStandardMaterial({ color: 0xa5f4ff, emissive: 0x31caff, emissiveIntensity: 4.5, roughness: .2, metalness: .08 }); ud.starboltOrb = new THREE.Mesh(new THREE.SphereGeometry(.19, 20, 16), material); rig.add(ud.starboltOrb); }
      ud.starboltOrb.visible = action === 'starbolt' && active;
      if (ud.starboltOrb.visible) { const pulse = 1 + Math.sin(t * 35) * .22; ud.starboltOrb.position.set(.52, 1.26, -.42); ud.starboltOrb.scale.setScalar(pulse); ud.starboltOrb.material.emissiveIntensity = 3.5 + pulse * 2; }
      if (action === 'solarNova' && active) {
        if (!ud.novaRings) {
          ud.novaRings = [0, 1].map(i => {
            const mesh = new THREE.Mesh(new THREE.RingGeometry(.82, 1, 56), new THREE.MeshBasicMaterial({ color: i ? 0x6beaff : 0xffd66e, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
            mesh.rotation.x = -Math.PI / 2; mesh.position.y = .045 + i * .018; rig.add(mesh); return mesh;
          });
        }
        const progress = THREE.MathUtils.clamp(1 - source.actionTime / 1.05, 0, 1);
        ud.novaRings.forEach((ring, i) => { ring.visible = true; ring.scale.setScalar(.2 + progress * (i ? 11.6 : 13.2)); ring.material.opacity = .82 * (1 - progress) * (i ? .65 : 1); });
      } else if (ud.novaRings) ud.novaRings.forEach(ring => { ring.visible = false; });
      const punchDuration = action === 'firePunch' ? .55 : .24;
      const punchProgress = source.hero === 'wildclaw' && active && (action === 'punch' || action === 'firePunch') ? THREE.MathUtils.clamp(1 - source.actionTime / punchDuration, 0, 1) : 0;
      const punchBlend = Math.sin(punchProgress * Math.PI);
      const swordProgress = source.hero === 'lizard' && active && action === 'swordSlice' ? THREE.MathUtils.clamp(1 - source.actionTime / .58, 0, 1) : 0;
      const swordBlend = Math.sin(swordProgress * Math.PI);
      if (ud.iceSword) {
        const windup = THREE.MathUtils.smoothstep(Math.min(1, swordProgress / .32), 0, 1);
        const cut = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((swordProgress - .26) / .62, 0, 1), 0, 1);
        ud.iceSword.rotation.x = .08 - .36 * windup + .68 * cut;
        ud.iceSword.rotation.y = -.12 * windup + .28 * cut;
        ud.iceSword.rotation.z = -.08 - .62 * windup + 1.22 * cut;
        if (ud.swordTrail) {
          ud.swordTrail.visible = swordBlend > .06;
          ud.swordTrail.rotation.z = -.6 + swordProgress * 1.7;
          ud.swordTrail.scale.setScalar(.8 + swordBlend * .34);
          ud.swordTrail.material.opacity = swordBlend * .72;
        }
      }
      for (const g of [ud.glbRig, ud.helmetedRig].filter(Boolean)) {
        if (g.pelvis) g.pelvis.rotation.set(0, Math.sin(cycle) * .016 * walkBlend, -Math.sin(cycle) * .008 * walkBlend);
        if (g.spine) g.spine.rotation.set(.012 * walkBlend, -Math.sin(cycle) * .026 * walkBlend, Math.sin(cycle) * .01 * walkBlend);
        if (g.chest) g.chest.rotation.set(source.climbing ? -.14 : -.018 * walkBlend, Math.sin(cycle) * .012 * walkBlend, Math.sin(cycle) * .004 * walkBlend);
        if (g.head) g.head.rotation.set(-.008 * walkBlend, -Math.sin(cycle) * .012 * walkBlend, 0);
        g.thighs.forEach((bone, i) => { bone.rotation.x = gait[i].thigh; });
        g.knees.forEach((bone, i) => { bone.rotation.x = source.climbing ? .48 + i * .08 : gait[i].knee; });
        g.shins.forEach((bone, i) => { bone.rotation.x = source.climbing ? -.15 : gait[i].ankle; });
        g.feet.forEach(bone => { bone.rotation.x = 0; });
        g.arms.forEach((bone, i) => { bone.rotation.x = source.climbing ? -.92 : gait[i].arm; bone.rotation.z = source.climbing ? (i ? -.28 : .28) : (i ? -.025 : .025); });
        g.forearms.forEach((bone, i) => { bone.rotation.x = source.climbing ? -.42 : gait[i].elbow; });
        if (punchBlend > 0) {
          g.arms[0].rotation.x = THREE.MathUtils.lerp(g.arms[0].rotation.x, -1.55, punchBlend);
          g.arms[0].rotation.z = THREE.MathUtils.lerp(g.arms[0].rotation.z, -.34, punchBlend);
          g.forearms[0].rotation.x = THREE.MathUtils.lerp(g.forearms[0].rotation.x, -.42, punchBlend);
          g.arms[1].rotation.x = THREE.MathUtils.lerp(g.arms[1].rotation.x, -.34, punchBlend * .72);
          g.arms[1].rotation.z = THREE.MathUtils.lerp(g.arms[1].rotation.z, .18, punchBlend * .72);
          if (g.chest) { g.chest.rotation.x -= .075 * punchBlend; g.chest.rotation.y = .12 * punchBlend; }
        } else if (source.hero !== 'wildclaw' && (action === 'punch' || action === 'firePunch')) { g.arms[0].rotation.x = -1.35; g.arms[0].rotation.z = -.22; g.forearms[0].rotation.x = -.38; }
        if (swordProgress > 0) {
          const windup = THREE.MathUtils.smoothstep(Math.min(1, swordProgress / .32), 0, 1);
          const cut = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((swordProgress - .26) / .62, 0, 1), 0, 1);
          g.arms[1].rotation.x = THREE.MathUtils.lerp(-.24, -1.18, windup) + cut * .72;
          g.arms[1].rotation.z = THREE.MathUtils.lerp(-.08, -.9, windup) + cut * 1.52;
          g.forearms[1].rotation.x = -.36 - .22 * windup + .3 * cut;
          g.arms[0].rotation.x = -.32 - swordBlend * .28;
          g.arms[0].rotation.z = .16 + swordBlend * .24;
          g.forearms[0].rotation.x = -.42;
          if (g.chest) { g.chest.rotation.x = -.06 * swordBlend; g.chest.rotation.y = -.32 * windup + .68 * cut; g.chest.rotation.z = -.08 * swordBlend; }
        }
        if (action === 'solarNova' && active) { const charge = Math.sin(THREE.MathUtils.clamp(1 - source.actionTime / 1.05, 0, 1) * Math.PI); g.arms.forEach((bone, i) => { bone.rotation.x = -.72 - charge * .16; bone.rotation.z = i ? -.82 - charge * .18 : .82 + charge * .18; }); g.forearms.forEach((bone, i) => { bone.rotation.x = -.18 - charge * .2; }); if (g.chest) g.chest.rotation.x = -.06 - charge * .1; }
        if (action === 'starbolt' && active) { g.arms[0].rotation.x = -1.28; g.arms[0].rotation.z = -.28; g.forearms[0].rotation.x = -.18; if (g.chest) g.chest.rotation.x = -.08; }
        if (action === 'kick') { g.thighs[0].rotation.x = -1.22; g.knees[0].rotation.x = .55; g.shins[0].rotation.x = 0; }
        if (action === 'block' || source.blocking) g.arms.forEach((bone, i) => { bone.rotation.x = -.85; bone.rotation.z = i ? -.22 : .22; });
        if (action === 'laser') { g.arms[0].rotation.x = -.92; g.arms[0].rotation.z = -.12; }
        if (source.jump > 0) {
          const lift = Math.sin(jumpProgress * Math.PI);
          g.arms.forEach((bone, i) => { bone.rotation.x = -.22 - lift * .35; bone.rotation.z = i ? -.12 - lift * .12 : .12 + lift * .12; });
          g.forearms.forEach(bone => { bone.rotation.x = -.12 - lift * .16; });
        }
        if (action === 'helmet' && (source.actionTime || 0) > 0) { const lift = Math.sin(ud.maskProgress * Math.PI); g.arms.forEach((bone, i) => { bone.rotation.x = -.78 * lift; bone.rotation.z = i ? -.28 * lift : .28 * lift; }); g.forearms.forEach(bone => { bone.rotation.x = -.25 * lift; }); }
        if (source.jump > 0) {
          const air = Math.sin(jumpProgress * Math.PI);
          g.thighs[0].rotation.x = -.3 - air * .34; g.thighs[1].rotation.x = .14 + air * .18;
          g.knees[0].rotation.x = .34 + air * .55; g.knees[1].rotation.x = .25 + air * .4;
          g.shins[0].rotation.x = -.12 - air * .18; g.shins[1].rotation.x = -.08 - air * .12;
          g.feet.forEach((bone, i) => { bone.rotation.x = -.08 - air * (i ? .1 : .18); });
        } else if (source.flying) {
          g.thighs.forEach((bone, i) => { bone.rotation.x = -.3 + i * .52; });
          g.knees.forEach((bone, i) => { bone.rotation.x = .3 + i * .16; });
        }
      }
      ud.legs.forEach((leg, i) => { leg.rotation.x = gait[i].thigh; leg.userData.shin.rotation.x = gait[i].knee; });
      ud.arms.forEach((arm, i) => { arm.rotation.x = gait[i].arm; arm.rotation.z = 0; arm.userData.fore.rotation.x = gait[i].elbow; });
      if (ud.helmet && source.action === 'helmet' && (source.actionTime || 0) > 0) {
        const lift = Math.sin(ud.maskProgress * Math.PI);
        ud.arms[1].rotation.x = -.15 - lift * 1.05;
        ud.arms[1].rotation.z = -.12 - lift * .38;
        ud.arms[1].userData.fore.rotation.x = -.2 - lift * .35;
      } else if (ud.helmet && !source.helmet) {
        ud.arms[1].rotation.x = -.16;
        ud.arms[1].userData.fore.rotation.x = -.15;
      }
      if (action === 'solarNova' && active) { const charge = Math.sin(THREE.MathUtils.clamp(1 - source.actionTime / 1.05, 0, 1) * Math.PI); ud.arms.forEach((arm, i) => { arm.rotation.x = -.72 - charge * .16; arm.rotation.z = i ? -.82 - charge * .18 : .82 + charge * .18; arm.userData.fore.rotation.x = -.18 - charge * .2; }); }
      if (action === 'starbolt' && active) { ud.arms[0].rotation.x = -1.28; ud.arms[0].rotation.z = -.28; ud.arms[0].userData.fore.rotation.x = -.18; }
      if (punchBlend > 0) {
        const arm = ud.arms[0];
        arm.rotation.x = THREE.MathUtils.lerp(arm.rotation.x, -1.5, punchBlend);
        arm.rotation.z = THREE.MathUtils.lerp(arm.rotation.z, -.42, punchBlend);
        arm.userData.fore.rotation.x = THREE.MathUtils.lerp(arm.userData.fore.rotation.x, -.3, punchBlend);
        ud.arms[1].rotation.x = THREE.MathUtils.lerp(ud.arms[1].rotation.x, -.3, punchBlend * .7);
        ud.arms[1].rotation.z = THREE.MathUtils.lerp(ud.arms[1].rotation.z, .18, punchBlend * .7);
      } else if (source.hero !== 'wildclaw' && (action === 'punch' || action === 'firePunch')) { const arm = ud.arms[0]; arm.rotation.x = -1.5; arm.rotation.z = -.48; arm.userData.fore.rotation.x = -.25; }
      if (swordProgress > 0) {
        const windup = THREE.MathUtils.smoothstep(Math.min(1, swordProgress / .32), 0, 1);
        const cut = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((swordProgress - .26) / .62, 0, 1), 0, 1);
        ud.arms[1].rotation.x = THREE.MathUtils.lerp(-.24, -1.18, windup) + cut * .72;
        ud.arms[1].rotation.z = THREE.MathUtils.lerp(-.08, -.9, windup) + cut * 1.52;
        ud.arms[1].userData.fore.rotation.x = -.36 - .22 * windup + .3 * cut;
        ud.arms[0].rotation.x = -.32 - swordBlend * .28;
        ud.arms[0].rotation.z = .16 + swordBlend * .24;
        ud.arms[0].userData.fore.rotation.x = -.42;
      }
      if (action === 'kick') { ud.legs[0].rotation.x = -1.28; ud.legs[0].userData.shin.rotation.x = .35; }
      if (action === 'block') { ud.arms.forEach((arm, i) => { arm.rotation.x = -1.35; arm.rotation.z = i ? -.85 : .85; }); }
      if (source.blocking) ud.arms.forEach((arm, i) => { arm.rotation.x = -1.35; arm.rotation.z = i ? -.85 : .85; });
      if (action === 'laser') { ud.arms[0].rotation.x = -1.1; ud.arms[0].rotation.z = -.2; }
      if (action === 'slam') { ud.arms.forEach(arm => { arm.rotation.x = -.9; }); rig.position.y = .28 + Math.max(0, Math.sin(t * 18)) * .35; }
      if (source.jump > 0) {
        const air = Math.sin(jumpProgress * Math.PI);
        ud.legs[0].rotation.x = -.3 - air * .34; ud.legs[1].rotation.x = .14 + air * .18;
        ud.legs[0].userData.shin.rotation.x = .34 + air * .55; ud.legs[1].userData.shin.rotation.x = .25 + air * .4;
        ud.arms.forEach((arm, i) => { arm.rotation.x = -.2 - air * .32; arm.rotation.z = i ? -.12 - air * .12 : .12 + air * .12; arm.userData.fore.rotation.x = -.25 - air * .16; });
      }
      if (source.smashHit > 0) { const recoil = Math.sin(THREE.MathUtils.clamp((.7 - source.smashHit) / .7, 0, 1) * Math.PI); rig.rotation.z = (source.smashSide || 1) * recoil * .32; rig.position.y += recoil * .22; }
      else if (source.dodge > 0) { rig.rotation.z = Math.sin(t * 25) * .24; rig.position.y = .12 + Math.abs(Math.sin(t * 18)) * .1; }
      else if (source.flying) rig.position.y = (source.flightHeight || 4.5) + Math.sin(t * 5) * .28;
      else if (source.jump > 0) rig.position.y = jumpLift + climbLift;
      if (ud.cape) {
        const wind = source.run ? 1.2 : moving ? .82 : .52;
        ud.cape.rotation.x = 0;
        ud.cape.rotation.z = 0;
        const positions = ud.cape.geometry.attributes.position, rest = ud.cape.userData.restVertices;
        if (rest) {
          for (let i = 0; i < positions.count; i++) {
            const k = i * 3, cx = rest[k], cy = rest[k + 1];
            const weight = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((1.55 - cy) / 1.78, 0, 1), .12, 1);
            const gust = Math.sin(t * 3.2 + cy * 2.35 + x * .25);
            positions.array[k] = cx + weight * (.06 + .095 * wind) * gust;
            positions.array[k + 1] = rest[k + 1] + weight * .035 * Math.sin(t * 4 + cx * 3.4 + cy * 1.8);
            positions.array[k + 2] = rest[k + 2] + weight * (.13 + .2 * wind) * Math.sin(t * 4.1 + cx * 2.6 + cy * 2.5 + x * .3);
          }
          positions.needsUpdate = true; ud.cape.geometry.computeVertexNormals();
        }
      }
      if (active && (action === 'punch' || action === 'firePunch')) {
        const glove = ud.arms[0].userData.fore.children[1]; if (glove) glove.material = t % .3 > .15 ? mats.fire : mats.goldBright;
      }
    } else {
      // Character faces point toward positive Z; the camera follows from behind at positive Z.
      const enemyDt = Math.min(.05, Math.max(0, t - (ud.enemyMotionTime ?? t)));
      ud.enemyMotionTime = t;
      const previous = ud.enemyPosition || { x, z };
      const dx = x - previous.x, dz = z - previous.z, travelled = Math.hypot(dx, dz);
      ud.enemyPosition = { x, z };
      const enemyWalking = !!source.walking || travelled > .002 || (kind === 'skeleton' && source.hp > 0);
      ud.enemyWalkBlend = THREE.MathUtils.lerp(ud.enemyWalkBlend || 0, enemyWalking ? 1 : 0, 1 - Math.exp(-enemyDt * 10));
      ud.enemyWalkPhase = (ud.enemyWalkPhase || 0) + enemyDt * (kind === 'skeleton' ? 5.8 : 4.8) * (.25 + ud.enemyWalkBlend * .75);
      const enemyCycle = ud.enemyWalkPhase, enemyBlend = ud.enemyWalkBlend;
      const enemyGait = [heroWalkPose(enemyCycle, enemyBlend, false), heroWalkPose(enemyCycle + Math.PI, enemyBlend, false)];
      if (travelled > .002) ud.enemyTargetYaw = Math.atan2(dx, dz);
      const enemyTargetYaw = Number.isFinite(ud.enemyTargetYaw) ? ud.enemyTargetYaw : 0;
      const enemyYawDelta = Math.atan2(Math.sin(enemyTargetYaw - rig.rotation.y), Math.cos(enemyTargetYaw - rig.rotation.y));
      rig.rotation.y += enemyYawDelta * (1 - Math.exp(-enemyDt * 7));
      rig.position.y += Math.abs(Math.sin(enemyCycle)) * .018 * enemyBlend;
      ud.legs.forEach((leg, i) => { leg.rotation.x = enemyGait[i].thigh; leg.userData.shin.rotation.x = enemyGait[i].knee; });
      ud.arms.forEach((arm, i) => {
        arm.rotation.x = enemyGait[i].arm * .72 + Math.sin(t * 1.7 + i) * .035 * (1 - enemyBlend);
        arm.rotation.z = i ? -.035 : .035;
        arm.userData.fore.rotation.x = enemyGait[i].elbow;
      });
      if (ud.glbRig) {
        const g = ud.glbRig;
        if (g.pelvis) g.pelvis.rotation.y = Math.sin(enemyCycle) * .018 * enemyBlend;
        if(kind==='ashen'&&g.spine){g.spine.rotation.x=Math.sin(t*1.6)*.012;g.spine.rotation.y=-Math.sin(enemyCycle)*.018*enemyBlend;}
        if (g.chest) g.chest.rotation.set(-.02 - .018 * enemyBlend, Math.sin(enemyCycle) * .025 * enemyBlend, Math.sin(enemyCycle) * .008 * enemyBlend);
        // Reset every axis before additive hit reactions; otherwise head pitch accumulates on each frame.
        if (g.head) g.head.rotation.set(-.008 * enemyBlend, Math.sin(t * .85 + key.length) * .055, 0);
        g.thighs.forEach((bone, i) => { bone.rotation.x = enemyGait[i].thigh; });
        g.knees.forEach((bone, i) => { bone.rotation.x = enemyGait[i].knee; });
        g.shins.forEach((bone, i) => { bone.rotation.x = enemyGait[i].ankle; });
        g.feet.forEach(bone => { bone.rotation.x = -.035; });
        g.arms.forEach((bone, i) => { bone.rotation.x = enemyGait[i].arm * .72; bone.rotation.z = i ? -.035 : .035; });
        g.forearms.forEach((bone, i) => { bone.rotation.x = enemyGait[i].elbow; });
      }
      if (kind === 'ashen' || kind === 'darkwarrior') {
        if(kind==='ashen'&&Number.isFinite(source.face)&&travelled<=.002){
          const delta=Math.atan2(Math.sin(source.face-rig.rotation.y),Math.cos(source.face-rig.rotation.y));rig.rotation.y+=delta*(1-Math.exp(-enemyDt*12));
          if(source.misfitMelee&&ud.glbRig){const g=ud.glbRig,a=source.misfitMelee.age,wind=THREE.MathUtils.smoothstep(a,0,.48),strike=THREE.MathUtils.smoothstep(a,.48,.67),recover=1-THREE.MathUtils.smoothstep(a,.75,1.05);g.arms[0].rotation.x=(-.45*wind-1.1*strike)*recover;g.forearms[0].rotation.x=(-1.15*wind+strike)*recover;g.chest.rotation.y=(-.22*wind+.48*strike)*recover;}
        }
        if (source.block > 0) {
          ud.arms.forEach((arm, i) => { arm.rotation.x = -1.05; arm.rotation.z = i ? -.58 : .58; arm.userData.fore.rotation.x = -.48; });
          if (ud.glbRig) { ud.glbRig.arms.forEach((arm, i) => { arm.rotation.x = -1.05; arm.rotation.z = i ? -.58 : .58; }); ud.glbRig.forearms.forEach(fore => { fore.rotation.x = -.48; }); }
        }
        if (!source.misfitMelee && source.attack > 0 && source.attack < .4) {
          const strike = Math.sin(THREE.MathUtils.clamp((.4 - source.attack) / .4, 0, 1) * Math.PI);
          ud.arms[0].rotation.x = -1.15 - strike * .55; ud.arms[0].rotation.z = -.28 * strike; ud.arms[0].userData.fore.rotation.x = -.35;
          if (ud.glbRig) { ud.glbRig.arms[0].rotation.x = -1.15 - strike * .55; ud.glbRig.arms[0].rotation.z = -.28 * strike; ud.glbRig.forearms[0].rotation.x = -.35; ud.glbRig.chest.rotation.y = .2 * strike; }
        }
        if (source.giant) ud.arms.forEach((arm, i) => { arm.rotation.x = Math.sin(t * 1.8 + i) * .5; });
      }
      if (kind === 'hammerer') {
        const smash = source.bossSmash || 0;
        const approaching = enemyBlend * Math.abs(Math.sin(enemyCycle)) * .045 + (1 - enemyBlend) * Math.sin(t * 1.7) * .012;
        rig.position.y += Math.max(0, approaching);
        if (ud.creatureModel) {
          ud.creatureModel.rotation.y = Math.sin(enemyCycle) * .018 * enemyBlend;
          ud.creatureModel.rotation.x = smash > 0 ? -.08 - Math.sin(THREE.MathUtils.clamp(1 - smash / 1.1, 0, 1) * Math.PI) * .14 : -.015 * enemyBlend;
          ud.creatureModel.rotation.z = Math.sin(enemyCycle) * .018 * enemyBlend;
        }
      }
      if (kind === 'bonecaller') { const casting=(source.casting||0)>0; ud.arms[0].rotation.x = -.5 + Math.sin(t * 1.6) * .18 - (casting ? Math.sin(t * 18) * .34 + .72 : 0); ud.arms[0].rotation.z = casting ? .22 : .04; ud.arms[0].userData.fore.rotation.x = -.38; if(ud.wandGem){const flare=casting?1.2+Math.abs(Math.sin(t*24))*.85:1+Math.sin(t*4)*.08;ud.wandGem.scale.setScalar(flare);ud.wandGem.material.emissiveIntensity=casting?5:2.7;} }
      if (ud.cape) ud.cape.rotation.x = Math.sin(t * 2) * .08;
    }
    if(!ud.glbRig&&ud.body){
      const blend=player?(ud.walkBlend||0):(ud.enemyWalkBlend||0),phase=player?(ud.walkPhase||0):(ud.enemyWalkPhase||0);
      ud.body.rotation.y=Math.sin(phase)*.045*blend;ud.body.rotation.z=Math.sin(phase)*.025*blend;
      if(ud.head)ud.head.rotation.y=-Math.sin(phase)*.025*blend+Math.sin(t*.9+key.length)*.025*(1-blend);
    }
    if(kind==='hammerer'&&ud.glbRig){
      const g=ud.glbRig,smash=source.bossSmash||0;
      if(smash>0){const progress=THREE.MathUtils.clamp(1-smash/1.1,0,1),wind=THREE.MathUtils.smoothstep(Math.min(1,progress/.48),0,1),strike=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((progress-.48)/.26,0,1),0,1),recover=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((progress-.76)/.24,0,1),0,1);
        g.arms.forEach((a,i)=>{a.rotation.x=(-2.4*wind+3.15*strike)*(1-recover);a.rotation.z=i?-.14:.14;});
        g.forearms.forEach(a=>{a.rotation.x=-.38-.58*wind*(1-strike);});g.chest.rotation.x=.23*strike*(1-recover)-.12*wind*(1-strike);
        g.knees.forEach(a=>a.rotation.x=.18+.4*strike*(1-recover));
      }
    }
    if (kind === 'ecal' && ud.glbRig) {
      const g = ud.glbRig, firing = source.action === 'ecalBlast' && source.actionTime > 0;
      if(g.tail){const speed=ud.walkBlend||0,turn=Math.atan2(Math.sin(rig.rotation.y-(ud.tailYaw??rig.rotation.y)),Math.cos(rig.rotation.y-(ud.tailYaw??rig.rotation.y)));ud.tailYaw=rig.rotation.y;
        ud.tailTurn=THREE.MathUtils.lerp(ud.tailTurn||0,THREE.MathUtils.clamp(-turn*3,-.4,.4),.1);
        g.tail.forEach((bone,i)=>{const phase=t*(1.5+speed*2.2)-i*.65;bone.rotation.y=Math.sin(phase)*(.07+speed*.10)+ud.tailTurn*(.7+i*.2);bone.rotation.x=Math.sin(phase*.7+.8)*.045+(source.jump>0?-.09:0);bone.rotation.z=Math.sin(phase+.5)*.045+(source.dodge>0?.1*Math.sin(t*12-i):0);});
      }

      g.hands?.forEach(b=>{b.rotation.set(0,0,0);b.scale.set(1,1,1);});
      const raised = source.ecalRaised || firing;
      ud.aimBlend = THREE.MathUtils.lerp(ud.aimBlend || 0, raised ? 1 : 0, .18);
      const recoil = firing ? Math.sin((1-source.actionTime/.34)*Math.PI*3)*.09 : 0;
      g.arms.forEach((bone,i) => { bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, -1.18 + recoil, ud.aimBlend); bone.rotation.z = (i ? -.12 : .12)*ud.aimBlend; });
      g.forearms.forEach((bone,i) => { bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, -.28 - recoil + Math.sin((ud.walkPhase||0)+i*Math.PI)*.035*(ud.walkBlend||0), ud.aimBlend); });
      if ((firing || source.ecalRaised) && source.ecalAim && !(source.moveSpeed>2) && Math.hypot(source.fx||0,source.fy||0)<.04) rig.rotation.y = Math.atan2(source.ecalAim.x-source.x, source.ecalAim.y-source.y);
    }
    if(player){
      const holding=Number.isInteger(source.heldPhoto)&&source.inspectingPhoto;
      if(holding&&!ud.heldEvidence){ud.heldEvidence=new THREE.Mesh(new THREE.PlaneGeometry(.88,.5),new THREE.MeshStandardMaterial({side:THREE.DoubleSide,roughness:1}));rig.add(ud.heldEvidence);ud.heldEvidence.position.set(0,1.25,.58);ud.heldEvidence.rotation.x=-.35;}
      if(ud.heldEvidence){ud.heldEvidence.visible=holding;if(holding){ud.heldEvidence.material.map=window.homePhotoTexture(THREE,source.heldPhoto);ud.heldEvidence.material.needsUpdate=true;}}
      if(holding){for(const g of [ud.glbRig,ud.helmetedRig].filter(Boolean)){g.arms.forEach((b,i)=>{b.rotation.x=-.65;b.rotation.z=i?-.22:.22;});g.forearms.forEach(b=>b.rotation.x=-.9);if(g.head)g.head.rotation.x=.12;}}
    }
    // Red Dawn uses a chambered punch, a bent elbow at impact, then recovery.
    if(player&&source.hero==='guardian'&&source.actionTime>0&&['punch','firePunch'].includes(source.action)){
      const duration=source.action==='firePunch'?.55:.24,u=THREE.MathUtils.clamp(1-source.actionTime/duration,0,1);
      const extend=THREE.MathUtils.smoothstep(u,.18,.56)*(1-THREE.MathUtils.smoothstep(u,.65,1));
      const chamber=Math.sin(Math.PI*u);
      for(const g of [ud.glbRig,ud.helmetedRig].filter(Boolean)){
        g.arms[0].rotation.set(-.35-extend*.9,0,-.1-extend*.12);
        g.forearms[0].rotation.x=-1.15+extend*.72;
        g.arms[1].rotation.x=-.35-chamber*.2;g.forearms[1].rotation.x=-.95;
        if(g.chest)g.chest.rotation.y=-chamber*.12+extend*.24;
      }
      if(ud.arms?.length>1){ud.arms[0].rotation.set(-.35-extend*.9,0,-.1-extend*.12);ud.arms[0].userData.fore.rotation.x=-1.15+extend*.72;ud.arms[1].rotation.x=-.35-chamber*.2;ud.arms[1].userData.fore.rotation.x=-.95;}
    }
    // Ecal's articulated combat poses: anticipate, strike, follow through, recover.
    if(source.hero==='ecal'&&!source.seated){
      const g=ud.glbRig,k=source.ecalSkill,moving= Math.min(1,ud.walkBlend||0);
      rig.rotation.x=0;rig.rotation.z=0;
      if(g){
        const breath=Math.sin(t*4.8),shift=Math.sin(t*2.6);
        if(g.spine)g.spine.rotation.x=-.06+breath*.018;
        if(g.chest){g.chest.rotation.x=.05;g.chest.rotation.y=shift*.045;g.chest.rotation.z=shift*.025;}
        if(g.head){g.head.rotation.y=0;g.head.rotation.x=-.025;g.head.rotation.z=-shift*.025;}
        if(!k&&moving<.15&&!(source.jump>0)){
          g.thighs.forEach((b,i)=>{b.rotation.x=-.16-breath*.025;b.rotation.z=i?-.06:.06;});
          g.knees.forEach((b,i)=>b.rotation.x=.25+breath*.035+(i?.04:0));
          if(!source.ecalRaised&&source.action!=='ecalBlast'){g.arms.forEach((b,i)=>{b.rotation.x=-.22+Math.sin(t*3+i)*.06;b.rotation.z=i?-.16:.16;});g.forearms.forEach((b,i)=>b.rotation.x=-.65+Math.sin(t*3+i)*.08);}
        }
        if(k){
          const u=Math.min(1,k.age/k.duration),wave=Math.sin(u*Math.PI),snap=Math.sin(Math.min(1,u/.48)*Math.PI),recover=1-THREE.MathUtils.smoothstep(u,.7,1);
          const side=k.side||1;
          if(g.chest){g.chest.rotation.y=side*wave*.48;g.chest.rotation.x=-wave*.18;}
          if(g.head){g.head.rotation.y=-side*wave*.18;g.head.rotation.x=-wave*.08;}
          g.arms.forEach((b,i)=>{b.rotation.x=-.8-wave*(i?.25:.5);b.rotation.z=(i?-.2:.2)*(1+wave);});
          g.forearms.forEach((b,i)=>b.rotation.x=-.55-wave*(i?.35:.1));
          g.thighs.forEach((b,i)=>{b.rotation.x=-wave*(i?.45:1.25);b.rotation.z=(i?-1:1)*wave*.18;});
          g.knees.forEach((b,i)=>b.rotation.x=wave*(i?1.4:.75));
          if(k.kind==='ecalDive'){
            const hold=THREE.MathUtils.smoothstep(u,0,.2)*(1-THREE.MathUtils.smoothstep(u,.72,1));
            rig.rotation.z=-side*hold*1.45;rig.rotation.x=-hold*.25;
            g.arms.forEach((b,i)=>{b.rotation.x=-(i?.95:1.4)*hold;b.rotation.z=(i?-.65:.38)*hold;});
            g.forearms.forEach(b=>b.rotation.x=-.18*hold);
            g.thighs[0].rotation.x=-hold*.3;g.thighs[1].rotation.x=-hold*1.15;g.knees[0].rotation.x=hold*.28;g.knees[1].rotation.x=hold*1.5;
          }
          if(k.kind==='ecalFlip'){
            // Hold the inverted dual-blaster silhouette briefly at the apex.
            const turn=u<.4?THREE.MathUtils.smoothstep(u,0,.4)*.5:u<.58?.5:.5+THREE.MathUtils.smoothstep(u,.58,1)*.5;
            rig.rotation.z=side*Math.PI*2*turn;rig.rotation.x=-wave*.3;
            g.arms.forEach((b,i)=>{b.rotation.x=-wave*1.2;b.rotation.z=(i?-1:1)*wave*.85;});g.forearms.forEach(b=>b.rotation.x=-.2*wave);
            g.thighs.forEach((b,i)=>b.rotation.x=-wave*(i?.55:1.25));g.knees.forEach((b,i)=>b.rotation.x=wave*(i?1.55:.5));
          }
          if(k.kind==='ecalSpin'){rig.rotation.y+=side*Math.PI*2*(u*u*(3-2*u));rig.rotation.z=wave*.3;g.arms.forEach((b,i)=>b.rotation.z=(i?-1:1)*wave*1.1);}
          if(k.kind==='ecalAirKick'){g.thighs[0].rotation.x=-1.7*wave;g.knees[0].rotation.x=1.4*(1-snap)*wave;rig.rotation.z=side*wave*.35;}
          if(['ecalDive','ecalFlip','ecalSpin'].includes(k.kind)&&g.tail)g.tail.forEach((b,i)=>{b.rotation.y=side*wave*.22*Math.sin(i*.7+u*5);b.rotation.x=-wave*.13;});
          if(u>.82&&k.kind!=='ecalHeavy'){const settle=Math.sin((u-.82)/.18*Math.PI);g.thighs.forEach(b=>b.rotation.x-=settle*.4);g.knees.forEach(b=>b.rotation.x+=settle*.6);}
          if(k.kind==='ecalHeavy'){g.arms[0].rotation.x=-.35-snap*1.2;g.forearms[0].rotation.x=(-1.5+snap*1.25)*recover;if(g.chest)g.chest.rotation.y=side*(-.3+snap*.95)*wave;g.thighs.forEach(b=>b.rotation.x=-wave*.2);g.knees.forEach(b=>b.rotation.x=wave*.35);}
        }
      }
    }
    const uprightWalk=player&&source.hero!=='ecal'&&!source.ecalSkill&&!source.seated&&!source.flying&&!source.climbing&&!(source.jump>0)&&!(source.dodge>0)&&!(source.smashHit>0)&&!(source.actionTime>0);
    if(uprightWalk){rig.rotation.x=0;rig.rotation.z=0;for(const model of [ud.glbModel,ud.helmetedModel].filter(Boolean)){model.rotation.x=0;model.rotation.z=0;}for(const g of [ud.glbRig,ud.helmetedRig].filter(Boolean))for(const bone of [g.pelvis,g.spine,g.chest,g.head].filter(Boolean)){bone.rotation.x=0;bone.rotation.z=0;}}
    if(source.seated){rig.rotation.y=source.seated.yaw;for(const g of [ud.glbRig,ud.helmetedRig].filter(Boolean)){g.thighs?.forEach(b=>b.rotation.x=-Math.PI/2);g.knees?.forEach(b=>b.rotation.x=Math.PI/2);g.shins?.forEach(b=>b.rotation.x=0);g.arms?.forEach(b=>b.rotation.x=-.35);g.forearms?.forEach(b=>b.rotation.x=-.75);}}
    window.heroStuntPose?.(rig,source,t);
    if(player&&!source.seated&&!source.ecalSkill&&!source.finStunt&&!(source.actionTime>0))for(const g of [ud.glbRig,ud.helmetedRig].filter(Boolean)){
      const lead=ud.turnLead||0,breath=Math.sin(t*2.1+key.length);
      if(g.head){g.head.rotation.y+=lead*.65;g.head.rotation.z+=Math.sin(t*.7+key.length)*.016;}
      if(g.neck)g.neck.rotation.y=lead*.2;
      if(g.chest){g.chest.rotation.y+=lead*.22;g.chest.rotation.x+=breath*.012;}
      if(g.spine)g.spine.rotation.y+=lead*.1;
    }
    if(player){
      const airborne=!!(source.jump>0||source.villageAirborne);
      if(airborne&&!ud.wasAirborne)ud.takeoffAt=t;
      if(!airborne&&ud.wasAirborne&&!source.flying&&!source.climbing)ud.landedAt=t;
      ud.wasAirborne=airborne;
      const landingAge=t-(ud.landedAt??-100),land=landingAge<.5?Math.sin(THREE.MathUtils.clamp(landingAge/.5,0,1)*Math.PI):0;
      ud.landingWeight=land;
      if(!source.seated&&!source.knockdown&&!source.finStunt&&!source.ecalSkill&&!source.flying&&!source.climbing&&(!(source.actionTime>0)||source.action==='jump')){
        for(const g of [ud.glbRig,ud.helmetedRig].filter(Boolean)){
          if(airborne){const lift=1-Math.exp(-Math.max(0,t-(ud.takeoffAt||t))*12),falling=source.villageAirborne?(source.villageVelocity||0)<0:source.jump<.38;
            g.thighs.forEach((b,i)=>b.rotation.x=-(falling?.28:i?.65:.85)*lift);
            g.knees.forEach((b,i)=>b.rotation.x=(falling?.45:i?1:1.2)*lift);
            g.arms.forEach((b,i)=>{b.rotation.x=-(i?.45:.7)*lift;b.rotation.z=(i?-1:1)*.22*lift;});
            if(g.chest)g.chest.rotation.x=.12*lift;
          }else if(land>0){g.thighs.forEach(b=>b.rotation.x-=land*.5);g.knees.forEach(b=>b.rotation.x+=land*.85);if(g.spine)g.spine.rotation.x+=land*.16;if(g.chest)g.chest.rotation.x+=land*.2;if(g.head)g.head.rotation.x+=land*.09;g.arms.forEach((b,i)=>b.rotation.x-=land*(i?.2:.35));}
        }
      }
    }
    return rig;
  }

  function resize() {
    const rect = wrap.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1376 / rect.width);
    backdropCanvas.width = Math.round(rect.width * ratio); backdropCanvas.height = Math.round(rect.height * ratio); details.width=backdropCanvas.width; details.height=backdropCanvas.height;
  }
  new ResizeObserver(resize).observe(wrap); window.addEventListener('resize', resize); resize();
  const footContact = window.createFootContact?.(THREE); const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0), groundRay=new THREE.Raycaster();
  const travelWorld=window.createTravelWorld?.(THREE,scene);
  const darkPresentation=window.createDarkBossPresentation?.(THREE,scene);
  const ashenPortal=window.createAshenPortal?.(THREE,scene);
  const finalRealm=null; // The fifth level was removed; keep its model files archived.
  const travelLook=new THREE.Vector3();
  const villageFollowPosition=new THREE.Vector3();
  let villageFollowMode=null;
  let lastFrame = performance.now(), cameraReady = false, backdropAt = -Infinity, backdropLevel = null, cameraLevel = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.045, (now - lastFrame) / 1000); lastFrame = now;
    const data = window.heroArena3DState();
    const state = data && data.state;
    if(!state||state.phase!=='game'||state.round!==3)window.updateVillageClueCinematic?.(THREE,state,camera,rigs);
    frostCastNotice.hidden=!(state?.phase==='game'&&state.round===2&&state.finale&&!window.frostFinaleActorsReady(state.finale));
    if (!state || state.phase !== 'game' || state.intro) {
      finalRealm?.hide();window.hideFrostIntro?.();darkPresentation?.hide();ashenPortal?.hide();window.heroTravelProjection=null;window.heroTravelUnproject=null;if(travelWorld)travelWorld.hide();wrap.classList.remove('playing3d'); canvas.style.visibility = 'hidden'; backdropCanvas.style.visibility = 'hidden'; details.style.visibility='hidden'; return;
    }
    details.style.visibility='visible'; canvas.style.visibility = 'visible'; wrap.classList.add('playing3d');
    const localKey = data.playerId === 'host' ? 'host' : data.playerId;
    const local = state.players[localKey] || Object.values(state.players)[0];
    if (!local) { renderer.render(scene, camera); return; }
    if(cameraLevel!==state.round){cameraLevel=state.round;cameraReady=false;}
    const meteorActive = state.round === 1;
    const snowActive = state.round === 2;
    if(snowActive)preloadFrostCast();
    const futureWorld = state.round >= 3;
    const warehouseActive = false;
    const dimensionBackdrop = state.round === 3 ? dimensionBackdrops.three : state.round === 4 ? dimensionBackdrops.four : state.round >= 5 ? dimensionBackdrops.five : null;
    fieldClinic.visible = state.round === 1;
    battlefield.visible = false; industrialArena.visible = !futureWorld && !warehouseActive && !snowActive && !meteorActive; futureStreetBase.visible = futureWorld; futureCity.visible = futureWorld; futureResidents.visible = futureWorld;
    if (warehouseArena) warehouseArena.group.visible = warehouseActive;
    if (meteorLevel) meteorLevel.group.visible = meteorActive;
    if (snowStreet) snowStreet.group.visible = snowActive;
    futureStreetAccents.forEach(item => { item.visible = futureWorld; });
    ships.forEach(ship => { ship.visible = futureWorld; }); rain.visible = futureWorld;
    cityGlow.visible = futureWorld; magentaGlow.visible = futureWorld;
    sceneColor.set(futureWorld ? 0x68211d : meteorActive ? 0x4a2119 : warehouseActive ? 0x19292c : 0x160f1b);
    if (dimensionBackdrop) coverBackdrop(dimensionBackdrop, camera.aspect);
    scene.background = meteorActive ? meteorLevel?.background || sceneColor : snowActive ? snowStreet?.background || sceneColor : dimensionBackdrop || sceneColor;
    scene.fog.color.set(snowActive ? 0x8c9da7 : futureWorld ? 0x6f332f : meteorActive ? 0x57352a : warehouseActive ? 0x334345 : 0x281720);
    scene.fog.near = warehouseActive ? 17 : 24; scene.fog.far = warehouseActive ? 79 : 112;
    hemi.color.setHex(snowActive ? 0xc6ddeb : futureWorld ? 0xffa27d : meteorActive ? 0xffb178 : warehouseActive ? 0xb4d2d2 : 0x625163);
    hemi.groundColor.setHex(warehouseActive ? 0x33302a : futureWorld ? 0x111827 : 0x100e15);
    hemi.intensity = snowActive ? 1.65 : futureWorld ? 2.1 : warehouseActive ? 1.05 : .65;
    moon.color.setHex(snowActive ? 0xc7dce9 : meteorActive ? 0xff8f52 : warehouseActive ? 0xc1dfe5 : 0xffc1a0);
    moon.intensity = snowActive ? 1.4 : futureWorld ? 2.4 : meteorActive ? 1.9 : warehouseActive ? 1.65 : 1.45;
    // Shared village lighting reaches every player equally, including the local hero.
    if(state.round===3){hemi.color.setHex(0xffdfb5);hemi.groundColor.setHex(0x695033);hemi.intensity=1.25;moon.color.setHex(0xffdbb5);moon.intensity=1.45;}
    const maskLabel = document.querySelector('[data-action="helmet"] small');
    if (maskLabel && local.hero === 'guardian') maskLabel.textContent = local.helmet ? 'REMOVE MASK' : 'PUT ON MASK';
    const t = now / 1000;
    const photoScene = !travelWorld && !!window.heroBackdrop;
    if (photoScene && (now - backdropAt >= 1000/30 || backdropLevel !== state.round)) {
      window.heroBackdrop.draw(backdropContext, backdropCanvas.width, backdropCanvas.height, state.round, t);
      backdropAt = now; backdropLevel = state.round;
    }
    backdropCanvas.style.visibility = photoScene ? 'visible' : 'hidden';
    contactFloor.visible = photoScene;
    if (photoScene) {
      scene.background = null;
      [battlefield, industrialArena, futureStreetBase, futureCity, futureResidents, rain,
        warehouseArena?.group, meteorLevel?.group, snowStreet?.group, ...ships].filter(Boolean).forEach(group => { group.visible = false; });
    }
    if (warehouseActive && !photoScene) warehouseArena?.update(t);
    if (meteorActive && !photoScene) meteorLevel?.update(t, camera.aspect);
    if (snowActive && !photoScene) snowStreet?.update(t, camera.aspect);
    clinicRing.material.opacity = .62 + Math.sin(t * 3) * .16; clinicRing.scale.setScalar(1 + Math.sin(t * 2.2) * .045);
    const actors = new Set();
    for (const [id, p] of Object.entries(state.players)) {
      actors.add(id); syncActor(id, p.hero === 'ecal' ? 'ecal' : p.hero === 'wildclaw' ? 'wildclaw' : p.hero === 'lizard' ? 'lizard' : p.hero === 'sentinel' ? 'sentinel' : p.hero === 'finnew' ? 'finnew' : 'golden', p, t, true, id === localKey);
    }
    if(state.round===5&&!state.finale)for(const p of (state.finalAllies||[]).filter(p=>p.hero!=='ecal')){actors.add(p.id);syncActor(p.id,p.hero==='guardian'?'golden':p.hero,p,t,true,false);}
    if(state.round===5&&state.finale?.ecal){
      const ally=state.finale.ecal;actors.add(ally.id);syncActor(ally.id,'ecal',ally,t,true,false);
    }
    if(state.round===3&&state.radioScene?.ally){const hero=state.radioScene.ally;actors.add(hero.id);syncActor(hero.id,'golden',hero,t,true,false);}
    if(state.round===2&&state.finale?.wildClaw){const hero=state.finale.wildClaw;actors.add(hero.id);syncActor(hero.id,'wildclaw',hero,t,true,false);}
    if(state.round===2&&state.finale?.redDawn){const hero=state.finale.redDawn;actors.add(hero.id);syncActor(hero.id,'golden',hero,t,true,false);}
    const boss = { hp:state.boss, x: state.bossX ?? 700, y: state.bossY ?? 285, block: state.bossBlock, attack: state.bossAttack, misfitMelee: state.misfitMelee, giant: state.round===5?false:state.giant, walking:state.bossWalking, face:state.bossFace, fx:state.bossWalking?Math.sin(state.bossFace||0):0, fy:state.bossWalking?Math.cos(state.bossFace||0):0 };
    if(state.ashenTransition?.stage==='uppercut'){const h=state.ashenTransition.hero;actors.add(h.id);syncActor(h.id,'golden',h,t,true,false);const e=state.ashenTransition.ecal;if(e){actors.add(e.id);syncActor(e.id,'ecal',e,t,true,false);}}
    const finalVillain = state.round >= 5, bossKey = finalVillain ? 'dark-armored-warrior' : 'ashen-king';
    if(state.round!==3){actors.add(bossKey); syncActor(bossKey, finalVillain ? 'darkwarrior' : 'ashen', boss, t);}
    (state.hammerers || []).forEach((hammerer, i) => { if (hammerer.dead) return; const key = 'twin-hammer-brute-' + i; actors.add(key); syncActor(key, 'hammerer', hammerer, t); });
    if (state.caster && !state.caster.dead) { actors.add('bonecaller'); syncActor('bonecaller', 'bonecaller', state.caster, t); }
    (state.goons || []).forEach((g, i) => { const key = 'skeleton-' + i; actors.add(key); syncActor(key, g.finalCreature?'finalcreature':'skeleton', g, t); });
    for (const [key, rig] of rigs) if (!actors.has(key)) { scene.remove(rig); rigs.delete(key); }
    if (futureWorld && !photoScene) for (const ship of ships) { ship.position.x = 26 * Math.sin(t * .12 + ship.position.z); ship.position.z += dt * (1 + ships.indexOf(ship) * .28); if (ship.position.z > 16) ship.position.z = -93; ship.rotation.y = Math.sin(t + ship.position.y) * .04; }
    if (futureWorld && !photoScene) { const dummy = new THREE.Object3D();
    for (let i = 0; i < residentCount; i++) {
      const resident = residentLocations[i], step = Math.sin(t * 1.7 + resident.phase) * .035;
      dummy.position.set(resident.x + Math.sin(t * .24 + resident.phase) * .055, .78, resident.z); dummy.rotation.set(0, Math.sin(t * .2 + resident.phase) * .08, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); residentBody.setMatrixAt(i, dummy.matrix);
      dummy.position.set(resident.x + Math.sin(t * .24 + resident.phase) * .055, 1.25, resident.z); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); residentHeads.setMatrixAt(i, dummy.matrix);
      for (let leg = 0; leg < 2; leg++) { dummy.position.set(resident.x + (leg ? .09 : -.09), .22, resident.z + (leg ? -step : step)); dummy.rotation.set(step * (leg ? 8 : -8), 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); residentLegs.setMatrixAt(i * 2 + leg, dummy.matrix); }
    }
    residentBody.instanceMatrix.needsUpdate = true; residentHeads.instanceMatrix.needsUpdate = true; residentLegs.instanceMatrix.needsUpdate = true;
    }
    const attr = rain.geometry.attributes.position;
    if (futureWorld && !photoScene) { for (let i = 0; i < rainN; i++) { const k = i * 3; rainPositions[k + 1] -= rainVelocity[i] * dt; rainPositions[k] -= dt * 1.3; if (rainPositions[k + 1] < 0) { rainPositions[k + 1] = 22; rainPositions[k] = (Math.random() - .5) * 46; rainPositions[k + 2] = (Math.random() - .5) * 70 - 22; } }
    attr.needsUpdate = true;
    }
    if(!futureWorld) for(const fire of fireSystems){const phase=t*7+fire.seed;fire.light.intensity=4.2+Math.sin(phase)*1.2+Math.sin(phase*2.1)*.7;fire.group.scale.set(1+Math.sin(phase)*.045,1,1+Math.cos(phase*1.3)*.04);fire.flames.forEach((flame,i)=>{flame.scale.y=.82+.23*Math.sin(phase+i*1.9);flame.rotation.z=Math.sin(phase+i)*.16;});fire.smoke.forEach((puff,i)=>{const p=(t*.16+fire.seed*.1+i*.34)%1;puff.position.y=1.1+p*2.8;puff.position.x=Math.sin(phase+p*4+i)*.35;puff.scale.setScalar(.7+p*1.5);puff.material.opacity=(1-p)*.18;});}
    const px = ((local.x ?? 500) - 500) * .055, pz = ((local.y ?? 300) - 300) * .055;
    const cameraMode = (state.ashenTransition) ? 'third' : (window.heroCameraMode?.() || 'third');
    const frontView = cameraMode === 'front';
    const firstPerson = cameraMode === 'first';
    const localRig = rigs.get(localKey);
    if (localRig) localRig.visible = !firstPerson;
    const yaw = localRig?.rotation.y ?? Math.atan2(local.fx || 0, local.fy ?? -1);
    const frontX = Math.sin(yaw), frontZ = Math.cos(yaw);
    const sideX = frontZ, sideZ = -frontX;
    const groundHeight=(x,z)=>state.round===2?(window.heroIceTerrain?.height(x,z)??0):state.round===3?(window.modelVillageHeight?.(x,z)??0):0;
    const bodySize = window.heroCharacterSize(local)*(state.round===3?.68:1);
    const flightLift = (state.round===3&&Number.isFinite(local.villageHeight)?local.villageHeight:groundHeight(px,pz))+(local.flying ? (local.flightHeight || 4.5) : 0);
    const desired = state.round===3&&!firstPerson&&!frontView ? new THREE.Vector3(px+1.1,flightLift+3.8,pz+(local.run?7.8:7)) : travelWorld && !firstPerson && !frontView ? new THREE.Vector3(px+1.4,4.1+(bodySize-1)*1.5+flightLift,pz+(local.run?8.8:7.2)) : firstPerson
      ? new THREE.Vector3(px, 2.18 * bodySize + flightLift, pz)
      : frontView
        ? new THREE.Vector3(px + frontX * 3.5 * bodySize, 2.05 * bodySize + flightLift, pz + frontZ * 3.5 * bodySize)
        : new THREE.Vector3(px + frontX * 2.1 + sideX * 3.7, 3.55 + flightLift, pz + frontZ * 2.1 + sideZ * 3.7);
    if(state.round===3){
      // Keep follow smoothing independent from obstacle correction.
      if(villageFollowMode!==cameraMode||!cameraReady)villageFollowPosition.copy(desired);
      else villageFollowPosition.lerp(desired,1-Math.exp(-dt*12));
      camera.position.copy(villageFollowPosition);
      villageFollowMode=cameraMode;cameraReady=true;
    }else{
      villageFollowMode=null;
      if (!cameraReady) { camera.position.copy(desired); cameraReady = true; }
      else camera.position.lerp(desired, .12);
    }
    if (firstPerson) camera.lookAt(px + frontX * 18, 2.18 * bodySize + flightLift, pz + frontZ * 18);
    else if (frontView) camera.lookAt(px, 1.18 * bodySize + flightLift, pz);
    else if(state.round===3){travelLook.set(px,flightLift+1.35,pz-.8);camera.lookAt(travelLook);}
    else if(travelWorld){travelLook.lerp(new THREE.Vector3(px,1.25*bodySize+flightLift,pz-1.8),1-Math.exp(-dt*8));camera.lookAt(travelLook);}else camera.lookAt(px, 1.08 + flightLift, pz);
    if(state.round===2&&!firstPerson){
      const floor=window.heroIceTerrain?.height(camera.position.x,camera.position.z);
      if(floor!==null&&floor!==undefined)camera.position.y=Math.max(camera.position.y,floor+.8);
      const look=new THREE.Vector3(px,groundHeight(px,pz)+1.4*bodySize,pz);
      const delta=camera.position.clone().sub(look);
      for(let step=1;step<=24;step++){
        const q=look.clone().addScaledVector(delta,step/24),h=window.heroIceTerrain?.height(q.x,q.z);
        if(h!==null&&h!==undefined&&q.y<h+.35){camera.position.copy(look.clone().addScaledVector(delta,Math.max(.12,(step-1)/24)));break;}
      }
      camera.lookAt(look);
    }
    cityGlow.position.x = px * .5; magentaGlow.position.x = 12 + px * .25;
    if(travelWorld){
      travelWorld.root.visible=true;travelWorld.update(state.round,new THREE.Vector3(px,0,pz),t);
      [battlefield,industrialArena,futureStreetBase,futureCity,futureResidents,rain,warehouseArena?.group,meteorLevel?.group,snowStreet?.group,...ships].filter(Boolean).forEach(g=>g.visible=false);
      contactFloor.visible=false;camera.updateMatrixWorld(true);detailContext.clearRect(0,0,details.width,details.height);
      window.heroTravelProjection=(x,y,w,h)=>{const wx=(x-500)*.055,wz=(y-300)*.055,v=new THREE.Vector3(wx,groundHeight(wx,wz),wz),a=v.clone().project(camera),b=v.clone().add(new THREE.Vector3(0,2.48,0)).project(camera);return {x:(a.x+1)*w/2,y:(1-a.y)*h/2,height:Math.min(h*.85,Math.max(0,(b.y-a.y)*h/2)),scale:1,depth:0,visible:a.z>-1&&a.z<1};};
      window.heroTravelUnproject=(x,y,w,h)=>{
        groundRay.setFromCamera(new THREE.Vector2(x/w*2-1,1-y/h*2),camera);
        const ice=state.round===2?window.heroIceTerrain:null;
        // On the public build the optional frozen collision bundle can be absent.
        // Aim against a flat ground plane until the original terrain is restored.
        const q=ice?.raycast?ice.raycast(groundRay.ray):
          groundRay.ray.intersectPlane(state.round===3?new THREE.Plane(new THREE.Vector3(0,1,0),-groundHeight(px,pz)):groundPlane,new THREE.Vector3());
        return q?{
          x:state.round===3?q.x/.055+500:THREE.MathUtils.clamp(q.x/.055+500,34,966),
          y:state.round===3?q.z/.055+300:THREE.MathUtils.clamp(q.z/.055+300,ice?.bounds?.minY??-18000,ice?.bounds?.maxY??574)
        }:{x:local.x,y:local.y};
      };
      for(const [key,rig] of rigs){const p=rig.userData.source;if(!p)continue;const pos=new THREE.Vector3(((p.x??700)-500)*.055,0,((p.y??285)-300)*.055);pos.y=state.round===3&&Number.isFinite(p.villageHeight)?p.villageHeight:groundHeight(pos.x,pos.z);const air=(state.round!==3&&p.jump>0?Math.sin(THREE.MathUtils.clamp((.76-p.jump)/.76,0,1)*Math.PI)*1.15:0)+(p.flying?(p.flightHeight||4.5):0)+(p.climbing?Math.min(110,p.climbHeight||0)*.045:0);footContact?.place(rig,pos,air);
        const anchor=window.heroGround.sample(state.round,p.x??700,p.y??285,details.width,details.height);
        if(anchor.visible){window.heroGround.bolts(detailContext,p,state.round,details.width,details.height);if(p.hero==='ecal'&&!rig.userData.glbModel&&!firstPerson)window.drawEcalCharacter?.(detailContext,p,anchor.x,anchor.y,anchor.height*window.heroCharacterSize(p),t);}
      }
      if(state.clinic)fieldClinic.position.set((state.clinic.x-500)*.055,0,(state.clinic.y-300)*.055);
      for(const c of state.civilians||[]){if(c.saved)continue;const q=window.heroGround.sample(state.round,c.x,c.y,details.width,details.height);if(!q.visible)continue;detailContext.fillStyle='#83ffd0';detailContext.font='bold 20px sans-serif';detailContext.fillText('+',q.x,q.y-8);}
      for(const shot of state.shots||[]){const q=window.heroGround.sample(state.round,shot.x,shot.y,details.width,details.height);if(!q.visible)continue;detailContext.fillStyle='#ff724f';detailContext.beginPath();detailContext.arc(q.x,q.y-q.height*.45,6,0,Math.PI*2);detailContext.fill();}
      const lightGround=groundHeight(px,pz);moon.position.set(px-10,lightGround+24,pz+8);moon.target.position.set(px,lightGround,pz);scene.add(moon.target);
    }
    if (photoScene && window.heroGround) {
      // A fixed photograph needs a fixed camera and a foot point on its visible ground.
      if(!firstPerson){camera.position.set(0, frontView ? 7 : 10, 18); camera.lookAt(0,0,0);} camera.updateMatrixWorld(true);
      const w=details.width,h=details.height; detailContext.clearRect(0,0,w,h);
      const groundPoint = (x,y) => { groundRay.setFromCamera(new THREE.Vector2(x/w*2-1,1-y/h*2),camera); return groundRay.ray.intersectPlane(state.round===3?new THREE.Plane(new THREE.Vector3(0,1,0),-groundHeight(px,pz)):groundPlane,new THREE.Vector3()); };
      for(const [key,rig] of rigs){
        const p=rig.userData.source;if(!p)continue;
        const anchor=window.heroGround.sample(state.round,p.x??700,p.y??285,w,h),point=groundPoint(anchor.x,anchor.y);if(!point)continue;
        const targetHeight=anchor.height*window.heroCharacterSize(p),base=point.clone().project(camera),top=point.clone().add(new THREE.Vector3(0,2.32,0)).project(camera);
        rig.scale.setScalar(THREE.MathUtils.clamp(targetHeight/Math.max(1,(top.y-base.y)*h/2),.35,3.8));
        const lift=window.heroGround.lift(p,targetHeight),worldLift=lift/targetHeight*2.32*rig.scale.x;
        if(footContact)footContact.place(rig,point,worldLift);else rig.position.copy(point).add(new THREE.Vector3(0,worldLift,0));
        if(rig.userData.hammerImpact){const q=window.heroGround.sample(state.round,p.smashX??p.x,p.smashY??p.y,w,h),hit=groundPoint(q.x,q.y);if(hit)rig.userData.hammerImpact.position.copy(hit).y=.025;}
        
        if(rig.visible)window.heroGround.shadow(detailContext,anchor,targetHeight,lift);
        window.heroGround.bolts(detailContext,p,state.round,w,h);
        if(p.hero==='ecal'&&!rig.userData.glbModel&&!firstPerson)window.drawEcalCharacter?.(detailContext,p,anchor.x,anchor.y,targetHeight,t);
      }
      // The clinic and health pickups share the same floor as combatants.
      if(state.clinic&&state.round===1){const a=window.heroGround.sample(state.round,state.clinic.x,state.clinic.y,w,h),q=groundPoint(a.x,a.y);if(q)fieldClinic.position.copy(q);}
      for(const c of state.civilians||[]){if(c.saved)continue;const a=window.heroGround.sample(state.round,c.x,c.y,w,h);detailContext.fillStyle='#75ffd2';detailContext.shadowColor='#32ffae';detailContext.shadowBlur=8;detailContext.font='bold '+Math.round(h*.027)+'px sans-serif';detailContext.textAlign='center';detailContext.fillText('+',a.x,a.y-3);detailContext.shadowBlur=0;}
      for(const shot of state.shots||[]){const a=window.heroGround.sample(state.round,shot.x,shot.y,w,h);detailContext.fillStyle=shot.type==='wand'?'#ff497e':'#ff9f49';detailContext.beginPath();detailContext.arc(a.x,a.y-a.height*.45,5*h/610,0,Math.PI*2);detailContext.fill();}
    }
    window.heroMeteorHazards?.draw(detailContext,state,details.width,details.height);
    darkPresentation?.update(state,camera,localRig,rigs.get(bossKey),[...rigs.values()].filter(r=>r.userData.isPlayer));
    ashenPortal?.update(state,t,rigs);
    if(state.finale||state.ashenTransition)detailContext.clearRect(0,0,details.width,details.height);
    else window.drawDarkBossEffects?.(detailContext,state,details.width,details.height);
    for(const rig of rigs.values()){const p=rig.userData.source;if(!p?.seated)continue;const g=rig.userData.glbRig||rig.userData.helmetedRig;if(g?.pelvis){rig.updateMatrixWorld(true);const hip=g.pelvis.getWorldPosition(new THREE.Vector3());rig.position.y+=1.04-hip.y;}}
    for(const rig of rigs.values()){const k=rig.userData.source?.ecalSkill;if(k&&['ecalDive','ecalFlip','ecalAirKick','ecalSpin'].includes(k.kind))rig.position.y+=Math.sin(Math.min(1,k.age/k.duration)*Math.PI)*(k.kind==='ecalDive'?.85:k.kind==='ecalSpin'?1.1:2.1);}
    for(const rig of rigs.values()){
      const p=rig.userData.source,g=rig.userData.glbRig;
      if(p?.hero!=='ecal'||!g?.hands)continue;
      const active=p.ecalSkill&&['ecalDive','ecalFlip','ecalSpin'].includes(p.ecalSkill.kind);
      if(active&&!rig.userData.acroBeams){rig.userData.acroBeams=[0,1].map(()=>{const beam=new THREE.Mesh(new THREE.CylinderGeometry(.035,.07,1,6),new THREE.MeshBasicMaterial({color:0x72edff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));rig.add(beam);return beam;});}
      rig.updateMatrixWorld(true);
      (rig.userData.acroBeams||[]).forEach((beam,i)=>{
        const k=p.ecalSkill;beam.visible=!!active&&k.age/k.duration>.18&&k.age/k.duration<.8&&(k.age%.12)<.075;
        if(!beam.visible)return;
        const start=g.hands[i].getWorldPosition(new THREE.Vector3());
        const target=p.ecalBolts?.[i%Math.max(1,p.ecalBolts?.length||0)]||p.ecalAim;
        const end=target?new THREE.Vector3((target.x-500)*.055,1.2,(target.y-300)*.055):start.clone().add(new THREE.Vector3(i?5:-5,-1,-7));
        rig.worldToLocal(start);rig.worldToLocal(end);const delta=end.clone().sub(start);
        beam.position.copy(start).add(end).multiplyScalar(.5);beam.scale.set(1,delta.length(),1);beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
      });
    }
    if(state.round===3&&localRig&&!firstPerson){
      localRig.visible=true;
      const focus=localRig.position.clone().add(new THREE.Vector3(0,1.25,0));
      window.modelVillageCamera?.(camera,focus);
      camera.lookAt(focus.clone().add(new THREE.Vector3(0,0,-.5)));
    }
    for(const rig of rigs.values())window.heroStuntFinish?.(rig,rig.userData.source);
    if(!firstPerson&&!state.intro&&!state.ashenTransition&&!state.radioScene&&!state.finale)window.heroStuntCamera?.(THREE,camera,localRig,local);
    for(const rig of rigs.values())window.plantHeroFeet?.(THREE,rig,t);
    window.updateVillageRoomCamera?.(THREE,state,camera);
    window.updateVillageRadioCamera?.(THREE,state,camera,rigs);
    window.redDawnPunchCamera?.(THREE,state,camera,rigs);
    if(!firstPerson&&!state.finale&&!state.ashenTransition&&!state.radioScene)window.heroCombatCamera?.(THREE,camera,localRig,local);
    finalRealm?.update(state,t,local);
    if(state.round===5){const bossRig=rigs.get('dark-armored-warrior');if(bossRig)bossRig.scale.multiplyScalar(1+(state.finalStorm?.energy||0)*.3);}
    window.updateFrostIntro?.(THREE,state,scene,camera,rigs,local,dt);
    window.finImpactCamera?.(THREE,state,camera,rigs,dt);
    for(const rig of rigs.values()){
      const k=rig.userData.source?.knockdown,g=rig.userData.glbRig;if(!k||!g)continue;
      const fall=THREE.MathUtils.smoothstep(k.age,0,.45),rise=THREE.MathUtils.smoothstep(k.age,1.2,2.6),low=fall*(1-rise);
      rig.rotation.z=low*1.35;rig.position.y+=low*.5;
      g.spine.rotation.x=low*.3;g.head.rotation.x=low*.15;
      g.thighs.forEach((b,i)=>b.rotation.x=-low*(i?.45:.8));g.knees.forEach(b=>b.rotation.x=low*1.1);
      g.arms.forEach((b,i)=>{b.rotation.x=-low*(i?.8:.25);b.rotation.z=(i?1:-1)*low*.35;});
    }

    window.updateVillageClueCinematic?.(THREE,state,camera,rigs);
    for(const actor of rigs.values())window.stabilizeCharacterPose?.(actor);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
