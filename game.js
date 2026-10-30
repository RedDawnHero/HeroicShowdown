(() => {
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const screens = $$('.screen'), canvas = $('#arena'), ctx = canvas.getContext('2d');
  const W = 1000, H = 610, colors = ['#ffc857','#6ed8ed','#f68a73','#b7a2ff','#75dda8','#ff96c9','#8db5ff','#e6e39a'], battlefield = new Image();
  function makeFutureCity(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#171522');sky.addColorStop(.53,'#382632');sky.addColorStop(1,'#61464b');g.fillStyle=sky;g.fillRect(0,0,W,H);const glow=g.createRadialGradient(505,275,8,505,275,390);glow.addColorStop(0,'#d9554b44');glow.addColorStop(1,'#fff5c900');g.fillStyle=glow;g.fillRect(0,0,W,H);for(let i=0;i<0;i++){const x=(i*193)%W,y=(i*71)%260;g.fillStyle=i%5?'#93eaff88':'#fff4b977';g.fillRect(x,y,1.5,1.5);}for(let layer=0;layer<2;layer++){const base=405+layer*63,step=layer?53:39;for(let x=-20;x<W;x+=step){const seed=(x*13+layer*97+2000)%101,h=85+(seed*1.7)+(layer?0:55),w=step-5,y=base-h;g.fillStyle=layer?'#17121b':'#211924';g.fillRect(x,y,w,h);g.fillStyle=layer?'#512735':'#613746';g.fillRect(x,y,w,2);if(seed%4===0){g.fillStyle='#ff805366';g.fillRect(x+w*.45,y-22,2,22);}for(let yy=y+12;yy<base-6;yy+=13)for(let xx=x+6;xx<x+w-3;xx+=10){const v=Math.abs(Math.floor(xx*3+yy*7+seed))%6;if(v<3){g.fillStyle=v===0?'#a83e58cc':'#70435699';g.fillRect(xx,yy,3,5);}}}}g.fillStyle='#071321';g.beginPath();g.moveTo(0,462);g.lineTo(W,450);g.lineTo(W,H);g.lineTo(0,H);g.closePath();g.fill();g.strokeStyle='#8a384944';g.lineWidth=2;for(let i=0;i<14;i++){g.beginPath();g.moveTo(500,453);g.lineTo(i*85-70,H);g.stroke();}for(let y=474;y<H;y+=25){g.globalAlpha=Math.min(.65,(y-450)/180);g.beginPath();g.moveTo(0,y);g.lineTo(W,y-12);g.stroke();}g.globalAlpha=1;return c;}
  const futureCityBackground=makeFutureCity();battlefield.src=futureCityBackground.toDataURL('image/png');
  const warehouseBackground = new Image();
  warehouseBackground.src = 'assets/level-one-meteor.jpg';
  const snowStreetBackground = new Image();
  snowStreetBackground.src = 'assets/level-two-future-snow.jpg';
  const levelThreeBackground = new Image();
  levelThreeBackground.src = 'assets/level-one-meteor-impact.jpg';
  const levelFourBackground = new Image();
  levelFourBackground.src = 'assets/level-four-future-city.jpg';
  const levelFiveBackground = new Image();
  levelFiveBackground.src = 'assets/level-five-final-city.jpg';
  function drawPhotoBackground(background) {
    if (window.heroBackdrop?.draw(ctx, W, H, state?.round || 1, performance.now()/1000)) return;
    ctx.fillStyle = '#222629';
    ctx.fillRect(0, 0, W, H);
    if (!background.complete || !background.naturalWidth) return;
    const scale = Math.max(W / background.naturalWidth, H / background.naturalHeight);
    const width = background.naturalWidth * scale, height = background.naturalHeight * scale;
    ctx.drawImage(background, (W - width) / 2, (H - height) / 2, width, height);
  }
  const drawBonecaller=()=>{const c=state?.caster;if(!c||c.dead)return;ctx.save();ctx.translate(c.x,c.y);ctx.shadowColor='#ec285e';ctx.shadowBlur=17;ctx.fillStyle='#10121d';ctx.beginPath();ctx.moveTo(-23,-3);ctx.lineTo(-34,28);ctx.lineTo(0,19);ctx.lineTo(30,29);ctx.lineTo(20,-7);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#090d16';ctx.beginPath();ctx.moveTo(-21,-18);ctx.quadraticCurveTo(-18,-49,5,-47);ctx.quadraticCurveTo(32,-42,24,-8);ctx.lineTo(18,4);ctx.lineTo(-20,4);ctx.closePath();ctx.fill();ctx.fillStyle='#c48b76';ctx.beginPath();ctx.ellipse(2,-23,12,16,0,0,7);ctx.fill();ctx.fillStyle='#16131a';ctx.beginPath();ctx.moveTo(-16,-28);ctx.lineTo(0,-48);ctx.lineTo(20,-31);ctx.lineTo(14,-24);ctx.lineTo(-13,-23);ctx.fill();ctx.fillStyle='#ff496b';ctx.shadowColor='#ff224f';ctx.shadowBlur=13;ctx.fillRect(-6,-25,4,2);ctx.fillRect(5,-25,4,2);ctx.beginPath();ctx.moveTo(-25,-4);ctx.lineTo(-34,-54);ctx.lineTo(-30,-58);ctx.lineTo(-24,-6);ctx.fill();ctx.fillStyle='#ff3d64';ctx.beginPath();ctx.moveTo(-35,-52);ctx.lineTo(-34,-68);ctx.lineTo(-25,-77);ctx.lineTo(-17,-67);ctx.lineTo(-21,-51);ctx.closePath();ctx.fill();ctx.fillStyle='#ffdda0';ctx.beginPath();ctx.arc(-27,-64,4,0,7);ctx.fill();ctx.shadowBlur=0;ctx.restore();ctx.textAlign='center';ctx.font='800 9px DM Sans';ctx.fillStyle='#ff718a';ctx.fillText('THE BONECALLER',c.x,c.y-88);ctx.fillStyle='#1a1822';ctx.fillRect(c.x-22,c.y-80,44,3);ctx.fillStyle='#ef4865';ctx.fillRect(c.x-22,c.y-80,44*Math.max(0,c.hp/60),3);};
  let peer = null, room = '', isHost = false, myId = '', heroChoice = 'wildclaw', punchStart = 0, punchTimer = null, punchFired = false, links = new Map(), state = null, loop = null, keys = {}, joy = {x:0,y:0}, arenaTarget = null, runHeld = false, lastState = 0, gameClock = null, toastClock = null, actionCooldown = {}, audioCtx = null, heardBlast = false;
  function show(id){ screens.forEach(s=>s.classList.toggle('active',s.id===id)); syncLevelMusic(); syncIntroVideo(); }
  function code(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('');}
  function say(txt){const t=$('#toast');t.textContent=txt;t.classList.add('show');clearTimeout(toastClock);toastClock=setTimeout(()=>t.classList.remove('show'),1500);}
  function earnHealth(p,amount=12){if(!p)return;const before=p.hp;p.hp=Math.min(100,p.hp+amount);if(p.hp>before)say(`+${p.hp-before} HEALTH · ENEMY DEFEATED`);}
  function status(text,online=false){$('#connectionStatus').innerHTML=`<i></i> ${text}`;$('#connectionStatus').style.color=online?'#70dca6':'#ffc857';}
  function unlockAudio(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!audioCtx&&Audio)audioCtx=new Audio();if(audioCtx?.state==='suspended')audioCtx.resume();}catch{}}
  function playExplosion(){try{unlockAudio();if(!audioCtx)return;const duration=1.35,buffer=audioCtx.createBuffer(1,Math.floor(audioCtx.sampleRate*duration),audioCtx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const noise=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),noiseGain=audioCtx.createGain();noise.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(1300,audioCtx.currentTime);filter.frequency.exponentialRampToValueAtTime(90,audioCtx.currentTime+duration);noiseGain.gain.setValueAtTime(.72,audioCtx.currentTime);noiseGain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);noise.connect(filter).connect(noiseGain).connect(audioCtx.destination);noise.start();noise.stop(audioCtx.currentTime+duration);const boom=audioCtx.createOscillator(),boomGain=audioCtx.createGain();boom.type='sine';boom.frequency.setValueAtTime(105,audioCtx.currentTime);boom.frequency.exponentialRampToValueAtTime(34,audioCtx.currentTime+.7);boomGain.gain.setValueAtTime(.7,audioCtx.currentTime);boomGain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.85);boom.connect(boomGain).connect(audioCtx.destination);boom.start();boom.stop(audioCtx.currentTime+.9);}catch{}}
  document.addEventListener('pointerdown',unlockAudio,{once:true});
  const levelMusic = $('#levelOneMusic'), introMusic = $('#riseUpMusic');
  const musicToggle = $('#musicToggle'), introMusicToggle = $('#introMusicToggle');
  const musicTracks = [levelMusic, introMusic], musicButtons = [musicToggle, introMusicToggle];
  musicTracks.forEach(track => { track.volume = .45; });
  let musicMuted = false, musicBlocked = false, musicStarting = null, musicTrack = null;
  function levelMusicActive() {
    // burialDone stays true after the hammer wave is cleared, even if the mage summons again.
    return state?.phase === 'game' && state.round === 1 && !state.intro && !state.burialDone && state.hammerers?.some(h => !h.dead) && $('#game').classList.contains('active');
  }
  function desiredMusic() {
    if (window.heroOpeningIntroActive?.() || state?.ashenTransition) return null;
    if (introVideoActive()) return introMusic;
    return levelMusicActive() ? levelMusic : null;
  }
  function updateMusicButton() {
    musicButtons.forEach(button => {
      const label = button === introMusicToggle ? 'Rise Up music' : 'Level 1 music';
      button.textContent = musicBlocked && !musicMuted ? '▶ PLAY MUSIC' : musicMuted ? '♫ MUSIC OFF' : '♫ MUSIC ON';
      button.setAttribute('aria-pressed', String(!musicMuted && !musicBlocked));
      button.setAttribute('aria-label', musicBlocked && !musicMuted ? 'Play ' + label : musicMuted ? 'Turn on ' + label : 'Mute ' + label);
    });
  }
  function syncLevelMusic(fromGesture = false) {
    const nextTrack = desiredMusic();
    // Stop the outgoing song before starting the next screen's music.
    musicTracks.forEach(track => {
      if (track !== nextTrack) {
        track.pause();
        if (track.currentTime > 0) track.currentTime = 0;
      }
    });
    if (musicTrack !== nextTrack) {
      musicTrack = nextTrack;
      musicStarting = null;
      musicBlocked = false;
    }
    musicToggle.hidden = nextTrack !== levelMusic;
    introMusicToggle.hidden = nextTrack !== introMusic;
    if (fromGesture) musicBlocked = false;
    updateMusicButton();
    if (!nextTrack) return;
    if (musicMuted || document.hidden) { nextTrack.pause(); return; }
    if (!nextTrack.paused || musicStarting || musicBlocked) return;
    const attempt = nextTrack.play();
    musicStarting = attempt;
    attempt.then(() => {
      if (desiredMusic() !== nextTrack || musicMuted || document.hidden) nextTrack.pause();
      if (musicStarting === attempt) musicBlocked = false;
    }).catch(error => {
      if (musicStarting === attempt && error.name !== 'AbortError' && desiredMusic() === nextTrack) musicBlocked = true;
    }).finally(() => {
      if (musicStarting === attempt) musicStarting = null;
      updateMusicButton();
    });
  }
  musicButtons.forEach(button => button.addEventListener('click', () => {
    if (!musicBlocked || musicMuted) musicMuted = !musicMuted;
    syncLevelMusic(true);
  }));
  document.addEventListener('pointerdown', event => { if (!musicButtons.some(button => button.contains(event.target))) syncLevelMusic(true); });
  document.addEventListener('keydown', event => { if (!event.repeat && !musicButtons.some(button => button.contains(event.target))) syncLevelMusic(true); });
  document.addEventListener('visibilitychange', () => syncLevelMusic());
  window.addEventListener('pagehide', () => musicTracks.forEach(track => track.pause()));
  const introVideo = $('#riseUpVideo');
  introVideo.muted = true;
  let introVideoStarting = null, introVideoBlocked = false, introVideoWasActive = false;
  function introVideoActive() {
    return false; // The 3D opening owns startup; never play the retired intro clip.
  }
  function syncIntroVideo(fromGesture = false) {
    const active = introVideoActive();
    if (!active) {
      introVideo.pause();
      if (introVideoWasActive) introVideo.currentTime = 0;
      introVideoWasActive = false;
      introVideoBlocked = false;
      return;
    }
    introVideoWasActive = true;
    if (document.hidden) { introVideo.pause(); return; }
    if (fromGesture) introVideoBlocked = false;
    if (!introVideo.paused || introVideoStarting || introVideoBlocked) return;
    const attempt = introVideo.play();
    introVideoStarting = attempt;
    attempt.then(() => {
      if (!introVideoActive() || document.hidden) introVideo.pause();
    }).catch(error => {
      if (error.name !== 'AbortError' && introVideoActive()) introVideoBlocked = true;
    }).finally(() => {
      if (introVideoStarting === attempt) introVideoStarting = null;
    });
  }
  document.addEventListener('pointerdown', () => syncIntroVideo(true));
  document.addEventListener('keydown', event => { if (!event.repeat) syncIntroVideo(true); });
  document.addEventListener('visibilitychange', () => syncIntroVideo());
  window.addEventListener('pagehide', () => introVideo.pause());
  function clearOpeningInput() {
    keys = {}; joy = {x: 0, y: 0}; runHeld = false; arenaTarget = null;
    if (punchTimer) clearTimeout(punchTimer);
    punchTimer = null; punchFired = false;
    const me = state?.players[myId || 'host'];
    if (me) { me.fx = 0; me.fy = 0; me.run = false; }
  }
  let openingShown = false;
  function syncOpeningCinematic() {
    const watching = !!(state?.intro && state?.storyCinematic);
    const button = $('#beginFight');
    button.disabled = watching;
    button.innerHTML = watching ? 'WAITING FOR HEROES…' : 'RISE UP <span>→</span>';
    if (!watching) { openingShown = false; return; }
    if (!openingShown && !state.players[myId || 'host']?.openingDone) {
      openingShown = true;
      if (window.playHeroOpeningIntro) window.playHeroOpeningIntro();
      else openingShown = false;
    }
  }
  window.addEventListener('heroic-opening-started', () => {
    clearOpeningInput();
    syncLevelMusic(); syncIntroVideo();
  });
  window.addEventListener('heroic-opening-finished', () => {
    clearOpeningInput();
    if (state?.intro && state.storyCinematic) action('finishOpening');
    syncLevelMusic(); syncIntroVideo();
  });
  let arenaPointer=null;function targetFromPointer(e){const r=canvas.getBoundingClientRect();arenaTarget={x:Math.max(34,Math.min(W-34,(e.clientX-r.left)/r.width*W)),y:Math.max(window.heroTravelProjection?-18000:82,Math.min(H-36,(e.clientY-r.top)/r.height*H))};}canvas.addEventListener('pointerdown',e=>{if(state?.phase!=='game'||state.intro)return;arenaPointer=e.pointerId;canvas.setPointerCapture(arenaPointer);targetFromPointer(e);});canvas.addEventListener('pointermove',e=>{if(e.pointerId===arenaPointer)targetFromPointer(e);});canvas.addEventListener('pointerup',e=>{if(e.pointerId===arenaPointer)arenaPointer=null;});canvas.addEventListener('pointercancel',()=>{arenaPointer=null;});
  setInterval(()=>{if(state?.collapse?.phase==='blast'&&!heardBlast){heardBlast=true;playExplosion();say('WILDCLAW: Find a way out of the battlefield!');}},40);
  const splitStyle=document.createElement('style');splitStyle.textContent='.arena-wrap.world-splitting:after{content:"";position:absolute;inset:0;z-index:5;pointer-events:none;background:linear-gradient(105deg,transparent 48.7%,#55dfff66 49.3%,#fff 49.8%,#8e70ff 50.15%,#55dfff66 50.7%,transparent 51.3%);filter:drop-shadow(0 0 18px #72eaff);animation:riftflash .22s ease-in-out infinite alternate}@keyframes riftflash{from{opacity:.45}to{opacity:1}}';document.head.appendChild(splitStyle);
  let futureSequenceStarted=false;
  setInterval(()=>{if(!isHost||state?.phase!=='game'||state.intro||state.finale||state.ashenTransition||(state.round===2&&window.heroIceLandscapeStatus&&window.heroIceLandscapeStatus!=='ready')||state.finImpact||(state.frostIntro&&!state.frostIntro.done)||!state.caster||state.caster.dead)return;state.caster.attack-=.1;state.caster.casting=Math.max(0,(state.caster.casting||0)-.1);if(state.caster.attack>0)return;state.caster.attack=4.8;state.caster.casting=.65;const target=Object.values(state.players).sort((a,b)=>Math.hypot(a.x-state.caster.x,a.y-state.caster.y)-Math.hypot(b.x-state.caster.x,b.y-state.caster.y))[0];if(target)state.shots.push({x:state.caster.x-25,y:state.caster.y-64,target:target.id,age:0,type:'wand'});if(state.caster.summons<2){const index=state.hammerers.length;state.hammerers.push(createHammerer(330+Math.random()*340,180+Math.random()*300,1.2+index*.35,true));state.caster.summons++;say('THE BONECALLER SUMMONS ANOTHER TWIN-HAMMER BRUTE!');}broadcast();},100);
  function nearestHammerer(p){return (state?.hammerers||[]).filter(h=>!h.dead).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];}
  function createHammerer(x,y,attack,summoned=false){return {x,y,hp:45,attack,bossSmash:0,bossSmashHit:false,smashX:500,smashY:470,walking:true,dead:false,summoned};}
  function createHammerers(){return [[140,370,.8],[860,370,1.5],[275,170,2.2],[735,170,2.9],[110,220,3.6],[895,220,4.3]].map(([x,y,attack])=>createHammerer(x,y,attack));}
  function freshState(){return {phase:'lobby',round:1,time:90,danger:12,boss:180,bossMax:180,giant:false,intro:false,burialDone:false,collapse:null,clinic:{x:180,y:510,cooldown:0},caster:{x:370,y:320,hp:60,attack:4,casting:0,summons:0,dead:false},hammerers:createHammerers(),players:{host:{id:'host',name:'You',hero:heroChoice,x:500,y:470,hp:100,score:0,face:0,fx:0,fy:0,action:'',actionTime:0,dodge:0,smashHit:0,buried:false,run:false,helmet:false,jump:0,climbing:false,weaponHeld:heroChoice==='lizard'||heroChoice==='ecal',color:colors[0]}},civilians:[{x:485,y:135,saved:false},{x:812,y:408,saved:false},{x:191,y:475,saved:false}],goons:[],shots:[],bossX:700,bossY:285,bossAttack:0,bossBlock:0,roundEnded:false};}
  function setLobby(codeValue,host){room=codeValue;isHost=host;show('lobby');$('#roomCode').textContent=room;$('#playerList').innerHTML='';$('#playerCount').textContent='1 / 8';$('#startGame').disabled=true;status('CONNECTING');}
  function addLink(conn){links.set(conn.peer,conn);conn.on('data',msg=>receive(conn.peer,msg));conn.on('close',()=>{links.delete(conn.peer);if(isHost&&state){delete state.players[conn.peer];finishOpeningIfReady();lobbyPlayers();broadcast();}});conn.on('error',()=>say('A hero lost connection'));}
  function createRoom(){if(!window.Peer){say('Connection library did not load');return;}room=code();myId='host';isHost=true;setLobby(room,true);peer=new Peer('hero-city-'+room.toLowerCase());peer.on('open',()=>{status('ROOM OPEN',true);$('#startGame').disabled=true;renderPlayers();});peer.on('connection',conn=>{if(!state){} addLink(conn);});peer.on('error',e=>{status(e.type==='unavailable-id'?'ROOM CODE BUSY':'CONNECTION ISSUE');say(e.type==='unavailable-id'?'Try creating a new room':'Could not connect to room service');});state=freshState();renderPlayers();}
  function joinRoom(){const value=$('#joinCode').value.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(value)){say('Enter a 6-character room code');return;}if(!window.Peer){say('Connection library did not load');return;}room=value;myId='';isHost=false;setLobby(room,false);peer=new Peer();peer.on('open',id=>{myId=id;const c=peer.connect('hero-city-'+room.toLowerCase(),{reliable:true});addLink(c);c.on('open',()=>{c.send({type:'join',id,hero:heroChoice,name:'Hero '+String.fromCharCode(65+Math.floor(Math.random()*26))});status('CONNECTED',true);});});peer.on('error',e=>{status('ROOM NOT FOUND');say(e.type==='peer-unavailable'?'Room code not found. Check with your host.':'Unable to join room');});}
  function receive(id,msg){if(!msg||typeof msg!=='object')return;if(isHost){if(msg.type==='join'&&state&&Object.keys(state.players).length<8&&!state.players[id]){const idx=Object.keys(state.players).length,hero=['wildclaw','finnew','ecal','lizard'].includes(msg.hero)?msg.hero:'guardian';state.players[id]={id,name:'Hero '+idx,hero,x:225+Math.random()*550,y:160+Math.random()*320,hp:100,score:0,face:0,fx:0,fy:0,action:'',actionTime:0,dodge:0,helmet:false,buried:false,run:false,jump:0,climbing:false,weaponHeld:hero==='lizard'||hero==='ecal',color:colors[idx%colors.length]};lobbyPlayers();broadcast();}else if(msg.type==='input'&&state?.players[id]&&!state.ashenTransition){state.players[id].fx=msg.x;state.players[id].fy=msg.y;state.players[id].run=!!msg.run;}else if(msg.type==='action'&&state?.players[id])act(state.players[id],msg.action);}else{if(msg.type==='state'){state=msg.state;if(state?.phase==='game')enterGame(false);else if(state?.phase==='results')finishUI();else renderPlayers();}}}
  function lobbyPlayers(){renderPlayers();broadcast();}
  function renderPlayers(){const ps=state?Object.values(state.players):[{id:'host',name:'You',hero:heroChoice,color:colors[0]}];$('#playerCount').textContent=`${ps.length} / 8`;$('#playerList').innerHTML=ps.map((p,i)=>`<div class="player-chip ${p.id===myId||p.id==='host'&&isHost?'you':''}"><span class="chip-icon" style="color:${p.color}">${p.hero==='ecal'?'✧':p.hero==='lizard'?'◆':p.hero==='wildclaw'?'♢':'✦'}</span><span>${esc(p.name)} <small style="color:#8390a0">${p.hero==='ecal'?'ECAL':p.hero==='lizard'?'LIZARD WARRIOR':p.hero==='wildclaw'?'WILDCLAW':p.hero==='sentinel'?'NIGHT SENTINEL':p.hero==='finnew'?'FIN NEW':'RED DAWN'}</small> ${p.id===myId||p.id==='host'&&isHost?'<small style="color:#ffc857"> YOU</small>':''}</span></div>`).join('');$('#startGame').disabled=!(isHost&&ps.length>=1);}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function broadcast(){if(!isHost||!state)return;const packet={type:'state',state};links.forEach(c=>{if(c.open)c.send(packet);});}
  function beginGame(){if(!isHost||Object.keys(state.players).length<1)return;futureSequenceStarted=false;state.futureWorld=false;state.phase='game';state.time=300;state.round=1;state.intro=true;state.storyCinematic=true;Object.values(state.players).forEach(p=>p.openingDone=false);state.roundEnded=false;renderPlayers();enterGame(true);broadcast();}
  function enterGame(host){show('game');renderHUD();renderControls();if(host&&!loop){let previous=performance.now(),broadcastAt=0;loop=setInterval(()=>{const now=performance.now(),dt=Math.min(.05,(now-previous)/1000);previous=now;simulate(dt);if(now-broadcastAt>80){broadcastAt=now;renderHUD();}draw();if(state?.phase==='results'){clearInterval(loop);loop=null;broadcast();finishUI();}},33);}else if(!host){draw();} }
  function act(p,kind){if(!state||state.phase!=='game')return;if(state.round===2&&['loading','error'].includes(window.heroFrozenCityModelStatus))return;if(state.intro&&kind!=='continueStory')return;if(kind==='continueStory'){state.intro=false;broadcast();return;}const trapped=state.players.host;if(trapped?.buried&&p.id!=='host'&&['punch','firePunch','blast','slam','kick'].includes(kind)&&Math.hypot(p.x-trapped.x,p.y-trapped.y)<115){trapped.buried=false;state.collapse.phase='rescued';say('HERO RESCUED!');broadcast();return;}if(kind==='helmet'){p.helmet=!p.helmet;p.action='helmet';p.actionTime=.4;say(p.helmet?'HELMET ON · MASK LASER READY':'HELMET OFF');return;}if(kind==='laser'&&!p.helmet){say('Put your helmet on to fire the mask laser');return;}if(kind==='jump'){if((p.jump||0)>0)return;p.jump=.76;p.action='jump';p.actionTime=.45;return;}const now=performance.now();if(actionCooldown[p.id+kind]&&now-actionCooldown[p.id+kind]<({punch:300,firePunch:850,slam:1800,kick:700,blast:1300,laser:1700,dodge:1200}[kind]||500))return;actionCooldown[p.id+kind]=now;p.action=kind;p.actionTime=kind==='dodge'?.35:kind==='firePunch'?.55:kind==='slam'?.5:.24;if(kind==='dodge'){p.dodge=.48;return;}if(kind==='jump')return;if(kind==='slam'){for(const g of [...state.goons])if(Math.hypot(g.x-p.x,g.y-p.y)<190){state.goons=state.goons.filter(q=>q!==g);p.score+=4;earnHealth(p,10);}if(state.burialDone&&!state.players.host.buried&&Math.hypot(state.bossX-p.x,state.bossY-p.y)<230){state.boss=Math.max(0,state.boss-16);p.score+=8;}state.danger=Math.max(0,state.danger-3);return;}if(kind==='kick'){p.action='kick';p.actionTime=.38;const g=state.goons.slice().sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(g&&Math.hypot(g.x-p.x,g.y-p.y)<165){g.hp-=2;const gx=g.x-p.x,gy=g.y-p.y,gd=Math.hypot(gx,gy)||1;g.x=Math.max(34,Math.min(W-34,g.x+gx/gd*42));g.y=Math.max(window.heroTravelProjection?-18000:82,Math.min(H-36,g.y+gy/gd*42));p.score+=3;if(g.hp<=0){state.goons=state.goons.filter(q=>q!==g);earnHealth(p,10);}return;}const wc=Math.hypot(state.caster.x-p.x,state.caster.y-p.y);if(!state.caster.dead&&wc<155){state.caster.hp-=18;p.score+=4;if(state.caster.hp<=0){state.caster.hp=0;state.caster.dead=true;p.score+=10;earnHealth(p,20);say('BONECALLER DEFEATED!');}return;}const h=nearestHammerer(p),hd=h?Math.hypot(h.x-p.x,h.y-p.y):Infinity;if(h&&hd<165){h.hp-=18;p.score+=5;if(h.hp<=0){h.dead=true;earnHealth(p,15);say('TWIN HAMMERER DEFEATED!');}return;}const bd=Math.hypot(state.bossX-p.x,state.bossY-p.y);if(state.burialDone&&!state.players.host.buried&&bd<150){if(state.bossBlock>0)say('Mr. Misfit blocks!');else{state.boss=Math.max(0,state.boss-6);p.score+=3;if(state.boss<=0){state.roundEnded=true;state.roundReason='BOSS DOWN';}}}return;}const wd=Math.hypot(state.caster.x-p.x,state.caster.y-p.y);if(!state.caster.dead&&wd<(kind==='laser'?410:kind==='blast'?205:kind==='firePunch'?155:105)){state.caster.hp-=kind==='firePunch'?30:kind==='blast'?22:kind==='laser'?15:14;p.score+=4;if(state.caster.hp<=0){state.caster.hp=0;state.caster.dead=true;p.score+=10;earnHealth(p,20);say('BONECALLER DEFEATED!');}else say('WAND MAGE HIT!');return;}const h=nearestHammerer(p),hd=h?Math.hypot(h.x-p.x,h.y-p.y):Infinity;if(h&&hd<(kind==='laser'?410:kind==='blast'?205:kind==='firePunch'?155:105)){h.hp-=kind==='firePunch'?18:kind==='blast'?10:kind==='laser'?8:3;p.score+=4;if(kind==='firePunch')p.fireTime=1.1;if(h.hp<=0){h.dead=true;earnHealth(p,15);say('TWIN HAMMERER DEFEATED!');}return;}const dx=state.bossX-p.x,dy=state.bossY-p.y,dist=Math.hypot(dx,dy);let damage=kind==='punch'?3:kind==='firePunch'?18:kind==='blast'?9:kind==='laser'?7:0;let hits=state.burialDone&&!state.players.host.buried&&dist<(kind==='laser'?410:kind==='blast'?205:kind==='firePunch'?155:105);let protectedBoss=state.bossBlock>0&&kind==='punch'&&dist<120;if(hits&&!protectedBoss){state.boss=Math.max(0,state.boss-damage);p.score+=kind==='laser'?5:kind==='blast'?5:kind==='firePunch'?8:3;if(kind==='firePunch')p.fireTime=1.1;if(state.boss<36)state.giant=true;if(state.boss<=0&&!state.roundEnded){p.score+=12;earnHealth(p,25);state.roundEnded=true;state.roundReason='BOSS DOWN';}}else if(protectedBoss){say('Mr. Misfit blocks! Dodge around him');}else if(['punch','firePunch','blast'].includes(kind)){let g=state.goons.find(g=>Math.hypot(g.x-p.x,g.y-p.y)<(kind==='firePunch'?175:145));if(g){g.hp-=kind==='firePunch'?3:kind==='blast'?2:1;p.score+=2;if(g.hp<=0){state.goons=state.goons.filter(x=>x!==g);earnHealth(p,10);}if(kind==='firePunch')p.fireTime=1.1;}}}
  function simulate(dt){if(!state||state.phase!=='game'||state.intro)return;
    // Do not start the frozen-city battle timer or enemies until the actual 3D scene is ready.
    if(state.round===2&&['loading','error'].includes(window.heroFrozenCityModelStatus))return;
    state.time-=dt;if(state.time<=0){state.time=0;state.roundEnded=true;state.roundReason='TIME UP';}if(state.clinic)state.clinic.cooldown=Math.max(0,state.clinic.cooldown-dt);for(const p of Object.values(state.players)){if(p.buried)continue;const blend=1-Math.exp(-dt*9);p.walkX=(p.walkX||0)+((p.fx||0)-(p.walkX||0))*blend;p.walkY=(p.walkY||0)+((p.fy||0)-(p.walkY||0))*blend;let x=p.walkX,y=p.walkY,n=Math.max(1,Math.hypot(x,y)),speed=p.dodge>0?440:(205+110*(p.runBlend||0));if(p.hero==='wildclaw'&&p.climbActive&&canClimbAt(p)){p.climbing=true;p.x=Math.max(34,Math.min(W-34,p.x+x/n*speed*dt));p.climbHeight=Math.max(0,Math.min(110,(p.climbHeight||0)-y*speed*dt));if(p.climbHeight===0&&y>0){p.climbing=false;p.climbActive=false;}}else{if(p.climbActive&&!canClimbAt(p))p.climbActive=false;p.climbing=false;p.climbHeight=0;p.x=Math.max(34,Math.min(W-34,p.x+x/n*speed*dt));p.y=Math.max(window.heroTravelProjection?-18000:82,Math.min((state.round===2&&Number.isFinite(window.heroIceTerrain?.bounds?.maxY))?window.heroIceTerrain.bounds.maxY:H-36,p.y+y/n*speed*dt));}if(p.dodge>0)p.dodge-=dt;if(p.jump>0)p.jump=Math.max(0,p.jump-dt);if(p.fireTime>0)p.fireTime-=dt;if(p.actionTime>0)p.actionTime-=dt;if(p.smashHit>0)p.smashHit=Math.max(0,p.smashHit-dt);if(!p.climbActive)p.climbing=false;if(state.clinic&&state.clinic.cooldown<=0&&p.hp<100&&Math.hypot(p.x-state.clinic.x,p.y-state.clinic.y)<58){const recovered=Math.min(35,100-p.hp);p.hp+=recovered;state.clinic.cooldown=22;say(`FIELD CLINIC · +${recovered} HEALTH`);}}
    if(state.round===5){window.darkBossCombat.update(state,dt,say);}else{
    window.misfitCombat.update(state,dt,say);
    }
    for(const h of state.hammerers||[]){if(h.dead)continue;const wasSmash=h.bossSmash||0;h.attack-=dt;h.bossSmash=Math.max(0,wasSmash-dt);const target=Object.values(state.players).sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];if(!target)continue;const dx=target.x-h.x,dy=target.y-h.y,distance=Math.hypot(dx,dy)||1;h.walking=distance>78&&h.bossSmash<=0;if(h.walking){h.x+=dx/distance*34*dt;h.y+=dy/distance*34*dt;}if(h.attack<=0&&distance<310&&h.bossSmash<=0){h.attack=3.7;h.bossSmash=1.1;h.bossSmashHit=false;h.smashX=target.x;h.smashY=target.y;say('TWIN HAMMERER WINDING UP! DODGE OR JUMP!');}if(wasSmash>0&&!h.bossSmashHit&&wasSmash>.28&&h.bossSmash<=.28){h.bossSmashHit=true;let hit=false;for(const p of Object.values(state.players)){if(Math.hypot(p.x-h.smashX,p.y-h.smashY)>125||p.dodge>0||p.jump>.26)continue;p.smashHit=.7;p.smashSide=p.x<h.x?-1:1;if(p.blocking){p.hp=Math.max(0,p.hp-7);say('BLOCKED MOST OF THE TWIN HAMMER SMASH!');}else{p.hp=Math.max(0,p.hp-22);state.danger+=7;say('TWIN HAMMER SMASH! YOU WERE HIT!');}const px=p.x-h.x,py=p.y-h.y,pd=Math.hypot(px,py)||1;p.x=Math.max(34,Math.min(W-34,p.x+px/pd*30));p.y=Math.max(window.heroTravelProjection?-18000:82,Math.min(H-36,p.y+py/pd*30));hit=true;}if(!hit)say('THE TWIN HAMMERS CRASH INTO THE GROUND!');}}
    for(const c of state.civilians){if(c.saved)continue;for(const p of Object.values(state.players)){if(Math.hypot(c.x-p.x,c.y-p.y)<38){c.saved=true;p.score+=2;state.danger=Math.max(0,state.danger-10);say('Civilian rescued  +2');break;}}}for(const g of state.goons){const target=Object.values(state.players).sort((a,b)=>Math.hypot(a.x-g.x,a.y-g.y)-Math.hypot(b.x-g.x,b.y-g.y))[0];if(!target)continue;const dx=target.x-g.x,dy=target.y-g.y,dist=Math.hypot(dx,dy)||1;if(dist>35){g.x+=dx/dist*48*dt;g.y+=dy/dist*48*dt;}g.attack-=dt;if(dist<40&&g.attack<=0&&target.dodge<=0&&target.jump<.26){target.hp=Math.max(0,target.hp-7);state.danger+=2;g.attack=1.5;say('A TWIN-HAMMER BRUTE STRIKES!');}}if(state.round===1&&!state.burialDone&&state.hammerers.every(h=>h.dead)){state.burialDone=true;syncLevelMusic();const hero=state.players.host;hero.buried=false;state.collapse={phase:'blast',age:0,x:hero.x,y:hero.y};say('A HUGE EXPLOSION! Keep moving!');}if(state.collapse){state.collapse.age+=dt;if(state.collapse.phase==='blast'&&state.collapse.age>.8){state.collapse.phase='escaped';say('Keep clear of the falling debris!');}if(state.players.host.buried&&state.collapse.age>8){state.players.host.buried=false;state.collapse.phase='escaped';say('The Red Dawn pulls free!');}}
    state.shots=state.shots.filter(s=>{s.age+=dt;let p=state.players[s.target];if(!p||s.age>(s.type==='dark'?2:1.25))return false;s.x+=(p.x-s.x)*Math.min(1,dt*2.4);s.y+=(p.y-s.y)*Math.min(1,dt*2.4);if(Math.hypot(s.x-p.x,s.y-p.y)<20){if(p.blocking&&s.type==='wand'){p.action='block';p.actionTime=.22;playCombatSound('block');say('WAND BLAST BLOCKED!');}else if(p.dodge<=0&&p.jump<.26){p.hp=Math.max(0,p.hp-((s.type==='dark'||s.type==='misfit')?(p.blocking?8:s.damage||23):s.type==='wand'?14:state.giant?24:15));state.danger+=s.type==='wand'?6:state.giant?8:4;if(s.type==='wand')say('THE BONECALLER BLASTS YOU!');}return false;}return true;});if(Math.random()<dt*.15){state.danger+=state.giant?1.4:.6;}if(state.giant&&Math.random()<dt*.7){say('GIANT SMASH! City danger rising');}
    if(state.danger>=100){state.danger=100;state.roundEnded=true;state.roundReason='CITY OVERWHELMED';}if(state.roundEnded)advanceLevel();}
  function advanceLevel(){if(state.round>=4){state.phase="results";state.roundEnded=true;return;}state.round++;if(state.round===2){window.heroFrozenCityModelStatus='loading';window.heroIceLandscapeStatus='loading';window.prepareFrozenCity?.();}if(state.round>4||state.roundReason==='CITY OVERWHELMED'||state.roundReason==='TIME UP'){state.phase='results';}else{const cleared=state.round-1,levelNames=['','FALLEN CITADEL','FROZEN FUTURE','HOME VILLAGE','SHATTERED FUTURE','DARK WARRIOR THRONE'];state.time=300+Math.min(60,(state.round-1)*10);state.danger=12;state.bossMax=state.round===5?420:180;state.boss=state.bossMax;if(state.round===5)state.burialDone=true;state.darkStrike=null;state.darkEnraged=false;state.darkRageAnnounced=false;state.darkAttackTurn=0;state.finale=null;state.giant=false;state.roundEnded=false;state.roundReason='';state.bossBlock=0;state.bossAttack=1.5;state.bossX=700;state.bossY=285;state.hammerers=createHammerers();for(const h of state.hammerers)h.hp+=Math.max(0,state.round-1)*8;state.caster={x:370,y:320,hp:60+state.round*10,attack:3.5,casting:0,summons:0,dead:false};state.goons=[];state.shots=[];state.collapse=null;state.players.host.buried=false;for(const p of Object.values(state.players)){p.hp=Math.max(50,p.hp);p.fx=0;p.fy=0;p.action='';p.actionTime=0;}state.civilians=[{x:485,y:135,saved:false},{x:812,y:408,saved:false},{x:191,y:475,saved:false}];say('ROUND '+cleared+' CLEAR! LEVEL '+state.round+' · '+levelNames[state.round]);}}

  let controlHero='';function renderControls(){const me=state?.players[myId==='host'?'host':myId],hero=me?.hero||'guardian';if(controlHero===hero)return;controlHero=hero;const specs=hero==='wildclaw'?[['punch','✊','PUNCH / FIRE'],['kick','🦶','KICK'],['jump','↑','HIGH JUMP'],['slam','✹','GROUND SLAM'],['run','🏃','RUN · HOLD'],['dodge','➜','DODGE']]:hero==='sentinel'||hero==='finnew'?[['punch','✊','PUNCH'],['kick','🦶','KICK'],...(hero==='finnew'?[['jump','⬆','JUMP']]:[]),['run','🏃','RUN · HOLD'],['dodge','➜','DODGE']]:[['punch','✊','PUNCH'],['kick','🦶','KICK'],['jump','⬆','JUMP'],['blast','✴','GOLD BLAST'],['helmet','⛑','PUT ON MASK'],['laser','⌁','MASK LASER'],['run','🏃','RUN · HOLD'],['dodge','➜','DODGE']];$('#abilityGrid').innerHTML=specs.map(([a,icon,label])=>`<button class="ability ${a}" data-action="${a}"><span>${icon}</span><small>${label}</small></button>`).join('');$('#abilityGrid').classList.toggle('wildclaw',hero==='wildclaw');$('#gameTip').innerHTML=hero==='sentinel'||hero==='finnew'?'MOVE PAD FOR ALL DIRECTIONS <span>·</span> HOLD RUN TO SPRINT <span>·</span> SPACE PUNCH <span>·</span> SHIFT DODGE':hero==='wildclaw'?'MOVE PAD FOR ALL DIRECTIONS <span>·</span> HOLD RUN TO SPRINT <span>·</span> SPACE PUNCH / HOLD FOR FIRE FIST <span>·</span> E JUMP <span>·</span> R GROUND SLAM <span>·</span> SHIFT DODGE <span>·</span> C CLIMB <span>·</span> MOVE UP TO SCALE A WALL':'MOVE PAD FOR ALL DIRECTIONS <span>·</span> HOLD RUN TO SPRINT <span>·</span> SPACE PUNCH <span>·</span> E BLAST <span>·</span> R PUT ON MASK <span>·</span> Q LASER <span>·</span> SHIFT DODGE';}
  function action(kind){if(!state||state.phase!=='game')return;if(kind==='laser'&&!state.players[myId==='host'?'host':myId]?.helmet){say('Put your helmet on to fire the mask laser');return;}if(isHost)act(state.players.host,kind);else{const c=[...links.values()][0];if(c?.open)c.send({type:'action',action:kind});}const b=$(`[data-action="${kind}"]`);b?.classList.add('pressed');setTimeout(()=>b?.classList.remove('pressed'),120);}
  function punchDown(){const me=state?.players[myId==='host'?'host':myId];if(me?.hero==='ecal'){action('ecalBlast');return;}if(me?.hero==='lizard'){action('swordSlice');return;}if(me?.hero!=='wildclaw'){action('punch');return;}if(punchTimer)return;punchFired=false;punchStart=Date.now();punchTimer=setTimeout(()=>{punchFired=true;action('firePunch');},470);}
  function punchUp(){if(!punchTimer)return;clearTimeout(punchTimer);punchTimer=null;if(!punchFired)action('punch');}
  function move(x,y,run=false){if(!state||state.phase!=='game')return;if(isHost){state.players.host.fx=x;state.players.host.fy=y;state.players.host.run=run||!!state.players.host.flying;}else{const c=[...links.values()][0],me=state.players[myId];if(c?.open)c.send({type:'input',x,y,run:run||!!me?.flying});}}
  function renderHUD(){if(!state)return;syncOpeningCinematic();syncLevelMusic();syncIntroVideo();$('#game').classList.toggle('story-intro',!!state.intro);$('#roundLabel').textContent=`ROUND ${Math.min(state.round,4)} / 4`;$('#bossHealth').style.width=Math.max(0,Math.min(100,state.boss/(state.bossMax||100)*100))+'%';$('#bossPhase').textContent=state.players.host.buried?'GUARDIAN BURIED':state.giant?'GIANT RAMPAGE':state.bossBlock>0?'BLOCKING':state.burialDone?'ARMORED':'BONECALLER & BRUTES';$('#timer').textContent=`${String(Math.floor(state.time/60)).padStart(2,'0')}:${String(Math.floor(state.time%60)).padStart(2,'0')}`;$('#storyPanel').hidden=!state.intro;$('#wandBossTag').hidden=!state.caster||state.caster.dead;$('#scores').innerHTML=Object.values(state.players).sort((a,b)=>b.score-a.score).map(p=>`<div class="score-chip"><span class="score-avatar" style="color:${p.color}">${p.hero==='ecal'?'✧':p.hero==='lizard'?'◆':p.hero==='wildclaw'?'♢':'✦'}</span><span>${esc(p.id===myId||p.id==='host'&&isHost?'YOU':p.name)}</span><span class="score-num">${p.score}</span></div>`).join('');const me=state.players[myId==='host'?'host':myId];$('[data-action="helmet"]')?.classList.toggle('is-on',!!me?.helmet);renderControls();}
  function draw(){if(!state)return;ctx.clearRect(0,0,W,H);if(battlefield.complete&&battlefield.naturalWidth){const scale=Math.max(W/battlefield.naturalWidth,H/battlefield.naturalHeight),w=battlefield.naturalWidth*scale,h=battlefield.naturalHeight*scale;ctx.drawImage(battlefield,(W-w)/2,(H-h)/2,w,h);ctx.fillStyle='#10192788';ctx.fillRect(0,0,W,H);}else{const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#152436');bg.addColorStop(1,'#101822');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);}drawCity();drawClinic();ctx.strokeStyle='#6fd7ed1b';ctx.lineWidth=1;for(let x=30;x<W;x+=45){ctx.beginPath();ctx.moveTo(x,55);ctx.lineTo(x,H);ctx.stroke();}for(let y=80;y<H;y+=45){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    state.civilians.forEach(c=>{if(c.saved)return;ctx.fillStyle='#9cf2cf';ctx.beginPath();ctx.arc(c.x,c.y,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#17392f';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('+',c.x,c.y+5);});
    state.goons.forEach(drawSkeleton);drawBonecaller();
    drawBoss();for(const s of state.shots){ctx.fillStyle=s.type==='wand'?'#ff4a72':'#ff7c48';ctx.shadowBlur=18;ctx.shadowColor=s.type==='wand'?'#ff265c':'#ff562b';ctx.beginPath();ctx.arc(s.x,s.y,s.type==='wand'?12:10,0,7);ctx.fill();ctx.shadowBlur=0;}
    Object.values(state.players).forEach(p=>drawHero(p));drawCollapse();if(arenaTarget){ctx.save();ctx.strokeStyle='#ffe19a';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(arenaTarget.x,arenaTarget.y,14,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(arenaTarget.x-5,arenaTarget.y);ctx.lineTo(arenaTarget.x+5,arenaTarget.y);ctx.moveTo(arenaTarget.x,arenaTarget.y-5);ctx.lineTo(arenaTarget.x,arenaTarget.y+5);ctx.stroke();ctx.restore();}ctx.fillStyle='#e8bf63';ctx.font='700 9px DM Sans';ctx.textAlign='left';ctx.fillText('ASHEN DISTRICT  ·  CIVILIANS SAFE: '+state.civilians.filter(c=>c.saved).length+' / 3',18,H-14);}
  function drawCity(){const buildings=[[18,225,95,115],[130,160,95,180],[856,175,120,155],[828,367,153,133],[320,60,85,57],[615,70,93,45]];buildings.forEach(([x,y,w,h],i)=>{ctx.fillStyle=i%2?'#1c2937':'#202c38';ctx.fillRect(x,y,w,h);ctx.fillStyle='#344454';ctx.fillRect(x,y,w,5);for(let xx=x+13;xx<x+w-7;xx+=21)for(let yy=y+16;yy<y+h-10;yy+=22){ctx.fillStyle=(Math.floor((xx+yy)/3)%4===0)?'#e9b65055':'#69c6d844';ctx.fillRect(xx,yy,7,9);}if(state.giant){ctx.strokeStyle='#ff795b99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+w*.54,y+9);ctx.lineTo(x+w*.47,y+h*.45);ctx.lineTo(x+w*.62,y+h*.7);ctx.lineTo(x+w*.51,y+h-5);ctx.stroke();ctx.fillStyle='#ff795b66';ctx.fillRect(x-5,y+h-3,w+10,5);}});if(state.giant){ctx.fillStyle='#ff8b6455';ctx.font='900 32px Barlow Condensed';ctx.textAlign='center';ctx.fillText('RUMBLE · BUILDINGS UNDER ATTACK',500,72);}}
  function drawClinic(){const c=state.clinic;if(!c||state.round!==1)return;const ready=c.cooldown<=0;ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(0,13,42,12,0,0,7);ctx.fill();ctx.fillStyle=ready?'#183b3b':'#242b31';ctx.strokeStyle=ready?'#63f0cc':'#71808a';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-36,-27,72,40,7);ctx.fill();ctx.stroke();ctx.fillStyle=ready?'#edfff9':'#c0c9cb';ctx.fillRect(-4,-19,8,23);ctx.fillRect(-15,-8,30,8);ctx.font='900 10px DM Sans';ctx.textAlign='center';ctx.fillStyle=ready?'#a5ffe4':'#a4afb2';ctx.fillText(ready?'LEVEL 1 · FIELD CLINIC':'CLINIC RECHARGING',0,-34);ctx.restore();}
  function drawSkeleton(g){const t=performance.now()/170,step=Math.sin(t+g.x)*4;ctx.save();ctx.translate(g.x,g.y);ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(0,17,19,7,0,0,7);ctx.fill();ctx.strokeStyle='#d9d1bb';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-9,4);ctx.lineTo(-17,13+step);ctx.lineTo(-20,22+step);ctx.moveTo(9,4);ctx.lineTo(17,13-step);ctx.lineTo(20,22-step);ctx.moveTo(-8,-2);ctx.lineTo(-17,-5-step);ctx.lineTo(-23,-12-step);ctx.moveTo(8,-2);ctx.lineTo(17,-5+step);ctx.lineTo(23,-12+step);ctx.stroke();ctx.fillStyle='#e2dac2';ctx.beginPath();ctx.ellipse(0,-12,14,16,0,0,7);ctx.fill();ctx.fillStyle='#26313a';ctx.beginPath();ctx.ellipse(-5,-12,3.5,5,0,0,7);ctx.ellipse(5,-12,3.5,5,0,0,7);ctx.fill();ctx.fillStyle='#ff664c';ctx.shadowColor='#ff4538';ctx.shadowBlur=7;ctx.fillRect(-7,-14,3,2);ctx.fillRect(4,-14,3,2);ctx.shadowBlur=0;ctx.fillStyle='#e2dac2';ctx.fillRect(-7,-3,14,3);ctx.strokeStyle='#e2dac2';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(0,12);for(let y=1;y<=9;y+=4){ctx.beginPath();ctx.ellipse(0,y,11,3,0,0,Math.PI);ctx.stroke();}ctx.stroke();ctx.fillRect(-2,11,4,4);ctx.fillStyle='#161f28';ctx.fillRect(-11,20,22,3);ctx.fillStyle='#ff725f';ctx.fillRect(-11,20,22*Math.max(0,g.hp/3),3);ctx.restore();}
  function drawBoss(){const x=state.bossX,y=state.bossY,giant=state.giant,scale=giant?1.8:1;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.shadowColor='#fa683a';ctx.shadowBlur=state.giant?30:14;ctx.fillStyle='#1b2729';ctx.beginPath();ctx.ellipse(0,5,38,48,0,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#405044';ctx.beginPath();ctx.arc(0,-25,23,0,7);ctx.fill();ctx.fillStyle='#ff5038';ctx.shadowColor='#ff381d';ctx.shadowBlur=10;ctx.fillRect(-13,-29,8,4);ctx.fillRect(5,-29,8,4);ctx.shadowBlur=0;ctx.fillStyle='#597060';ctx.beginPath();ctx.moveTo(-26,-7);ctx.lineTo(-48,2);ctx.lineTo(-39,17);ctx.lineTo(-23,9);ctx.fill();ctx.fillStyle='#cf602a';ctx.shadowColor='#ff712e';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#ff9a39';ctx.beginPath();ctx.arc(37,13,14,0,7);ctx.fill();ctx.fillStyle='#fff5be';ctx.beginPath();ctx.arc(37,13,6,0,7);ctx.fill();ctx.restore();ctx.textAlign='center';ctx.font='800 10px DM Sans';ctx.fillStyle='#ff9679';ctx.fillText(state.round>=5?'DARK ARMORED WARRIOR':state.giant?'GIANT MR. MISFIT':'MR. MISFIT',x,y-(giant?82:60));if(state.bossBlock>0){ctx.strokeStyle='#8dddf4';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,53,0,7);ctx.stroke();}}
  function drawHero(p){const lift=p.hero==='wildclaw'&&p.jump>0?Math.sin((.76-p.jump)/.76*Math.PI)*58:0,py=p.y-lift;ctx.save();ctx.translate(p.x,py);ctx.globalAlpha=p.dodge>0?.55:1;ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,17+lift,21,8,0,0,7);ctx.fill();ctx.fillStyle=p.hero==='wildclaw'?'#2483c7':p.color;ctx.beginPath();ctx.moveTo(-12,-4);ctx.lineTo(-24,18);ctx.lineTo(0,11);ctx.lineTo(15,19);ctx.lineTo(12,-4);ctx.fill();ctx.fillStyle='#10202c';ctx.beginPath();ctx.ellipse(0,1,16,22,0,0,7);ctx.fill();if(p.hero==='wildclaw'){ctx.fillStyle='#45a8e6';ctx.beginPath();ctx.ellipse(0,-2,12,16,0,0,7);ctx.fill();ctx.fillStyle='#122333';for(const sx of [-8,0,8]){ctx.beginPath();ctx.moveTo(sx-2,-12);ctx.lineTo(sx+2,-2);ctx.lineTo(sx-1,7);ctx.lineTo(sx-5,-2);ctx.fill();}}ctx.fillStyle=p.hero==='wildclaw'?'#f0ead2':p.color;ctx.beginPath();ctx.arc(0,-24,12,0,7);ctx.fill();if(p.hero==='wildclaw'){ctx.fillStyle='#ded6c1';ctx.beginPath();ctx.moveTo(-9,-31);ctx.lineTo(-14,-43);ctx.lineTo(-3,-35);ctx.moveTo(9,-31);ctx.lineTo(14,-43);ctx.lineTo(3,-35);ctx.fill();ctx.fillStyle='#14212b';for(const sx of [-6,0,6]){ctx.beginPath();ctx.moveTo(sx-3,-33);ctx.lineTo(sx,-21);ctx.lineTo(sx+3,-33);ctx.fill();}ctx.fillStyle='#7af1bd';ctx.fillRect(-8,-26,5,2);ctx.fillRect(3,-26,5,2);}else{ctx.fillStyle='#69daf2';ctx.fillRect(-8,-27,5,2);ctx.fillRect(3,-27,5,2);}if(p.helmet){ctx.strokeStyle='#d7aa58';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-25,13,Math.PI,0);ctx.stroke();ctx.fillStyle='#6de6fa';ctx.fillRect(-8,-28,5,3);ctx.fillRect(3,-28,5,3);}ctx.fillStyle=p.fireTime>0?'#ff8741':'#ffc857';ctx.shadowColor=p.fireTime>0?'#ff542e':'transparent';ctx.shadowBlur=p.fireTime>0?18:0;ctx.beginPath();ctx.arc(15,3,7,0,7);ctx.fill();ctx.shadowBlur=0;if(p.fireTime>0){ctx.fillStyle='#ffe36e';ctx.beginPath();ctx.arc(15,3,3,0,7);ctx.fill();}ctx.globalAlpha=1;ctx.restore();if(p.climbing){ctx.strokeStyle='#69e0ef';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,py,25,0,7);ctx.stroke();}if(p.actionTime>0&&p.action==='laser'){ctx.save();ctx.strokeStyle='#73eaff';ctx.lineWidth=4;ctx.shadowColor='#54e6ff';ctx.shadowBlur=22;ctx.beginPath();ctx.moveTo(p.x,py-22);ctx.lineTo(state.bossX,state.bossY);ctx.stroke();ctx.restore();}ctx.textAlign='center';ctx.font='700 9px DM Sans';ctx.fillStyle='#eaf2fa';ctx.fillText(p.id===myId||p.id==='host'&&isHost?'YOU':p.name,p.x,py-42);if(p.actionTime>0){ctx.strokeStyle=p.action==='laser'?'#68e8ff':p.action==='blast'?'#ffd35c':p.action==='slam'?'#ff865f':'#fcf3df';ctx.lineWidth=p.action==='blast'||p.action==='slam'?5:3;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=15;ctx.beginPath();ctx.arc(p.x,p.y,35+(0.55-p.actionTime)*190,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}if(p.hp<100){ctx.fillStyle='#fff3';ctx.fillRect(p.x-17,py-36,34,3);ctx.fillStyle='#ff6e5b';ctx.fillRect(p.x-17,py-36,34*p.hp/100,3);}}
  function drawCollapse(){if(!state.collapse)return;const c=state.collapse,p=state.players.host;if(c.phase==="blast"){ctx.save();ctx.globalAlpha=Math.max(0,1-c.age/.8);ctx.strokeStyle="#ffe5a0";ctx.lineWidth=24;ctx.shadowColor="#ff7b38";ctx.shadowBlur=40;ctx.beginPath();ctx.arc(c.x,c.y,32+c.age*320,0,Math.PI*2);ctx.stroke();ctx.restore();}if(p.buried){ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle="#181b1dee";ctx.beginPath();ctx.ellipse(0,12,62,25,0,0,7);ctx.fill();for(let i=0;i<3;i++){const x=(i-1)*25,y=-4+(i%2)*10;ctx.fillStyle="#ddd5bd";ctx.beginPath();ctx.arc(x,y-10,9,0,7);ctx.fill();ctx.fillStyle="#273039";ctx.beginPath();ctx.arc(x-3,y-11,2,0,7);ctx.arc(x+3,y-11,2,0,7);ctx.fill();ctx.strokeStyle="#ddd5bd";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-18,y+3);ctx.lineTo(x+18,y+9);ctx.moveTo(x,y);ctx.lineTo(x-8,y+18);ctx.moveTo(x,y);ctx.lineTo(x+9,y+18);ctx.stroke();}ctx.strokeStyle="#9d8765";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,12,48,18,0,0,7);ctx.stroke();ctx.textAlign="center";ctx.font="800 11px DM Sans";ctx.fillStyle="#ffd27a";ctx.fillText("TRAPPED IN THE QUICKSAND",0,-42);ctx.font="700 8px DM Sans";ctx.fillStyle="#f0e8dc";ctx.fillText("ALLY: PUNCH NEAR THE SKELETON PILE TO RESCUE",0,53);ctx.restore();}}function finishUI(){if(!state||state.phase!=='results')return;const ordered=Object.values(state.players).sort((a,b)=>b.score-a.score);const winner=ordered[0];$('#resultTitle').textContent=state.roundReason==='CITY OVERWHELMED'?'CITY OVERWHELMED':'CITY SAVED!';$('#resultCopy').textContent=state.roundReason==='CITY OVERWHELMED'?'Mr. Misfit overwhelmed the city. The heroes regroup and train for next time.':`${winner?.name||'The heroes'} led the rescue. The city is safe—for now.`;$('#finalScores').innerHTML=ordered.map((p,i)=>`<div class="final-score"><span>${i===0?'✦ ':''}${esc(p.id===myId||p.id==='host'&&isHost?'YOU':p.name)}</span><strong>${p.score} PTS</strong></div>`).join('');show('results');}
  function reset(){window.updateFinalWhiteout?.(null);window.heroAshenMovie?.sync(null,false);heardBlast=false;if(loop)clearInterval(loop);loop=null;if(peer){peer.destroy();peer=null;}links.clear();state=null;isHost=false;myId='';show('home');}
  $('#createRoom').onclick=createRoom;$('#joinRoom').onclick=joinRoom;$('#joinCode').addEventListener('input',e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6));$('#startGame').onclick=beginGame;$('#beginFight').onclick=()=>{action('continueStory');syncLevelMusic(true);syncIntroVideo();};$('#backHome').onclick=reset;$('#playAgain').onclick=reset;$('#copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(room);say('ROOM CODE COPIED');}catch{say('ROOM CODE: '+room);}};
  function selectHero(choice){if(!['guardian','wildclaw','finnew','ecal','lizard'].includes(choice))choice='guardian';heroChoice=choice;try{localStorage.setItem('heroicShowdownHero',heroChoice);}catch{}$$('[data-hero]').forEach(x=>x.classList.toggle('selected',x.dataset.hero===heroChoice));$('.hero-art').src=heroChoice==='ecal'?'assets/ecal-character.png':heroChoice==='lizard'?'assets/lizard-sword-reference.jpg':heroChoice==='wildclaw'?'assets/wildclaw-reference.jpg':heroChoice==='sentinel'?'assets/night-sentinel-reference.png':heroChoice==='finnew'?'assets/fin-new-reference.jpg':'assets/hero-reference.jpg';$('.hero-art').classList.toggle('sentinel',heroChoice==='sentinel');$('.hero-art').classList.toggle('finnew',heroChoice==='finnew');$('.hero-art').classList.toggle('lizard',heroChoice==='lizard');$('.hero-art').classList.toggle('ecal',heroChoice==='ecal');$('.hero-art').alt=heroChoice==='ecal'?'Ecal, green feline hero in orange armor with twin cyan blasters':'Selected hero';$('.label-hero b').textContent=heroChoice==='ecal'?'ECAL':heroChoice==='lizard'?'LIZARD WARRIOR':heroChoice==='wildclaw'?'WILDCLAW':heroChoice==='sentinel'?'NIGHT SENTINEL':heroChoice==='finnew'?'FIN NEW':'THE RED DAWN';}
  $$('[data-hero]').forEach(b=>b.addEventListener('click',()=>selectHero(b.dataset.hero)));selectHero(heroChoice);
  $('#abilityGrid').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-action]');if(!b)return;e.preventDefault();b.dataset.action==='punch'?punchDown():b.dataset.action==='run'?(runHeld=true):action(b.dataset.action);});$('#abilityGrid').addEventListener('pointerup',e=>{if(e.target.closest('[data-action="punch"]'))punchUp();if(e.target.closest('[data-action="run"]'))runHeld=false;});window.addEventListener('pointerup',()=>{punchUp();runHeld=false;});
  window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key.toLowerCase()]=true;if(e.repeat)return;if(e.code==='Space')punchDown();const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;if(e.key.toLowerCase()==='e'&&hero==='wildclaw')action('jump');if(e.key.toLowerCase()==='e'&&hero==='guardian')action('blast');if(e.key.toLowerCase()==='j')action('jump');if(e.key.toLowerCase()==='q'&&hero==='guardian')action('laser');if(e.key.toLowerCase()==='r'&&hero==='wildclaw')action('slam');if(e.key.toLowerCase()==='r'&&hero==='guardian')action('helmet');if(e.key==='Shift')action('dodge');if(e.key==='Control')runHeld=true;});window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.code==='Space')punchUp();if(e.key==='Control')runHeld=false;});setInterval(()=>{let x=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,y=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup||keys.m?1:0)+joy.y,n=Math.hypot(x,y);if(n>1){x/=n;y/=n;}const me=state?.players[myId==='host'?'host':myId];if(x||y)arenaTarget=null;else if(arenaTarget&&me){if(state.round===2&&window.heroIceTerrain){const steer=window.heroIceTerrain.direction(me,arenaTarget);if(steer.done)arenaTarget=null;else{x=steer.x;y=steer.y;}}else{const dx=arenaTarget.x-me.x,dy=arenaTarget.y-me.y,d=Math.hypot(dx,dy)||1;if(d<18)arenaTarget=null;else{x=dx/d;y=dy/d;}}}if(state?.phase==='game')move(x,y,runHeld||keys.control);},45);
  const movePad=$('#movePad'),heldDirections=new Map();function refreshMovePad(){joy.x=(Array.from(heldDirections.values()).includes('right')?1:0)-(Array.from(heldDirections.values()).includes('left')?1:0);joy.y=(Array.from(heldDirections.values()).includes('down')?1:0)-(Array.from(heldDirections.values()).includes('up')?1:0);movePad.querySelectorAll('[data-dir]').forEach(b=>b.classList.toggle('pressed',Array.from(heldDirections.values()).includes(b.dataset.dir)));}movePad.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-dir]');if(!b)return;e.preventDefault();movePad.setPointerCapture(e.pointerId);heldDirections.set(e.pointerId,b.dataset.dir);refreshMovePad();});movePad.addEventListener('pointermove',e=>{if(!heldDirections.has(e.pointerId))return;const under=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-dir]');if(under&&movePad.contains(under)){heldDirections.set(e.pointerId,under.dataset.dir);refreshMovePad();}});function endMovePointer(e){if(heldDirections.delete(e.pointerId))refreshMovePad();}window.addEventListener('pointerup',endMovePointer);window.addEventListener('pointercancel',endMovePointer);movePad.addEventListener('lostpointercapture',endMovePointer);
  const controlsStyle=document.createElement('style');controlsStyle.textContent='#abilityGrid{grid-template-columns:repeat(4,65px)}.ability.kick span{color:#ffc857}.ability.run span{color:#90d3ff}.move-pad{display:grid;grid-template-columns:repeat(3,30px);grid-template-rows:repeat(3,30px);gap:2px;touch-action:none;user-select:none}.move-pad button{padding:0;border:1px solid #ffffff24;background:#172331;color:#e8f4ff;font-size:15px;font-weight:900;touch-action:none;cursor:pointer;box-shadow:inset 0 0 12px #4bc7f514}.move-pad button[data-dir=up]{grid-area:1/2}.move-pad button[data-dir=left]{grid-area:2/1}.move-pad button[data-dir=right]{grid-area:2/3}.move-pad button[data-dir=down]{grid-area:3/2}.move-pad button.pressed,.move-pad button:active{background:#604a20;border-color:#ffd56b;color:#ffe29c;box-shadow:0 0 12px #ffc85755}.move-center{grid-area:2/2;display:grid;place-items:center;color:#8394a7;font-size:7px;letter-spacing:.5px;font-weight:800}.game-tip:before{content:"HOLD M TO MOVE FORWARD · ";color:#ffc857}#arena.future-world{filter:hue-rotate(155deg) saturate(1.35) contrast(1.08)}@media(max-width:800px){#abilityGrid{grid-template-columns:repeat(4,minmax(47px,64px))}.move-pad{grid-template-columns:repeat(3,26px);grid-template-rows:repeat(3,26px)}}@media(max-width:380px){#abilityGrid{grid-template-columns:repeat(4,51px)}}';document.head.appendChild(controlsStyle);setInterval(()=>$('#arena').classList.toggle('future-world',!!state?.futureWorld),150);
  const priorAct=act;act=function(p,kind){if(kind==='fly'){if(p.hero!=='guardian')return;p.flying=!p.flying;p.run=p.flying||!!p.run;p.action='fly';p.actionTime=.45;say(p.flying?'RED DAWN TAKES FLIGHT!':'FLIGHT OFF');broadcast();return;}priorAct(p,kind);};
  const priorDrawHero=drawHero;drawHero=function(p){priorDrawHero(p);if(p.flying){ctx.save();ctx.strokeStyle='#65dfff';ctx.shadowColor='#65dfff';ctx.shadowBlur=18;ctx.globalAlpha=.72;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y+19,23,7,0,0,Math.PI*2);ctx.stroke();ctx.restore();}};
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'&&!e.repeat)action('fly');});
  const flightButton=document.createElement('button');flightButton.className='ability fly';flightButton.dataset.action='fly';flightButton.innerHTML='<span>✦</span><small>FLY</small>';$('#abilityGrid').appendChild(flightButton);const priorRenderControls=renderControls;renderControls=function(){priorRenderControls();const isGuardian=(state?.players[myId==='host'?'host':myId]?.hero||heroChoice)==='guardian',button=$('#abilityGrid [data-action="fly"]');if(isGuardian&&!button)$('#abilityGrid').appendChild(flightButton);if(!isGuardian)button?.remove();};const flightStyle=document.createElement('style');flightStyle.textContent='.ability.fly span{color:#72e8ff}';document.head.appendChild(flightStyle);
  const priorDraw=draw;draw=function(){priorDraw();if(!state?.futureWorld)return;const t=performance.now()/1000;ctx.save();ctx.globalCompositeOperation='screen';for(const [x,y,r] of [[105,142,52],[276,390,64],[498,176,50],[753,372,72],[912,150,48]]){const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'#36cfff55');g.addColorStop(1,'#1aaaff00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#71eaff';ctx.shadowColor='#43cfff';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(x,y,3+Math.sin(t*2+x)*1.2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}for(let i=0;i<3;i++){const x=((t*(72+i*27)+i*347)%(W+220))-110,y=95+i*145+Math.sin(t*1.6+i)*25;ctx.save();ctx.translate(x,y);ctx.fillStyle='#1a4766cc';ctx.strokeStyle='#71e8ff';ctx.lineWidth=1.5;ctx.shadowColor='#39caff';ctx.shadowBlur=17;ctx.beginPath();ctx.moveTo(-43,0);ctx.lineTo(-22,-8);ctx.lineTo(25,-6);ctx.lineTo(42,0);ctx.lineTo(22,8);ctx.lineTo(-25,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#c5f8ff';ctx.fillRect(-18,-2,8,2);ctx.fillRect(0,-2,8,2);ctx.fillStyle='#29bfff';ctx.fillRect(-57,-2,13,4);ctx.restore();}ctx.globalAlpha=.5;ctx.strokeStyle='#74dcff';ctx.lineWidth=1;for(let i=0;i<88;i++){const x=(i*137+Math.sin(i*18.2)*45)%W,y=(i*83+t*(290+i%4*48))%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+15+i%7);ctx.stroke();}ctx.restore();};
  const futureFilter=document.createElement('style');futureFilter.textContent='#arena.future-world{filter:brightness(1.08) saturate(1.18) contrast(1.04)}';document.head.appendChild(futureFilter);
  const drawWithFuturePeople=draw;draw=function(){drawWithFuturePeople();if(!state?.futureWorld)return;const t=performance.now()/1000;ctx.save();for(let i=0;i<7;i++){const stride=t*5+i*1.7,x=((i*159+t*(12+i%3*5))%(W+50))-25,y=166+(i%4)*35,scale=.72+(i%3)*.12,swing=Math.sin(stride)*5;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.shadowColor=i%2?'#35dbff':'#a78bff';ctx.shadowBlur=9;ctx.strokeStyle=i%2?'#62dfff':'#b5a2ff';ctx.fillStyle='#12243bee';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-18,5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillRect(-5,-12,10,15);ctx.strokeRect(-5,-12,10,15);ctx.beginPath();ctx.moveTo(-4,-9);ctx.lineTo(-10,Math.sin(stride)*3);ctx.moveTo(4,-9);ctx.lineTo(10,-Math.sin(stride)*3);ctx.moveTo(-3,3);ctx.lineTo(-5+swing,14);ctx.moveTo(3,3);ctx.lineTo(5-swing,14);ctx.stroke();ctx.fillStyle='#eafaff';ctx.beginPath();ctx.arc(1,-19,1.2,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.restore();};
  const drawFutureCrowd=draw;draw=function(){drawFutureCrowd();if(!state?.futureWorld)return;const t=performance.now()/1000;ctx.save();ctx.globalAlpha=.76;for(let i=0;i<28;i++){const phase=t*(3.4+i%5*.35)+i*2.3,x=((i*43+t*(7+i%6*2))%(W+28))-14,y=126+(i*47)%210,scale=.42+(i%4)*.09,swing=Math.sin(phase)*3.8,hue=i%3===0?'#70ecff':i%3===1?'#ba9eff':'#78ffc8';ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.shadowColor=hue;ctx.shadowBlur=7;ctx.strokeStyle=hue;ctx.fillStyle='#13233af0';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-16,5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillRect(-5,-10,10,14);ctx.strokeRect(-5,-10,10,14);ctx.beginPath();ctx.moveTo(-4,-7);ctx.lineTo(-9,Math.sin(phase)*2);ctx.moveTo(4,-7);ctx.lineTo(9,-Math.sin(phase)*2);ctx.moveTo(-3,4);ctx.lineTo(-5+swing,14);ctx.moveTo(3,4);ctx.lineTo(5-swing,14);ctx.stroke();ctx.fillStyle='#e9fbff';ctx.fillRect(1,-18,2,2);ctx.restore();}ctx.restore();};
  const drawThousandPeople=draw;draw=function(){drawThousandPeople();if(!state?.futureWorld)return;const t=performance.now()/1000;ctx.save();ctx.globalAlpha=.68;ctx.fillStyle='#122a43';ctx.beginPath();ctx.strokeStyle='#397eaa';ctx.lineWidth=.8;for(let i=0;i<1000;i++){const row=i%18,s=.28+(Math.floor(i/18)%4)*.055,x=(i*73+Math.sin(t*.55+i*.17)*2+t*(1+i%4*.35))%W,y=113+row*12+(Math.floor(i/18)%3)*2,r=1.15+s*.65;ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,Math.PI*2);ctx.rect(x-1.3-s,y+1,2.6+s*2,3.8+s*3);ctx.moveTo(x-1,y+4+s*2);ctx.lineTo(x-1.5+Math.sin(t*3+i)*.6,y+7+s*4);ctx.moveTo(x+1,y+4+s*2);ctx.lineTo(x+1.5-Math.sin(t*3+i)*.6,y+7+s*4);}ctx.fill();ctx.stroke();ctx.globalAlpha=.8;ctx.fillStyle='#73e8ff';ctx.shadowColor='#3bcaff';ctx.shadowBlur=5;ctx.beginPath();for(let i=0;i<1000;i+=5){const row=i%18,x=(i*73+Math.sin(t*.55+i*.17)*2+t*(1+i%4*.35))%W,y=113+row*12+(Math.floor(i/18)%3)*2;ctx.rect(x-1,y-2,1.5,1);}ctx.fill();ctx.restore();};
  // Keep the original vocal punch recording exclusive to cinematic impacts.
  const cinematicPunchClip=new Audio('assets/player-punch.aac');
  cinematicPunchClip.preload='auto';
  function playCinematicPunch(){
    try{unlockAudio();cinematicPunchClip.currentTime=0;cinematicPunchClip.volume=1;cinematicPunchClip.play().catch(()=>playPunchImpact(true));}catch{playPunchImpact(true);}
  }
  function playPunchImpact(strong=false){
    try{unlockAudio();if(!audioCtx)return;const now=audioCtx.currentTime,duration=strong?.19:.13;
      const body=audioCtx.createOscillator(),bodyGain=audioCtx.createGain();body.type='sine';body.frequency.setValueAtTime(strong?135:165,now);body.frequency.exponentialRampToValueAtTime(42,now+duration);bodyGain.gain.setValueAtTime(.001,now);bodyGain.gain.exponentialRampToValueAtTime(strong?.52:.37,now+.006);bodyGain.gain.exponentialRampToValueAtTime(.001,now+duration);body.connect(bodyGain).connect(audioCtx.destination);body.start(now);body.stop(now+duration);
      const buffer=audioCtx.createBuffer(1,Math.ceil(audioCtx.sampleRate*.085),audioCtx.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/(samples.length*.18));const hit=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),gain=audioCtx.createGain();hit.buffer=buffer;filter.type='lowpass';filter.frequency.value=strong?1800:2400;gain.gain.value=.24;hit.connect(filter).connect(gain).connect(audioCtx.destination);hit.start(now);
    }catch{}
  }
  function playCombatSound(kind){if(kind==='punch'||kind==='firePunch'){playPunchImpact(kind==='firePunch');return;}try{unlockAudio();if(!audioCtx)return;const now=audioCtx.currentTime,osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),settings={punch:[105,'triangle',.12],firePunch:[72,'sawtooth',.2],kick:[82,'triangle',.16],blast:[210,'sawtooth',.24],laser:[680,'sine',.22],slam:[54,'sine',.32],dodge:[340,'triangle',.12],block:[410,'square',.16],fly:[260,'sine',.2],jump:[230,'sine',.19]};const [freq,type,duration]=settings[kind]||[180,'triangle',.12];osc.type=type;osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.48),now+duration);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(kind==='block'?.16:.11,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain).connect(audioCtx.destination);osc.start(now);osc.stop(now+duration);}catch{}}
  const actWithFlight=act;act=function(p,kind){if(kind==='block'){p.blocking=!p.blocking;p.action=p.blocking?'block':'';p.actionTime=p.blocking?.35:0;say(p.blocking?'BLOCK UP!':'BLOCK DOWN');playCombatSound('block');broadcast();return;}if(['punch','firePunch','kick','blast','laser','slam','dodge','fly','jump'].includes(kind))playCombatSound(kind);actWithFlight(p,kind);};
  const actionWithAudio=action;action=function(kind){if(!isHost&&['punch','firePunch','kick','blast','laser','slam','dodge','fly','jump','block'].includes(kind))playCombatSound(kind);actionWithAudio(kind);};
  const simulateBeforeBlock=simulate;simulate=function(dt){const before=state?Object.fromEntries(Object.entries(state.players).map(([id,p])=>[id,p.hp])):{};simulateBeforeBlock(dt);if(!isHost||!state)return;for(const [id,p] of Object.entries(state.players)){if(p.blocking&&before[id]!=null&&p.hp<before[id]){p.hp=Math.min(100,p.hp+(before[id]-p.hp)*.8);p.action='block';p.actionTime=.22;}}};
  const renderBeforeBlock=renderControls;renderControls=function(){renderBeforeBlock();const blockButton=document.createElement('button');blockButton.className='ability block';blockButton.dataset.action='block';blockButton.innerHTML='<span>🛡</span><small>BLOCK</small>';if(!$('#abilityGrid [data-action="block"]'))$('#abilityGrid').appendChild(blockButton);};
  const drawBeforeShield=drawHero;drawHero=function(p){drawBeforeShield(p);if(p.blocking){const pulse=35+Math.sin(performance.now()/110)*2;ctx.save();ctx.strokeStyle='#69dcff';ctx.lineWidth=3;ctx.globalAlpha=.82;ctx.shadowColor='#46d8ff';ctx.shadowBlur=22;ctx.beginPath();ctx.arc(p.x,p.y-9,pulse,0,Math.PI*2);ctx.stroke();ctx.restore();}else if(Math.hypot(p.fx||0,p.fy||0)>.1){const t=performance.now()/90;ctx.save();ctx.strokeStyle=p.flying?'#7deaff':'#ffc857';ctx.globalAlpha=p.run?.6:.28;ctx.lineWidth=p.run?3:1.5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=p.run?12:5;for(let i=0;i<(p.run?4:2);i++){const offset=i*7;ctx.beginPath();ctx.moveTo(p.x-(p.fx||0)*22-offset,p.y-8+offset);ctx.lineTo(p.x-(p.fx||0)*34-offset-Math.sin(t+i)*3,p.y-8+offset);ctx.stroke();}ctx.restore();}};
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='b'&&!e.repeat)action('block');});
  const blockStyle=document.createElement('style');blockStyle.textContent='.ability.block span{color:#75e4ff}.ability.block.is-on{border-color:#75e4ff;background:#102d3a}';document.head.appendChild(blockStyle);const blockStateTimer=setInterval(()=>{const p=state?.players[myId==='host'?'host':myId];$('[data-action="block"]')?.classList.toggle('is-on',!!p?.blocking);$('[data-action="respawn"]')?.toggleAttribute('hidden',!state?.futureWorld);},120);
  let futureTalkIndex=0;const futureChats=['FUTURE RESIDENT: Rescue the three civilians to evacuate them!','FUTURE RESIDENT: Use your powers to clear Mr. Misfit’s forces!','FUTURE RESIDENT: Block when the villains strike, then counterattack!','FUTURE RESIDENT: Find Mr. Misfit and defeat him to free our city!'];const actionBeforeTalk=action;action=function(kind){if(kind==='respawn'){if(!state?.futureWorld)return;say(futureChats[futureTalkIndex++%futureChats.length]);playCombatSound('block');return;}actionBeforeTalk(kind);};
  const renderBeforeRespawn=renderControls;renderControls=function(){renderBeforeRespawn();if(!$('#abilityGrid [data-action="respawn"]')){const b=document.createElement('button');b.className='ability respawn';b.dataset.action='respawn';b.innerHTML='<span>↻</span><small>RESPAWN</small>';b.hidden=!state?.futureWorld;$('#abilityGrid').appendChild(b);}};const respawnStyle=document.createElement('style');respawnStyle.textContent='.ability.respawn span{color:#a4ffcf}';document.head.appendChild(respawnStyle);
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='h'&&!e.repeat)action('weapon');});
  const actBeforeWeapon=act;act=function(p,kind){if(kind==='weapon'){p.weaponHeld=!p.weaponHeld;p.action='weapon';p.actionTime=.35;say(p.weaponHeld?'ENERGY WEAPON READY':'WEAPON HOLSTERED');playCombatSound('blast');broadcast();return;}actBeforeWeapon(p,kind);};const actionBeforeWeapon=action;action=function(kind){if(kind==='weapon'&&!isHost)playCombatSound('blast');actionBeforeWeapon(kind);};
  const renderBeforeWeapon=renderControls;renderControls=function(){renderBeforeWeapon();if(!$('#abilityGrid [data-action="weapon"]')){const b=document.createElement('button');b.className='ability weapon';b.dataset.action='weapon';b.innerHTML='<span>⚡</span><small>WEAPON · H</small>';$('#abilityGrid').appendChild(b);}};
  const drawBeforeWeapon=drawHero;drawHero=function(p){drawBeforeWeapon(p);if(p.weaponHeld){ctx.save();ctx.lineCap='round';ctx.strokeStyle='#ffd66b';ctx.lineWidth=5;ctx.shadowColor='#62e9ff';ctx.shadowBlur=13;ctx.beginPath();ctx.moveTo(p.x+11,p.y-3);ctx.lineTo(p.x+28,p.y-17);ctx.stroke();ctx.strokeStyle='#7ceaff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x+13,p.y-4);ctx.lineTo(p.x+29,p.y-18);ctx.stroke();ctx.restore();}};const weaponStyle=document.createElement('style');weaponStyle.textContent='.ability.weapon span{color:#ffd66b}.ability.weapon.is-on{border-color:#69dcff;background:#152c37}';document.head.appendChild(weaponStyle);setInterval(()=>{const me=state?.players[myId==='host'?'host':myId];$('[data-action="weapon"]')?.classList.toggle('is-on',!!me?.weaponHeld);},140);
  function makeCharacterSprite(src,crop,whiteKey=false){const image=new Image();image.src=src;let result=null;image.onload=()=>{try{const sx=Math.floor(image.naturalWidth*crop[0]),sy=Math.floor(image.naturalHeight*crop[1]),sw=Math.floor(image.naturalWidth*crop[2]),sh=Math.floor(image.naturalHeight*crop[3]),raw=document.createElement('canvas');raw.width=sw;raw.height=sh;const r=raw.getContext('2d',{willReadFrequently:true});r.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);if(whiteKey){const im=r.getImageData(0,0,sw,sh),d=im.data;let x0=sw,y0=sh,x1=0,y1=0;for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const i=(y*sw+x)*4,rr=d[i],gg=d[i+1],bb=d[i+2],white=Math.min(rr,gg,bb),spread=Math.max(rr,gg,bb)-white;if(rr>220&&gg>220&&bb>215&&spread<36){d[i+3]=Math.round(d[i+3]*Math.max(0,Math.min(1,(250-white)/22)));}if(d[i+3]>12){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}r.putImageData(im,0,0);if(x1>x0&&y1>y0){const trimmed=document.createElement('canvas');trimmed.width=x1-x0+1;trimmed.height=y1-y0+1;trimmed.getContext('2d').drawImage(raw,x0,y0,trimmed.width,trimmed.height,0,0,trimmed.width,trimmed.height);result=trimmed;}else result=raw;}else{const mask=document.createElement('canvas');mask.width=sw;mask.height=sh;const m=mask.getContext('2d'),g=m.createRadialGradient(sw/2,sh/2,Math.min(sw,sh)*.22,sw/2,sh/2,Math.max(sw,sh)*.58);g.addColorStop(.63,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');m.fillStyle=g;m.fillRect(0,0,sw,sh);r.globalCompositeOperation='destination-in';r.drawImage(mask,0,0);result=raw;}}catch{result=null;}};return{image,get:()=>result};}
  const arenaArt={guardian:makeCharacterSprite('assets/hero-reference.jpg',[.19,.015,.52,.97],true),wildclaw:makeCharacterSprite('assets/wildclaw-reference.jpg',[.06,.19,.67,.81]),sentinel:makeCharacterSprite('assets/night-sentinel-reference.png',[.30,.08,.48,.86]),finnew:makeCharacterSprite('assets/fin-new-reference.jpg',[.06,.02,.88,.96],true),king:makeCharacterSprite('assets/villain-reference.jpg',[.20,.16,.70,.72])};
  const vectorHeroDraw=drawHero;drawHero=function(p){const art=arenaArt[p.hero]?.get();if(!art){vectorHeroDraw(p);return;}const jump=p.jump>0?Math.sin((.76-p.jump)/.76*Math.PI)*55:0,hover=p.flying?14+Math.sin(performance.now()/120)*4:0,py=p.y-jump-hover,h=p.hero==='guardian'?106:94,w=h*art.width/art.height;ctx.save();ctx.globalAlpha=p.dodge>0?.55:1;ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(p.x,p.y+17,w*.3,8,0,0,Math.PI*2);ctx.fill();ctx.shadowColor=p.hero==='guardian'?'#58dfff':'#59a9ff';ctx.shadowBlur=10;ctx.drawImage(art,p.x-w/2,py-h+20,w,h);ctx.restore();ctx.textAlign='center';ctx.font='800 9px DM Sans';ctx.fillStyle='#f5f7fa';ctx.fillText(p.id===myId||p.id==='host'&&isHost?'YOU':p.name,p.x,py-h+12);if(p.hp<100){ctx.fillStyle='#fff4';ctx.fillRect(p.x-18,py-h+15,36,3);ctx.fillStyle='#ff6e5b';ctx.fillRect(p.x-18,py-h+15,36*p.hp/100,3);}if(p.flying||p.blocking){ctx.save();ctx.strokeStyle=p.blocking?'#69dcff':'#b0f5ff';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=19;ctx.lineWidth=p.blocking?3:2;ctx.beginPath();ctx.ellipse(p.x,p.y+9,p.blocking?37:25,p.blocking?49:13,0,0,Math.PI*2);ctx.stroke();ctx.restore();}if(p.weaponHeld){ctx.save();ctx.strokeStyle='#ffe082';ctx.lineWidth=5;ctx.shadowColor='#68eaff';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(p.x+w*.26,py-h*.37);ctx.lineTo(p.x+w*.48,py-h*.52);ctx.stroke();ctx.restore();}if(p.actionTime>0&&p.action==='laser'){ctx.save();ctx.strokeStyle='#73eaff';ctx.lineWidth=4;ctx.shadowColor='#54e6ff';ctx.shadowBlur=22;ctx.beginPath();ctx.moveTo(p.x,py-h*.62);ctx.lineTo(state.bossX,state.bossY);ctx.stroke();ctx.restore();}};
  const vectorBossDraw=drawBoss;drawBoss=function(){const art=arenaArt.king.get();if(!art){vectorBossDraw();return;}const {bossX:x,bossY:y,giant}=state,h=giant?244:160,w=h*art.width/art.height;ctx.save();ctx.shadowColor='#ff603c';ctx.shadowBlur=giant?34:22;ctx.drawImage(art,x-w/2,y-h+34,w,h);ctx.restore();ctx.textAlign='center';ctx.font='900 10px DM Sans';ctx.fillStyle='#ff9679';ctx.fillText(giant?'GIANT MR. MISFIT':'MR. MISFIT',x,y-h+24);if(state.bossBlock>0){ctx.strokeStyle='#8dddf4';ctx.shadowColor='#4adfff';ctx.shadowBlur=12;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y-30,Math.max(w,h)*.36,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}};
  const guardianRaw=new Image();guardianRaw.src='assets/hero-reference.jpg';const drawWithGuardianFallback=drawHero;drawHero=function(p){drawWithGuardianFallback(p);if(p.hero==='guardian'&&guardianRaw.complete&&guardianRaw.naturalWidth&&!arenaArt.guardian.get()){const sx=guardianRaw.naturalWidth*.19,sy=guardianRaw.naturalHeight*.015,sw=guardianRaw.naturalWidth*.52,sh=guardianRaw.naturalHeight*.97,h=106,w=h*sw/sh;ctx.save();ctx.globalAlpha=.86;ctx.globalCompositeOperation='multiply';ctx.shadowColor='#53dfff';ctx.shadowBlur=10;ctx.drawImage(guardianRaw,sx,sy,sw,sh,p.x-w/2,p.y-h+20,w,h);ctx.restore();}};
  function animatedLimb(a,b,c,d,width,base,shine){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#07101acc';ctx.lineWidth=width+5;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();const grad=ctx.createLinearGradient(a,b,c,d);grad.addColorStop(0,shine);grad.addColorStop(.45,base);grad.addColorStop(1,'#101b2a');ctx.strokeStyle=grad;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();ctx.strokeStyle=shine;ctx.globalAlpha=.65;ctx.lineWidth=Math.max(1,width*.13);ctx.beginPath();ctx.moveTo(a-width*.14,b);ctx.lineTo(c-width*.14,d);ctx.stroke();ctx.globalAlpha=1;}
  function drawHero(p){const now=performance.now()/1000,moving=Math.hypot(p.fx||0,p.fy||0)>.08,phase=now*(p.run?13:8)+String(p.id).length,walk=moving?Math.sin(phase)*8:Math.sin(now*2+String(p.id).length)*1.2,bounce=moving?Math.abs(Math.sin(phase))*2:Math.sin(now*2)*1,jump=p.hero==='wildclaw'&&p.jump>0?Math.sin((.76-p.jump)/.76*Math.PI)*50:0,hover=p.flying?12+Math.sin(now*8)*4:0,py=p.y-jump-hover,guardian=p.hero!=='wildclaw',gold=guardian?'#bd8438':'#287eb8',shine=guardian?'#ffe29a':'#8ceaff',body=guardian?'#172532':'#155d96',kick=p.action==='kick'&&p.actionTime>0?Math.sin((1-p.actionTime/.38)*Math.PI)*16:0,punch=p.action==='punch'||p.action==='firePunch'||p.action==='blast';ctx.save();ctx.fillStyle='#020913aa';ctx.beginPath();ctx.ellipse(p.x,p.y+13,21,6,0,0,Math.PI*2);ctx.fill();ctx.translate(p.x,py-bounce);if((p.fx||0)<-.18)ctx.scale(-1,1);ctx.globalAlpha=p.dodge>0?.65:1;const capeSwing=Math.sin(now*4+(p.x*.02))*7;const cape=ctx.createLinearGradient(-24,-48,25,12);cape.addColorStop(0,guardian?'#9a7444':'#176aaf');cape.addColorStop(1,'#101c2b');ctx.fillStyle=cape;ctx.beginPath();ctx.moveTo(-12,-50);ctx.quadraticCurveTo(-30,-31,-21+capeSwing,-7);ctx.lineTo(-8,4);ctx.lineTo(5,-19);ctx.lineTo(19,4);ctx.quadraticCurveTo(31,-27,12,-50);ctx.closePath();ctx.fill();ctx.strokeStyle=guardian?'#f6ce75':'#7edfff';ctx.globalAlpha=.65;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=p.dodge>0?.65:1;
    const rearLeg=walk,frontLeg=-walk-kick;animatedLimb(-7,-25,-10+rearLeg*.45,-12,8,guardian?'#a97732':'#2477b0',shine);animatedLimb(-10+rearLeg*.45,-12,-10+rearLeg,-1,6,guardian?'#394657':'#213f5a',shine);animatedLimb(7,-25,10+frontLeg*.45,-12,9,guardian?'#c18a3c':'#2c89c5',shine);animatedLimb(10+frontLeg*.45,-12,11+frontLeg,-1,7,guardian?'#495361':'#255276',shine);ctx.fillStyle='#111c2a';ctx.beginPath();ctx.roundRect(-16+rearLeg,-3,13,6,2);ctx.roundRect(5+frontLeg,-3,14,6,2);ctx.fill();ctx.strokeStyle=shine;ctx.globalAlpha=.7;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-14+rearLeg,-1);ctx.lineTo(-5+rearLeg,-1);ctx.moveTo(7+frontLeg,-1);ctx.lineTo(16+frontLeg,-1);ctx.stroke();ctx.globalAlpha=p.dodge>0?.65:1;
    const torso=ctx.createLinearGradient(-17,-53,18,-21);torso.addColorStop(0,shine);torso.addColorStop(.16,gold);torso.addColorStop(.52,body);torso.addColorStop(1,gold);ctx.fillStyle='#091321';ctx.beginPath();ctx.roundRect(-16,-53,32,34,8);ctx.fill();ctx.fillStyle=torso;ctx.beginPath();ctx.roundRect(-13,-52,26,30,7);ctx.fill();ctx.strokeStyle=shine;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-49);ctx.lineTo(0,-23);ctx.moveTo(-10,-44);ctx.lineTo(-4,-39);ctx.lineTo(0,-42);ctx.lineTo(5,-38);ctx.lineTo(10,-44);ctx.stroke();ctx.fillStyle=guardian?'#ffbd48':'#64dcff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=14+Math.sin(now*8)*4;ctx.beginPath();ctx.arc(0,-38,4.2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#101b2a';ctx.beginPath();ctx.roundRect(-18,-52,10,10,4);ctx.roundRect(8,-52,10,10,4);ctx.fill();ctx.strokeStyle=shine;ctx.lineWidth=1.4;ctx.stroke();
    const leftArm=punch? -23:Math.sin(phase+Math.PI)*5,rightArm=punch?-31:Math.sin(phase)*5;animatedLimb(-14,-48,-21+leftArm*.25,-37,9,gold,shine);animatedLimb(-21+leftArm*.25,-37,-20+leftArm,-26,7,guardian?'#394657':'#20517a',shine);animatedLimb(14,-48,22+rightArm*.2,-38,10,gold,shine);animatedLimb(22+rightArm*.2,-38,25+rightArm,-27,8,guardian?'#566174':'#276da0',shine);ctx.fillStyle=guardian?'#e7b949':'#52b7ee';ctx.shadowColor=shine;ctx.shadowBlur=p.fireTime>0?16:6;ctx.beginPath();ctx.arc(-20+leftArm,-25,5.5,0,Math.PI*2);ctx.arc(25+rightArm,-26,6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if(guardian){ctx.fillStyle='#d4a14d';ctx.beginPath();ctx.arc(0,-62,11,Math.PI,0);ctx.lineTo(10,-54);ctx.lineTo(-10,-54);ctx.closePath();ctx.fill();ctx.strokeStyle='#f3d27f';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#71eaff';ctx.shadowColor='#3de6ff';ctx.shadowBlur=10;ctx.fillRect(-7,-61,5,2.5);ctx.fillRect(2,-61,5,2.5);ctx.shadowBlur=0;if(p.helmet){ctx.strokeStyle='#f5d271';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-61,12,Math.PI,0);ctx.stroke();}}else{ctx.fillStyle='#ddcfae';ctx.beginPath();ctx.arc(0,-61,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d9e5df';ctx.beginPath();ctx.moveTo(-6,-66);ctx.lineTo(-10,-80);ctx.lineTo(-1,-68);ctx.moveTo(6,-66);ctx.lineTo(10,-80);ctx.lineTo(1,-68);ctx.fill();ctx.fillStyle='#15212d';ctx.beginPath();ctx.moveTo(-8,-62);ctx.lineTo(-5,-57);ctx.lineTo(-2,-62);ctx.moveTo(2,-62);ctx.lineTo(5,-57);ctx.lineTo(8,-62);ctx.fill();ctx.fillStyle='#68ffca';ctx.shadowColor='#4fffc2';ctx.shadowBlur=7;ctx.fillRect(-6,-63,3,2);ctx.fillRect(3,-63,3,2);ctx.shadowBlur=0;for(let i=-2;i<=2;i++){ctx.strokeStyle='#17242e';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(i*3,-70);ctx.lineTo(i*2,-57);ctx.stroke();}}
    if(p.weaponHeld){ctx.strokeStyle='#f7d56e';ctx.lineWidth=4;ctx.shadowColor='#58e9ff';ctx.shadowBlur=13;ctx.beginPath();ctx.moveTo(27+rightArm,-27);ctx.lineTo(38+rightArm,-45);ctx.stroke();ctx.strokeStyle='#a6f7ff';ctx.lineWidth=1.5;ctx.stroke();ctx.shadowBlur=0;}if(p.fireTime>0){ctx.fillStyle='#ff6333';ctx.shadowColor='#ff3c18';ctx.shadowBlur=20;ctx.beginPath();ctx.arc(-20+leftArm,-25,9+Math.sin(now*25)*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}ctx.restore();
    if(p.blocking){ctx.save();ctx.strokeStyle='#66e8ff';ctx.globalAlpha=.78;ctx.lineWidth=3;ctx.shadowColor='#30cfff';ctx.shadowBlur=21;ctx.beginPath();ctx.ellipse(p.x,p.y-34,34,50,0,0,Math.PI*2);ctx.stroke();ctx.restore();}if(p.climbing){ctx.strokeStyle='#69e0ef';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,py-34,30,0,Math.PI*2);ctx.stroke();}if(p.actionTime>0&&p.action==='laser'){ctx.save();ctx.strokeStyle='#73eaff';ctx.lineWidth=4;ctx.shadowColor='#54e6ff';ctx.shadowBlur=22;ctx.beginPath();ctx.moveTo(p.x,py-58);ctx.lineTo(state.bossX,state.bossY);ctx.stroke();ctx.restore();}if(p.actionTime>0&&p.action==='kick'){ctx.save();ctx.strokeStyle='#ffe29a';ctx.shadowColor='#ffc857';ctx.shadowBlur=14;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x+18,py-5,22+Math.sin(now*20)*4,-.5,.8);ctx.stroke();ctx.restore();}ctx.textAlign='center';ctx.font='800 9px DM Sans';ctx.fillStyle='#fff';ctx.shadowColor='#03101b';ctx.shadowBlur=5;ctx.fillText(p.id===myId||p.id==='host'&&isHost?'YOU':p.name,p.x,py-88);ctx.shadowBlur=0;if(p.hp<100){ctx.fillStyle='#fff4';ctx.fillRect(p.x-18,py-82,36,3);ctx.fillStyle='#ff645f';ctx.fillRect(p.x-18,py-82,36*p.hp/100,3);}}
  function drawBoss(){const t=performance.now()/1000,{bossX:x,bossY:y,giant}=state,scale=giant?1.75:1,bob=Math.sin(t*2.4)*2,step=Math.sin(t*3)*5,pulse=8+Math.sin(t*8)*2;ctx.save();ctx.translate(x,y+bob);ctx.scale(scale,scale);ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(0,19,42,11,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#10261f';ctx.beginPath();ctx.moveTo(-18,-51);ctx.quadraticCurveTo(-41,-27,-33,3);ctx.lineTo(-23,14);ctx.lineTo(-12,-27);ctx.lineTo(12,-27);ctx.lineTo(28,14);ctx.quadraticCurveTo(43,-26,17,-52);ctx.closePath();ctx.fill();ctx.strokeStyle='#438c74';ctx.lineWidth=2;ctx.stroke();animatedLimb(-11,-27,-17+step*.2,-12,13,'#344d43','#9ca98b');animatedLimb(-17+step*.2,-12,-15+step,-1,10,'#293c38','#829889');animatedLimb(11,-27,17-step*.2,-12,13,'#344d43','#9ca98b');animatedLimb(17-step*.2,-12,15-step,-1,10,'#293c38','#829889');ctx.fillStyle='#182923';ctx.beginPath();ctx.roundRect(-19,-57,38,36,9);ctx.fill();const armor=ctx.createLinearGradient(-18,-50,18,-23);armor.addColorStop(0,'#7c8c72');armor.addColorStop(.35,'#364a3d');armor.addColorStop(1,'#1c2c27');ctx.fillStyle=armor;ctx.beginPath();ctx.roundRect(-16,-54,32,30,8);ctx.fill();ctx.strokeStyle='#879579';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#e05b32';ctx.shadowColor='#ff572d';ctx.shadowBlur=20;ctx.beginPath();ctx.arc(0,-39,pulse*.55,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffcb72';ctx.beginPath();ctx.arc(0,-39,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;const swing=Math.sin(t*3.8)*8;animatedLimb(-15,-50,-24,-40,12,'#53604c','#b1aa83');animatedLimb(-24,-40,-28+swing*.5,-31,10,'#354537','#aaa27d');animatedLimb(15,-50,25,-40,12,'#53604c','#b1aa83');animatedLimb(25,-40,29-swing*.4,-31,10,'#354537','#aaa27d');ctx.fillStyle='#65745b';ctx.beginPath();ctx.arc(0,-67,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a7a27a';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#61775f';ctx.beginPath();ctx.moveTo(-10,-72);ctx.lineTo(-15,-84);ctx.lineTo(-4,-76);ctx.moveTo(10,-72);ctx.lineTo(15,-84);ctx.lineTo(4,-76);ctx.fill();ctx.fillStyle='#ff452f';ctx.shadowColor='#ff3321';ctx.shadowBlur=13;ctx.fillRect(-8,-69,5,2.5);ctx.fillRect(3,-69,5,2.5);ctx.shadowBlur=0;ctx.restore();ctx.textAlign='center';ctx.font='900 10px DM Sans';ctx.fillStyle='#ff977b';ctx.fillText(giant?'GIANT MR. MISFIT':'MR. MISFIT',x,y-(giant?132:83));if(state.bossBlock>0){ctx.strokeStyle='#8dddf4';ctx.lineWidth=3;ctx.shadowColor='#48ddff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y-35,giant?97:55,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}}
  const storyCityStyle=document.createElement('style');storyCityStyle.textContent='.story-panel{background:linear-gradient(90deg,#080e17f5 0%,#080e17df 48%,#080e1755 100%),url("'+futureCityBackground.toDataURL('image/png')+'") center/cover no-repeat!important}';document.head.appendChild(storyCityStyle);
  let cameraOffset={x:0,y:0};const targetBeforeCamera=targetFromPointer;targetFromPointer=function(e){if(window.heroTravelUnproject){const r=canvas.getBoundingClientRect();arenaTarget=window.heroTravelUnproject((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H,W,H);return;}targetBeforeCamera(e);if(arenaTarget&&window.heroGround&&state){arenaTarget=window.heroGround.unsample(state.round,arenaTarget.x,arenaTarget.y,W,H);}};
  function drawRPGHero(p){const t=performance.now()/1000,playerId=myId==='host'?'host':myId,isLocal=p.id===playerId,scale=isLocal?1.32:.92,moving=Math.hypot(p.fx||0,p.fy||0)>.08,cycle=t*(p.run?15:9)+String(p.id).length,stride=moving?Math.sin(cycle)*9:Math.sin(t*2)*1.5,bob=moving?Math.abs(Math.sin(cycle))*2:Math.sin(t*2)*1,jump=p.jump>0?Math.sin((.76-p.jump)/.76*Math.PI)*42:0,fly=p.flying?12+Math.sin(t*8)*4:0,climbLift=p.climbing?Math.min(110,p.climbHeight||0)*.42:0,animal=p.hero==='wildclaw',metal=animal?'#1978b6':'#b88032',edge=animal?'#8ceaff':'#ffe099',dark=animal?'#123953':'#26313d',kick=p.action==='kick'&&p.actionTime>0?18*Math.sin((1-p.actionTime/.38)*Math.PI):0,py=p.y-jump-fly-bob-climbLift;ctx.save();ctx.translate(p.x,py);const angle=Math.hypot(p.fx||0,p.fy||0)>.08?Math.atan2(p.fx,-p.fy):(p.face||0);ctx.scale((p.fx||Math.sin(p.face||0))<-.08?-scale:scale,scale);ctx.globalAlpha=p.dodge>0?.6:1;ctx.fillStyle='#020817bb';ctx.beginPath();ctx.ellipse(0,12,20,6,0,0,Math.PI*2);ctx.fill();const capeWave=Math.sin(t*4+p.x*.03)*8;ctx.fillStyle=animal?'#075b9b':'#5a4229';ctx.beginPath();ctx.moveTo(-12,-52);ctx.quadraticCurveTo(-28,-33,-21+capeWave,-4);ctx.lineTo(-8,5);ctx.lineTo(1,-22);ctx.lineTo(11,5);ctx.quadraticCurveTo(28,-27,12,-52);ctx.closePath();ctx.fill();ctx.strokeStyle=edge;ctx.globalAlpha=.68;ctx.lineWidth=1.4;ctx.stroke();ctx.globalAlpha=p.dodge>0?.6:1;
    animatedLimb(-7,-26,-10+stride*.45,-13,8,metal,edge);animatedLimb(-10+stride*.45,-13,-11+stride-kick*.2,-2,7,animal?'#246082':'#475261',edge);animatedLimb(7,-26,10-stride*.45,-13,8,metal,edge);animatedLimb(10-stride*.45,-13,11-stride+kick,-2,7,animal?'#246082':'#475261',edge);ctx.fillStyle='#101b29';ctx.beginPath();ctx.roundRect(-16+stride,-3,13,7,3);ctx.roundRect(4-stride,-3,14,7,3);ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-12+stride,0);ctx.lineTo(-5+stride,0);ctx.moveTo(8-stride,0);ctx.lineTo(15-stride,0);ctx.stroke();
    const armor=ctx.createLinearGradient(-18,-53,18,-20);armor.addColorStop(0,edge);armor.addColorStop(.17,metal);armor.addColorStop(.56,dark);armor.addColorStop(1,metal);ctx.fillStyle='#080f1b';ctx.beginPath();ctx.roundRect(-17,-54,34,35,8);ctx.fill();ctx.fillStyle=armor;ctx.beginPath();ctx.roundRect(-14,-52,28,30,7);ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-49);ctx.lineTo(0,-24);ctx.moveTo(-10,-45);ctx.lineTo(-5,-40);ctx.lineTo(0,-44);ctx.lineTo(5,-40);ctx.lineTo(10,-45);ctx.stroke();ctx.fillStyle=animal?'#66eaff':'#ffcb54';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=15;ctx.beginPath();ctx.arc(0,-39,4.5+Math.sin(t*8)*.6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle=metal;ctx.beginPath();ctx.ellipse(-16,-49,7,10,-.25,0,Math.PI*2);ctx.ellipse(16,-49,7,10,.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=1;ctx.stroke();
    const armSwing=moving?Math.sin(cycle+Math.PI)*7:0,attack=p.action==='punch'||p.action==='firePunch';animatedLimb(-14,-49,-21-armSwing*.2,-38,9,metal,edge);animatedLimb(-21-armSwing*.2,-38,-20-armSwing,-27,7,dark,edge);animatedLimb(14,-49,21+armSwing*.2,-38,9,metal,edge);animatedLimb(21+armSwing*.2,-38,24+armSwing,-27,7,dark,edge);ctx.fillStyle=animal?'#b8d2dc':'#e9bd61';ctx.beginPath();ctx.arc(-20-armSwing,-26,5.5,0,Math.PI*2);ctx.arc(24+armSwing,-26,5.5,0,Math.PI*2);ctx.fill();if(animal){ctx.fillStyle='#e5e1ca';ctx.beginPath();ctx.moveTo(-6,-61);ctx.lineTo(-11,-78);ctx.lineTo(-1,-66);ctx.moveTo(6,-61);ctx.lineTo(11,-78);ctx.lineTo(1,-66);ctx.fill();ctx.strokeStyle='#17212a';for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*3,-67);ctx.lineTo(i*2,-55);ctx.stroke();}}else{ctx.fillStyle='#111b25';ctx.beginPath();ctx.arc(0,-63,11,Math.PI,0);ctx.lineTo(10,-54);ctx.lineTo(-10,-54);ctx.closePath();ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-62,11,Math.PI,0);ctx.stroke();ctx.fillStyle='#77eaff';ctx.fillRect(-7,-62,5,2);ctx.fillRect(2,-62,5,2);}if(p.weaponHeld){ctx.strokeStyle='#ffe17a';ctx.lineWidth=4;ctx.shadowColor='#67eaff';ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(25,-25);ctx.lineTo(38,-48);ctx.stroke();ctx.shadowBlur=0;}if(p.fireTime>0){ctx.fillStyle='#ff6538';ctx.shadowColor='#ff3c18';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(24,-26,9+Math.sin(t*25)*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}ctx.restore();if(p.blocking){ctx.save();ctx.strokeStyle='#68e8ff';ctx.globalAlpha=.78;ctx.shadowColor='#35d4ff';ctx.shadowBlur=20;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,py-30,31*scale,45*scale,angle,0,Math.PI*2);ctx.stroke();ctx.restore();}if(p.action==='laser'&&p.actionTime>0){ctx.save();ctx.strokeStyle='#79f2ff';ctx.lineWidth=3;ctx.shadowColor='#52eaff';ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(p.x,py-48);ctx.lineTo(state.bossX,state.bossY);ctx.stroke();ctx.restore();}ctx.textAlign='center';ctx.font=isLocal?'900 10px DM Sans':'800 8px DM Sans';ctx.fillStyle='#f5fbff';ctx.shadowColor='#06121e';ctx.shadowBlur=6;ctx.fillText(isLocal?'YOU':p.name,p.x,py-89*scale);ctx.shadowBlur=0;if(p.hp<100){ctx.fillStyle='#fff5';ctx.fillRect(p.x-18,py-82*scale,36,3);ctx.fillStyle='#ff625d';ctx.fillRect(p.x-18,py-82*scale,36*p.hp/100,3);}}
  function drawHammerer(h){const t=performance.now()/1000,smash=!!h.bossSmash,progress=smash?1-h.bossSmash/1.1:0,wind=smash?Math.max(0,Math.min(1,progress/.58)):0,slam=smash?Math.max(0,Math.min(1,(progress-.58)/.42)):0,swing=smash?(-1.22*wind+2.35*slam):Math.sin(t*2+h.x)*.06,step=h.walking?Math.sin(t*8+h.x)*5:0,crouch=smash?Math.sin(progress*Math.PI)*7:0,me=state?.players[myId==='host'?'host':myId]||state?.players.host,depth=me?Math.max(.78,Math.min(1.28,.92+(h.y-me.y)*.00065)):1;ctx.save();ctx.translate(h.x,h.y);ctx.scale(depth,depth);ctx.fillStyle='#030811aa';ctx.beginPath();ctx.ellipse(0,7,25,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#171719';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-9,-22);ctx.lineTo(-11-step*.35,-10+crouch);ctx.lineTo(-14+step*.35,0);ctx.moveTo(9,-22);ctx.lineTo(11+step*.35,-10+crouch);ctx.lineTo(14-step*.35,0);ctx.stroke();ctx.strokeStyle='#bd9559';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-14+step*.35,0);ctx.lineTo(-19+step*.45,2);ctx.moveTo(14-step*.35,0);ctx.lineTo(19-step*.45,2);ctx.stroke();const armor=ctx.createLinearGradient(-23,-59,23,-10);armor.addColorStop(0,'#b48950');armor.addColorStop(.4,'#3a3128');armor.addColorStop(1,'#171d24');ctx.fillStyle=armor;ctx.beginPath();ctx.roundRect(-19,-56+crouch,38,38,8);ctx.fill();ctx.strokeStyle='#d1a45d';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#c69d78';ctx.beginPath();ctx.arc(0,-67+crouch,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#161719';ctx.beginPath();ctx.arc(0,-72+crouch,13,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#171217';ctx.fillRect(-7,-68+crouch,4,2);ctx.fillRect(3,-68+crouch,4,2);ctx.fillStyle='#9a4b35';ctx.fillRect(-4,-61+crouch,8,2);const arm=(side)=>{const a=swing*side;ctx.save();ctx.translate(side*15,-49+crouch);ctx.rotate(a);ctx.strokeStyle='#27252a';ctx.lineWidth=11;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(side*12,14);ctx.stroke();ctx.strokeStyle='#bd9559';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(side*12,14);ctx.lineTo(side*17,25);ctx.stroke();ctx.translate(side*17,25);ctx.rotate(side*.3);ctx.fillStyle='#302d32';ctx.fillRect(-3,-3,6,20);ctx.fillStyle='#9d7746';ctx.fillRect(-13,12,26,16);ctx.fillStyle='#29272c';ctx.fillRect(-17,8,34,5);ctx.strokeStyle='#dbb572';ctx.lineWidth=1.5;ctx.strokeRect(-13,12,26,16);ctx.restore();};arm(-1);arm(1);ctx.fillStyle='#343038';ctx.fillRect(-15,-18+crouch,30,20);ctx.fillStyle='#b18850';ctx.beginPath();ctx.moveTo(-13,-18+crouch);ctx.lineTo(0,-24+crouch);ctx.lineTo(13,-18+crouch);ctx.lineTo(10,-7+crouch);ctx.lineTo(-10,-7+crouch);ctx.closePath();ctx.fill();ctx.restore();ctx.textAlign='center';ctx.font='800 8px DM Sans';ctx.fillStyle='#e8c17e';ctx.fillText('TWIN-HAMMER BRUTE',h.x,h.y-93);if(smash&&progress>.7){ctx.save();ctx.strokeStyle='#ffc857';ctx.globalAlpha=.7;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(h.smashX,h.smashY,32+progress*22,10+progress*8,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}
  function drawThirdPerson(){if(!state||document.querySelector('.arena-wrap').classList.contains('playing3d'))return;if(state.intro){ctx.clearRect(0,0,W,H);drawPhotoBackground(warehouseBackground);return;}const meteorLevel=state.round===1,snowLevel=state.round===2,dimensionBackground=state.round===3?levelThreeBackground:state.round===4?levelFourBackground:state.round>=5?levelFiveBackground:null;ctx.clearRect(0,0,W,H);if(snowLevel){drawPhotoBackground(snowStreetBackground);}else if(meteorLevel){drawPhotoBackground(warehouseBackground);}else if(dimensionBackground){drawPhotoBackground(dimensionBackground);}else{ctx.drawImage(futureCityBackground,0,0,W,H);const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#07132633');shade.addColorStop(.52,'#0a1b2b55');shade.addColorStop(1,'#06101ddc');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);drawCity();const road=ctx.createLinearGradient(0,280,0,H);road.addColorStop(0,'#18324c');road.addColorStop(.25,'#0b1a2a');road.addColorStop(1,'#050c16');ctx.fillStyle=road;ctx.beginPath();ctx.moveTo(410,278);ctx.lineTo(590,278);ctx.lineTo(1120,H);ctx.lineTo(-120,H);ctx.closePath();ctx.fill();ctx.strokeStyle='#42ddff77';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(410,278);ctx.lineTo(-120,H);ctx.moveTo(590,278);ctx.lineTo(1120,H);ctx.stroke();for(let i=1;i<=12;i++){const y=280+i*i*2.1;ctx.globalAlpha=Math.min(.65,i/14);ctx.beginPath();ctx.moveTo(500-i*18,y);ctx.lineTo(500+i*18,y);ctx.stroke();}ctx.globalAlpha=1;}const me=state.players[myId||'host']||state.players.host;cameraOffset={x:0,y:0};
    const ground=window.heroGround;
    const mapped=(obj,fn,baseHeight=86,sole=4,size=window.heroCharacterSize(obj))=>{const q={...ground.sample(state.round,obj.x,obj.y,W,H)};q.height*=size;const scale=q.height/baseHeight;ground.shadow(ctx,q,q.height,ground.lift(obj,q.height));ctx.save();ctx.translate(q.x,q.y);ctx.scale(scale,scale);ctx.translate(-obj.x,-obj.y-sole);fn();ctx.restore();};
    if(state.clinic&&state.round===1)mapped(state.clinic,drawClinic,150,0,1);
    for(const c of state.civilians){if(c.saved)continue;const q=ground.sample(state.round,c.x,c.y,W,H);ctx.fillStyle='#85ffd4';ctx.font='bold 19px sans-serif';ctx.textAlign='center';ctx.fillText('+',q.x,q.y);}
    const actors=[];
    for(const h of state.hammerers)if(!h.dead)actors.push({y:h.y,fn:()=>mapped(h,()=>drawHammerer(h),86,5.5)});
    for(const g of state.goons)actors.push({y:g.y,fn:()=>mapped(g,()=>drawSkeleton(g),76,24.5)});
    if(state.caster&&!state.caster.dead)actors.push({y:state.caster.y,fn:()=>mapped(state.caster,drawBonecaller,108,29)});
    actors.push({y:state.bossY,fn:()=>mapped({x:state.bossX,y:state.bossY},drawBoss,state.giant?130:86,4)});
    for(const p of Object.values(state.players))actors.push({y:p.y,fn:()=>{if(p.hero==='ecal'){const q=ground.sample(state.round,p.x,p.y,W,H);window.drawEcalCharacter?.(ctx,p,q.x,q.y,q.height*window.heroCharacterSize(p),performance.now()/1000);}else mapped(p,()=>drawRPGHero(p),p.id===(myId||'host')?105:78,4);}});
    actors.sort((a,b)=>a.y-b.y).forEach(a=>a.fn());
    for(const p of Object.values(state.players))ground.bolts(ctx,p,state.round,W,H);
    window.heroMeteorHazards?.draw(ctx,state,W,H);
    for(const s of state.shots){const q=ground.sample(state.round,s.x,s.y,W,H);ctx.fillStyle=s.type==='wand'?'#ff4a72':'#ff7c48';ctx.beginPath();ctx.arc(q.x,q.y-q.height*.42,6,0,Math.PI*2);ctx.fill();}
    if(arenaTarget){const q=ground.sample(state.round,arenaTarget.x,arenaTarget.y,W,H);ctx.strokeStyle='#ffe19a';ctx.beginPath();ctx.ellipse(q.x,q.y,12,4,0,0,Math.PI*2);ctx.stroke();}
    if(state.futureWorld&&!snowLevel&&!window.heroBackdrop?.ready(state.round)){const t=performance.now()/1000;ctx.save();ctx.globalAlpha=.9;for(let i=0;i<3;i++){const x=((t*(68+i*24)+i*350)%(W+100))-50,y=72+i*73+Math.sin(t*1.7+i)*12;ctx.fillStyle='#102c48';ctx.strokeStyle='#65e8ff';ctx.shadowColor='#3bcfff';ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(x-26,y);ctx.lineTo(x-12,y-6);ctx.lineTo(x+20,y-5);ctx.lineTo(x+31,y);ctx.lineTo(x+14,y+6);ctx.lineTo(x-18,y+5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#aef7ff';ctx.fillRect(x-8,y-1,7,2);ctx.fillStyle='#2dcaff';ctx.fillRect(x-41,y-1,12,3);}ctx.shadowBlur=0;ctx.globalAlpha=.36;ctx.strokeStyle='#6bdfff';ctx.lineWidth=1;for(let i=0;i<68;i++){const x=(i*139)%W,y=(i*83+t*(250+i%4*40))%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+13);ctx.stroke();}ctx.restore();}ctx.fillStyle='#e8f7ff';ctx.font='800 9px DM Sans';ctx.textAlign='left';ctx.fillText((['','FALLEN CITADEL','FROZEN FUTURE','HOME VILLAGE','SHATTERED FUTURE','DARK WARRIOR THRONE'][Math.min(state.round,5)]||'SHATTERED WORLD')+'  ·  CIVILIANS SAFE: '+state.civilians.filter(c=>c.saved).length+' / 3',18,H-14);}
  draw=drawThirdPerson;
  const skeletonWithDepth=drawSkeleton;drawSkeleton=function(g){const me=state?.players[myId==='host'?'host':myId]||state?.players.host,depth=me?Math.max(.72,Math.min(1.3,.94+(g.y-me.y)*.00065)):1;ctx.save();ctx.translate(g.x,g.y);ctx.scale(depth,depth);skeletonWithDepth({...g,x:0,y:0});ctx.restore();};
  // Keep the existing networked game state authoritative while rendering its actors in a true 3D scene.
  const previousAct = act;
  act = function(p, kind) { if (kind === 'helmet') { p.helmet = !p.helmet; p.action = 'helmet'; p.actionTime = .8; say(p.helmet ? 'MASK ON · LASER READY' : 'MASK REMOVED'); const maskLabel = $('[data-action=\"helmet\"] small'); if (maskLabel) maskLabel.textContent = p.helmet ? 'REMOVE MASK' : 'PUT ON MASK'; broadcast(); return; } previousAct(p, kind); };
  function canClimbAt(p){return (p.x<245&&p.y>150&&p.y<430)||(p.x>810&&p.y>145&&p.y<525)||(p.y<150&&p.x>285&&p.x<735);}
  const actionBeforeClimb=act;
  act=function(p,kind){if(kind==='climb'){if(p.hero!=='wildclaw'){say('Only Wildclaw can climb buildings');return;}if(p.climbActive){p.climbActive=false;p.climbing=false;say('WILDCLAW DROPS DOWN');}else if(canClimbAt(p)){p.climbActive=true;p.climbing=true;p.climbHeight=p.climbHeight||0;say('WILDCLAW CLIMBS! MOVE UP TO SCALE THE WALL');}else say('MOVE BESIDE A BUILDING FIRST');$('#abilityGrid [data-action=climb]')?.classList.toggle('pressed',!!p.climbActive);broadcast();return;}actionBeforeClimb(p,kind);};
  const controlsBeforeClimb=renderControls;
  renderControls=function(){controlsBeforeClimb();const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;if(hero==='wildclaw')$('#gameTip').innerHTML='MOVE PAD FOR ALL DIRECTIONS <span>·</span> C CLIMB AT A BUILDING <span>·</span> MOVE UP TO SCALE <span>·</span> SPACE PUNCH / FIRE FIST';let b=$('#abilityGrid [data-action=climb]');if(hero==='wildclaw'){if(!b){b=document.createElement('button');b.className='ability climb';b.dataset.action='climb';b.innerHTML='<span>🧗</span><small>CLIMB · C</small>';$('#abilityGrid').appendChild(b);}b.classList.toggle('pressed',!!state?.players[myId==='host'?'host':myId]?.climbActive);}else b?.remove();};
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='c'&&!e.repeat){const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;if(hero==='wildclaw')action('climb');}});
  const keyboardBeforeControls=renderControls;
  const shortcutByAction={punch:'SPACE',kick:'K',jump:'J',slam:'R',blast:'E',helmet:'R',laser:'Q',run:'CTRL',dodge:'SHIFT',fly:'F',block:'B',weapon:'H',climb:'C'};
  renderControls=function(){keyboardBeforeControls();const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;$('#keyboardHelp').innerHTML=hero==='wildclaw'?'<kbd>W A S D</kbd> MOVE <kbd>SPACE</kbd> PUNCH <kbd>K</kbd> KICK <kbd>E</kbd> JUMP <kbd>R</kbd> SLAM <kbd>C</kbd> CLIMB <kbd>SHIFT</kbd> DODGE <kbd>CTRL</kbd> RUN':'<kbd>W A S D</kbd> MOVE <kbd>SPACE</kbd> PUNCH <kbd>K</kbd> KICK <kbd>J</kbd> JUMP <kbd>E</kbd> BLAST <kbd>R</kbd> MASK <kbd>Q</kbd> LASER <kbd>SHIFT</kbd> DODGE <kbd>CTRL</kbd> RUN';if(hero==='guardian')$('#keyboardHelp').insertAdjacentHTML('beforeend',' <kbd>F</kbd> FLY');$('#keyboardHelp').insertAdjacentHTML('beforeend',' <kbd>B</kbd> BLOCK <kbd>H</kbd> WEAPON');$$('#abilityGrid [data-action]').forEach(button=>{const kind=button.dataset.action,key=shortcutByAction[kind];if(!key||button.hidden)return;const label=button.querySelector('small')?.textContent||kind.toUpperCase();const mark=key+'|'+label;if(button.dataset.keyLabel===mark)return;button.dataset.keyLabel=mark;button.innerHTML='<kbd>'+key+'</kbd><small>'+label+'</small>';});};
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='k'&&!e.repeat)action('kick');});
  const actionBeforeSolarNova=act;
  act=function(p,kind){if(kind!=='solarNova'){actionBeforeSolarNova(p,kind);return;}if(!state||state.phase!=='game'||state.intro)return;if(p.hero!=='guardian'){say('SOLAR NOVA IS RED DAWN\'S POWER');return;}const now=performance.now(),cooldownKey=p.id+'solarNova';if(actionCooldown[cooldownKey]&&now-actionCooldown[cooldownKey]<9000){say('SOLAR NOVA IS RECHARGING');return;}actionCooldown[cooldownKey]=now;p.action='solarNova';p.actionTime=1.05;playCombatSound('blast');say('RED DAWN: SOLAR NOVA!');let hits=0;for(const h of state.hammerers||[]){const d=Math.hypot(h.x-p.x,h.y-p.y);if(!h.dead&&d<260){h.hp-=28;hits++;if(h.hp<=0){h.dead=true;p.score+=8;earnHealth(p,15);}else{const dx=h.x-p.x,dy=h.y-p.y,n=Math.hypot(dx,dy)||1;h.x=Math.max(34,Math.min(W-34,h.x+dx/n*55));h.y=Math.max(window.heroTravelProjection?-18000:82,Math.min(H-36,h.y+dy/n*55));}}}for(const g of [...state.goons])if(Math.hypot(g.x-p.x,g.y-p.y)<260){state.goons=state.goons.filter(q=>q!==g);hits++;p.score+=3;earnHealth(p,10);}if(state.caster&&!state.caster.dead&&Math.hypot(state.caster.x-p.x,state.caster.y-p.y)<260){state.caster.hp-=24;hits++;if(state.caster.hp<=0){state.caster.hp=0;state.caster.dead=true;p.score+=10;earnHealth(p,20);}}if(state.burialDone&&!state.players.host.buried&&Math.hypot(state.bossX-p.x,state.bossY-p.y)<270){if(state.bossBlock>0)say('MR. MISFIT BLOCKS THE NOVA!');else{state.boss=Math.max(0,state.boss-18);hits++;p.score+=8;if(state.boss<36)state.giant=true;if(state.boss<=0){state.roundEnded=true;state.roundReason='BOSS DOWN';}}}if(hits)say('SOLAR NOVA HITS '+hits+' ENEM'+(hits===1?'Y':'IES')+'!');broadcast();};
  const empoweredAct=act;
  act=function(p,kind){if(p.hero!=='guardian'||!['punch','kick','blast','laser','dodge','fly'].includes(kind)){empoweredAct(p,kind);return;}if(kind==='laser'&&!p.helmet){empoweredAct(p,kind);return;}const now=performance.now(),cooldowns={punch:130,kick:230,blast:520,laser:700,dodge:460,fly:350},key=p.id+'redDawn'+kind;if(actionCooldown[key]&&now-actionCooldown[key]<cooldowns[kind])return;actionCooldown[key]=now;delete actionCooldown[p.id+kind];
    // A close Red Dawn punch targets Misfit directly, even with nearby minions.
    if(kind==='punch'&&state?.phase==='game'&&!state.intro&&!state.ashenTransition&&!state.roundEnded&&[1,2,4].includes(state.round)&&!p.buried&&state.boss>0&&Math.hypot(state.bossX-p.x,state.bossY-p.y)<150){
      p.action='punch';p.actionTime=.3;p.face=Math.atan2(state.bossX-p.x,p.y-state.bossY);
      const damage=state.bossBlock>0?12:25;
      state.boss=Math.max(0,state.boss-damage);p.score+=6;
      playCombatSound('punch');say('RED DAWN HITS MR. MISFIT · −'+damage+' HEALTH');
      if(state.boss<36)state.giant=true;
      if(state.boss<=0){p.score+=12;earnHealth(p,25);state.roundEnded=true;state.roundReason='BOSS DOWN';}
      renderHUD();broadcast();return;
    }
    const bossBefore=state.boss,casterBefore=state.caster?.hp,hammerBefore=(state.hammerers||[]).map(h=>[h,h.hp]),goonBefore=(state.goons||[]).map(g=>[g,g.hp]);empoweredAct(p,kind);if(kind==='dodge'){p.dodge=.7;p.actionTime=.5;}if(kind==='fly')p.flightHeight=p.flying?4.5:0;if(['punch','kick','blast','laser'].includes(kind)){const boost=kind==='punch'?15:kind==='laser'?1.2:kind==='kick'?.65:.55;if(state.boss<bossBefore){const extra=Math.round((bossBefore-state.boss)*boost);state.boss=Math.max(0,state.boss-extra);p.score+=2;if(state.boss<=0&&!state.roundEnded){p.score+=12;earnHealth(p,25);state.roundEnded=true;state.roundReason='BOSS DOWN';}}if(state.caster&&casterBefore>state.caster.hp&&!state.caster.dead){state.caster.hp=kind==='punch'?0:state.caster.hp-Math.round((casterBefore-state.caster.hp)*boost);if(state.caster.hp<=0){state.caster.hp=0;state.caster.dead=true;p.score+=5;earnHealth(p,20);}}for(const [h,hp] of hammerBefore)if(!h.dead&&hp>h.hp){h.hp=kind==='punch'?0:h.hp-Math.round((hp-h.hp)*boost);if(h.hp<=0){h.hp=0;h.dead=true;earnHealth(p,15);say('TWIN HAMMERER DEFEATED!');}}for(const [g,hp] of goonBefore)if(state.goons.includes(g)&&hp>g.hp){g.hp=kind==='punch'?0:g.hp-Math.round((hp-g.hp)*boost);if(g.hp<=0){state.goons=state.goons.filter(q=>q!==g);earnHealth(p,10);}}}broadcast();};
  const baseSim=simulate;simulate=function(dt){const dodging=Object.values(state?.players||{}).filter(p=>p.hero==='guardian'&&p.dodge>0&&!p.cometDash&&!p.buried).map(p=>[p,p.fx||0,p.fy||0]);baseSim(dt);for(const [p,dx,dy] of dodging){const length=Math.hypot(dx,dy);if(!length)continue;p.x=Math.max(34,Math.min(W-34,p.x+dx/length*210*dt));p.y=Math.max(window.heroTravelProjection?-18000:82,Math.min(H-36,p.y+dy/length*210*dt));}};
  const actBeforeExtraPowers=act;
  act=function(p,kind){
    if(!['starbolt','cometRush'].includes(kind)){actBeforeExtraPowers(p,kind);return;}
    if(!state||state.phase!=='game'||state.intro||p.hero!=='guardian')return;
    const now=performance.now(),cooldown=kind==='starbolt'?3800:3200,key=p.id+kind;
    if(actionCooldown[key]&&now-actionCooldown[key]<cooldown){say(kind==='starbolt'?'STARBOLT RECHARGING':'COMET RUSH RECHARGING');return;}
    actionCooldown[key]=now;p.action=kind;p.actionTime=kind==='starbolt'?.6:.42;playCombatSound(kind==='starbolt'?'blast':'fly');
    if(kind==='starbolt'){
      const targets=[];
      for(const h of state.hammerers||[])if(!h.dead)targets.push({type:'hammerer',ref:h,x:h.x,y:h.y});
      for(const g of state.goons||[])targets.push({type:'goon',ref:g,x:g.x,y:g.y});
      if(state.caster&&!state.caster.dead)targets.push({type:'caster',ref:state.caster,x:state.caster.x,y:state.caster.y});
      if(state.burialDone&&!state.players.host.buried)targets.push({type:'boss',x:state.bossX,y:state.bossY});
      const target=targets.filter(t=>Math.hypot(t.x-p.x,t.y-p.y)<470).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
      if(!target){say('NO ENEMY IN STARBOLT RANGE');return;}
      if(target.type==='hammerer'){target.ref.hp-=34;if(target.ref.hp<=0){target.ref.dead=true;p.score+=9;earnHealth(p,15);}}
      else if(target.type==='goon'){state.goons=state.goons.filter(g=>g!==target.ref);p.score+=5;}
      else if(target.type==='caster'){target.ref.hp-=38;if(target.ref.hp<=0){target.ref.hp=0;target.ref.dead=true;p.score+=12;earnHealth(p,20);}}
      else if(state.bossBlock>0)say('MR. MISFIT BLOCKS THE STARBOLT!');
      else{state.boss=Math.max(0,state.boss-22);p.score+=9;if(state.boss<36)state.giant=true;if(state.boss<=0){state.roundEnded=true;state.roundReason='BOSS DOWN';}}
      p.starboltTarget={x:target.x,y:target.y,until:now+500};say('STARBOLT STRIKES!');
    }else{
      let dx=p.fx||0,dy=p.fy||0;
      if(Math.hypot(dx,dy)<.1){const near=[...(state.hammerers||[]).filter(h=>!h.dead),...(state.goons||[]),...(state.caster&&!state.caster.dead?[state.caster]:[])].sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(near){dx=near.x-p.x;dy=near.y-p.y;}else{dx=0;dy=-1;}}
      const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const sx=p.x,sy=p.y,ex=Math.max(34,Math.min(W-34,sx+dx*190)),ey=Math.max(window.heroTravelProjection?-18000:82,Math.min(H-36,sy+dy*190));p.cometDash={dx,dy,remaining:.24};p.dodge=.34;
      const distance=(x,y)=>{const vx=ex-sx,vy=ey-sy,t=Math.max(0,Math.min(1,((x-sx)*vx+(y-sy)*vy)/(vx*vx+vy*vy||1)));return Math.hypot(x-(sx+t*vx),y-(sy+t*vy));};let hits=0;
      for(const h of state.hammerers||[])if(!h.dead&&distance(h.x,h.y)<85){h.hp-=24;hits++;if(h.hp<=0){h.dead=true;p.score+=7;earnHealth(p,15);}}
      for(const g of [...state.goons])if(distance(g.x,g.y)<85){state.goons=state.goons.filter(q=>q!==g);hits++;p.score+=3;earnHealth(p,10);}
      if(state.caster&&!state.caster.dead&&distance(state.caster.x,state.caster.y)<85){state.caster.hp-=24;hits++;if(state.caster.hp<=0){state.caster.hp=0;state.caster.dead=true;p.score+=10;earnHealth(p,20);}}
      if(state.burialDone&&!state.players.host.buried&&distance(state.bossX,state.bossY)<95){if(state.bossBlock>0)say('MR. MISFIT BLOCKS THE COMET RUSH!');else{state.boss=Math.max(0,state.boss-16);hits++;p.score+=8;if(state.boss<=0){state.roundEnded=true;state.roundReason='BOSS DOWN';}}}
      say(hits?'COMET RUSH! '+hits+' ENEMY HITS':'COMET RUSH!');
    }
    broadcast();
  };
  const simBeforeComet=simulate;
  simulate=function(dt){const dashes=Object.values(state?.players||{}).filter(p=>p.cometDash?.remaining>0&&!p.buried).map(p=>[p,p.fx,p.fy]);for(const [p] of dashes){p.fx=0;p.fy=0;}simBeforeComet(dt);for(const [p,fx,fy] of dashes){p.fx=fx;p.fy=fy;const dash=p.cometDash;if(!dash)continue;p.x=Math.max(34,Math.min(W-34,p.x+dash.dx*620*dt));p.y=Math.max(window.heroTravelProjection?-18000:82,Math.min(H-36,p.y+dash.dy*620*dt));dash.remaining-=dt;if(dash.remaining<=0)p.cometDash=null;}};
  const controlsBeforeExtraPowers=renderControls;
  renderControls=function(){controlsBeforeExtraPowers();const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;if(hero!=='guardian')return;const grid=$('#abilityGrid');for(const [kind,key,label] of [['starbolt','Z','STARBOLT'],['cometRush','V','COMET RUSH']])if(!$('#abilityGrid [data-action="'+kind+'"]')){const button=document.createElement('button');button.className='ability '+kind;button.dataset.action=kind;button.innerHTML='<kbd>'+key+'</kbd><small>'+label+'</small>';grid.appendChild(button);}$('#keyboardHelp').insertAdjacentHTML('beforeend',' <kbd>Z</kbd> STARBOLT <kbd>V</kbd> COMET RUSH');};
  window.addEventListener('keydown',e=>{if(e.repeat)return;const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;if(hero!=='guardian')return;if(e.key.toLowerCase()==='z')action('starbolt');if(e.key.toLowerCase()==='v')action('cometRush');});
  const controlsBeforeNova=renderControls;
  renderControls=function(){controlsBeforeNova();const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice,grid=$('#abilityGrid'),present=$('#abilityGrid [data-action="solarNova"]');if(hero==='guardian'){if(!present){const button=document.createElement('button');button.className='ability solar-nova';button.dataset.action='solarNova';button.innerHTML='<kbd>X</kbd><small>SOLAR NOVA</small>';grid.appendChild(button);}$('#keyboardHelp').insertAdjacentHTML('beforeend',' <kbd>X</kbd> SOLAR NOVA');}else present?.remove();};
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='x'&&!e.repeat){const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;if(hero==='guardian')action('solarNova');}});
  // Lizard Warrior: the sword is always equipped and drives a fast, fully networked melee attack.
  const actBeforeLizard=act;
  act=function(p,kind){
    if(p.hero!=='lizard'||!['swordSlice','weapon'].includes(kind)){actBeforeLizard(p,kind);return;}
    if(!state||state.phase!=='game'||state.intro)return;
    p.weaponHeld=true;
    if(kind==='weapon'){say('THE LIZARD WARRIOR\'S FROST SWORD IS READY');return;}
    const now=performance.now(),cooldownKey=p.id+'swordSlice';
    if(actionCooldown[cooldownKey]&&now-actionCooldown[cooldownKey]<330)return;
    actionCooldown[cooldownKey]=now;
    p.action='swordSlice';p.actionTime=.58;p.swordCombo=((p.swordCombo||0)+1)%3;p.swordTrailUntil=now+580;
    playCombatSound('kick');
    const range=205;let hits=0,defeated=0;
    for(const h of state.hammerers||[]){
      if(h.dead||Math.hypot(h.x-p.x,h.y-p.y)>range)continue;
      h.hp-=95;hits++;p.score+=7;
      if(h.hp<=0){h.dead=true;defeated++;p.score+=5;earnHealth(p,15);}
    }
    for(const g of [...state.goons]){
      if(Math.hypot(g.x-p.x,g.y-p.y)>range)continue;
      state.goons=state.goons.filter(enemy=>enemy!==g);hits++;defeated++;p.score+=5;earnHealth(p,10);
    }
    if(state.caster&&!state.caster.dead&&Math.hypot(state.caster.x-p.x,state.caster.y-p.y)<=range){
      state.caster.hp-=120;hits++;p.score+=8;
      if(state.caster.hp<=0){state.caster.hp=0;state.caster.dead=true;defeated++;p.score+=8;earnHealth(p,20);}
    }
    if(state.burialDone&&!state.players.host.buried&&Math.hypot(state.bossX-p.x,state.bossY-p.y)<=range+20){
      if(state.bossBlock>0){state.bossBlock=0;say('FROST SWORD BREAKS THE '+(state.round===5?'DARK WARRIOR\'S':'MR. MISFIT\'S')+' GUARD!');}
      state.boss=Math.max(0,state.boss-32);hits++;p.score+=10;
      if(state.boss<36)state.giant=true;
      if(state.boss<=0&&!state.roundEnded){defeated++;p.score+=15;earnHealth(p,25);state.roundEnded=true;state.roundReason='BOSS DOWN';}
    }
    state.danger=Math.max(0,state.danger-Math.min(4,hits));
    say(hits?'FROST SWORD SLICE · '+hits+' HIT'+(hits===1?'':'S')+(defeated?' · '+defeated+' DOWN':''):'FROST SWORD CUTS THE AIR');
    broadcast();
  };
  const actionBeforeLizard=action;
  action=function(kind){if(kind==='swordSlice'&&!isHost)playCombatSound('kick');actionBeforeLizard(kind);};
  const controlsBeforeLizard=renderControls;
  renderControls=function(){
    controlsBeforeLizard();
    const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice,grid=$('#abilityGrid'),slice=$('#abilityGrid [data-action="swordSlice"]');
    if(hero!=='lizard'){slice?.remove();return;}
    for(const kind of ['punch','blast','helmet','laser','weapon','fly','climb','starbolt','cometRush','solarNova'])$('#abilityGrid [data-action="'+kind+'"]')?.remove();
    if(!slice){const button=document.createElement('button');button.className='ability sword-slice';button.dataset.action='swordSlice';button.innerHTML='<kbd>SPACE / X</kbd><small>FROST SWORD SLICE</small>';grid.prepend(button);}
    $('#gameTip').innerHTML='MOVE PAD FOR ALL DIRECTIONS <span>·</span> SPACE OR X SWORD SLICE <span>·</span> J JUMP <span>·</span> K KICK <span>·</span> SHIFT DODGE <span>·</span> CTRL RUN';
    $('#keyboardHelp').innerHTML='<kbd>W A S D</kbd> MOVE <kbd>SPACE / X</kbd> SWORD SLICE <kbd>J</kbd> JUMP <kbd>K</kbd> KICK <kbd>SHIFT</kbd> DODGE <kbd>CTRL</kbd> RUN <kbd>B</kbd> BLOCK';
  };
  window.addEventListener('keydown',e=>{if(e.repeat||e.key.toLowerCase()!=='x')return;const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;if(hero==='lizard')action('swordSlice');});
  // Ecal's two blasters fire together. Keep hero bolts separate from hostile shots.
  function ecalImpact(p,x,y){p.ecalImpacts=(p.ecalImpacts||[]).filter(v=>Date.now()-v.at<750).slice(-15);p.ecalImpacts.push({x,y,at:Date.now()});playPunchImpact(true);}
  function ecalTargets(p){const list=[];for(const h of state.hammerers||[])if(!h.dead)list.push({id:h.id||'hammer'+state.hammerers.indexOf(h),type:'hammerer',ref:h,x:h.x,y:h.y});for(const g of state.goons||[])list.push({id:g.id||'goon'+state.goons.indexOf(g),type:'goon',ref:g,x:g.x,y:g.y});if(state.caster&&!state.caster.dead)list.push({id:'caster',type:'caster',ref:state.caster,x:state.caster.x,y:state.caster.y});if(state.burialDone&&state.boss>0)list.push({id:'boss',type:'boss',x:state.bossX,y:state.bossY});return list.filter(t=>Math.hypot(t.x-p.x,t.y-p.y)<650).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));}
  const actBeforeEcal=act;
  act=function(p,kind){
    if(p.hero!=='ecal'){actBeforeEcal(p,kind);return;}
    if(!state||state.phase!=='game'||state.intro||p.buried)return;
    if(kind==='ecalLock'||kind==='ecalSwitch'){
      const list=ecalTargets(p);if(!list.length){p.ecalLock=null;say('NO TARGET IN RANGE');return;}
      if(kind==='ecalLock'&&p.ecalLock){p.ecalLock=null;say('AIM RELEASED');return;}
      const index=kind==='ecalSwitch'?(list.findIndex(t=>t.id===p.ecalLock)+1)%list.length:0;const target=list[index];p.ecalLock=target.id;p.ecalAim={x:target.x,y:target.y};p.ecalRaised=true;say('ECAL · TARGET LOCKED');broadcast();return;
    }
    const skill=['ecalHeavy','ecalPrecision','ecalDive','ecalFlip','ecalSpin','ecalAirKick'].includes(kind);
    if(skill){
      const now=performance.now(),key=p.id+kind,cooldown=kind==='ecalHeavy'?280:kind==='ecalPrecision'?700:kind==='ecalDive'?420:650;
      if(actionCooldown[key]&&now-actionCooldown[key]<cooldown)return;actionCooldown[key]=now;
      const melee=kind==='ecalHeavy'||kind==='ecalAirKick',list=ecalTargets(p),target=list.find(t=>t.id===p.ecalLock)||list[0];
      const duration=kind==='ecalHeavy'?.32:kind==='ecalDive'?.48:kind==='ecalFlip'?.72:.56;p.ecalSkill={kind,age:0,duration,side:(p.ecalMoveSide=-(p.ecalMoveSide||-1)),dx:p.fx||Math.sin(p.moveYaw||0),dy:p.fy||Math.cos(p.moveYaw||0)};
      p.action=melee?'punch':'ecalBlast';p.actionTime=duration;p.ecalRaised=!melee;p.ecalBolts=[];
      if(!melee)p.ecalShotId=(p.ecalShotId||0)+1;else playPunchImpact(true);
      if(kind!=='ecalHeavy'&&kind!=='ecalPrecision')p.dodge=.7;
      const selected=kind==='ecalSpin'?list.slice(0,4):target?[target]:[];
      for(const t of selected){if(melee&&Math.hypot(t.x-p.x,t.y-p.y)>145)continue;
        p.ecalAim={x:t.x,y:t.y};if(!melee){p.ecalBolts.push({x:t.x,y:t.y});ecalImpact(p,t.x,t.y);}
        if(t.type==='boss'){state.boss=Math.max(0,state.boss-(melee?32:kind==='ecalPrecision'?38:18));if(state.boss<=0){state.roundEnded=true;state.roundReason='BOSS DOWN';}}
        else{t.ref.hp-=melee?100:kind==='ecalPrecision'?80:34;if(t.ref.hp<=0){t.ref.hp=0;t.ref.dead=true;if(t.type==='goon')state.goons=state.goons.filter(g=>g!==t.ref);p.score+=8;earnHealth(p,10);}}
      }
      if(!melee&&!p.ecalBolts.length){const n=Math.hypot(p.ecalSkill.dx,p.ecalSkill.dy)||1;p.ecalBolts=[-1,1].map(side=>({x:p.x+p.ecalSkill.dx/n*300+side*90,y:p.y+p.ecalSkill.dy/n*300}));}
      broadcast();return;
    }
    if(kind==='ecalRaise'||kind==='weapon'){p.ecalRaised=!p.ecalRaised;p.weaponHeld=true;say(p.ecalRaised?'ECAL · BLASTERS RAISED':'ECAL · BLASTERS LOWERED');broadcast();return;}
    if(['helmet','laser','blast','fly','slam','firePunch','starbolt','cometRush','solarNova','swordSlice','climb'].includes(kind))return;
    if(kind==='dodge'){act(p,'ecalDive');return;}
    if(!['ecalBlast','punch'].includes(kind)){actBeforeEcal(p,kind);return;}
    const now=performance.now(),key=p.id+'ecalBlast';
    if(actionCooldown[key]&&now-actionCooldown[key]<200)return;
    actionCooldown[key]=now;p.weaponHeld=true;p.blocking=false;p.action='ecalBlast';p.actionTime=.34;p.ecalRaised=true;p.ecalShotId=(p.ecalShotId||0)+1;
    const targets=[];
    for(const h of state.hammerers||[])if(!h.dead)targets.push({type:'hammerer',ref:h,x:h.x,y:h.y});
    for(const g of state.goons||[])targets.push({type:'goon',ref:g,x:g.x,y:g.y});
    if(state.caster&&!state.caster.dead)targets.push({type:'caster',ref:state.caster,x:state.caster.x,y:state.caster.y});
    if(state.burialDone&&!state.players.host.buried&&state.boss>0)targets.push({type:'boss',x:state.bossX,y:state.bossY});
    const inRange=targets.filter(t=>Math.hypot(t.x-p.x,t.y-p.y)<410).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
    let dx=p.fx||Math.sin(p.face||0),dy=p.fy||-Math.cos(p.face||0),length=Math.hypot(dx,dy)||1;
    dx/=length;dy/=length;p.ecalBolts=[];
    let defeated=0;
    for(let hand=0;hand<2;hand++){
      const locked=ecalTargets(p).find(t=>t.id===p.ecalLock);const target=locked||inRange[Math.min(hand,inRange.length-1)];
      if(!target){p.ecalBolts.push({x:p.x+dx*340,y:p.y+dy*340});continue;}
      p.ecalBolts.push({x:target.x,y:target.y});ecalImpact(p,target.x,target.y);
      if(hand===0){p.face=Math.atan2(target.x-p.x,p.y-target.y);p.ecalAim={x:target.x,y:target.y};}
      if(target.type==='boss'){
        if(state.bossBlock<=0){state.boss=Math.max(0,state.boss-10);p.score+=4;if(state.boss<36)state.giant=true;}
        if(state.boss<=0&&!state.roundEnded){p.score+=15;earnHealth(p,25);state.roundEnded=true;state.roundReason='BOSS DOWN';defeated++;}
      }else if(target.type==='goon'){
        if(state.goons.includes(target.ref)){target.ref.hp-=2;p.score+=2;if(target.ref.hp<=0){state.goons=state.goons.filter(g=>g!==target.ref);earnHealth(p,10);defeated++;}}
      }else if(!target.ref.dead){
        target.ref.hp-=26;p.score+=4;
        if(target.ref.hp<=0){target.ref.hp=0;target.ref.dead=true;p.score+=8;earnHealth(p,target.type==='caster'?20:15);defeated++;}
      }
    }
    if(!inRange.length)p.ecalAim={x:p.x+dx*340,y:p.y+dy*340};
    if(defeated)say('ECAL · TWIN BLASTERS · '+defeated+' ENEM'+(defeated===1?'Y':'IES')+' DOWN');
    broadcast();
  };
  const controlsBeforeEcal=renderControls;
  renderControls=function(){
    controlsBeforeEcal();
    const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice,grid=$('#abilityGrid');
    if(hero!=='ecal'){grid.querySelectorAll('[data-action^="ecal"]').forEach(b=>b.remove());return;}
    const allowed=new Set(['ecalHeavy','ecalPrecision','ecalLock','ecalSwitch','ecalDive','ecalFlip','ecalSpin','ecalAirKick','ecalRaise','ecalBlast','kick','jump','dodge','run','block']);
    for(const button of grid.querySelectorAll('[data-action]'))if(!allowed.has(button.dataset.action))button.remove();
    if(!$('#abilityGrid [data-action="ecalBlast"]')){const button=document.createElement('button');button.className='ability ecal-blast';button.dataset.action='ecalBlast';button.innerHTML='<kbd>SPACE / E</kbd><small>TWIN BLASTERS</small>';grid.prepend(button);}
    if(!$('#abilityGrid [data-action="ecalRaise"]')){const b=document.createElement('button');b.className='ability';b.dataset.action='ecalRaise';b.innerHTML='<kbd>L</kbd><small>RAISE / LOWER BLASTERS</small>';grid.prepend(b);}
    for(const [kind,label] of [['ecalHeavy','HEAVY PUNCH'],['ecalLock','LOCK AIM'],['ecalSwitch','SWITCH TARGET'],['ecalPrecision','PRECISION SHOT'],['ecalDive','SIDE DIVE'],['ecalFlip','FLIP SHOT'],['ecalSpin','SPIN BURST'],['ecalAirKick','AIR KICK']])if(!grid.querySelector('[data-action="'+kind+'"]')){const b=document.createElement('button');b.className='ability';b.dataset.action=kind;b.innerHTML='<span>✦</span><small>'+label+'</small>';grid.appendChild(b);}
    $('#gameTip').innerHTML='L RAISE / LOWER BLASTERS <span>·</span> TAP SPECIAL BUTTONS TO DIVE, FLIP, SPIN OR LOCK AIM <span>·</span> SPACE OR E TWIN BLASTERS <span>·</span> J JUMP <span>·</span> K KICK <span>·</span> SHIFT QUICK DODGE <span>·</span> B BLOCK';
    $('#keyboardHelp').innerHTML='<kbd>L</kbd> RAISE / LOWER ARMS <kbd>W A S D</kbd> MOVE <kbd>SPACE / E</kbd> TWIN BLASTERS <kbd>J</kbd> JUMP <kbd>K</kbd> KICK <kbd>SHIFT</kbd> DODGE <kbd>CTRL</kbd> RUN <kbd>B</kbd> BLOCK';
  };
  window.addEventListener('keydown',e=>{if(e.repeat||e.key.toLowerCase()!=='e')return;const hero=state?.players[myId==='host'?'host':myId]?.hero||heroChoice;if(hero==='ecal')action('ecalBlast');});
  window.addEventListener('keydown',e=>{if(e.repeat||e.key.toLowerCase()!=='l'||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const p=state?.players[myId||'host'];if(p?.hero==='ecal'){e.preventDefault();action('ecalRaise');}});
  const ecalSounds=Array.from({length:4},()=>{const a=new Audio('assets/ecal-blast.m4a');a.preload='auto';a.volume=.7;return a;});
  let ecalSoundCursor=0;const heardEcalShots=new Map();let ecalSoundState=null;
  function hearEcalBlasters(){requestAnimationFrame(hearEcalBlasters);if(!state||state.phase!=='game'||state.intro){ecalSounds.forEach(a=>a.pause());heardEcalShots.clear();return;}for(const p of [...Object.values(state.players),...(state.round===5&&state.finale?.ecal?[state.finale.ecal]:[]),...(state.ashenTransition?.ecal?[state.ashenTransition.ecal]:[])]){if(p.hero!=='ecal')continue;const shot=p.ecalShotId||0,old=heardEcalShots.get(p.id)||0;heardEcalShots.set(p.id,shot);if(shot>old){const a=ecalSounds[ecalSoundCursor++%ecalSounds.length];a.currentTime=0;a.play().catch(()=>{});}}}
  requestAnimationFrame(hearEcalBlasters);
  const simulateBeforeTrueVillain=simulate;
  simulate=function(dt){
    simulateBeforeTrueVillain(dt);
    if(state?.phase==='game'&&state.round===5&&!state.finalBoss){state.finalBoss=true;say('RED DAWN DEFEATS MR. MISFIT — BUT THE RED SKY REMAINS! THE DARK ARMORED WARRIOR IS THE TRUE VILLAIN!');broadcast();}
  };
  const simulateBeforeMeteors=simulate;
  simulate=function(dt){
    simulateBeforeMeteors(dt);
    if(isHost)window.heroMeteorHazards?.update(state,dt,p=>{if(p.id===(myId||'host'))say('FIRE ROCK HIT! DODGE THE GLOWING CIRCLES');});
    // Give each enemy its own standing room instead of piling up on one point.
    if(!state||state.phase!=='game'||state.intro||state.round!==1)return;
    const enemies=(state.hammerers||[]).filter(h=>!h.dead);
    for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++){
      const a=enemies[i],b=enemies[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d>=74||a.bossSmash||b.bossSmash)continue;
      const nx=d>.01?dx/d:1,ny=d>.01?dy/d:0,push=(74-d)*Math.min(.5,dt*4);
      a.x=Math.max(45,Math.min(955,a.x-nx*push));a.y=Math.max(window.heroTravelProjection?-18000:95,Math.min(560,a.y-ny*push));
      b.x=Math.max(45,Math.min(955,b.x+nx*push));b.y=Math.max(window.heroTravelProjection?-18000:95,Math.min(560,b.y+ny*push));
    }
  };
  const hudBeforeTrueVillain=renderHUD;
  renderHUD=function(){
    hudBeforeTrueVillain();
    if(!state)return;
    const bossTitle=$('.boss-meta b');
    if(bossTitle)bossTitle.textContent=state.round===5?'DARK ARMORED WARRIOR · TRUE MAIN VILLAIN':'MR. MISFIT · WORLD CONQUEROR';
    if(state.round===5)$('#bossPhase').textContent=state.darkEnraged?'ENRAGED':state.bossBlock>0?'DARK GUARD':'TRUE VILLAIN';
    window.updateDarkBossHUD?.(state);
  };
  const finishBeforeTrueVillain=finishUI;
  finishUI=function(){
    window.updateFinalWhiteout?.(state);
    finishBeforeTrueVillain();
    window.updateDarkBossHUD?.(state);
    if(state?.roundReason==='TIME UP'){$('#resultTitle').textContent='TIME RAN OUT';$('#resultCopy').textContent='The villain survived. Regroup and try again.';}
    if(state?.phase==='results'&&state.roundReason==='BOSS DOWN'&&state.finalBoss){$('#resultTitle').textContent='TRUE VILLAIN DEFEATED!';$('#resultCopy').textContent='Red Dawn defeated Mr. Misfit, then the heroes brought down the Dark Armored Warrior and ended his invasion.';}
  };
  // Keep all combat paused while each player watches or skips the movie after Rise Up.
  const actBeforeOpening = act, actionBeforeOpening = action;
  function finishOpeningIfReady() {
    if (!isHost || !state?.intro || !state.storyCinematic) return;
    if (!Object.values(state.players).every(player => player.openingDone)) return;
    // Finishing the movie is a game transition, not a hero combat action.
    // Ecal's combat guard correctly rejects actions while intro is true, so
    // routing continueStory through that guard left the Rise Up panel open.
    state.intro = false;
    state.storyCinematic = false;
    openingShown = false;
    renderHUD();
  }
  act = function(player, kind) {
    if (!state || state.phase !== 'game') return;
    if (kind === 'continueStory') {
      if (!state.intro || state.storyCinematic) return;
      state.storyCinematic = true;
      Object.values(state.players).forEach(hero => {
        hero.openingDone = false; hero.fx = 0; hero.fy = 0; hero.run = false;
      });
      renderHUD(); broadcast(); return;
    }
    if (kind === 'finishOpening') {
      if (!state.intro || !state.storyCinematic) return;
      player.openingDone = true;
      player.fx = 0; player.fy = 0; player.run = false;
      finishOpeningIfReady();
      broadcast(); return;
    }
    if (state.intro) return;
    actBeforeOpening(player, kind);
  };
  action = function(kind) {
    if (state?.intro && !['continueStory', 'finishOpening'].includes(kind)) return;
    actionBeforeOpening(kind);
  };
  $('#beginFight').addEventListener('keydown', event => {
    if (event.code !== 'Space') return;
    event.preventDefault(); event.stopPropagation();
    if (!event.repeat) $('#beginFight').click();
  });
  let heroCameraMode = 'third';
  window.heroCameraMode = () => heroCameraMode;
  $('#cameraToggle').addEventListener('click', () => {
    heroCameraMode = heroCameraMode === 'third' ? 'first' : heroCameraMode === 'first' ? 'front' : 'third';
    const labels = { first: 'VIEW · FIRST PERSON', front: 'VIEW · FRONT-FACING', third: 'VIEW · THIRD PERSON' };
    $('#cameraToggle').textContent = labels[heroCameraMode];
  });
  window.heroArena3DState = () => ({ state, playerId: myId || 'host' });
  // Remote players get smooth photo motion between authoritative network updates.
  let remoteDrawAt = 0;
  function animateRemoteScenery(now) {
    requestAnimationFrame(animateRemoteScenery);
    if (!isHost && state?.phase === 'game' && now - remoteDrawAt >= 1000 / 30 && !document.hidden && !window.heroOpeningIntroActive?.()) {
      draw(); remoteDrawAt = now;
    }
  }
  requestAnimationFrame(animateRemoteScenery);
  // The portrait renderer is shared by the canvas and CGI views, so Ecal keeps
  // his own design even when a browser cannot load the other heroes' models.
  function drawEcalInArena(p){
    const now=performance.now()/1000,isLocal=p.id===(myId||'host'),height=isLocal?142:130;
    if(window.drawEcalCharacter)window.drawEcalCharacter(ctx,p,p.x,p.y,height,now);
    const lift=p.jump>0?Math.sin(Math.max(0,Math.min(1,(.76-p.jump)/.76))*Math.PI)*height*.4:0;
    ctx.save();ctx.textAlign='center';ctx.font='800 9px DM Sans';ctx.fillStyle='#d9fbff';ctx.shadowColor='#06121e';ctx.shadowBlur=5;
    ctx.fillText(isLocal?'YOU · ECAL':p.name+' · ECAL',p.x,p.y-height-lift-8);ctx.shadowBlur=0;
    if(p.hp<100){ctx.fillStyle='#ffffff44';ctx.fillRect(p.x-19,p.y-height-lift-4,38,3);ctx.fillStyle='#62e3da';ctx.fillRect(p.x-19,p.y-height-lift-4,38*Math.max(0,p.hp)/100,3);}
    ctx.restore();
  }
  const rpgHeroBeforeEcal=drawRPGHero;
  drawRPGHero=function(p){if(p.hero==='ecal'){drawEcalInArena(p);return;}rpgHeroBeforeEcal(p);};
  const heroBeforeEcal=drawHero;
  drawHero=function(p){if(p.hero==='ecal'){drawEcalInArena(p);return;}heroBeforeEcal(p);};
  // The final victory is an authoritative timed sequence, before results.
  const simulateBeforeFinale=simulate,actBeforeFinale=act,moveBeforeFinale=move;
  function beginBossFinale(){
    if(state.finale)return;
    state.boss=0;state.roundEnded=false;state.roundReason='BOSS DOWN';
    state.finale={age:0};state.darkStrike=null;state.misfitMelee=null;state.shots=[];
    for(const p of Object.values(state.players)){
      p.fx=0;p.fy=0;p.run=false;p.action='';p.actionTime=0;p.dodge=0;p.jump=0;
      p.flying=false;p.flightHeight=0;p.climbing=false;p.cometDash=null;p.blocking=false;
    }
    if(state.round===5){
      // An Ecal ally performs the finisher when the chosen hero is someone else.
      const existing=Object.values(state.players).find(p=>p.hero==='ecal');
      const shooter=existing||{...state.players.host,id:'ecal-final-ally',name:'Ecal',hero:'ecal',hp:100,color:'#70ecff'};
      if(existing)state.finale.finisherId=existing.id;else state.finale.ecal=shooter;
      shooter.x=Math.max(65,Math.min(935,state.bossX-95));shooter.y=state.bossY+110;
      shooter.fx=0;shooter.fy=0;shooter.moveSpeed=0;shooter.action='';shooter.actionTime=0;
      shooter.ecalRaised=false;shooter.weaponHeld=true;shooter.portalEntered=false;
      shooter.ecalAim={x:state.bossX,y:state.bossY};
      shooter.face=Math.atan2(state.bossX-shooter.x,shooter.y-state.bossY);
      state.boss=1;state.bossWalking=false;state.bossBlock=0;
      state.finale.finisherBackup={...shooter};
      state.finale.shotFired=false;state.finale.finishingImpact=false;
    }
    if(state.round===2){
      const existing=Object.values(state.players).find(p=>p.hero==='guardian');
      const hero=existing||{...state.players.host,id:'red-dawn-cinematic',name:'Red Dawn',hero:'guardian',hp:100,color:'#ffc857'};
      if(existing)state.finale.guardianId=existing.id;else state.finale.redDawn=hero;
      hero.x=state.bossX-22;hero.y=state.bossY+26;window.heroIceTerrain?.snap?.(hero);
      hero.moveSpeed=0;hero.fx=0;hero.fy=0;hero.action='';hero.actionTime=0;hero.weaponHeld=false;
      hero.face=Math.atan2(state.bossX-hero.x,hero.y-state.bossY);hero.portalEntered=false;
      state.finale.guardianBackup={...hero};state.finale.heroImpact=false;
      state.finale.wildClaw={...hero,id:'wild-claw-cinematic',name:'Wild Claw',hero:'wildclaw',helmet:false,x:hero.x+55,y:hero.y+15};
      window.heroIceTerrain?.snap?.(state.finale.wildClaw);
      state.boss=1;state.bossBlock=0;state.bossAttack=0;state.bossWalking=false;
    }
    arenaTarget=null;say(state.round===2?'RED DAWN STEPS FORWARD TO FINISH MR. MISFIT!':'DARK ARMORED IS DESTABILIZING… ECAL TAKES AIM.');broadcast();
  }
  act=function(p,kind){
    if(state?.finale)return;
    actBeforeFinale(p,kind);
    if(state?.phase==='game'&&state.round===5&&state.boss<=0)beginBossFinale();
  };
  move=function(x,y,run){if(state?.finale)return;moveBeforeFinale(x,y,run);};
  simulate=function(dt){
    if(state?.phase==='game'&&state.round===5&&!state.intro&&state.boss<=0&&!state.finale)beginBossFinale();
    if(state?.phase==='game'&&state.finale){
      if(state.round===2&&!window.frostFinaleActorsReady?.(state.finale)){broadcast();return;}
      state.finale.age+=dt;
      for(const p of Object.values(state.players)){p.fx=0;p.fy=0;}
      if(state.round===5){
        const f=state.finale,timing=window.darkFinaleTiming;
        if(f.finisherId&&!state.players[f.finisherId]){f.ecal={...f.finisherBackup,id:'ecal-final-ally'};f.finisherId=null;}
        const shooter=state.players[f.finisherId]||f.ecal;
        if(shooter){
          shooter.ecalRaised=f.age>=3.35;
          shooter.actionTime=Math.max(0,(shooter.actionTime||0)-dt);
          if(f.age>=timing.shot&&!f.shotFired){
            f.shotFired=true;shooter.action='ecalBlast';shooter.actionTime=.34;
            shooter.ecalShotId=(shooter.ecalShotId||0)+1;
            shooter.ecalBolts=[{x:state.bossX,y:state.bossY}];
            say('ECAL · ONE FINAL SHOT');
          }
        }
        if(f.age>=timing.impact&&!f.finishingImpact){f.finishingImpact=true;state.boss=0;}
      }
      if(state.finale.age>=(state.round===5?window.darkFinaleTiming.end:8)){state.roundEnded=true;state.roundReason='BOSS DOWN';state.phase='results';}
      broadcast();return;
    }
    simulateBeforeFinale(dt);
  };
  let heardFinalExplosion=false,heardMisfitPunch=false;
  const finaleFrame=document.createElement('canvas');finaleFrame.width=W;finaleFrame.height=H;
  const drawBeforeFinale=draw,bossBeforeFinale=drawBoss;
  drawBoss=function(){if(state?.finale?.age>=(state.round===5?window.darkFinaleTiming.impact:4.2))return;bossBeforeFinale();};
  draw=function(){
    drawBeforeFinale();
    window.updateFinalWhiteout?.(state);
    if(state?.phase!=='game'){window.updateDarkBossHUD?.(state);return;}
    if(state.finale){
      if(state.round===2&&state.finale.heroImpact&&!heardMisfitPunch){heardMisfitPunch=true;playCinematicPunch();}
      if(state.round===2&&state.finale.redDawn&&!document.querySelector('.arena-wrap').classList.contains('playing3d'))drawRPGHero(state.finale.redDawn);
      if(state.round===5&&state.finale.age>=window.darkFinaleTiming.impact&&!heardFinalExplosion){heardFinalExplosion=true;playExplosion();}
      window.updateDarkBossHUD?.(state);
      if(!document.querySelector('.arena-wrap').classList.contains('playing3d')){
        const e=state.finale.age-(state.round===5?window.darkFinaleTiming.impact:4.2);
        if(e>=0&&e<3.5){const a=window.heroGround?.sample(state.round,state.bossX,state.bossY,W,H)||{x:state.bossX,y:state.bossY};ctx.save();ctx.globalAlpha=Math.max(0,1-e/3.5);const glow=ctx.createRadialGradient(a.x,a.y-40,0,a.x,a.y-40,35+e*95);glow.addColorStop(0,'#fff4c5');glow.addColorStop(.35,'#ff823f');glow.addColorStop(1,'#5a233500');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);ctx.restore();}
      }
    }else{heardFinalExplosion=false;heardMisfitPunch=false;}
    if(state.finale&&!document.querySelector('.arena-wrap').classList.contains('playing3d')){
      const age=state.finale.age,me=state.players[myId||'host']||state.players.host;
      const a=window.heroGround?.sample(state.round,state.bossX,state.bossY,W,H)||{x:state.bossX,y:state.bossY,height:110};
      const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
      const amount=ease(age/.85)*(1-ease((age-1.9)/2.1)),zoom=1+amount*1.8;
      finaleFrame.getContext('2d').drawImage(canvas,0,0);
      ctx.save();ctx.clearRect(0,0,W,H);
      const tx=Math.max(W-W*zoom,Math.min(0,(W/2-a.x)*amount-a.x*(zoom-1)));
      const ty=Math.max(H-H*zoom,Math.min(0,(H/2-a.y+a.height*.86)*amount-(a.y-a.height*.86)*(zoom-1)));
      const shake=state.round===5?(age<window.darkFinaleTiming.impact?Math.min(5,age):Math.max(0,9-(age-window.darkFinaleTiming.impact)*4)):0;
      ctx.translate(tx+Math.sin(age*47)*shake,ty+Math.sin(age*63)*shake*.65);ctx.scale(zoom,zoom);ctx.drawImage(finaleFrame,0,0);ctx.restore();
    }
    window.drawDarkBossEffects?.(ctx,state,W,H);
  };
  // Resolve every movement path against the imported ice terrain, including
  // dash boosts and knockback supplied by the older combat wrappers above.
  const simulateBeforeIce=simulate,actBeforeIce=act;
  let iceState=null,icePlaced=new WeakSet();
  const iceBodies=()=>[...Object.values(state.players),...(state.hammerers||[]).filter(h=>!h.dead),...(state.goons||[]),...(state.caster&&!state.caster.dead?[state.caster]:[]),...(state.civilians||[])];
  function prepareIce(){
    const terrain=window.heroIceTerrain;if(!terrain||typeof terrain.snap!=='function'||typeof terrain.world!=='function')return;
    if(iceState!==state){iceState=state;icePlaced=new WeakSet();const boss={x:state.bossX,y:state.bossY};terrain.snap(boss);state.bossX=boss.x;state.bossY=boss.y;}
    const occupied=[];
    for(const p of iceBodies())if(icePlaced.has(p))occupied.push(terrain.world(p));
    for(const p of iceBodies())if(!icePlaced.has(p)){terrain.snap(p,occupied);icePlaced.add(p);}
  }
  function iceSnapshot(){prepareIce();return {bodies:iceBodies().map(p=>[p,{x:p.x,y:p.y}]),boss:{x:state.bossX,y:state.bossY}};}
  function resolveIce(before){
    if(!before||state?.phase!=='game'||state.round!==2||typeof window.heroIceTerrain?.resolve!=='function')return;
    for(const [p,old] of before.bodies)window.heroIceTerrain.resolve(p,old);
    const boss={x:state.bossX,y:state.bossY};window.heroIceTerrain.resolve(boss,before.boss);state.bossX=boss.x;state.bossY=boss.y;
    prepareIce();
  }
  act=function(p,kind){
    if(state?.round===2&&window.heroIceLandscapeStatus&&window.heroIceLandscapeStatus!=='ready')return;
    const before=state?.round===2&&typeof window.heroIceTerrain?.snap==='function'&&typeof window.heroIceTerrain?.resolve==='function'?iceSnapshot():null;
    actBeforeIce(p,kind);resolveIce(before);
  };
  simulate=function(dt){
    const ice=state?.phase==='game'&&state.round===2&&window.heroIceTerrain;
    if(!ice)iceState=null;
    if(ice&&window.loadFrozenLandscape){window.loadFrozenLandscape();if(window.heroIceLandscapeStatus!=='ready')return;}
    const before=ice&&typeof ice.snap==='function'&&typeof ice.resolve==='function'?iceSnapshot():null;
    simulateBeforeIce(dt);resolveIce(before);
    if(state?.phase==='game'&&state.round===2&&window.heroIceTerrain)prepareIce();
  };
  // Publish resolved movement, not just held keys, to both animation renderers.
  const simulateBeforeMovementPose=simulate;
  simulate=function(dt){
    const round=state?.round,previous=new Map(Object.values(state?.players||{}).map(p=>[p,{x:p.x,y:p.y}]));
    simulateBeforeMovementPose(dt);
    for(const p of Object.values(state?.players||{})){
      const old=previous.get(p),dx=old?p.x-old.x:0,dy=old?p.y-old.y:0;
      p.moveSpeed=round===state.round&&!state.intro&&!state.finale?Math.min(650,Math.hypot(dx,dy)/Math.max(.001,dt)):0;
      if(p.moveSpeed>.5)p.moveYaw=Math.atan2(dx,dy);
    }
  };
  // Level one: Mr. Misfit defeated -> movie -> walk into portal -> level two.
  const actBeforeAshen=act,simulateBeforeAshen=simulate,moveBeforeAshen=move,actionBeforeAshen=action;
  function beginAshenTransition(){
    
    if(state.ashenTransition)return;
    state.boss=0;state.giant=false;state.finImpact=null;state.roundEnded=false;state.roundReason='MISFIT ESCAPED';
    const leader=Object.values(state.players).find(p=>p.hero==='guardian');const hero=leader||{...state.players.host,id:'red-dawn-uppercut',hero:'guardian',helmet:false};state.ashenTransition={id:Date.now(),stage:'getaway',age:0,x:state.bossX,y:state.bossY-100,hero:state.players.host||hero};state.ashenTransition.ecal={...state.players.host,id:'ecal-uppercut',hero:'ecal',x:state.bossX+90,y:state.bossY+75,helmet:false,action:'',actionTime:0,ecalRaised:true,ecalShotId:0,ecalAim:{x:state.bossX,y:state.bossY},jump:0,dodge:0,flying:false};state.shots=[];state.meteorHazards=[];
    for(const p of Object.values(state.players)){
      p.fx=0;p.fy=0;p.moveSpeed=0;p.run=false;p.action='';p.actionTime=0;
      p.dodge=0;p.jump=0;p.flying=false;p.flightHeight=0;p.climbing=false;p.climbActive=false;
      p.cometDash=null;p.blocking=false;p.buried=false;p.portalEntered=false;p.ashenMovieDone=false;
    }
    for(const h of state.hammerers||[]){h.walking=false;h.bossSmash=0;}
    if(state.caster)state.caster.casting=0;
    clearOpeningInput();syncLevelMusic();say('MR. MISFIT IS ESCAPING!');broadcast();
  }
  act=function(p,kind){
    if(state?.ashenTransition){
      if(kind==='finishAshenMovie'&&state.ashenTransition.stage==='getaway'){state.ashenTransition.stage='portal';state.ashenTransition.age=0;clearOpeningInput();broadcast();return;}
      if(kind==='finishAshenMovie'&&state.ashenTransition.stage==='movie'){p.ashenMovieDone=true;broadcast();}
      return;
    }
    actBeforeAshen(p,kind);
    if(state?.phase==='game'&&state.round===1&&!state.intro&&state.boss<=0)beginAshenTransition();
    if(state?.phase==='game'&&state.round===2&&!state.intro&&state.boss<=0)beginBossFinale();
  };
  action=function(kind){if(state?.ashenTransition&&kind!=='finishAshenMovie')return;actionBeforeAshen(kind);};
  move=function(x,y,run){if(state?.ashenTransition)return;moveBeforeAshen(x,y,run);};
  simulate=function(dt){
    // The ice-level Mr. Misfit shares the final villain's death camera, then
    // advances to level three instead of ending the entire game.
    if(state?.phase==='game'&&state.round===2&&!state.intro&&state.boss<=0&&!state.finale)beginBossFinale();
    if(state?.phase==='game'&&state.round===2&&state.finale){
      if(state.round===2&&!window.frostFinaleActorsReady?.(state.finale)){broadcast();return;}
      state.finale.age+=dt;
      for(const p of Object.values(state.players)){p.fx=0;p.fy=0;p.moveSpeed=0;}
      const f=state.finale;
      if(f.guardianId&&!state.players[f.guardianId]){f.redDawn={...f.guardianBackup,id:'red-dawn-cinematic'};f.guardianId=null;}
      const hero=state.players[f.guardianId]||f.redDawn;
      if(hero){hero.action=f.age>=1.4&&f.age<3.1?'firePunch':'';hero.actionTime=hero.action ? .55 : 0;hero.fireTime=hero.action?1:0;}
      if(f.age>=2.65&&!f.heroImpact){f.heroImpact=true;state.boss=0;say('RED DAWN DEFEATS MR. MISFIT!');}
      if(f.age>5.4){for(const actor of [hero,f.wildClaw].filter(Boolean)){actor.y+=dt*55;actor.fx=0;actor.fy=1;actor.moveSpeed=55;actor.face=0;actor.moveYaw=0;actor.action='';actor.actionTime=0;actor.fireTime=0;actor.smashHit=0;actor.dodge=0;actor.jump=0;actor.climbing=false;actor.flying=false;actor.blocking=false;actor.run=false;}}
      if(state.finale.age>=10.5){
        if(hero){hero.fireTime=0;hero.action='';hero.actionTime=0;}

        state.roundEnded=true;state.roundReason='BOSS DOWN';
        clearOpeningInput();advanceLevel();renderHUD();
      }
      broadcast();return;
    }
    if(state?.phase==='game'&&state.round===1&&!state.intro&&state.boss<=0&&!state.ashenTransition)beginAshenTransition();
    const tr=state?.ashenTransition;
    if(!tr){simulateBeforeAshen(dt);return;}
    if(tr.stage==='getaway'){
      if(window.misfitGetawayReady===tr.id&&!document.hidden)tr.age+=Math.min(.05,Math.max(0,dt));
      if(tr.age>=8){tr.stage='portal';tr.age=0;clearOpeningInput();say('MR. MISFIT ESCAPED · FOLLOW HIM INTO THE FROST');}
      broadcast();return;
    }
    tr.age+=dt;
    for(const p of Object.values(state.players)){p.fx=0;p.fy=0;p.moveSpeed=0;}
    if(tr.stage==='uppercut'){
      if(tr.ecal){const shot=tr.age>1&&tr.age<5?Math.floor((tr.age-1)/.65)+1:tr.ecal.ecalShotId;tr.ecal.action=tr.age>1&&tr.age<5?'ecalBlast':'';tr.ecal.actionTime=tr.ecal.action?.28:0;tr.ecal.ecalShotId=shot;}
      if(tr.age>=5.8&&!tr.assistSound){tr.assistSound=true;playCombatSound('kick');}
      if(tr.age>=5.65&&!tr.groundBreakSound){tr.groundBreakSound=true;playCombatSound('slam');}
      if(tr.age>=6.2&&!tr.leapSound){tr.leapSound=true;playCombatSound('fly');playCombatSound('jump');}
      if(tr.age>=17.2&&!tr.portalBoom){tr.portalBoom=true;playExplosion();}
      if(tr.age>=9.3&&!tr.hitSound){tr.hitSound=true;playCinematicPunch();}
      if(tr.age>=21){tr.stage='portal';tr.age=0;clearOpeningInput();say('FOLLOW MR. MISFIT · LEVEL TWO');}
      broadcast();return;
    }
    if(tr.stage==='movie'&&Object.values(state.players).every(p=>p.ashenMovieDone)){
      tr.stage='portal';tr.age=0;
      const leader=state.players.host||Object.values(state.players)[0];
      tr.x=Math.max(80,Math.min(920,leader.x));tr.y=leader.y-115;
      clearOpeningInput();say('ENTERING THE PORTAL · FROZEN FUTURE');
    }else if(tr.stage==='portal'&&tr.age>1.2){
      for(const p of Object.values(state.players)){
        const dx=tr.x-p.x,dy=tr.y-p.y,d=Math.hypot(dx,dy);
        if(d<5){p.x=tr.x;p.y=tr.y;p.portalEntered=true;continue;}
        const step=Math.min(d,180*dt);p.x+=dx/d*step;p.y+=dy/d*step;
        p.fx=dx/d;p.fy=dy/d;p.moveYaw=Math.atan2(dx,dy);p.face=p.moveYaw;p.moveSpeed=step/dt;
      }
      if(Object.values(state.players).every(p=>p.portalEntered)){
        tr.arrived=(tr.arrived||0)+dt;
        if(tr.arrived>.85){
          state.ashenTransition=null;state.futureWorld=false;state.roundEnded=true;state.roundReason='BOSS DOWN';
          for(const p of Object.values(state.players)){p.portalEntered=false;p.moveSpeed=0;p.x=500;p.y=470;}
          clearOpeningInput();advanceLevel();renderHUD();
        }
      }
    }
    broadcast();
  };
  const hudBeforeAshen=renderHUD;
  let wasAshenTransition=false;
  renderHUD=function(){
    hudBeforeAshen();
    const tr=state?.ashenTransition,me=state?.players[myId||'host'];
    window.heroAshenMovie?.sync(tr?.stage==='movie'?tr.id:null,!!me?.ashenMovieDone);
    if(wasAshenTransition&&!tr){controlHero='';renderControls();}
    wasAshenTransition=!!tr;
    if(tr)$('#gameTip').textContent=tr.stage==='getaway'?'MR. MISFIT IS MAKING A GETAWAY':tr.stage==='movie'?'THE NEXT CHAPTER':'FOLLOW MR. MISFIT · FROZEN FUTURE';
  };
  window.addEventListener('heroic-ashen-movie-finished',()=>{clearOpeningInput();action('finishAshenMovie');});
  const drawBeforeAshen=draw,drawBossBeforeAshen=drawBoss;
  drawBoss=function(){if(state?.ashenTransition)return;drawBossBeforeAshen();};
  draw=function(){
    drawBeforeAshen();const tr=state?.ashenTransition;
    if(!tr)return;
    if(!document.querySelector('.arena-wrap').classList.contains('playing3d'))window.drawAshenTransition?.(ctx,state,W,H);
  };
  const rpgBeforePortal=drawRPGHero,heroBeforePortal=drawHero;
  drawRPGHero=function(p){if(p.portalEntered)return;rpgBeforePortal(p);};
  drawHero=function(p){if(p.portalEntered)return;heroBeforePortal(p);};
  const resetBeforeAshen=reset;
  reset=function(){window.heroAshenMovie?.sync(null,false);resetBeforeAshen();};
  const modelNotice=document.createElement('div');modelNotice.hidden=true;
  modelNotice.style.cssText='position:fixed;left:20px;bottom:20px;z-index:30000;max-width:440px;padding:16px;background:#14202ff5;color:#fff;border:1px solid #efbd63;border-radius:8px;font:15px sans-serif';
  document.body.appendChild(modelNotice);
  window.heroModelLoadError=(message)=>{modelNotice.hidden=false;modelNotice.textContent=message+' Your saved models have not been removed. Reload the game to retry.';};
  const load3DWorld = () => { const world = document.createElement('script'); world.src = 'world3d.js?v=village-smooth-9';world.onerror=()=>window.heroModelLoadError('The 3D game script could not load.'); document.body.appendChild(world); };
  window.addEventListener('error',event=>{if(/world3d|model-village|village-radio/.test(event.filename||''))window.heroModelLoadError('3D startup error: '+event.message);});
  const prepare3DWorld = (attempt=0) => {
    Promise.all([import('three'), import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js')]).then(([THREE, loaders]) => {
      modelNotice.hidden=true;window.THREE = THREE; window.GLTFLoader = loaders.GLTFLoader; load3DWorld();
    }).catch(error => {console.error('3D engine loading failed',error);if(attempt<2)setTimeout(()=>prepare3DWorld(attempt+1),1500);else window.heroModelLoadError('The 3D engine could not load. Check your internet connection.');});
  };
  const homeLoading=document.createElement('section');
  homeLoading.hidden=true;homeLoading.style.cssText='position:fixed;inset:0;z-index:10000;background:#102522;color:white;';
  homeLoading.innerHTML='<img src="assets/home-village-reference.jpg" alt="The heroes’ lantern-lit forest village" style="width:100%;height:100%;object-fit:cover"><div style="position:absolute;inset:0;background:linear-gradient(transparent 30%,#061914ee);display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(24px,6vw,90px)"><small style="letter-spacing:4px">CHAPTER THREE · RETURN HOME</small><h1 style="font-size:clamp(26px,4vw,58px);max-width:900px">The Investigate of Mr. Misfit Crime Scene</h1><label for="homeLoadingProgress">Preparing the investigation…</label><progress id="homeLoadingProgress" max="100" value="0" style="width:min(650px,100%);height:14px;accent-color:#e7bd70;margin-top:18px"></progress></div>';
  document.body.append(homeLoading);
  const homeLoadingProgress=homeLoading.querySelector('progress');
  // A peaceful investigation replaces combat in the third chapter.
  const homePanel=document.createElement('section');
  homePanel.style.cssText='position:relative;max-width:none;margin:12px 0;padding:12px 16px;background:#102523ed;color:#edf5e8;border:1px solid #c6a76c;border-radius:12px;font:14px sans-serif';
  homePanel.hidden=true;document.querySelector('.arena-wrap').insertAdjacentElement('afterend',homePanel);
  const homeTitle=document.createElement('strong'),homeText=document.createElement('p'),homeButton=document.createElement('button');
  homeTitle.textContent='LEVEL 3 · HOME VILLAGE';homeButton.textContent='Study evidence';homeButton.onclick=()=>action('studyEvidence');homePanel.append(homeTitle,homeText,homeButton);
  const photoViewer=document.createElement('section');photoViewer.hidden=true;
  photoViewer.style.cssText='position:fixed;inset:0;z-index:10001;background:#06100fef;padding:24px;overflow:auto;color:#eee5cb;text-align:center';
  photoViewer.innerHTML='<h2></h2><div style="overflow:auto;max-height:72vh"><img alt="Recovered evidence photograph" style="max-width:95%;max-height:68vh;object-fit:contain;transition:transform .2s"></div><p></p><button type="button" class="photoZoom">Zoom in / out</button> <button type="button" class="photoClose">Put away &amp; continue</button>';
  document.body.append(photoViewer);let lastViewedPhoto=null,photoZoom=false;
  photoViewer.querySelector('.photoClose').onclick=()=>{action('putPhotoAway');move(0,0);};
  photoViewer.querySelector('.photoZoom').onclick=()=>{photoZoom=!photoZoom;const img=photoViewer.querySelector('img');img.style.maxWidth=photoZoom?'none':'95%';img.style.maxHeight=photoZoom?'none':'68vh';img.style.width=photoZoom?'160%':'';};
  photoViewer.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')action('putPhotoAway');});
  const photoInventory=document.createElement('div');homePanel.append(photoInventory);

  const preHomeAct=act;
  act=function(p,kind){
    if(state?.round!==3||state.phase!=='game')return preHomeAct(p,kind);
    if(!state.homeStudy||state.homeStudy.loading<3.5)return;
    if(kind==='jump'){if(!p.inspectingPhoto&&!p.seated&&!p.villageAirborne){p.villageHeight=window.modelVillageHeight?.((p.x-500)*.055,(p.y-300)*.055)??p.villageHeight??0;p.villageVelocity=42;p.villageAirborne=true;p.jump=.76;broadcast();}return;}
    if(kind==='putPhotoAway'){p.heldPhoto=null;p.inspectingPhoto=false;broadcast();return;}
    if(kind.startsWith('reviewPhoto:')){const i=Number(kind.split(':')[1]);if(state.homeStudy.found[i]){p.heldPhoto=i;p.inspectingPhoto=true;p.fx=0;p.fy=0;broadcast();}return;}
    const study=state.homeStudy;
    if(kind==='studyEvidence'){
      if(window.VillageClueScene.photosFound(study)){window.VillageClueScene.begin(state,p);broadcast();return;}
      const i=window.homeClues.findIndex((c,i)=>!study.found[i]&&Math.hypot(c.x-p.x,c.y-p.y)<65);
      if(i<0){say('WALK TO A GLOWING EVIDENCE TABLE');return;}
      p.heldPhoto=i;p.inspectingPhoto=true;p.fx=0;p.fy=0;study.found[i]=true;study.message=window.homeClues[i].text;p.score+=10;say('EVIDENCE RECOVERED · '+window.homeClues[i].title.toUpperCase());broadcast();
    }
  };
  const preHomeSimulate=simulate;
  simulate=function(dt){
    if(state?.round!==3||state.phase!=='game')return preHomeSimulate(dt);
    if(!state.homeStudy){
      state.homeStudy={loading:0,found:[false,false,false,false],message:'You are home. Find three old photographs and a revenge note to discover whether Mr. Misfit was a distraction.'};
      state.hammerers=[];state.goons=[];state.shots=[];state.caster=null;state.civilians=[];state.clinic=null;state.danger=0;state.boss=0;state.roundEnded=false;
      Object.values(state.players).forEach((p,i)=>{p.x=window.modelVillageSpawn?.x??245;p.y=window.modelVillageSpawn?.y??380;p.heldPhoto=null;p.inspectingPhoto=false;p.hp=100;p.fx=0;p.fy=0;p.buried=false;p.flying=false;p.climbing=false;p.jump=0;p.dodge=0;p.action='';p.fireTime=0;});
    }
    if(state.homeStudy.loading<3.5){state.homeStudy.loading=Math.min(3.5,state.homeStudy.loading+dt);for(const p of Object.values(state.players)){p.fx=0;p.fy=0;p.moveSpeed=0;}return;}
    if(window.modelVillageReady&&!window.modelVillageReady())return;
    if(window.modelVillageSpawn&&!state.homeStudy.bridgeSpawned){state.homeStudy.bridgeSpawned=true;for(const hero of Object.values(state.players)){hero.x=window.modelVillageSpawn.x;hero.y=window.modelVillageSpawn.y;hero.walkX=hero.walkY=0;hero.villageHeight=window.modelVillageHeight?.((hero.x-500)*.055,(hero.y-300)*.055);hero.villageVelocity=0;hero.villageAirborne=false;}}
    for(const p of Object.values(state.players)){
      if(p.inspectingPhoto||p.seated){p.fx=0;p.fy=0;p.moveSpeed=0;continue;}
      const ox=p.x,oy=p.y,n=Math.max(1,Math.hypot(p.fx||0,p.fy||0)),speed=p.villageAirborne?(p.run?280:220):(115+65*(p.runBlend||0));
      const heightAt=(x,y)=>window.modelVillageHeight?.((x-500)*.055,(y-300)*.055);
      const oldFloor=heightAt(ox,oy);
      if(!Number.isFinite(oldFloor)||!window.homeVillageWalkable(ox,oy)){
        const safe=p.villageSafe||window.modelVillageSpawn;
        if(safe){p.x=safe.x;p.y=safe.y;p.villageHeight=heightAt(p.x,p.y);p.villageVelocity=0;p.villageAirborne=false;p.walkX=p.walkY=0;continue;}
      }else if(!p.villageAirborne)p.villageSafe={x:ox,y:oy};
      if(!Number.isFinite(p.villageHeight))p.villageHeight=oldFloor??0;
      const step=Math.min(dt,.05);
      if(p.villageAirborne){p.villageVelocity=(p.villageVelocity||0)-24*step;p.villageHeight+=p.villageVelocity*step;}
      const blend=1-Math.exp(-dt*9);p.walkX=(p.walkX||0)+((p.fx||0)-(p.walkX||0))*blend;p.walkY=(p.walkY||0)+((p.fy||0)-(p.walkY||0))*blend;
      // The coarse village grid can combine several stair treads in one cell.
      const stairStep=p.villageAirborne?.65:1.25;
      const canMove=(x,y)=>{const h=heightAt(x,y);return window.homeVillageWalkable(x,y)&&Number.isFinite(h)&&h<=p.villageHeight+stairStep;};
      const nx=ox+p.walkX/n*speed*step,ny=oy+p.walkY/n*speed*step;
      if(canMove(nx,ny)){p.x=nx;p.y=ny;}
      else {const slideX=canMove(nx,oy)&&Math.abs(nx-ox)>.001,slideY=canMove(ox,ny)&&Math.abs(ny-oy)>.001;
        if(slideX&&(!slideY||Math.abs(nx-ox)>=Math.abs(ny-oy)))p.x=nx;
        else if(slideY)p.y=ny;
      }
      const floor=heightAt(p.x,p.y)??oldFloor??p.villageHeight;
      if(p.villageHeight<=floor+.08&&(p.villageVelocity||0)<=0){
        p.villageHeight=floor;p.villageVelocity=0;p.villageAirborne=false;
      }else if(!p.villageAirborne&&floor<p.villageHeight-1.25){
        p.villageAirborne=true;p.villageVelocity=0;
      }else if(!p.villageAirborne)p.villageHeight=floor;
      p.jump=p.villageAirborne?.4:0;
      p.moveSpeed=Math.hypot(p.x-ox,p.y-oy)/Math.max(.001,dt);if(p.moveSpeed>1)p.moveYaw=Math.atan2(p.x-ox,p.y-oy);
      p.action='';p.actionTime=0;p.smashHit=0;p.blocking=false;
    }
  };
  const preHomeHUD=renderHUD;
  renderHUD=function(){preHomeHUD();const active=state?.phase==='game'&&state.round===3&&!state.intro;window.villageNature?.setActive(active&&!document.hidden);const loading=active&&(!state.homeStudy||state.homeStudy.loading<3.5);homeLoading.hidden=!loading;homeLoadingProgress.value=Math.min(100,(state.homeStudy?.loading||0)/3.5*100);homePanel.hidden=!active||loading;if(!active||loading){photoViewer.hidden=true;return;}
    const study=state.homeStudy;if(!study)return;
    const complete=window.VillageClueScene.photosFound(study),me=state.players[myId||'host']||state.players.host;
    const holding=Number.isInteger(me.heldPhoto)&&me.inspectingPhoto;
    photoViewer.hidden=!holding;
    if(holding&&lastViewedPhoto!==me.heldPhoto){lastViewedPhoto=me.heldPhoto;const clue=window.homeClues[me.heldPhoto];photoViewer.querySelector('h2').textContent=clue.title;photoViewer.querySelector('img').src=window.homeEvidenceImages[clue.image];photoViewer.querySelector('p').textContent=clue.text;photoZoom=false;photoViewer.querySelector('img').style.cssText='max-width:95%;max-height:68vh;object-fit:contain';photoViewer.querySelector('.photoClose').focus();}
    if(!holding)lastViewedPhoto=null;
    const inventoryKey=study.found.join(',');if(photoInventory.dataset.items!==inventoryKey){photoInventory.dataset.items=inventoryKey;photoInventory.replaceChildren();study.found.forEach((found,i)=>{if(!found)return;const button=document.createElement('button');button.textContent='View '+window.homeClues[i].title;button.onclick=()=>action('reviewPhoto:'+i);photoInventory.append(button);});}
    const nearby=window.homeClues.findIndex((c,i)=>!study.found[i]&&Math.hypot(c.x-me.x,c.y-me.y)<65);
    const next=window.homeClues.findIndex((c,i)=>!study.found[i]);
    homeText.textContent=study.message+' '+(complete?'All three photographs recovered. Replay the cinematic or keep exploring.':`${study.found.slice(0,3).filter(Boolean).length}/3 photographs found. Next: ${window.homeClues[next].title}. Look for the glowing photographs along the village path.`);
    homeButton.disabled=!complete&&nearby<0;homeButton.textContent=complete?'Replay clue cinematic':nearby>=0?'Study '+window.homeClues[nearby].title:'Walk to a photograph';
    $('#roundLabel').textContent='LEVEL 3 · HOME VILLAGE';$('#bossPhase').textContent='INVESTIGATE MR. MISFIT';$('#timer').textContent='HOME';
  };

  if(matchMedia('(pointer:coarse)').matches){
    const stick=document.createElement('span');stick.className='ipad-stick';movePad.append(stick);movePad.setAttribute('aria-label','Movement thumbstick');let thumb=null;
    const updateThumb=e=>{const rect=movePad.getBoundingClientRect(),dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2,len=Math.hypot(dx,dy),radius=rect.width*.32,k=len>radius?radius/len:1;joy.x=len<8?0:dx*k/radius;joy.y=len<8?0:dy*k/radius;stick.style.transform=`translate(${dx*k}px,${dy*k}px)`;arenaTarget=null;unlockAudio();};
    movePad.addEventListener('pointerdown',e=>{if(thumb!==null)return;e.preventDefault();e.stopImmediatePropagation();thumb=e.pointerId;movePad.setPointerCapture(thumb);updateThumb(e);},true);
    movePad.addEventListener('pointermove',e=>{if(e.pointerId!==thumb)return;e.preventDefault();e.stopImmediatePropagation();updateThumb(e);},true);
    const releaseThumb=e=>{if(e&&e.pointerId!==thumb)return;thumb=null;joy.x=joy.y=0;stick.style.transform='';};
    movePad.addEventListener('pointerup',releaseThumb);movePad.addEventListener('pointercancel',releaseThumb);movePad.addEventListener('lostpointercapture',releaseThumb);
    const releaseTouch=()=>{releaseThumb();keys={};runHeld=false;punchUp();arenaTarget=null;move(0,0);};window.addEventListener('blur',releaseTouch);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseTouch();});
    $('#abilityGrid').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-action]');if(b)b.setPointerCapture(e.pointerId);},true);
    $('#abilityGrid').addEventListener('pointercancel',()=>{punchUp();runHeld=false;});
  }

  const seatButton=document.createElement('button');seatButton.textContent='Sit';seatButton.style.cssText='position:absolute;bottom:84px;right:18px;z-index:25;padding:14px 22px;border-radius:12px;background:#dec393;color:#241b10;font-weight:bold';document.querySelector('.arena-wrap').appendChild(seatButton);seatButton.hidden=true;
  function nearbySeat(p){let best=null,d=Infinity;for(const r of window.villageRooms||[])for(const q of [{x:2.45,z:1.5,yaw:0},{x:-2.35,z:1.9,yaw:Math.PI}]){const x=500+(r.x+q.x)/.055,y=300+(r.z+q.z)/.055,dist=Math.hypot(p.x-x,p.y-y);if(dist<d){d=dist;best={x,y,yaw:q.yaw};}}return d<65?best:null;}
  const beforeSeatAct=act;act=function(p,kind){if(kind!=='sitChair'){if(p.seated)return;return beforeSeatAct(p,kind);}if(state?.round!==3||state.radioScene)return;if(p.seated){const old=p.seated;p.x=old.returnX;p.y=old.returnY;p.seated=null;}else{const seat=nearbySeat(p);if(!seat)return;p.seated={...seat,returnX:p.x,returnY:p.y};p.x=seat.x;p.y=seat.y;p.moveYaw=seat.yaw;p.fx=p.fy=p.moveSpeed=0;p.action='';}broadcast();};
  seatButton.onclick=()=>action('sitChair');
  const beforeSeatHUD=renderHUD;renderHUD=function(){beforeSeatHUD();const p=state?.players?.[myId||'host'];seatButton.hidden=!(state?.phase==='game'&&state.round===3&&p&&!state.radioScene&&!p.inspectingPhoto&&(p.seated||nearbySeat(p)));seatButton.textContent=p?.seated?'Stand up':'Sit on chair';};
  const beforeEcalSkillsSim=simulate;simulate=function(dt){beforeEcalSkillsSim(dt);if(!state||state.phase!=='game'||state.intro||state.finale||state.ashenTransition||state.radioScene)return;for(const p of Object.values(state.players)){if(p.hero!=='ecal')continue;const target=ecalTargets(p).find(t=>t.id===p.ecalLock);if(target)p.ecalAim={x:target.x,y:target.y};else p.ecalLock=null;const k=p.ecalSkill;if(!k)continue;k.age+=dt;if(k.age>=k.duration){p.ecalSkill=null;continue;}if(['ecalDive','ecalFlip','ecalAirKick'].includes(k.kind)){const n=Math.hypot(k.dx,k.dy)||1,speed=k.kind==='ecalDive'?480:240,dx=k.kind==='ecalDive'?k.dy*(k.side||1):k.dx,dy=k.kind==='ecalDive'?-k.dx*(k.side||1):k.dy;const x=p.x+dx/n*speed*dt,y=p.y+dy/n*speed*dt;const old={x:p.x,y:p.y};p.x=x;p.y=y;if(state.round===2&&window.heroIceTerrain)window.heroIceTerrain.resolve(p,old);}}};

  const beforeFinAct=act;
  act=function(p,kind){
    if(!p||p.hero!=='finnew'||!['jump','punch','kick','dodge','finSmash'].includes(kind))return beforeFinAct(p,kind);
    if(state.intro||state.ashenTransition||state.finale||p.seated)return;
    if(p.finStunt&&p.finStunt.age/p.finStunt.duration<.65)return;
    beforeFinAct(p,kind==='finSmash'?'punch':kind);
    p.finStunt={kind:kind==='finSmash'?'smash':kind,age:0,duration:['jump','finSmash'].includes(kind)?1.05:kind==='dodge'?.72:.48,side:(p.finSide=-(p.finSide||-1)),terrainJump:state.round===3&&kind==='jump'};
    if(state.round!==3)p.jump=0;
  };
  const beforeFinSim=simulate;simulate=function(dt){beforeFinSim(dt);if(!state||state.phase!=='game'||state.intro||state.ashenTransition||state.radioScene)return;for(const p of Object.values(state.players)){if(p.finStunt){p.finStunt.age+=dt;if(p.finStunt.age>=p.finStunt.duration)p.finStunt=null;}}};
  const beforeFinControls=renderControls;renderControls=function(){beforeFinControls();const p=state?.players?.[myId||'host'];if(p?.hero==='finnew'&&!document.querySelector('[data-action="finSmash"]')){const b=document.createElement('button');b.className='ability';b.dataset.action='finSmash';b.textContent='FLIP SMASH';document.querySelector('#abilityGrid').appendChild(b);}};



  const stuntCombos={stuntKick:['jump','kick','punch'],stuntCounter:['dodge','punch','jump'],stuntAerial:['jump','kick'],stuntFinisher:['dodge','dodge','punch','kick','jump','slam']};
  const beforeComboAct=act;
  let performingCombo=false;
  function comboStrike(p,kind){performingCombo=true;try{return beforeComboAct(p,p.hero==='ecal'?(kind==='punch'?'ecalHeavy':kind==='slam'?'ecalSpin':kind):kind);}finally{performingCombo=false;}}
  act=function(p,kind){if(!p||!['ecal','wildclaw'].includes(p.hero))return beforeComboAct(p,kind);if(stuntCombos[kind]){if(state.intro||state.finale||state.ashenTransition||p.buried||p.seated||p.stuntCombo)return;p.stuntCombo={kind,index:0,time:0};return;}if(kind==='stuntPunch')return comboStrike(p,'punch');if(p.stuntCombo&&!performingCombo)p.stuntCombo=null;return beforeComboAct(p,kind);};
  const beforeComboSim=simulate;simulate=function(dt){beforeComboSim(dt);if(!state||state.phase!=='game'||state.intro||state.finale||state.ashenTransition)return;for(const p of Object.values(state.players)){const c=p.stuntCombo;if(!c)continue;c.time-=dt;if(c.time<=0){const steps=stuntCombos[c.kind];if(c.index>=steps.length){p.stuntCombo=null;continue;}const move=steps[c.index++];comboStrike(p,move);c.time=move==='jump'?.42:move==='dodge'?(p.hero==='wildclaw'?1.25:.55):.44;}}};
  const beforeComboControls=renderControls;renderControls=function(){beforeComboControls();const p=state?.players?.[myId||'host'];if(!['ecal','wildclaw'].includes(p?.hero))return;for(const [kind,label] of [['stuntPunch','POWER PUNCH'],['stuntKick','STUNT KICK'],['stuntCounter','DODGE + COUNTER'],['stuntAerial','AERIAL KICK'],['stuntFinisher','STUNT FINISHER']])if(!document.querySelector('[data-action="'+kind+'"]')){const b=document.createElement('button');b.className='ability';b.dataset.action=kind;b.textContent=label;document.querySelector('#abilityGrid').appendChild(b);}};
  function frostPlaying(){return state?.round===2&&state.frostIntro&&!state.frostIntro.done;}
  function startFrostIntro(){if(state?.phase!=='game'||state.round!==2||state.frostIntro)return;state.frostIntro={id:Date.now(),age:150,done:true};Object.values(state.players).forEach(p=>{p.fx=p.fy=0;p.run=false;p.action='';p.actionTime=0;});broadcast();}
  const beforeFrostAdvance=advanceLevel;advanceLevel=function(){beforeFrostAdvance();startFrostIntro();};
  const beforeFrostAct=act;act=function(p,kind){if(frostPlaying()){if(kind==='skipFrostIntro'){state.frostIntro.age=150;state.frostIntro.done=true;broadcast();}return;}return beforeFrostAct(p,kind);};
  const beforeFrostAction=action;action=function(kind){if(frostPlaying()&&kind!=='skipFrostIntro')return;return beforeFrostAction(kind);};
  const beforeFrostMove=move;move=function(x,y,run){if(frostPlaying())return;return beforeFrostMove(x,y,run);};
  const beforeFrostSim=simulate;simulate=function(dt){startFrostIntro();if(frostPlaying()){window.loadFrozenLandscape?.();if(window.heroIceLandscapeStatus==='ready'){prepareIce();if(window.heroFrostIntroReady&&!document.hidden){state.frostIntro.age+=Math.min(dt,.05);if(state.frostIntro.age>=150)state.frostIntro.done=true;}}return;}return beforeFrostSim(dt);};
  window.addEventListener('heroic-frost-skip',()=>action('skipFrostIntro'));

  const beforeFinPowerAct=act;
  act=function(p,kind){
    if(!['finnew','guardian','wildclaw','ecal','lizard','sentinel'].includes(p?.hero)||!['punch','stuntPunch','ecalHeavy','firePunch'].includes(kind)||state?.phase!=='game'||![1,2,4].includes(state.round)||state.intro||state.ashenTransition||state.finale||frostPlaying()||state.roundEnded||p.buried||p.seated||state.boss<=0||Math.hypot(state.bossX-p.x,state.bossY-p.y)>=150)return beforeFinPowerAct(p,kind);
    const now=performance.now(),key=p.id+'finPowerPunch';if(actionCooldown[key]&&now-actionCooldown[key]<450)return;actionCooldown[key]=now;
    const damage=state.bossBlock>0?16:32;
    p.action='punch';p.actionTime=.42;p.face=Math.atan2(state.bossX-p.x,p.y-state.bossY);
    if(p.hero==='finnew')p.finStunt={kind:'punch',age:0,duration:.48,side:(p.finSide=-(p.finSide||-1))};
    state.boss=Math.max(0,state.boss-damage);p.score+=6;
    playCombatSound('punch');say(({finnew:'FIN NEW',guardian:'RED DAWN',wildclaw:'WILDCLAW',ecal:'ECAL',lizard:'LIZARD WARRIOR',sentinel:'NIGHT SENTINEL'}[p.hero]||'HERO')+' HITS MR. MISFIT · −'+damage+' HEALTH');
    if(state.boss<36)state.giant=true;
    if(state.boss<=0){p.score+=12;earnHealth(p,25);state.roundEnded=true;state.roundReason='BOSS DOWN';}
    renderHUD();broadcast();
  };
  const beforeImpactAct=act;
  act=function(p,kind){
    if(state?.finImpact)return;
    const eligible=['finnew','guardian','wildclaw'].includes(p?.hero)&&(['punch','stuntPunch'].includes(kind)||(p.hero==='wildclaw'&&kind==='firePunch'))&&[1,2,4].includes(state?.round)&&!state.intro&&!state.ashenTransition&&!state.finale&&!frostPlaying()&&!state.roundEnded&&state.boss>0&&Date.now()-(state.finImpactLast||0)>4500;
    const hp=state?.boss,ended=state?.roundEnded,reason=state?.roundReason;
    beforeImpactAct(p,kind);
    if(eligible&&state.boss<hp){const damage=hp-state.boss;state.boss=hp;state.roundEnded=ended;state.roundReason=reason;state.finImpactLast=Date.now();state.finImpact={id:Date.now(),player:p.id,age:0,damage,hit:false,x:p.x,y:p.y,bx:state.bossX,by:state.bossY};p.fx=p.fy=0;p.finStunt=null;broadcast();}
  };
  const beforeImpactMove=move;move=function(x,y,run){if(state?.finImpact)return;return beforeImpactMove(x,y,run);};
  const beforeImpactSim=simulate;simulate=function(dt){
    const c=state?.finImpact;if(!c)return beforeImpactSim(dt);
    if(document.hidden)return;
    c.age+=Math.min(dt,.05);const p=state.players[c.player];
    if(!p||state.phase!=='game'||state.finale||state.ashenTransition){state.finImpact=null;return;}
    if(c.age>=1.1&&!c.hit){c.hit=true;state.boss=Math.max(0,state.boss-c.damage);playPunchImpact(true);broadcast();}
    const speed=c.age<.8?1:c.age<1.1?.2:c.age<1.21?0:c.age<1.45?.35:1.25;
    if(speed>0&&state.boss>0)beforeImpactSim(dt*speed);
    p.x=c.x;p.y=c.y;p.fx=p.fy=0;state.bossX=c.bx;state.bossY=c.by;
    if(c.age>=1.85){state.finImpact=null;p.action='';p.actionTime=0;p.finStunt=null;if(state.boss<=0){state.roundEnded=true;state.roundReason='BOSS DOWN';}broadcast();}
  };

  const beforeRecoveryAct=act;act=function(p,kind){if(p?.knockdown)return;return beforeRecoveryAct(p,kind);};
  const beforeRecoveryMove=move;move=function(x,y,run){if(state?.players?.[myId||'host']?.knockdown)return;return beforeRecoveryMove(x,y,run);};
  const beforeRecoverySim=simulate;simulate=function(dt){
    if(state?.phase==='game')for(const p of Object.values(state.players))if(p.knockdown){p.fx=p.fy=0;p.dodge=1;p.hp=40;}
    beforeRecoverySim(dt);
    if(state?.phase!=='game'||state.intro||state.ashenTransition||state.finale||frostPlaying())return;
    for(const p of Object.values(state.players)){
      if(p.hp<=0&&!p.knockdown){p.knockdown={age:0,x:p.x,y:p.y};p.hp=40;p.finStunt=null;p.stuntCombo=null;p.ecalSkill=null;p.action='';p.actionTime=0;p.jump=0;p.flying=false;p.climbing=false;}
      if(p.knockdown){const k=p.knockdown;k.age+=dt;p.x=k.x;p.y=k.y;p.fx=p.fy=0;p.hp=40;p.dodge=1;if(k.age>=2.6){p.knockdown=null;p.dodge=.8;say('BACK ON YOUR FEET · KEEP FIGHTING');}}
    }
  };

  window.finalPortalPoint=()=>({x:(window.modelVillageSpawn?.x??500)+65,y:window.modelVillageSpawn?.y??387});
  const beforeStormAct=act;act=function(p,kind){const hp=state?.boss;beforeStormAct(p,kind);if(state?.round===5&&state.finalStorm?.phase==='weakened'&&state.boss<hp&&state.boss>0)state.boss=Math.max(0,state.boss-(hp-state.boss)*.45);};
  const beforeStormSim=simulate;simulate=function(dt){
    if(state?.phase==='game'&&state.round===5&&!state.finalStorm){const host=state.players.host;state.finalStorm={energy:0,hits:0,phase:'charging',lastHP:state.boss,timer:2,rocks:[]};state.time=600;state.finalAllies=(host.hero==='ecal'?[]:[-1,1,2]).map((side,i)=>({...host,id:'final-echo-'+i,x:host.x+side*65,y:host.y-35,hp:100,score:0,fx:0,fy:0,action:'',actionTime:0,finStunt:null,ecalSkill:null,knockdown:null,attackWait:i*.4}));for(let i=0;i<2;i++)state.goons.push({id:'realm-creature-'+i,finalCreature:true,x:280+i*450,y:180,hp:10,attack:2+i});}
    const previousHP=state?.round===5?Object.fromEntries(Object.entries(state.players).map(([id,p])=>[id,p.hp])):{};
    beforeStormSim(dt);
    if(state?.phase!=='game'||state.round!==5||state.finale)return;
    const storm=state.finalStorm;if(!storm)return;state.finalAllies=(state.finalAllies||[]).filter(p=>p.hero!=='ecal');
    for(const [id,p] of Object.entries(state.players)){const loss=(previousHP[id]??p.hp)-p.hp;if(loss>0&&!p.knockdown){if(storm.phase==='tempest')p.hp=Math.max(0,p.hp-loss*.35);else if(storm.phase==='weakened')p.hp=Math.min(100,p.hp+loss*.3);}}
    if(state.boss<storm.lastHP)storm.hits++;storm.lastHP=state.boss;
    storm.phase=state.boss<state.bossMax*.35||storm.hits>=18?'weakened':storm.hits>=6?'tempest':'charging';
    const target=storm.phase==='weakened'?.08:Math.min(1,storm.hits/6);storm.energy+=(target-storm.energy)*Math.min(1,dt*2);
    storm.timer-=dt;if(storm.timer<=0&&storm.rocks.length<10){storm.timer=storm.phase==='tempest'?1.2:2.6;const p=Object.values(state.players)[Math.floor(Math.random()*Object.keys(state.players).length)];storm.rocks.push({x:Math.max(60,Math.min(940,p.x+(Math.random()-.5)*240)),y:Math.max(95,Math.min(530,p.y+(Math.random()-.5)*220)),age:0,hit:false});}
    for(const h of storm.rocks){h.age+=dt;if(h.age>=2&&!h.hit){h.hit=true;for(const p of Object.values(state.players))if(!p.knockdown&&p.dodge<=0&&p.jump<=0&&Math.hypot(p.x-h.x,p.y-h.y)<30)p.hp=Math.max(0,p.hp-12);}if(h.age>2&&h.age<5)for(const p of Object.values(state.players))if(!p.knockdown&&p.jump<=0&&Math.hypot(p.x-h.x,p.y-h.y)<20)p.hp=Math.max(0,p.hp-dt*4);}
    storm.rocks=storm.rocks.filter(h=>h.age<5);
    for(const [i,p] of (state.finalAllies||[]).entries()){const angle=i*Math.PI*2/3,tx=state.bossX+Math.cos(angle)*85,ty=state.bossY+Math.sin(angle)*85,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);p.fx=d>12?dx/d:0;p.fy=d>12?dy/d:0;p.x+=p.fx*Math.min(d,100*dt);p.y+=p.fy*Math.min(d,100*dt);p.moveSpeed=d>12?100:0;p.moveYaw=Math.atan2(p.fx,p.fy);p.actionTime=Math.max(0,p.actionTime-dt);p.attackWait-=dt;if(d<30&&p.attackWait<=0){p.attackWait=2.4+i*.15;p.action='punch';p.actionTime=.4;if(state.boss>1)state.boss=Math.max(1,state.boss-1);}}
    storm.lastHP=state.boss;
  };
  const beforeStormHUD=renderHUD;renderHUD=function(){beforeStormHUD();if(state?.phase==='game'&&state.round===5&&state.finalStorm)$('#bossPhase').textContent=state.finalStorm.phase==='weakened'?'WEAKENED · KEEP ATTACKING':state.finalStorm.phase==='tempest'?'TEMPEST · WATCH THE FALLING ROCKS':'ABSORBING HITS · POWER RISING';};
  const beforeRunBlend=simulate;simulate=function(dt){if(state?.players)for(const p of Object.values(state.players))p.runBlend=(p.runBlend||0)+((p.run?1:0)-(p.runBlend||0))*(1-Math.exp(-dt*5));return beforeRunBlend(dt);};
  const beforeClueAct=act;
  act=function(p,kind){
    if(state?.clueScene){if(kind==='skipClueScene'){window.VillageClueScene.finish(state);broadcast();}return;}
    const result=beforeClueAct(p,kind);
    if(state?.round===3&&window.VillageClueScene.photosFound(state.homeStudy)&&!state.homeStudy.cinematicSeen){window.VillageClueScene.begin(state,p);arenaTarget=null;broadcast();}
    return result;
  };
  const beforeClueMove=move;move=function(x,y,run){if(state?.clueScene)return;return beforeClueMove(x,y,run);};
  const beforeClueSim=simulate;simulate=function(dt){
    if(state?.phase==='game'&&state.round===3&&state.clueScene){
      for(const p of Object.values(state.players)){p.fx=p.fy=0;p.run=false;p.moveSpeed=0;}
      window.VillageClueScene.step(state,dt,window.clueCinematicReady===state.clueScene.id);return;
    }
    return beforeClueSim(dt);
  };
  window.addEventListener('skip-village-clue-scene',()=>action('skipClueScene'));
  prepare3DWorld();
})();
