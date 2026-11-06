/* Main game, chapter one only. Presentation never writes to mission state. */
(() => {
  window.createRuinedCityCanyon=(T,scene)=>{
    const root=new T.Group();root.name='Chapter One · starship canyon';root.visible=false;scene.add(root);
    const rand=n=>{const x=Math.sin(n*127.1+31.7)*43758.5453;return x-Math.floor(x);};
    const surface=document.createElement('canvas');surface.width=surface.height=256;const ctx=surface.getContext('2d');
    ctx.fillStyle='#8f7c62';ctx.fillRect(0,0,256,256);
    for(let i=0;i<7000;i++){const a=rand(i);ctx.fillStyle=i%3?'rgba(20,13,8,.13)':'rgba(255,223,165,.18)';ctx.fillRect(rand(i+9)*256,rand(i+87)*256,.5+a*3,.4+a*2);}
    for(let i=0;i<22;i++){ctx.strokeStyle='#342a2160';ctx.lineWidth=.5+rand(i)*1.7;ctx.beginPath();const x=rand(i+67)*256,y=rand(i+69)*256;ctx.moveTo(x,y);ctx.lineTo(x+rand(i+13)*28,y+rand(i+19)*7);ctx.stroke();}
    const patina=new T.CanvasTexture(surface);patina.colorSpace=T.SRGBColorSpace;patina.wrapS=patina.wrapT=T.RepeatWrapping;
    const metal=new T.MeshStandardMaterial({color:0x807563,map:patina,bumpMap:patina,bumpScale:.045,roughness:.88,metalness:.6,side:T.DoubleSide});
    const edge=new T.MeshStandardMaterial({color:0x9a8c72,map:patina,roughness:.77,metalness:.64});
    const dark=new T.MeshStandardMaterial({color:0x211f1a,roughness:.93,metalness:.4});
    const bone=new T.MeshStandardMaterial({color:0xd3c7ad,bumpMap:patina,bumpScale:.012,roughness:.98});
    const socket=new T.MeshStandardMaterial({color:0x1a130e,roughness:1});
    const sharedBox=new T.BoxGeometry(1,1,1);
    function part(parent,geometry,material,p,s,rz=0){const o=new T.Mesh(geometry,material);o.position.set(...p);if(s)o.scale.set(...s);o.rotation.z=rz;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
    function panel(parent,p,s,material=metal,rz=0){return part(parent,sharedBox,material,p,s,rz);}
    // The wreck sits beyond the playable lane. Its broken ribs and open engines
    // have volume from every camera angle, rather than being a flat backdrop.
    const wreck=new T.Group();wreck.name='Collapsed starship hull';wreck.position.set(35,9,-58);wreck.rotation.set(.15,.35,-.44);root.add(wreck);
    const shell=new T.CylinderGeometry(6.5,8,47,32,3,true,.25,Math.PI*1.44);
    part(wreck,shell,metal,[0,9,0]);
    const hullFace=new T.Shape();hullFace.moveTo(-7,-12);hullFace.lineTo(7,-12);hullFace.lineTo(9,11);hullFace.lineTo(6,24);hullFace.lineTo(2,28);hullFace.lineTo(-1,22);hullFace.lineTo(-6,27);hullFace.lineTo(-9,8);hullFace.closePath();
    const tear=new T.Path();tear.moveTo(-2,-7);tear.lineTo(-2,11);tear.lineTo(0,8);tear.lineTo(2,14);tear.lineTo(3,-5);tear.closePath();hullFace.holes.push(tear);
    part(wreck,new T.ExtrudeGeometry(hullFace,{depth:.55,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:1}),metal,[0,1,6]);
    for(let i=0;i<8;i++){panel(wreck,[-4,-8+i*4.1,6.65],[4.8,.13,.16],edge);panel(wreck,[5,-8+i*4.1,6.65],[2.7,.13,.16],edge);}
    for(let i=0;i<11;i++){
      const y=-12+i*4.2;
      const rib=part(wreck,new T.TorusGeometry(7.1,.16,7,40,Math.PI*1.56),edge,[0,y,0]);rib.rotation.x=Math.PI/2;rib.rotation.z=.28;
      for(let j=0;j<3;j++)panel(wreck,[Math.sin(j*1.7)*7.15,y,Math.cos(j*1.7)*7.15],[.17,3.8,.19],dark);
      if(i%2===0)panel(wreck,[-7.4,y,1.8],[3.8,.16,6],metal,-.15-rand(i)*.3);
    }
    for(let i=0;i<26;i++){const y=-12+rand(i+20)*46,a=rand(i+90)*5.8;panel(wreck,[Math.sin(a)*7.3,y,Math.cos(a)*7.3],[1.4+rand(i)*2.6,.16,1.8+rand(i+3)*3],i%3?metal:edge,(rand(i)-.5)*.5);}
    for(const x of [-8.8,8.8]){
      const engine=new T.Group();engine.position.set(x,-8,0);engine.rotation.x=Math.PI/2;wreck.add(engine);
      part(engine,new T.CylinderGeometry(3,3.5,9,24,1,true),dark,[0,0,0]);
      for(const y of [-4.5,-3,3,4.5]){const ring=part(engine,new T.TorusGeometry(3.2,.18,8,32),edge,[0,y,0]);ring.rotation.x=Math.PI/2;}
      for(let j=0;j<12;j++){const a=j*Math.PI/6;panel(engine,[Math.sin(a)*2.7,-3.8,Math.cos(a)*2.7],[.12,1.8,1.6],metal,a);}
    }
    const brokenTip=new T.Shape();brokenTip.moveTo(-8,0);brokenTip.lineTo(8,0);brokenTip.lineTo(6,10);brokenTip.lineTo(3,6);brokenTip.lineTo(1,15);brokenTip.lineTo(-1,8);brokenTip.lineTo(-5,11);brokenTip.closePath();
    part(wreck,new T.ExtrudeGeometry(brokenTip,{depth:.35,bevelEnabled:false}),metal,[0,30,-2]);
    // Futuristic silhouettes outside the existing masonry avenue.
    for(const side of [-1,1])for(let i=0;i<6;i++){
      const tower=new T.Group();tower.name='Broken science-fiction tower';tower.position.set(side*(39+rand(i+side*7)*13),0,-32-i*26);tower.rotation.z=side*(.025+rand(i)*.04);root.add(tower);
      const height=23+rand(i+55)*28,r=3.6+rand(i+80)*2.4;
      part(tower,new T.CylinderGeometry(r*.7,r,height,12,4,true,0,Math.PI*1.72),metal,[0,height/2,0]);
      for(let j=1;j<7;j++){const ring=part(tower,new T.TorusGeometry(r+.12,.14,5,24,Math.PI*1.7),edge,[0,height*j/7,0]);ring.rotation.x=Math.PI/2;}
      for(let j=0;j<5;j++)panel(tower,[Math.sin(j*1.4)*r,height+rand(i+j)*4,Math.cos(j*1.4)*r],[.13,4+rand(j)*5,.18],dark,(rand(i+j)-.5)*.4);
    }
    // Batch repeated static parts so the added hull detail costs few draw calls.
    root.updateMatrixWorld(true);const batches=new Map();
    root.traverse(o=>{if(!o.isMesh)return;const key=o.geometry.type+JSON.stringify(o.geometry.parameters)+o.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);});
    for(const parts of batches.values())if(parts.length>1){const batch=new T.InstancedMesh(parts[0].geometry,parts[0].material,parts.length);batch.name='Batched canyon architecture';batch.castShadow=true;batch.receiveShadow=true;parts.forEach((o,i)=>{batch.setMatrixAt(i,o.matrixWorld);o.visible=false;});batch.instanceMatrix.needsUpdate=true;root.add(batch);}
    // A small off-path prop is inspectable without cluttering the walking lane.
    const skull=new T.Group();skull.name='Half-buried weathered skull';skull.position.set(-26.8,.02,8);skull.rotation.y=.42;root.add(skull);
    part(skull,new T.SphereGeometry(.25,28,22),bone,[0,.17,0],[1,.9,.82]);
    part(skull,new T.SphereGeometry(.17,20,14),bone,[0,.07,.115],[.92,.42,.64]);
    for(const side of [-1,1]){
      part(skull,new T.SphereGeometry(.073,16,12),socket,[side*.094,.19,.178],[1,.88,.45]);
      const brow=part(skull,new T.TorusGeometry(.077,.012,6,24),bone,[side*.094,.19,.195],[1,.79,.5]);brow.rotation.z=-side*.18;
    }
    const nose=new T.Shape();nose.moveTo(0,.015);nose.lineTo(-.033,-.06);nose.lineTo(.033,-.06);nose.closePath();part(skull,new T.ShapeGeometry(nose),socket,[0,.135,.205]);
    for(let i=0;i<8;i++)part(skull,new T.SphereGeometry(.018,7,8),bone,[(i-3.5)*.033,.028,.242-Math.abs(i-3.5)*.009],[.85,1.65,.7]);
    part(skull,new T.SphereGeometry(.11,16,8),socket,[0,.018,.193],[1.1,.45,.25]);
    const dirt=new T.MeshStandardMaterial({color:0x7a664b,map:patina,roughness:1});
    part(skull,new T.SphereGeometry(.4,20,10),dirt,[0,-.066,0],[1.5,.2,1.2]);
    // A cloudy orange sky is generated in the renderer; no external picture is
    // stretched over the city or used in place of traversable scenery.
    const skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{clock:{value:0}},vertexShader:`varying vec3 direction;void main(){direction=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`,fragmentShader:`
      varying vec3 direction;uniform float clock;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float cloud(vec2 p){float n=0.,a=.5;for(int i=0;i<4;i++){n+=a*noise(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return n;}
      void main(){vec3 d=normalize(direction);float h=clamp(d.y,0.,1.);vec3 color=mix(vec3(.40,.20,.065),vec3(.09,.068,.045),smoothstep(0.,.8,h));vec2 uv=d.xz/(max(.13,d.y)+.25);float n=cloud(uv*2.3+vec2(clock*.003,0));float clouds=smoothstep(.31,.70,n);color=mix(color,vec3(.075,.05,.025),clouds*.9);float sun=pow(max(dot(d,normalize(vec3(.48,.36,-.79))),0.),65.);color+=vec3(1.,.72,.30)*sun*1.6;color+=vec3(.12,.06,.012)*pow(max(dot(d,normalize(vec3(.48,.36,-.79))),0.),5.);gl_FragColor=vec4(color,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`});
    const sky=new T.Mesh(new T.SphereGeometry(150,32,20),skyMaterial);sky.name='Smoky orange sky';sky.frustumCulled=false;sky.renderOrder=-10;root.add(sky);
    const rays=new T.Group();rays.name='Golden light shafts';root.add(rays);
    const rayMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{strength:{value:.08}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float strength;void main(){float edge=pow(max(0.,1.-abs(v.x*2.-1.)),2.);gl_FragColor=vec4(1.,.69,.28,edge*sin(v.y*3.14159)*strength);}'});
    for(let i=0;i<5;i++){
      const x=27+i*2.2,z=-48-i*2,w=2.4+i*.65,geo=new T.BufferGeometry();
      geo.setAttribute('position',new T.Float32BufferAttribute([x,43,z,x+.7,43,z,-4+i*2+w,.1,-8,-4+i*2-w,.1,-8],3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,1,1,1,1,0,0,0],2));geo.setIndex([0,1,2,0,2,3]);rays.add(new T.Mesh(geo,rayMaterial));
    }
    const dustGeo=new T.BufferGeometry(),dustPositions=new Float32Array(210*3);
    for(let i=0;i<210;i++){dustPositions[i*3]=(rand(i)-.5)*54;dustPositions[i*3+1]=rand(i+40)*15;dustPositions[i*3+2]=-110+rand(i+80)*150;}
    dustGeo.setAttribute('position',new T.BufferAttribute(dustPositions,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:0xf1c986,size:.055,transparent:true,opacity:.35,depthWrite:false}));root.add(dust);
    const wrap=document.querySelector('.arena-wrap'),button=document.createElement('button');button.type='button';button.textContent='SKULL CLOSE-UP';button.hidden=true;button.setAttribute('aria-label','Inspect the half-buried skull; movement returns to play');button.style.cssText='position:absolute;bottom:52px;right:12px;z-index:5;border:1px solid #bd9865;background:#241c14dc;color:#ffe6b3;padding:8px 11px;border-radius:5px;font:bold 11px sans-serif';wrap.appendChild(button);
    const style=document.createElement('style');style.textContent='[data-ruin-inspect][hidden]{display:none!important}';document.head.appendChild(style);button.dataset.ruinInspect='';
    let inspectUntil=0,active=false,inspection=false,previousPosition=null,ownedCamera=null,originalFov=54;
    const heading=new T.Vector3(0,0,-1),desired=new T.Vector3(),look=new T.Vector3(),follow=new T.Vector3();let followReady=false,lastMode='';
    const cancel=()=>{inspectUntil=0;inspection=false;};
    button.addEventListener('click',()=>{if(active)inspectUntil=performance.now()+4200;});
    document.addEventListener('keydown',event=>{if(!event.repeat&&/^(Key[WASDMJKERQFBHVZX]|Arrow(Up|Down|Left|Right)|Space|ShiftLeft|ControlLeft|Escape)$/.test(event.code))cancel();});
    wrap.addEventListener('pointerdown',event=>{if(!button.contains(event.target))cancel();});
    document.querySelector('#cameraToggle')?.addEventListener('click',cancel);
    const busy=s=>!!(s?.intro||s?.ashenTransition||s?.misfitConfrontation||s?.misfitEscape||s?.finImpact||s?.finale||s?.radioScene||s?.finalCombo||s?.canyonArrival);
    let target=null,postScene=null,postCamera=null,postMaterial=null;
    function preparePost(renderer){
      if(!target){target=new T.WebGLRenderTarget(1,1,{depthBuffer:true});target.depthTexture=new T.DepthTexture(1,1,T.UnsignedShortType);postScene=new T.Scene();postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);postMaterial=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:target.texture},depthImage:{value:target.depthTexture},pixel:{value:new T.Vector2()},focus:{value:1},clip:{value:new T.Vector2(.1,180)}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D image;uniform sampler2D depthImage;uniform vec2 pixel;uniform vec2 clip;uniform float focus;varying vec2 v;float distanceAt(vec2 uv){float z=texture2D(depthImage,uv).x;return clip.x*clip.y/(clip.y-z*(clip.y-clip.x));}void main(){float d=distanceAt(v),blur=clamp(abs(d-focus)/max(d,.01)*3.,0.,1.);vec3 col=texture2D(image,v).rgb;float total=1.;for(int i=0;i<12;i++){float angle=float(i)*2.39996;vec2 uv=clamp(v+vec2(cos(angle),sin(angle))*pixel*sqrt((float(i)+.5)/12.)*blur*9.,vec2(0.),vec2(1.));float sampleDepth=distanceAt(uv);float w=sampleDepth<focus+.35&&d>focus+.5?0.:1.;col+=texture2D(image,uv).rgb*w;total+=w;}gl_FragColor=vec4(col/total,1.);
      #include <colorspace_fragment>
      }`});postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),postMaterial));}
      const size=renderer.getDrawingBufferSize(new T.Vector2()),w=Math.min(1600,size.x),h=Math.round(size.y*w/size.x);if(target.width!==w||target.height!==h)target.setSize(w,h);postMaterial.uniforms.pixel.value.set(1/w,1/h);
    }
    return {
      root,
      setState(state){active=state?.phase==='game'&&[1,4].includes(state.round)&&!state.intro;root.visible=active;button.hidden=!active||busy(state);if(!active){cancel();followReady=false;previousPosition=null;if(ownedCamera){ownedCamera.fov=originalFov;ownedCamera.updateProjectionMatrix();ownedCamera=null;}}},
      updateEnvironment(state,camera,local,t,travelWorld){if(!active)return;sky.position.copy(camera.position);skyMaterial.uniforms.clock.value=t;scene.background=null;scene.fog.color.setHex(0x9b744a);scene.fog.near=34;scene.fog.far=145;dust.position.z=Math.floor(((local.y??300)-300)*.055/80)*80;
        for(const chunk of travelWorld?.root?.children||[])for(const floor of chunk.children||[])if(floor.geometry?.type==='PlaneGeometry'&&floor.geometry.parameters.width===62){floor.material=dirt;floor.name='Clear dirt walking lane';}
      },
      updateCamera(state,local,camera,rig,dt,mode,closeOnly=false){
        if(!active||busy(state)){if(inspection){camera.fov=originalFov;camera.updateProjectionMatrix();}cancel();followReady=false;return;}
        if(!ownedCamera){ownedCamera=camera;originalFov=camera.fov;}
        const x=((local.x??500)-500)*.055,z=((local.y??300)-300)*.055,size=window.heroCharacterSize?.(local)||1,air=local.flying?(local.flightHeight||4.5):0;
        if(closeOnly){
          if(previousPosition&&Math.hypot(x-previousPosition.x,z-previousPosition.z)>.035)cancel();previousPosition={x,z};inspection=inspectUntil>performance.now();
          if(inspection){camera.position.set(-25.85,.28,9.05);camera.lookAt(-26.8,.19,8.09);camera.fov=32;camera.updateProjectionMatrix();if(rig)rig.visible=false;}return;
        }
        if((local.fx||0)**2+(local.fy||0)**2>.01)heading.set(local.fx,0,local.fy).normalize();
        if(mode==='front'){camera.fov=originalFov;camera.updateProjectionMatrix();followReady=false;return;}
        const right=new T.Vector3(-heading.z,0,heading.x);
        if(mode==='first'){desired.set(x,2.18*size+air,z);look.copy(desired).addScaledVector(heading,25);}
        else {desired.set(x,2.12*size+.28+air,z).addScaledVector(heading,-6.4).addScaledVector(right,1.2);desired.x=T.MathUtils.clamp(desired.x,-27.1,27.1);look.set(x,1.92*size+air,z).addScaledVector(heading,11).addScaledVector(right,.45);}
        if(!followReady||lastMode!==mode){follow.copy(desired);followReady=true;}else follow.lerp(desired,1-Math.exp(-dt*(mode==='first'?18:7)));
        lastMode=mode;camera.position.copy(follow);camera.lookAt(look);camera.fov=mode==='first'?62:58;camera.updateProjectionMatrix();
      },
      renderCloseup(renderer,camera){if(!active||!inspection)return false;preparePost(renderer);camera.updateMatrixWorld(true);postMaterial.uniforms.clip.value.set(camera.near,camera.far);const world=new T.Vector3(-26.8,.19,8.09).applyMatrix4(camera.matrixWorldInverse);postMaterial.uniforms.focus.value=-world.z;const original=renderer.getRenderTarget();renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(original);renderer.render(postScene,postCamera);return true;}
    };
  };
})();
