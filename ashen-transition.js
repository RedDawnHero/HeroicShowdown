/* Movie playback stays separate from the host's level-transition state. */
(() => {
  const overlay=document.createElement('section');
  overlay.className='opening-intro';overlay.id='ashenMovie';overlay.hidden=true;overlay.tabIndex=-1;
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Journey to the frozen world');
  overlay.innerHTML=`<video playsinline preload="metadata" style="object-fit:contain" aria-label="Journey to level two"></video>
    <div class="opening-prompt"><button class="btn btn-gold" type="button">▶ PLAY VIDEO</button><p role="status">Loading video…</p></div>
    <div class="opening-toolbar"><div class="opening-playback"><button class="opening-control" type="button" aria-pressed="true">SOUND ON</button></div><button class="opening-skip" type="button">SKIP VIDEO →</button></div>
    <progress class="opening-progress" max="1" value="0" aria-label="Video progress"></progress>`;
  document.body.appendChild(overlay);
  const video=overlay.querySelector('video'),prompt=overlay.querySelector('.opening-prompt'),play=prompt.querySelector('button'),status=prompt.querySelector('p'),sound=overlay.querySelector('.opening-control'),skip=overlay.querySelector('.opening-skip'),progress=overlay.querySelector('progress');
  let activeId=null,done=false,pending=false,restore=[];
  function close(){
    activeId=null;done=false;pending=false;video.pause();video.removeAttribute('src');video.load();overlay.hidden=true;
    restore.forEach(([el,inert])=>el.inert=inert);restore=[];
    document.body.classList.remove('ashen-movie-active');
  }
  function waiting(){video.pause();prompt.hidden=false;play.hidden=true;status.textContent='Waiting for the other heroes to finish. The portal opens next.';skip.hidden=true;}
  function finish(){if(activeId===null||done)return;done=true;waiting();window.dispatchEvent(new Event('heroic-ashen-movie-finished'));}
  async function start(){
    if(activeId===null||done||pending||document.hidden)return;
    const id=activeId;pending=true;play.disabled=true;status.textContent='Loading video…';
    try{await video.play();if(id!==activeId||done||document.hidden)video.pause();else prompt.hidden=true;}
    catch(error){if(id!==activeId||done)return;prompt.hidden=false;play.hidden=false;status.textContent=video.error?'The video could not play. Retry Play Video, or Skip Video to reach the portal.':'Press Play Video to watch with sound.';}
    finally{if(id===activeId){pending=false;play.disabled=false;}}
  }
  window.heroAshenMovie={sync(id,finished){
    if(id===null||id===undefined){if(activeId!==null)close();return;}
    if(activeId!==id){
      if(activeId!==null)close();activeId=id;done=false;overlay.hidden=false;
      restore=[...document.querySelectorAll('body > header,body > main,body > footer')].map(el=>[el,el.inert]);restore.forEach(([el])=>el.inert=true);
      document.body.classList.add('ashen-movie-active');prompt.hidden=false;play.hidden=false;skip.hidden=false;play.disabled=false;
      progress.value=0;video.src='assets/ashen-king-transition.mov';overlay.focus({preventScroll:true});
      if(!finished)start();
    }
    if(finished&&!done){done=true;waiting();}
  }};
  play.addEventListener('click',()=>{if(video.error){video.load();}start();});
  skip.addEventListener('click',finish);video.addEventListener('ended',finish);
  video.addEventListener('error',()=>{if(activeId===null||done)return;prompt.hidden=false;play.hidden=false;status.textContent='The video could not play. Retry Play Video, or Skip Video to reach the portal.';});
  video.addEventListener('timeupdate',()=>{if(Number.isFinite(video.duration)&&video.duration>0)progress.value=video.currentTime/video.duration;});
  sound.addEventListener('click',()=>{video.muted=!video.muted;sound.textContent=video.muted?'SOUND OFF':'SOUND ON';sound.setAttribute('aria-pressed',String(!video.muted));});
  document.addEventListener('visibilitychange',()=>{if(activeId===null)return;if(document.hidden)video.pause();else if(!done)start();});
  window.addEventListener('pagehide',()=>video.pause());
  window.addEventListener('keydown',e=>{
    if(activeId===null)return;e.stopImmediatePropagation();
    if(e.key==='Escape'){e.preventDefault();finish();}
    if(e.code==='Space'&&e.target===overlay){e.preventDefault();start();}
    if(e.key==='Tab'){
      const buttons=[...overlay.querySelectorAll('button')].filter(b=>!b.disabled&&b.getClientRects().length);
      const first=buttons[0],last=buttons[buttons.length-1];
      if(e.shiftKey&&(e.target===first||e.target===overlay)){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&(e.target===last||e.target===overlay)){e.preventDefault();first?.focus();}
    }
  },true);
  window.addEventListener('keyup',e=>{if(activeId!==null)e.stopImmediatePropagation();},true);
  const style=document.createElement('style');style.textContent='body.ashen-movie-active{overflow:hidden}';document.head.appendChild(style);

  window.createAshenPortal=(T,scene)=>{
    const group=new T.Group();scene.add(group);group.visible=false;
    const ring=new T.Mesh(new T.TorusGeometry(1.42,.085,12,96),new T.MeshBasicMaterial({color:0x82eaff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));
    const outer=new T.Mesh(new T.TorusGeometry(1.64,.022,8,96),new T.MeshBasicMaterial({color:0xbf8bff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));
    const surface=new T.Mesh(new T.CircleGeometry(1.4,64),new T.ShaderMaterial({transparent:true,side:T.DoubleSide,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec2 uvp;void main(){uvp=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`varying vec2 uvp;uniform float time;void main(){vec2 p=uvp*2.0-1.0;float r=length(p);float a=atan(p.y,p.x);float swirl=sin(a*5.0-r*21.0+time*3.4)*.5+.5;float threads=pow(swirl,7.0);vec3 c=mix(vec3(.025,.015,.12),vec3(.12,.65,.9),threads*.7+pow(r,5.0)*.8);gl_FragColor=vec4(c,.95*(1.0-smoothstep(.96,1.0,r)));}`}));
    group.add(surface,ring,outer);
    const light=new T.PointLight(0x70d9ff,5,11,2);light.position.z=1;group.add(light);
    const sparks=new T.Group();group.add(sparks);
    const material=new T.MeshBasicMaterial({color:0xaaf5ff,transparent:true,blending:T.AdditiveBlending,depthWrite:false});
    for(let i=0;i<28;i++){const spark=new T.Mesh(new T.SphereGeometry(.018,4,4),material);sparks.add(spark);}
    return {hide(){group.visible=false;},update(s,t,rigs){
      const tr=s.ashenTransition;group.visible=tr?.stage==='portal'||(tr?.stage==='getaway'&&tr.age>1.5)||(tr?.stage==='uppercut'&&tr.age>4.8);
      if(tr?.stage!=='uppercut'&&tr?.stage!=='getaway'&&tr){const boss=rigs.get('ashen-king');if(boss)boss.visible=false;}
      if(!group.visible)return;
      group.position.set((tr.x-500)*.055,tr.stage==='uppercut'?.08:1.8,(tr.y-300)*.055);group.rotation.x=tr.stage==='uppercut'?-Math.PI/2:0;group.scale.set(1,1.23,1);
      const opening=Math.min(1,tr.age/1.1);group.scale.multiplyScalar(Math.max(.01,opening));
      surface.material.uniforms.time.value=t;outer.rotation.z=t*.65;ring.material.opacity=.78+Math.sin(t*8)*.2;
      sparks.children.forEach((p,i)=>{const a=t*(.6+i%3*.13)+i*2.4,r=1.45+Math.sin(t*2+i)*.18;p.position.set(Math.cos(a)*r,Math.sin(a)*r,Math.sin(t+i)*.17);});
      for(const [id,p] of Object.entries(s.players)){const rig=rigs.get(id);if(rig&&p.portalEntered)rig.visible=false;}
    }};
  };
  window.drawAshenTransition=(g,s,w,h)=>{
    const tr=s.ashenTransition;if(!tr)return;
    const sample=(x,y)=>window.heroGround?.sample(1,x,y,w,h)||{x,y,height:110};
    g.save();
    if(tr.stage==='portal'){
      const a=sample(tr.x,tr.y),r=a.height*.65*Math.min(1,tr.age);
      g.translate(a.x,a.y-r);g.shadowColor='#7feaff';g.shadowBlur=25;g.fillStyle='#17112ae8';g.strokeStyle='#8feaff';g.lineWidth=5;
      g.beginPath();g.ellipse(0,0,r*.63,r,0,0,Math.PI*2);g.fill();g.stroke();
      g.strokeStyle='#c994ff';g.lineWidth=2;g.rotate(tr.age);g.beginPath();g.ellipse(0,0,r*.4,r*.7,0,0,Math.PI*2);g.stroke();
    }
    g.restore();
  };
})();
