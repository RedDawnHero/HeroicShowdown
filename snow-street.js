window.createSnowStreet = function (THREE) {
  const group = new THREE.Group(); group.name = 'Level 2 — snowbound ruins'; group.visible = false;
  let seed = 823;
  const rand = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
  const mat = (color, roughness = .9) => new THREE.MeshStandardMaterial({color, roughness, metalness: .08});
  const snow = mat(0xdbe5e7), ruin = mat(0x424b50), black = mat(0x141d22), metal = mat(0x555b5b, .55);
  const cube = new THREE.BoxGeometry(1, 1, 1);
  function box(parent, size, material, position) {
    const mesh = new THREE.Mesh(cube, material); mesh.scale.set(...size); mesh.position.set(...position);
    mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  const paint = document.createElement('canvas'); paint.width = paint.height = 512;
  const g = paint.getContext('2d'); g.fillStyle = '#9cabad'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1400; i++) {
    const x = rand() * 512, y = rand() * 512;
    g.fillStyle = i % 3 ? '#dbe4e5aa' : '#26353b99';
    g.beginPath(); g.ellipse(x, y, 1 + rand() * 14, 1 + rand() * 10, rand() * 6, 0, Math.PI * 2); g.fill();
  }
  const texture = new THREE.CanvasTexture(paint); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(9, 12);
  const groundMat = mat(0xb5c5ca); groundMat.map = texture; groundMat.bumpMap = texture; groundMat.bumpScale = .045;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(75, 100), groundMat);
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -.06, -18); floor.receiveShadow = true; group.add(floor);
  for (const side of [-1, 1]) {
    box(group, [5, .22, 94], snow, [side * 29, .02, -17]);
    for (let i = 0; i < 5; i++) {
      const z = 18 - i * 16, height = 8 + rand() * 8;
      box(group, [7, height, 12], ruin, [side * 35, height / 2, z]);
      box(group, [7.3, .2, 12.3], snow, [side * 35, height + .1, z]);
      for (let y = 2; y < height - 1; y += 2.7) for (const offset of [-3, 0, 3]) {
        box(group, [.06, 1.6, 1.2], black, [side * 31.47, y, z + offset]);
        box(group, [.3, .08, 1.4], snow, [side * 31.3, y - .8, z + offset]);
      }
      const pole = box(group, [.13, 6, .14], metal, [side * 28, 3, z + 6]); pole.rotation.z = side * .12;
      box(group, [1.7, .12, .14], metal, [side * 27.6, 5.9, z + 6]);
    }
  }
  // Burned vehicles stay along the edges, leaving the combat area open.
  for (const [x, z, bus] of [[-28, -15, true], [29, 8, false], [-29, 17, false], [28, -29, false]]) {
    const car = new THREE.Group(); car.position.set(x, 0, z); car.rotation.y = rand() * .5 - .25; group.add(car);
    const length = bus ? 6.5 : 3.9, height = bus ? 2.25 : 1.05;
    box(car, [2.2, .65, length], ruin, [0, .55, 0]);
    box(car, [2, height, length * .7], black, [0, .95 + height / 2, 0]);
    box(car, [2.15, .13, length * .73], snow, [0, 1.02 + height, 0]);
    box(car, [2.2, .09, .9], snow, [0, .91, length * .39]);
    for (const side of [-1, 1]) for (const end of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .22, 12), black);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(side * 1.1, .43, end * length * .31); car.add(wheel);
    }
    if (bus) for (let z = -2.5; z < 2.6; z += .7) box(car, [2.1, 1.5, .08], metal, [0, 2, z]);
  }
  const dummy = new THREE.Object3D();
  const debris = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1), ruin, 220);
  const caps = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1), snow, 220);
  for (let i = 0; i < 220; i++) {
    const x = (rand() - .5) * 61, z = rand() * 84 - 60, size = Math.abs(x) > 26 ? .3 + rand() * .6 : .06 + rand() * .17;
    dummy.position.set(x, size * .2, z); dummy.rotation.set(rand() * .3, rand() * 6, 0); dummy.scale.set(size, size * .38, size * .8); dummy.updateMatrix(); debris.setMatrixAt(i, dummy.matrix);
    dummy.position.y += size * .3; dummy.scale.y = size * .12; dummy.updateMatrix(); caps.setMatrixAt(i, dummy.matrix);
  }
  group.add(debris, caps);
  const flakeCanvas = document.createElement('canvas'); flakeCanvas.width = flakeCanvas.height = 32;
  const fg = flakeCanvas.getContext('2d'), fade = fg.createRadialGradient(16, 16, 1, 16, 16, 16);
  fade.addColorStop(0, '#ffffffff'); fade.addColorStop(.4, '#ffffffcc'); fade.addColorStop(1, '#ffffff00'); fg.fillStyle = fade; fg.fillRect(0, 0, 32, 32);
  const flakeMap = new THREE.CanvasTexture(flakeCanvas), count = 650, positions = new Float32Array(count * 3), particles = [];
  for (let i = 0; i < count; i++) particles.push({x: (rand() - .5) * 65, z: rand() * 85 - 59, y: rand() * 24, speed: .6 + rand() * 1.2});
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const flakes = new THREE.Points(geometry, new THREE.PointsMaterial({map: flakeMap, color: 0xe7f2ff, size: .11, transparent: true, opacity: .78, depthWrite: false})); flakes.frustumCulled = false; group.add(flakes);
  // Built-in stormy sky avoids an unavailable external Level 2 JPEG.
  const skyCanvas=document.createElement('canvas');skyCanvas.width=1024;skyCanvas.height=512;
  const skyContext=skyCanvas.getContext('2d'),gradient=skyContext.createLinearGradient(0,0,0,512);
  gradient.addColorStop(0,'#526b7e');gradient.addColorStop(.45,'#8399a7');
  gradient.addColorStop(1,'#d8e2e6');skyContext.fillStyle=gradient;
  skyContext.fillRect(0,0,1024,512);
  for(let i=0;i<42;i++){
    const x=rand()*1024,y=rand()*460,r=35+rand()*150;
    const fog=skyContext.createRadialGradient(x,y,0,x,y,r);
    fog.addColorStop(0,'rgba(227,239,245,.16)');
    fog.addColorStop(1,'rgba(227,239,245,0)');
    skyContext.fillStyle=fog;skyContext.fillRect(x-r,y-r,r*2,r*2);
  }
  const backdrop=new THREE.CanvasTexture(skyCanvas);
  backdrop.colorSpace=THREE.SRGBColorSpace;
  return {group, get background() { return backdrop; }, update(t, aspect) {
    if (backdrop.isTexture && backdrop.image) {
      const imageAspect = backdrop.image.width / backdrop.image.height;
      backdrop.repeat.set(Math.min(1, aspect / imageAspect), Math.min(1, imageAspect / aspect));
      backdrop.offset.set((1 - backdrop.repeat.x) / 2, (1 - backdrop.repeat.y) / 2);
    }
    particles.forEach((p, i) => { positions[i * 3] = p.x + Math.sin(t * .35 + i) * .6; positions[i * 3 + 1] = ((p.y - t * p.speed) % 24 + 24) % 24; positions[i * 3 + 2] = p.z + Math.sin(t * .18 + i) * .3; });
    geometry.attributes.position.needsUpdate = true;
  }};
};
