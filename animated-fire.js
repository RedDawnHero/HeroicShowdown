/* Grounded photographic flames, with separate rising smoke and embers. */
(() => {
  const image = new Image();
  // The optional photo pack is not deployed in every build. Draw local layered
  // flames instead of requesting a missing PNG and leaving the fire invisible.
  function proceduralFire() {
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;
    const g=canvas.getContext('2d');
    const layers=[
      {cx:128,rx:113,top:15,base:313,inner:'#ffba53',outer:'rgba(255,57,8,0)'},
      {cx:122,rx:80,top:60,base:310,inner:'#ffdf89',outer:'rgba(255,100,15,0)'},
      {cx:132,rx:51,top:125,base:314,inner:'#fff7bd',outer:'rgba(255,181,47,0)'}
    ];
    for(const layer of layers){
      const grad=g.createRadialGradient(layer.cx,layer.base-56,4,layer.cx,layer.base-90,layer.rx*1.7);
      grad.addColorStop(0,layer.inner);grad.addColorStop(.45,'#ff7927');grad.addColorStop(1,layer.outer);
      g.fillStyle=grad;g.beginPath();g.moveTo(layer.cx-layer.rx,layer.base);
      g.bezierCurveTo(layer.cx-layer.rx*1.15,layer.base-95,layer.cx-layer.rx*.37,layer.top+108,layer.cx-20,layer.top);
      g.bezierCurveTo(layer.cx+layer.rx*.07,layer.top+75,layer.cx+layer.rx*.72,layer.base-140,layer.cx+layer.rx,layer.base);
      g.closePath();g.fill();
    }
    const glow=g.createRadialGradient(128,291,2,128,291,108);
    glow.addColorStop(0,'rgba(255,246,181,.96)');glow.addColorStop(.26,'rgba(255,153,26,.76)');glow.addColorStop(1,'rgba(255,66,9,0)');
    g.fillStyle=glow;g.fillRect(0,172,256,148);
    return canvas.toDataURL('image/png');
  }
  image.onerror=()=>{image.onerror=null;image.src=proceduralFire();};
  image.src=window.heroFireImage || proceduralFire();
  const fract = n => n - Math.floor(n);
  const random = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
  const smokeCanvas = document.createElement('canvas');
  smokeCanvas.width = smokeCanvas.height = 128;
  const ctx = smokeCanvas.getContext('2d');
  for (let i = 0; i < 22; i++) {
    const x = 34 + random(i) * 60, y = 34 + random(i + 30) * 60;
    const r = 14 + random(i + 60) * 20;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(100,94,88,.22)');
    gradient.addColorStop(.45, 'rgba(82,78,75,.12)');
    gradient.addColorStop(1, 'rgba(70,68,66,0)');
    ctx.fillStyle = gradient; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  window.createAnimatedFireFactory = T => {
    const fireTexture = new T.Texture();
    fireTexture.colorSpace = T.SRGBColorSpace;
    function installImage() { fireTexture.image = image; fireTexture.needsUpdate = true; }
    if (image.complete && image.naturalWidth) installImage();
    else image.addEventListener('load', installImage, {once: true});
    const smokeTexture = new T.CanvasTexture(smokeCanvas);
    const sparkCanvas = document.createElement('canvas'); sparkCanvas.width = sparkCanvas.height = 32;
    const sc = sparkCanvas.getContext('2d'), sg = sc.createRadialGradient(16,16,0,16,16,16);
    sg.addColorStop(0,'#fffbd9'); sg.addColorStop(.2,'#ffbd4c'); sg.addColorStop(1,'rgba(255,79,12,0)');
    sc.fillStyle = sg; sc.fillRect(0,0,32,32);
    const sparkTexture = new T.CanvasTexture(sparkCanvas);
    return (seed, size = 1) => {
      const root = new T.Group(); root.name = 'Burning debris with smoke'; root.scale.setScalar(size);
      const clock = {value: 0};
      const material = new T.MeshBasicMaterial({map: fireTexture, transparent: true,
        depthWrite: false, side: T.DoubleSide, toneMapped: false, alphaTest: .012});
      material.onBeforeCompile = shader => {
        shader.uniforms.fireTime = clock;
        shader.vertexShader = 'uniform float fireTime;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
          #include <begin_vertex>
          float lift = smoothstep(0.16, 0.94, uv.y);
          transformed.x += lift * (sin(uv.y * 13.0 - fireTime * 5.1) * 0.085
            + sin(uv.y * 23.0 + fireTime * 8.3) * 0.032);
          transformed.y += lift * sin(fireTime * 7.2 + uv.x * 9.0 + uv.y * 11.0) * 0.09;
        `);
        shader.fragmentShader = 'uniform float fireTime;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          #ifdef USE_MAP
            vec2 fireUv = vMapUv;
            float flameMask = smoothstep(0.18, 0.75, fireUv.y);
            fireUv.x += sin(fireTime * 5.3 - fireUv.y * 18.0) * .012 * flameMask;
            fireUv.y += sin(fireTime * 6.1 + fireUv.x * 14.0) * .009 * flameMask;
            vec4 sampledDiffuseColor = texture2D(map, fireUv);
            sampledDiffuseColor.rgb *= 1.0 + .07 * sin(fireTime * 10.0 + fireUv.y * 24.0) * flameMask;
            diffuseColor *= sampledDiffuseColor;
          #endif
        `);
      };
      // The image's debris base sits at 96% of its height; only upper vertices bend.
      const geo = new T.PlaneGeometry(2.5, 2.7, 12, 24);
      const flame = new T.Mesh(geo, material); flame.position.y = 1.24; root.add(flame);
      const smoke = [];
      for (let i = 0; i < 9; i++) {
        const mat = new T.SpriteMaterial({map: smokeTexture, transparent: true, depthWrite: false,
          color: 0xb8aea5, opacity: .4});
        const puff = new T.Sprite(mat); root.add(puff); smoke.push(puff);
      }
      const sparksGeo = new T.BufferGeometry(), positions = new Float32Array(24 * 3);
      sparksGeo.setAttribute('position', new T.BufferAttribute(positions, 3));
      const sparkMat = new T.PointsMaterial({map: sparkTexture, color: 0xffba66,
        size: .075, transparent: true, opacity: .9, depthWrite: false,
        blending: T.AdditiveBlending, toneMapped: false});
      const sparks = new T.Points(sparksGeo, sparkMat); sparks.frustumCulled = false; root.add(sparks);
      return {root, update(t, viewer, worldZ) {
        clock.value = t + random(seed) * 20;
        flame.visible = !!fireTexture.image;
        flame.rotation.y = Math.atan2(viewer.x - root.position.x, viewer.z + 8 - worldZ);
        for (let i = 0; i < smoke.length; i++) {
          const age = fract(t * (.12 + random(seed+i) * .035) + i / smoke.length + random(seed));
          const puff = smoke[i], s = .8 + age * 3.3;
          puff.position.set(age * 1.6 + Math.sin(t*.65+i)*age*.45, 1.1+age*6, Math.sin(i*4+age*3)*age*.6);
          puff.scale.set(s, s * 1.18, 1);
          puff.material.opacity = Math.sin(age * Math.PI) * .5;
          puff.material.rotation = i + age * .75;
        }
        for (let i = 0; i < 24; i++) {
          const age = fract(t * (.31 + random(i+seed)*.19) + random(i*7+seed));
          positions[i*3] = (random(i+9)-.5)*1.3 + age*.7 + Math.sin(age*8+i)*age*.2;
          positions[i*3+1] = .25 + age * (2.4 + random(i+2)*2.6);
          positions[i*3+2] = (random(i+40)-.5)*.9;
        }
        sparksGeo.attributes.position.needsUpdate = true;
      }, dispose() {
        // Geometry is released here; travel-world must not dispose it again.
        geo.dispose(); sparksGeo.dispose(); material.dispose(); sparkMat.dispose();
        smoke.forEach(p => p.material.dispose());
        root.clear();
      }};
    };
  };

  window.drawAnimatedGroundFires = (g, t, level) => {
    if (!image.complete || !image.naturalWidth) return;
    const sites = {
      1: [[175,635,150],[1140,650,180],[885,510,85]],
      2: [[230,650,140],[1130,620,155],[840,510,70]],
      3: [[140,590,145],[1190,610,150],[410,520,75]],
      4: [[240,655,165],[1100,650,150],[875,520,80]],
      5: [[190,670,175],[1140,660,180],[870,535,90]]
    }[level] || [];
    for (const [x,y,s] of sites) {
      g.save();
      for (let i=0;i<7;i++) {
        const a=fract(t*.14+i/7+x*.01), w=s*(.5+a*1.4);
        g.globalAlpha=Math.sin(a*Math.PI)*.5;
        g.drawImage(smokeCanvas,x+a*s*.5-w/2,y-s*.6-a*s*2,w,w*1.15);
      }
      g.globalAlpha=1;
      for(let row=0;row<image.height;row+=6) {
        const h=Math.min(6,image.height-row), lift=Math.max(0,1-row/image.height/.82);
        const dx=Math.sin(t*6+row*.04+x)*lift*s*.025;
        g.drawImage(image,0,row,image.width,h,x-s/2+dx,y-s*.96+row/image.height*s,s,h/image.height*s+.5);
      }
      g.fillStyle='#ffcb70';
      for(let i=0;i<16;i++) {
        const a=fract(t*(.32+random(i)*.2)+random(i+x));g.globalAlpha=Math.sin(a*Math.PI);
        g.fillRect(x+(random(i+50)-.5)*s*.7+a*s*.25,y-s*.18-a*s*1.8,1.4,2.3);
      }
      g.restore();
    }
  };
})();
