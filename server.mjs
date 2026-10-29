// RIFT_FIX49_RESTORE_MOVEMENT: stable Fix47 gameplay restored.
import http from 'node:http';
import { createReadStream } from 'node:fs'; // RIFT_FIX67_STREAM_LARGE_ASSETS
import { readFile, stat, writeFile, rename } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { randomBytes } from 'node:crypto';

const root = new URL('.', import.meta.url).pathname;
const rooms = new Map();
const roomSavePath=new URL(process.env.RIFT_STATE_FILE||'rift-game-state.json',import.meta.url);
let savingRooms=false;
async function saveRooms(){
  if(savingRooms)return;savingRooms=true;
  try{
    const data=[...rooms.values()].map(({clients,players,...room})=>({...room,players:[...players]}));
    const temporary=new URL(roomSavePath.href+'.tmp');await writeFile(temporary,JSON.stringify(data));await rename(temporary,roomSavePath);
  }catch(error){console.warn('Game progress could not be saved:',error.message);}finally{savingRooms=false;}
}
setInterval(saveRooms,2000).unref();

const ORIE_ENABLED=true; // Repaired Orie is available for solo play and joining a party.
const mime = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.m4a': 'audio/mp4', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const worlds = [
  { name: 'Gop City', displayName: 'Gop City', chapter: 1, level: 1, title: 'Pod Commander', tint: '#f38158', hp: 180 },
  { name: 'Moon', displayName: 'Moon Surface', chapter: 2, level: 1, title: 'Moon Warlord', tint: '#8bd8ff', hp: 270 },
  { name: 'Moon', displayName: 'Riftship Hangar', environment: 'moon-ship', chapter: 2, level: 2, title: 'Riftship Captain', tint: '#8bd8ff', hp: 310 },
  { name: 'Frostfall', displayName: 'Frostfall', chapter: 3, level: 1, title: 'Glacier Warden', tint: '#66d4ec', hp: 250 },
  { name: 'Starfall Reach', displayName: 'Starfall Reach', chapter: 4, level: 1, title: 'The Rift Colossus', tint: '#b18cff', hp: 330 },
];
const weapons = [
  { id: 'riftblades', name: 'Twin Riftblades', cost: 0, damage: 20, note: 'Zo’s signature twin energy blades' },
  { id: 'spark', name: 'Spark Fists', cost: 0, damage: 16, note: 'A reliable close-range backup' },
  { id: 'exa-rifle', name: 'Exa’s Longshot', cost: 150, damage: 34, note: 'Heavy precision rifle · Exa’s signature weapon' },
  { id: 'withal-blasters', name: 'Withal’s Double Blasters', cost: 0, damage: 38, note: 'Twin hand cannons · delayed miss recovery' },
  { id: 'twinfang', name: 'Twinfang Blades', cost: 70, damage: 25, note: 'Fast, close-range strikes' },
  { id: 'nova', name: 'Nova Cannon', cost: 120, damage: 39, note: 'Heavy ranged blast' },
  { id: 'storm', name: 'Storm Chakrams', cost: 180, damage: 31, note: 'Swift spinning arcs' },
];
const upgrades = [
  { id: 'power', name: 'Power Core', cost: 90, note: 'Permanently boost every hit' },
  { id: 'vitality', name: 'Vitality Module', cost: 80, note: 'Restore health and increase max health' },
];
function worldObjects(index) {
  if (index === 2) {
    const packs = [{x:150,y:155},{x:370,y:285},{x:690,y:165},{x:860,y:370},{x:1080,y:250}];
    const offsets = [[-20,-13],[15,18],[29,-6]];
    const enemies = packs.flatMap((pack,group)=>offsets.map(([dx,dy],member)=>{
      const n=group*offsets.length+member,hp=62+(member===2?8:0);
      return {id:`riftship-robot-${n}`,name:member===2?'Hangar Sentinel':'Riftship Robot',kind:'robot',group:group+1,x:pack.x+dx,y:pack.y+dy,hp,maxHp:hp,attackAt:0};
    }));
    const chests=[{id:'riftship-chest-1',x:205,y:420,opened:false,reward:'power'},{id:'riftship-chest-2',x:925,y:125,opened:false,reward:'credits'},{id:'riftship-chest-3',x:710,y:420,opened:false,reward:'vitality'}];
    return {enemies,enemyCount:enemies.length,chests,bitsDrops:[]};
  }
  if (index === 1) {
    const packs = [{x:150,y:155},{x:370,y:285},{x:690,y:165},{x:860,y:370},{x:1080,y:250}];
    const offsets = [[-20,-13],[15,18],[29,-6]];
    const enemies = packs.flatMap((pack,group)=>offsets.map(([dx,dy],member)=>{
      const kind=member===2&&group%2===1?'fighter':'robot';
      const n=group*offsets.length+member;
      const hp=kind==='fighter'?72:54;
      return {id:`moon-raider-${n}`,name:kind==='fighter'?'Rift Fighter':'Moon Robot',kind,group:group+1,x:pack.x+dx,y:pack.y+dy,hp,maxHp:hp,attackAt:0};
    }));
    const chests=[{id:'moon-chest-1',x:205,y:420,opened:false,reward:'power'},{id:'moon-chest-2',x:925,y:125,opened:false,reward:'credits'},{id:'moon-chest-3',x:710,y:420,opened:false,reward:'vitality'}];
    return {enemies,enemyCount:enemies.length,chests,bitsDrops:[]};
  }
  const packs = [
    { x: 145, y: 150 }, { x: 390, y: 285 }, { x: 720, y: 155 }, { x: 805, y: 385 },
  ];
  const enemyNames = index === 0 ? ['Pod Trooper', 'Pod Vanguard', 'Pod Brute'] : ['Riftling', 'Ash Scout', 'Shard Hound'];
  const offsets = [[-24, -16], [18, 22], [34, -8]];
  const enemies = packs.flatMap((pack, group) => offsets.map(([dx, dy], member) => {
    const n = group * offsets.length + member;
    const worldStep=index>2?index-1:index, hp=42+worldStep*12;
    return { id: `${index}-raider-${n}`, name: enemyNames[member], group: group + 1, x: pack.x + dx, y: pack.y + dy, hp, maxHp: hp, attackAt: 0 };
  }));
  const chests = [
    { id: `${index}-chest-1`, x: 185, y: 410, opened: false, reward: 'power' },
    { id: `${index}-chest-2`, x: 782, y: 260, opened: false, reward: 'credits' },
    { id: `${index}-chest-3`, x: 650, y: 390, opened: false, reward: 'vitality' },
  ];
  return { enemies, enemyCount: enemies.length, chests, bitsDrops: [] };
}

function send(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'access-control-allow-origin': '*' });
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}
function json(req) {
  return new Promise((resolve, reject) => {
    let body = ''; req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch (e) { reject(e); } });
  });
}
function snapshot(room) {
  return {
    baseFloor45:room.baseFloor45||null, code: room.code, status: room.status, host: room.host, story: room.story, chapterIntro: room.chapterIntro || null, chapterComplete: room.chapterComplete || false, bossActive: room.bossActive, bossReady: room.bossReady, bossPosition:room.bossPosition||{x:480,y:25}, moonBoardReady:Boolean(room.moonBoardReady), enemyCount: room.enemyCount,
    world: room.world, boss: room.boss, players: [...room.players.values()], enemies: room.enemies, chests: room.chests, bitsDrops: room.bitsDrops || [],
    tutorialStage: room.tutorialStage || null, trainingHits: room.trainingHits || 0, trainingDummies: room.trainingDummies || [], trainingLasers: room.trainingLasers || [], trainingDodges: room.trainingDodges || 0, trainingDoor: room.trainingDoor || null, trainingEntrance: room.trainingEntrance || null, weapons, upgrades,
    message: room.message, updated: Date.now(),
  };
}
function broadcast(room) {
  const data = `data: ${JSON.stringify(snapshot(room))}\n\n`;
  for (const client of room.clients) { try { client.write(data); } catch {} }
}
function newRoom(code) {
  const objects = worldObjects(0);
  return { code, status: 'lobby', host: null, story: 'A massive invasion ship has arrived above Gop City. Red drop pods detach from its sides and crash into the city, spilling out enemy troops. They seize buildings and steal the city’s Bits. Zo wants to join the Riftbreakers; first he must help drive the invaders out and prove he is brave and strong enough.', worldIndex: 0, world: worlds[0], boss: { hp: worlds[0].hp, maxHp: worlds[0].hp }, bossActive: false, bossReady: false, bossPosition:{x:480,y:25}, moonBoardReady:false, ...objects, players: new Map(), clients: new Set(), message: 'Waiting for heroes…', lastTransition: 0 };
}
function roomError(res, message, status = 400) { send(res, status, { error: message }); }
function worldDistance(a, b) { return Math.hypot((a.x - b.x) * .06, (a.y - b.y) * .12); }
function collectBitsDrops(room, player) {
  const collected = (room.bitsDrops || []).filter(drop => worldDistance(drop, player) <= 2.1);
  if (!collected.length) return;
  room.bitsDrops = room.bitsDrops.filter(drop => !collected.includes(drop));
  const amount = collected.reduce((sum, drop) => sum + drop.amount, 0);
  player.credits += amount;
  room.message = `${player.name} collected ${collected.length === 1 ? 'a Bit crystal' : `${collected.length} Bit crystals`}! +${amount} Bits`;
}
function awakenBossIfFound(room, player) {
  // FIX121: Gop City has NO portal. Boss appears near the last-wave victor.
  if(!room.bossReady||room.bossActive)return;
  if(room.world.name==='Gop City'){
    room.bossActive=true;
    room.bossPosition={x:player.x+82,y:player.y-14};
    room.nextBossAttack=Date.now()+1800;
    room.message='Pod Commander has arrived! Keep moving: it must get close to strike.';
  }else if(worldDistance(player,{x:480,y:46})<9.5){
    room.bossActive=true;room.bossPosition={x:480,y:25};
    room.message=`The ${room.world.title} emerges from the Rift Gate!`;
  }
}
function advanceTutorial(room, player) {
  if (room.status !== 'tutorial') return;
  if (room.tutorialStage === 'find-training-entrance' && worldDistance(player, room.trainingEntrance) < 4.2) {
    room.tutorialStage = 'enter-training'; room.message = 'You found Exa’s warehouse. Press USE or E to enter the training area.';
  } else if (room.tutorialStage === 'follow-training' && worldDistance(player, { x: 1200, y: 392 }) < 2.4) {
    room.tutorialStage = 'practice-hits'; room.message = 'Exa: Hit a practice figure five times. Use QUICK HIT or POWER HIT.';
  } else if (room.tutorialStage === 'follow-lasers' && worldDistance(player, { x: 1200, y: 350 }) < 2.4) {
    room.tutorialStage = 'dodge-lasers'; room.message = 'Exa: The laser course is live. Dodge through each of the three beams.';
  } else if (room.tutorialStage === 'return-to-city' && worldDistance(player, room.trainingDoor) < 3.4) {
    room.tutorialStage = 'exit-training'; room.message = 'Training complete! Press USE or E at the final door to return to Gop City.';
  }
}
function inTrainingInterior(room) {
  return room.status === 'tutorial' && ['follow-training','practice-hits','follow-lasers','dodge-lasers','return-to-city','exit-training'].includes(room.tutorialStage);
}
function resetAfterPartyWipe(room) {
  const bossFight = room.bossActive;
  if (bossFight) {
    const maxHp = room.boss.maxHp || room.world.hp;
    room.boss = { hp: maxHp, maxHp };
    room.bossReady = true;
    room.bossActive = true;
  } else {
    Object.assign(room, worldObjects(room.worldIndex));
    room.boss = { hp: room.world.hp, maxHp: room.world.hp };
    room.bossReady = false;
    room.bossActive = false;
    room.bitsDrops = [];
  }
  room.status = 'playing';
  room.nextEnemyUpdate = Date.now() + 1200;
  room.nextBossAttack = Date.now() + 2200;
  room.bossPosition={x:480,y:25};
  if(bossFight&&room.world.name==='Gop City'){
    const spawn=[...room.players.values()][0];if(spawn)room.bossPosition={x:spawn.x+82,y:spawn.y-14};
  }
  let slot = 0;
  for (const hero of room.players.values()) {
    hero.hp = hero.maxHp || 100;
    hero.rage = 0;
    hero.rageUntil = 0;
    hero.dodgeUntil = 0;
    hero.lastHurt = 0;
    hero.attackUntil = 0;
    hero.jumpUntil = 0;
    hero.elevation = 0; hero.zipTravel = null;hero.fallTravel=null;hero.jumpTravel=null;
    hero.x = 480 + ((slot % 4) - 1.5) * 32;
    hero.y = bossFight ? 112 - Math.floor(slot / 4) * 20 : 438 - Math.floor(slot / 4) * 18;
    slot++;
  }
  room.message = bossFight
    ? 'The crew was defeated. All heroes are back, and the boss has reset. Cleared enemy waves stay cleared.'
    : 'The crew was defeated. All heroes and the current enemy wave have reset.';
}
function restoreGroundOutfit(hero){
  hero.spaceSuit=false;hero.flying=false;hero.cloakedUntil=0;
  hero.elevation=0;hero.zipTravel=null;hero.fallTravel=null;hero.jumpTravel=null;
  if(hero.hero==='Zo'){hero.weapon='riftblades';hero.weaponsDrawn=true;hero.owned||=[];if(!hero.owned.includes('riftblades'))hero.owned.push('riftblades');}
}
function trainingLaserDamage(room,p,from=p){
  if(room.status!=='tutorial'||room.tutorialStage!=='dodge-lasers'||p.hp<=0||p.dodgeUntil>Date.now())return false;
  const now=Date.now();if(now-(p.lastLaserHit||0)<1000)return false;
  const hit=(room.trainingLasers||[]).slice(room.trainingDodges||0).some(gate=>{
    if(Math.min(from.y,p.y)>gate.y+4||Math.max(from.y,p.y)<gate.y-4)return false;
    const t=Math.abs(p.y-from.y)<.001?0:Math.max(0,Math.min(1,(gate.y-from.y)/(p.y-from.y)));
    return Math.abs(from.x+(p.x-from.x)*t-gate.x)<72;
  });
  if(!hit)return false;
  p.lastLaserHit=now;p.hp=Math.max(0,p.hp-15);room.message='Laser hit! −15 health. Dodge straight through the beam to avoid damage.';
  if(p.hp===0){const gate=room.trainingLasers[room.trainingDodges||0];p.hp=p.maxHp||100;p.x=gate.x;p.y=gate.y+35;p.facing=0;p.elevation=0;p.jumpTravel=null;p.fallTravel=null;room.message='Exa: Try again. You are back at the current laser with full health.';}
  return true;
}
// FIX121: World location of the visible capital ship above the Moon.
const moonBoardTarget121={x:480,y:438-78/.12};
function boardMoonShip121(room,p,manual=false){
  // FIX134: Flying to the capital ship is the route to Level 2, no boss kill needed.
  if(room.status!=='playing'||room.worldIndex!==1||p.hp<=0)return false;
  const altitude=p.elevation||0,near=worldDistance(p,moonBoardTarget121)<19;
  if(!p.flying||altitude<29||altitude>57||!near){
    if(manual)room.message='Boarding is open! Take off, climb to height 29–57 and fly NORTH to the huge Riftship. No boss defeat needed.';
    return false;
  }
  room.worldIndex=2;room.world=worlds[2];room.boss={hp:room.world.hp,maxHp:room.world.hp};
  room.bossActive=false;room.bossReady=false;room.moonBoardReady=false;room.bossPosition={x:480,y:25};
  Object.assign(room,worldObjects(2));room.status='break';
  let slot=0;
  for(const hero of room.players.values()){
    hero.x=480+(slot++%4)*28;hero.y=470;hero.flying=false;hero.landing121=false;hero.elevation=0;
    hero.zipTravel=null;hero.jumpTravel=null;hero.fallTravel=null;
    hero.hp=Math.min(hero.maxHp||100,hero.hp+32);if(hero.hero==='Withal')hero.spaceSuit=true;
  }
  room.message='Riftship boarding successful! Entering Chapter 2 · Level 2 Hangar...';
  setTimeout(()=>{
    if(room.status!=='break'||room.worldIndex!==2)return;
    room.status='playing';room.message='The Riftship Hangar is open. Clear the robot defenses and find the Captain.';broadcast(room);
  },1800);
  broadcast(room);return true;
}
function applyAction(room, p, action) {
  // RIFT_FIX63_RAGE_FINISHER: authoritative twin-robot cinematic, not an ordinary Rage buff.
  if(action.type==='rift-finisher63'){
    if(p.hero!=='Zo'||room.status!=='playing'||p.hp<=0||p.riftFinisher63||p.rage<100||p.zipTravel||p.jumpTravel||p.fallTravel||p.ledgeClimb46)return;
    const targets=[...room.enemies].filter(e=>e.hp>0&&e.kind!=='fighter'&&!e.riftFinisher63&&!e.grippedBy&&worldDistance(e,p)<=13)
      .sort((a,b)=>worldDistance(a,p)-worldDistance(b,p)).slice(0,2);
    if(targets.length!==2){room.message='RAGE FINISHER: approach two nearby robots first.';return;}
    const now=Date.now();p.rage=0;p.rageUntil=0;p.flying=false;
    p.jumpUntil=0;p.zipTravel=null;p.jumpTravel=null;p.fallTravel=null;
    p.riftFinisher63={started:now,targets:targets.map(e=>e.id),duration:3850,done:false};
    p.weaponsDrawn=true;
    const mid={x:(targets[0].x+targets[1].x)/2,y:(targets[0].y+targets[1].y)/2};
    p.facing=Math.atan2(-((mid.x-p.x)*.06),-((mid.y-p.y)*.12));
    for(let side=0;side<2;side++)targets[side].riftFinisher63={owner:p.id,side};
    room.message=p.name+' unleashes TWIN RIFTBLADE RAGE FINISHER!';
    return;
  }
  if(p.riftFinisher63&&action.type!=='leave')return;
  if(ORIE_ENABLED&&action.type==='orie-test'&&p.id===room.host){p.hero='Orie';p.name='Orie';p.weapon='spark';p.spaceSuit=false;room.status='playing';room.tutorialStage='complete';p.x=480;p.y=438;room.message='Orie enters Gop City. Use his magic to defeat the pod squads.';return;}
  if(action.type==='orie-power'&&p.hero==='Orie'&&p.hp>0&&room.status==='playing'){
    const now=Date.now(),power=action.power;p.orieCooldowns||={};
    if(now<(p.orieCooldowns[power]||0))return;
    const durations={flight:300,shield:6500,dash:1300,explosion:4000,grip:600,throw:1200,pound:4500,impact:0};
    if(!(power in durations)||power==='impact'&&!p.poundUntil)return;
    p.orieCooldowns[power]=now+durations[power];
    if(power==='flight'){p.flying=!p.flying;p.elevation=p.flying?4:0;p.jumpTravel=null;p.fallTravel=null;return;}
    if(power==='shield'){p.shieldUntil=now+4000;return;}
    if(power==='grip'){
      const enemy=room.enemies.filter(e=>!e.grippedBy).sort((a,b)=>worldDistance(a,p)-worldDistance(b,p))[0];
      if(!enemy||worldDistance(enemy,p)>18){room.message='Move within reach of an enemy to grip it.';return;}
      for(const e of room.enemies)if(e.grippedBy===p.id)e.grippedBy=null;
      enemy.grippedBy=p.id;enemy.gripUntil=now+6000;p.gripTarget=enemy.id;return;
    }
    if(power==='pound'){p.flying=false;p.jumpTravel=null;p.fallTravel=null;p.poundStart=p.elevation||0;p.poundUntil=now+850;return;}
    let radius=power==='explosion'?8:power==='impact'?10:power==='throw'?5:3.8,damage=power==='impact'?65:power==='explosion'?48:power==='throw'?55:32,cx=p.x,cy=p.y;
    if(power==='dash'){p.x-=Math.sin(p.facing||0)*8/.06;p.y-=Math.cos(p.facing||0)*8/.12;cx=p.x;cy=p.y;p.dodgeUntil=now+450;}
    if(power==='throw'){
      const enemy=room.enemies.find(e=>e.id===p.gripTarget&&e.grippedBy===p.id);if(!enemy)return;
      enemy.grippedBy=null;enemy.x=p.x-Math.sin(p.facing||0)*14/.06;enemy.y=p.y-Math.cos(p.facing||0)*14/.12;enemy.hp=Math.max(0,enemy.hp-55);enemy.throwUntil=now+600;cx=enemy.x;cy=enemy.y;p.gripTarget=null;
    }
    if(power==='impact'){p.poundUntil=0;p.elevation=0;}
    p.orieEffect={type:power,x:cx,y:cy,started:now,until:now+700,radius};p.attackUntil=now+400;
    for(const enemy of room.enemies)if(worldDistance(enemy,{x:cx,y:cy})<=radius)enemy.hp=Math.max(0,enemy.hp-damage);
    for(const enemy of room.enemies.filter(e=>e.hp<=0)){p.score+=50;room.bitsDrops||=[];room.bitsDrops.push({id:enemy.id+'-bits',x:enemy.x,y:enemy.y,amount:30});}
    room.enemies=room.enemies.filter(e=>e.hp>0);
    if(!room.enemies.length){room.bossReady=true;awakenBossIfFound(room,p);}
    // Route boss hits through the existing combat handler so chapter progression remains intact.
    if(room.bossActive&&worldDistance(room.world.name==='Gop City'?(room.bossPosition||{x:480,y:25}):{x:480,y:46}, {x:cx,y:cy})<=radius+5){p.lastAttack=0;applyAction(room,p,{type:'heavy'});}
    room.message='Orie · '+(power==='impact'?'GROUND POUND':power.toUpperCase());return;
  }
  if(action.type==='zipline'&&p.hero==='Zo'&&p.hp>0&&['playing','tutorial'].includes(room.status)){
    const target={x:Number(action.x),y:Number(action.height),z:Number(action.z)},start={x:(p.x-480)*.06,y:p.elevation||0,z:(p.y-438)*.12};
    if(!Object.values(target).every(Number.isFinite)||target.y<0||target.y>40||Math.hypot(target.x-start.x,target.y-start.y,target.z-start.z)>130||p.zipTravel)return;
    const distance=Math.hypot(target.x-start.x,target.y-start.y,target.z-start.z);
    p.zipTravel={start,target,started:Date.now(),duration:Math.max(420,Math.min(1700,distance/45*1000))};p.flying=false;p.fallTravel=null;p.jumpTravel=null;return;
  }
  if(action.type==='jump-support'&&p.jumpTravel&&Number.isFinite(action.height)&&action.height>=0&&action.height<=(p.elevation||0)+.4){p.jumpTravel.floor=action.height;return;}
  if(action.type==='zip-land'&&!p.jumpTravel&&!p.zipTravel&&!p.flying&&Number.isFinite(action.height)&&action.height>=0&&action.height<(p.elevation||0)){
    if(p.fallTravel)p.fallTravel.floor=action.height;
    else p.fallTravel={start:p.elevation||0,floor:action.height,started:Date.now()};
    return;
  }
  // RIFT_FIX43_STABLE_SLOPES: emergency recovery only on the outside Gop City map.
  if(action.type==='gop-unstuck43'){
    if(room.world?.name!=='Gop City'||!['playing','tutorial'].includes(room.status)||inTrainingInterior(room)||p.hp<=0)return;
    if(Date.now()-(p.lastGopUnstuck43||0)<3500)return;
    p.lastGopUnstuck43=Date.now();
    p.x=480;p.y=390;p.elevation=0;p.flying=false;
    p.zipTravel=null;p.fallTravel=null;p.jumpTravel=null;p.ledgeClimb46=null;p.jumpUntil=0;
    room.message=p.name+' returned safely to the Gop City road.';
    return;
  }
  // RIFT_FIX45_BASE_ENTRY_FLOOR: one actual floor placed at the photographed dark doorway.
  // Location is anchored to the player's real position and facing, never guessed from the artwork.
  if(action.type==='gop-base-floor45'){
    if(room.world?.name!=='Gop City'||!['playing','tutorial'].includes(room.status)||inTrainingInterior(room)||p.hp<=0||p.zipTravel||p.jumpTravel||p.fallTravel)return;
    const now=Date.now();if(now-(p.lastBaseFloor45||0)<2400)return;
    p.lastBaseFloor45=now;
    const yaw=Number.isFinite(p.facing)?p.facing:0;
    const fx=-Math.sin(yaw),fz=-Math.cos(yaw),cx=(p.x-480)*.06,cz=(p.y-438)*.12;
    const y=Math.max(0,Math.min(85,Number(p.elevation)||0));
    room.baseFloor45={x:cx+fx*4.15,z:cz+fz*4.15,y,yaw,width:4.4,length:10};
    room.message='Base entrance floor placed. You can walk through the doorway without falling through the new platform.';
    return;
  }
  // RIFT_FIX46_SOLID_CITY RIFT_FIX47_WALL_CLIMB: slower, staged ledge latch / pull-up.
  if(action.type==='gop-ledge46'){
    if(room.world?.name!=='Gop City'||!['playing','tutorial'].includes(room.status)||inTrainingInterior(room)||p.hp<=0||p.hero!=='Zo'||p.flying||p.zipTravel||p.ledgeClimb46)return;
    const x=Number(action.x),z=Number(action.z),height=Number(action.height),oldY=Math.max(0,p.elevation||0);
    if(![x,z,height].every(Number.isFinite))return;
    if(height<oldY+.65||height>oldY+3.8||height>85)return;
    const px=(p.x-480)*.06,pz=(p.y-438)*.12,dx=x-px,dz=z-pz;
    if(Math.hypot(dx,dz)>2.05||Math.hypot(dx,dz)<.24)return;
    const yaw=Number(p.facing)||0;
    if(dx*(-Math.sin(yaw))+dz*(-Math.cos(yaw))<.18)return;
    if(Date.now()-(p.lastLedge46||0)<1450)return;
    p.lastLedge46=Date.now();
    p.zipTravel=null;p.fallTravel=null;p.jumpTravel=null;
    p.ledgeClimb46={startX:p.x,startY:p.y,startHeight:oldY,endX:480+x/.06,endY:438+z/.12,endHeight:height,started:Date.now(),duration:1340};
    room.message=p.name+' grabs the ledge and pulls up!';
    return;
  }
  if(action.type==='move'&&p.ledgeClimb46)return;
  if(action.type==='move'&&p.zipTravel)return;
  if (action.type === 'urite-companion' && room.status === 'playing' && room.world.name === 'Moon' && room.players.size === 1 && p.id === room.host && p.hp > 0) {
    const now = Date.now();
    if (now - (room.npcUriteAttackAt || 0) < 1650) return;
    const urite = { x: p.x - 18, y: p.y + 9 };
    const target = [...room.enemies].sort((a,b)=>worldDistance(a,urite)-worldDistance(b,urite))[0];
    if (!target || worldDistance(target,urite) > 1.65) return;
    room.npcUriteAttackAt = now;
    target.hp = Math.max(0, target.hp - 24);
    if (target.hp === 0) {
      room.enemies = room.enemies.filter(enemy => enemy.id !== target.id);
      p.score += 50; room.bitsDrops ||= [];
      room.bitsDrops.push({ id: `${target.id}-bits`, x: target.x, y: target.y, amount: 30 });
      if (!room.enemies.length) {
        room.bossReady = true; room.message = 'Urite defeated the last robot in the wave! The Rift Gate is open—find it in the northern reach.';
        awakenBossIfFound(room, p);
      } else room.message = `Urite blasted a ${target.name}! A Bit crystal dropped nearby.`;
    } else room.message = `Urite blasted ${target.name} for 24 damage!`;
  } else if (action.type === 'jump' && (room.status === 'playing' || room.status === 'tutorial') && p.hp > 0) {
    const now=Date.now();if(p.zipTravel||p.flying||now-(p.lastJumpAt||0)<140)return;
    const previous=p.jumpTravel;
    if(previous&&previous.count>=2)return;
    const elapsed=previous?Math.max(0,(now-previous.started)/1000):0;
    const height=previous?Math.max(previous.floor,previous.start+previous.velocity*elapsed-14*elapsed*elapsed):(p.elevation||0);
    p.jumpTravel={start:height,floor:previous?.floor??(p.fallTravel?.floor??height),velocity:previous?10:8.5,started:now,count:previous?2:1};
    p.elevation=height;p.fallTravel=null;p.lastJumpAt=now;p.jumpUntil=now+650;
  } else if (action.type === 'turn' && (room.status === 'playing' || room.status === 'tutorial') && p.hp > 0) {
    p.facing=((p.facing||0)+(Number(action.direction)<0?-1:1)*Math.PI/4)%(Math.PI*2);
  } else if ((action.type === 'attack' || action.type === 'heavy') && room.status === 'tutorial' && room.tutorialStage === 'practice-hits' && p.hp > 0) {
    const now = Date.now(),reach = 3.2;
    const target = [...room.trainingDummies].sort((a,b)=>worldDistance(a,p)-worldDistance(b,p))[0];
    if (!target || worldDistance(target,p) > reach) { room.message = 'Move closer to a practice figure, then strike.'; return; }
    const heavy = action.type === 'heavy';
    if (heavy ? now - (p.lastHeavy || 0) < 1100 : now - p.lastAttack < 430) return;
    p.lastAttack = now;if(heavy)p.lastHeavy=now;p.slashSide=action.slashSide==='r'?'r':'l';p.attackType=heavy?'heavy':'quick';p.attackUntil=now+(heavy?540:360);
    p.facing = Math.atan2(-((target.x-p.x)*.06),-((target.y-p.y)*.12));
    room.trainingHits++;
    if(room.trainingHits>=5){room.trainingHits=5;room.tutorialStage='follow-lasers';room.message='Five hits! Exa is heading to the laser-dodge course. Follow him.';}
    else room.message=`Practice hit ${room.trainingHits} of 5. Keep going!`;
  } else if (action.type === 'move' && (room.status === 'playing' || room.status === 'tutorial') && p.hp > 0) {
    const dx = Math.max(-1, Math.min(1, Number(action.dx) || 0));
    const dy = Math.max(-1, Math.min(1, Number(action.dy) || 0));
    const mag = Math.hypot(dx, dy) || 1;
    const beforeMove={x:p.x,y:p.y};
    const speed = p.flying&&room.worldIndex===1?13:(p.rageUntil > Date.now() ? (p.hero==='Zo'?15:11) : 6); // FIX134 faster flight toward distant ship
    const inside=inTrainingInterior(room);
    p.facing = Math.atan2(-dx,-dy);
    // RIFT_FIX41_WALKABLE_CITY RIFT_FIX42_WALKABLE_CITY: slopes, rooftops and expanded real city.
    const walk41=room.world?.name==='Gop City'&&!inside&&!p.zipTravel&&!p.jumpTravel&&!p.fallTravel&&!p.flying;
    const requested41=Number(action.terrainHeight);
    const terrain41=walk41&&action.terrainHeight!==undefined&&Number.isFinite(requested41)&&requested41>=0&&requested41<=85;
    const previousHeight41=Number(p.elevation)||0;
    // A non-jumping player cannot step directly onto a high rooftop or through a cliff.
    if(terrain41&&requested41>previousHeight41+1.65)return;
    p.x = room.world?.name==='Gop City'&&!inside ? Math.max(-2800,Math.min(3800,p.x+dx/mag*speed)) : (p.elevation>1?p.x+dx/mag*speed:Math.max(inside?1019:14, Math.min(inside?1381:1450, p.x + dx / mag * speed)));
    p.y = room.world?.name==='Gop City'&&!inside ? Math.max(-1900,Math.min(2350,p.y+dy/mag*speed)) : (p.elevation>1?p.y+dy/mag*speed:Math.max(inside?171:18, Math.min(inside?445:532, p.y + dy / mag * speed)));
    if(terrain41){
      if(requested41<previousHeight41-1.1){p.fallTravel={start:previousHeight41,floor:requested41,started:Date.now()};}
      else p.elevation=requested41;
    }
    // RIFT_FIX45_BASE_ENTRY_FLOOR RIFT_FIX46_SOLID_CITY: supporting platform and correctly oriented edges.
    const entry=room.world?.name==='Gop City'&&!inside?room.baseFloor45:null;
    if(entry&&!p.zipTravel&&!p.flying){
      const local=(px,pz)=>{
        const x=(px-480)*.06-entry.x,z=(pz-438)*.12-entry.z,c=Math.cos(entry.yaw||0),t=Math.sin(entry.yaw||0);
        return {u:x*c-z*t,v:x*t+z*c};
      };
      const a=local(beforeMove.x,beforeMove.y),b=local(p.x,p.y);
      const covers=k=>Math.abs(k.u)<=entry.width/2-.08&&Math.abs(k.v)<=entry.length/2-.08;
      const wasOn=covers(a),willBeOn=covers(b);
      if(wasOn&&!willBeOn&&b.v<entry.length/2-.10){
        // Side and back edges stop accidental falls; entrance side remains open.
        p.x=beforeMove.x;p.y=beforeMove.y;
      }else if(willBeOn&&!p.jumpTravel&&!p.fallTravel&&Math.abs((p.elevation||0)-entry.y)<2.1){
        p.elevation=entry.y;
      }
    }
    // A normal walk may rise smoothly onto mapped slopes; no instant roof teleport.
    if(room.world?.name==='Gop City'&&!inside&&!p.zipTravel&&!p.jumpTravel&&!p.fallTravel&&!p.flying){
      const requested=Number(action.terrainHeight), onEntry=entry&&Math.abs((p.x-480)*.06-entry.x)<entry.width+6;
      if(Number.isFinite(requested)&&requested>=0&&requested<=85){
        const allowedFloor=entry&&action.navFloor46&&Math.abs(requested-entry.y)<.13;
        if(allowedFloor){p.elevation=entry.y;}
        else if(requested<=p.elevation+1.48&&requested>=p.elevation-1.04){p.elevation=requested;}
      }
    }
    trainingLaserDamage(room,p,beforeMove);
    advanceTutorial(room,p);
    awakenBossIfFound(room, p);
    collectBitsDrops(room, p);
  } else if ((action.type === 'attack' || action.type === 'heavy' || action.type === 'blast') && room.status === 'playing' && p.hp > 0) {
    const now = Date.now();
    const item = weapons.find(w => w.id === p.weapon);
    const blast = action.type === 'blast' && p.hero === 'Urite' && p.spaceSuit && room.world.name === 'Moon';
    const reach = blast ? 22 : p.hero === 'Exa' ? 37.2 : p.hero === 'Withal' ? 27 : p.weapon === 'nova' ? 22.2 : p.weapon === 'storm' ? 13.2 : p.weapon === 'twinfang' ? 4.2 : p.weapon === 'riftblades' ? (p.weaponsDrawn === false ? 3.2 : 4.8) : 3.2;
    const bossDistance = worldDistance(p, room.world.name==='Gop City'?(room.bossPosition||{x:480,y:25}):{x:480,y:25});
    const nearestEnemy = [...room.enemies].filter(e=>!e.riftFinisher63).sort((a,b)=>worldDistance(a,p)-worldDistance(b,p))[0];
    const enemyInRange = nearestEnemy && worldDistance(nearestEnemy,p) <= reach;
    const bossInRange = room.bossActive && bossDistance <= reach;
    if (!enemyInRange && !bossInRange) {
      room.message = room.enemies.length ? `${p.name}, wait for a Rift enemy to close in or move nearer before striking.` : room.bossReady ? `${p.name}, find the northern Rift Gate to reveal the boss.` : `${p.name}, move closer to the awakened ${room.world.title}.`;
      if (p.hero === 'Withal' && room.status === 'playing' && p.hp > 0 && now >= (p.recoverAt || 0) && (room.enemies.length || room.bossActive)) {
        p.recoverAt = now + 1800;
        room.message = `${p.name} missed—but Withal’s blasters are locking onto a recovery shot!`;
        setTimeout(() => {
          if (room.status !== 'playing' || p.hp <= 0 || room.players.get(p.id) !== p) return;
          const target = [...room.enemies].sort((a,b)=>worldDistance(a,p)-worldDistance(b,p))[0];
          const damage = 32 + (p.power || 0);
          p.score += damage;p.credits += 5;
          if (target) {
            target.hp = Math.max(0,target.hp-damage);
            if (target.hp === 0) {
              room.enemies = room.enemies.filter(e=>e.id!==target.id);p.score+=50;
              room.bitsDrops ||= [];room.bitsDrops.push({id:`${target.id}-bits`,x:target.x,y:target.y,amount:30});
              if (!room.enemies.length) { room.bossReady=true;room.message=`Withal’s recovery shot cleared the last enemy! Find the Rift Gate.`;awakenBossIfFound(room,p); }
              else room.message=`Withal’s one-second recovery shot defeated a ${target.name}! A Bit crystal dropped nearby.`;
            } else room.message=`Withal’s one-second recovery shot hit ${target.name} for ${damage}!`;
          } else if (room.bossActive) {
            room.boss.hp=Math.max(1,room.boss.hp-damage);
            room.message=`Withal’s one-second recovery shot hit ${room.world.title} for ${damage}!`;
          }
          broadcast(room);
        },1000);
      }
      return;
    }
    const heavy = action.type === 'heavy';
    if (blast ? now - (p.lastBlast || 0) < 850 : heavy ? now - (p.lastHeavy || 0) < 1100 : now - p.lastAttack < (p.weapon === 'nova' ? 700 : 430)) return;
    const attackTarget = enemyInRange ? nearestEnemy : (room.world.name==='Gop City'?(room.bossPosition||{x:480,y:25}):{x:480,y:25});
    p.facing = Math.atan2(-((attackTarget.x - p.x) * .06), -((attackTarget.y - p.y) * .12));
    p.lastAttack = now;if(blast)p.lastBlast=now;
    if (heavy) p.lastHeavy = now;
    p.slashSide=action.slashSide==='r'?'r':'l';p.attackType = blast ? 'blast' : heavy ? 'heavy' : 'quick'; p.attackUntil = now + (heavy ? 540 : 360);
    const power = (blast ? 32 : p.weapon === 'riftblades' && p.weaponsDrawn === false ? 16 : item?.damage || 16) + (p.power || 0);
    const boosted = p.rageUntil > now ? (p.hero==='Zo'?3:1.65) : 1;
    const damage = Math.round(power * (heavy ? 1.75 : 1) * boosted * (p.hero === 'Exa' ? 1.25 : p.hero === 'Urite' ? 1.2 : p.hero === 'Withal' ? 1.35 : 1));
    if (enemyInRange) {
      nearestEnemy.hp = Math.max(0, nearestEnemy.hp - damage);
      if (nearestEnemy.hp === 0) {
        room.enemies = room.enemies.filter(e => e.id !== nearestEnemy.id); p.score += 50;
        room.bitsDrops ||= [];
        room.bitsDrops.push({ id: `${nearestEnemy.id}-bits`, x: nearestEnemy.x, y: nearestEnemy.y, amount: 30 });
        if (!room.enemies.length) {
          room.bossReady = true; room.message = `${p.name} defeated the last Rift enemy! The Rift Gate is open—find it in the northern reach.`;
          awakenBossIfFound(room, p);
        }
        else room.message = `${p.name} defeated a ${nearestEnemy.name}! A Bit crystal dropped nearby.`;
      }
      else room.message = `${p.name} hit ${nearestEnemy.name} for ${damage}!`;
    } else {
      room.boss.hp = Math.max(0, room.boss.hp - damage);
      room.message = `${p.name} ${heavy ? 'powered through' : 'struck'} ${room.world.title} for ${damage}!`;
    }
    p.credits += heavy ? 8 : 5;
    p.score += damage;
    room.message += ` +${heavy ? 8 : 5} Bits`;
    if (room.boss.hp === 0 && room.lastTransition < now) {
      if(room.worldIndex===1){
        // FIX120: Moon victory unlocks boarding, not a timed scene skip.
        room.moonBoardReady=true;room.bossActive=false;room.bossReady=false;
        room.lastTransition=now+2000;
        for(const hero of room.players.values()){hero.credits+=50;hero.score+=100;}
        room.message='Moon Warlord defeated! Fly NORTH and HIGH to the giant Riftship. Level 2 begins when you reach its underside.';
        return;
      }
      room.lastTransition = now + 11300;
      room.status = 'break';
      room.message = `${room.world.title} defeated! The next gate is opening…`;
      setTimeout(() => {
        if (room.status !== 'break') return;
        for (const hero of room.players.values()) { hero.credits += 50; hero.score += 100; }
        room.worldIndex++;
        if (room.worldIndex >= worlds.length) {
          room.status = 'won'; room.message = 'The Rift Colossus is defeated! Zo has proven himself and earned his place among the Riftbreakers.';
        } else {
          room.world = worlds[room.worldIndex]; room.boss = { hp: room.world.hp, maxHp: room.world.hp }; room.bossActive = false; room.bossReady = false;
          Object.assign(room, worldObjects(room.worldIndex));
          for (const hero of room.players.values()) { hero.hp = Math.min(hero.maxHp || 100, hero.hp + 32); hero.elevation=0; hero.zipTravel=null;hero.fallTravel=null;hero.jumpTravel=null; }
          if (room.worldIndex === 1) {
            room.chapterIntro = 'moon'; room.chapterComplete = false;
            for (const hero of room.players.values()) {
              hero.hero = hero.hero==='Orie'?'Orie':hero.id === room.host ? 'Zo' : hero.hero === 'Withal' ? 'Withal' : 'Urite';
              hero.spaceSuit = true; hero.flying = false; hero.cloakedUntil = 0;
              if (hero.id === room.host) hero.weapon = 'riftblades';
              else if (hero.hero === 'Withal') { hero.weapon = 'withal-blasters'; hero.owned ||= []; if (!hero.owned.includes('withal-blasters')) hero.owned.push('withal-blasters'); }
            }
            room.status = 'intro';
            room.message = 'Urite has arrived in Gop City: “A massive robot army is coming. Zo, we need to take the fight to the Moon!”';
          } else if (room.worldIndex === 2) {
            let slot=0;
            for(const hero of room.players.values()){hero.x=480+(slot++%4)*28;hero.y=470;hero.flying=false;if(hero.hero==='Withal')hero.spaceSuit=true;}
            room.message='You have boarded the invasion ship. Clear the robot-only hangar wave, then find the Riftship Captain.';
            // This chapter level also uses the gate-break interlude. Without
            // ending it, the server rejects every move because movement is
            // accepted only while the room is playing or in the tutorial.
            setTimeout(() => {
              if (room.status !== 'break') return;
              room.status = 'playing';
              room.message = `The break is over. Enter ${room.world.displayName||room.world.name} and face the ${room.world.title}!`;
              broadcast(room);
            }, 9000);
          } else {
            if (room.worldIndex > 2) for (const hero of room.players.values()) restoreGroundOutfit(hero);
            room.message = `${room.world.displayName||room.world.name} unlocked! Visit the armory. Next: ${room.world.title}.`;
            setTimeout(() => {
              if (room.status !== 'break') return;
              room.status = 'playing'; room.message = `The break is over. Enter ${room.world.displayName||room.world.name} and face the ${room.world.title}!`; broadcast(room);
            }, 9000);
          }
        }
        broadcast(room);
      }, 2300);
    }
  } else if (action.type === 'dodge' && (room.status === 'playing' || room.status === 'tutorial') && p.hp > 0) {
    const now = Date.now();
    if (now < (p.dodgeUntil || 0)) return;
    const before={x:p.x,y:p.y},facing=p.facing||0,distance=p.rageUntil>now?9:7.2;
    const inside=inTrainingInterior(room);
    p.x=Math.max(inside?1019:14,Math.min(inside?1381:1450,p.x-Math.sin(facing)*distance/.06));
    p.y=Math.max(inside?171:70,Math.min(inside?445:505,p.y-Math.cos(facing)*distance/.12));
    p.dodgeUntil=now+850;
    if(room.status==='tutorial'&&room.tutorialStage==='dodge-lasers'){
      const gate=room.trainingLasers?.[room.trainingDodges||0];
      const crossed=gate&&(before.y-gate.y)*(p.y-gate.y)<0;
      const t=gate?(gate.y-before.y)/(p.y-before.y):0;
      if(crossed&&Math.abs(before.x+(p.x-before.x)*t-gate.x)<72){room.trainingDodges++;if(room.trainingDodges>=3){room.trainingDodges=3;room.tutorialStage='return-to-city';room.message='All three lasers dodged! Follow Exa to the final door back to Gop City.';}else room.message=`Laser ${room.trainingDodges} of 3 cleared! Follow Exa to the next beam.`;}
      else if(gate)room.message='Face the beam and dodge straight through it.';
    }
  } else if (action.type === 'hurt' && room.status === 'playing' && p.hp > 0 && !p.riftFinisher63) {
    const now = Date.now();
    if (now - p.lastHurt < 1150 || p.shieldUntil>now) return;
    p.lastHurt = now;
    p.hp = Math.max(0, p.hp - (room.practice ? 10 : 13));
    p.rage = Math.min(100, p.rage + 35);
    if(p.hero==='Zo'&&p.rage>=100)room.message=p.name+' · RAGE FINISHER READY — PRESS F!';
    if (p.rage >= 100 && p.rageUntil < now && p.hero!=='Zo') { p.rage = 0; p.rageUntil = now + (p.hero==='Zo'?7000:5000); room.message = p.hero==='Zo'?`${p.name} · RIFT RAGE! 2.5× SPEED · 3× DAMAGE · 7 SECONDS!`:`${p.name} is RAGING! Speed and damage boosted!`; }
    if ([...room.players.values()].every(hero => hero.hp <= 0)) resetAfterPartyWipe(room);
  } else if (action.type === 'flight-height120' && room.status === 'playing' && p.hp>0 && p.spaceSuit && p.flying && room.worldIndex===1) {
    const now=Date.now(),direction=Math.sign(Number(action.direction)||0);
    if(!direction||now-(p.lastFlightStep120||0)<150)return;
    p.lastFlightStep120=now;
    // FIX134: More responsive altitude control with a capped, server-authoritative height.
    p.elevation=Math.max(1.5,Math.min(72,(p.elevation||3)+direction*3.5));
  } else if (action.type === 'board-mothership120' && room.status==='playing' && room.worldIndex===1 && p.hp>0) {
    // FIX134: Boarding is available from the start of the Moon surface.
    boardMoonShip121(room,p,true);
  } else if (action.type === 'flight' && room.status === 'playing' && p.hp > 0 && ['Zo','Urite'].includes(p.hero) && room.worldIndex===1) {
    // FIX122: Allow the Moon heroes to fly even if an older saved room lacked spaceSuit.
    p.spaceSuit=true;
    p.flying = !p.flying;
    p.landing121=!p.flying;
    p.elevation=p.flying?Math.max(3,p.elevation||0):(p.elevation||0);
    p.jumpTravel=null;p.fallTravel=null;
    room.message = `${p.name} ${p.flying ? 'takes to the lunar sky! Use U/O or ▲/▼ to climb and descend.' : 'is descending smoothly to land on the Moon'}.`;
  } else if (action.type === 'cloak' && room.status === 'playing' && p.hp > 0 && p.hero === 'Zo' && p.spaceSuit && room.world.name === 'Moon') {
    p.cloakedUntil = Date.now() + 5000; room.message = `${p.name} activates the orange suit’s stealth field!`;
  } else if (action.type === 'throw-ship' && room.status === 'playing' && p.hp > 0 && p.hero === 'Urite' && p.spaceSuit && room.world.name === 'Moon') {
    const ship=[...room.enemies].filter(enemy=>enemy.kind==='fighter').sort((a,b)=>worldDistance(a,p)-worldDistance(b,p))[0];
    if (!ship || worldDistance(ship,p)>12) { room.message = 'Move close to a Rift Fighter so Urite can grab and throw it.'; return; }
    room.enemies=room.enemies.filter(enemy=>enemy.id!==ship.id);
    const targets=room.enemies.filter(enemy=>worldDistance(enemy,ship)<13);
    for(const enemy of targets)enemy.hp=Math.max(0,enemy.hp-105);
    const defeated=targets.filter(enemy=>enemy.hp<=0);room.enemies=room.enemies.filter(enemy=>enemy.hp>0);
    p.score+=defeated.length*50+targets.length*105;p.credits+=12;
    if(!room.enemies.length){room.bossReady=true;room.message='Urite hurled a fighter into the last robot squad! The Rift Gate is open.';awakenBossIfFound(room,p);}
    else room.message=`Urite threw a fighter ship into ${targets.length} nearby enemies! +12 Bits`;
  } else if (action.type === 'revive' && room.status === 'playing' && p.hp > 0) {
    const target = room.players.get(action.target);
    if (target && target.hp <= 0 && Math.hypot(target.x - p.x, target.y - p.y) < 120) {
      target.hp = 45; p.credits += 20; room.message = `${p.name} brought ${target.name} back! +20 Bits`;
    }
  } else if (action.type === 'buy') {
    const item = weapons.find(w => w.id === action.weapon);
    if (item && p.credits >= item.cost && !p.owned.includes(item.id)) {
      p.credits -= item.cost; p.owned.push(item.id); p.weapon = item.id; room.message = `${p.name} unlocked ${item.name}!`;
    } else if (item && p.owned.includes(item.id)) p.weapon = item.id;
  } else if (action.type === 'weapon-toggle' && p.hero === 'Zo' && p.weapon === 'riftblades') {
    p.weaponsDrawn = Boolean(action.drawn);
    room.message = `${p.name} ${p.weaponsDrawn ? 'draws' : 'stows'} the Twin Riftblades.`;
  } else if (action.type === 'upgrade') {
    const upgrade = upgrades.find(item => item.id === action.upgrade);
    if (upgrade && p.credits >= upgrade.cost) {
      p.credits -= upgrade.cost;
      if (upgrade.id === 'power') p.power = (p.power || 0) + 7;
      if (upgrade.id === 'vitality') { p.maxHp = (p.maxHp || 100) + 20; p.hp = Math.min(p.maxHp, p.hp + 45); }
      room.message = `${p.name} installed a ${upgrade.name}!`;
    } else if (upgrade) room.message = `You need ${upgrade.cost} Bits for the ${upgrade.name}.`;
  } else if (action.type === 'interact' && room.status === 'tutorial' && ['find-training-entrance','enter-training'].includes(room.tutorialStage) && worldDistance(p,room.trainingEntrance)<5) {
    p.elevation=0;p.zipTravel=null;p.fallTravel=null;p.jumpTravel=null;p.x = 1032; p.y = 390; room.tutorialStage = 'follow-training'; room.message = 'The warehouse door seals behind Zo. Follow Exa to the practice figures.';
  } else if (action.type === 'interact' && room.status === 'tutorial' && room.tutorialStage === 'exit-training' && worldDistance(p,room.trainingDoor)<5) {
    p.elevation=0;p.zipTravel=null;p.fallTravel=null;p.jumpTravel=null;p.x = 480; p.y = 390; room.status = 'playing'; room.tutorialStage = 'complete'; Object.assign(room,worldObjects(room.worldIndex));
    room.bossActive = false; room.bossReady = false; room.message = 'The final door opens back onto Gop City. Training complete—fight the pod squads!';
  } else if (action.type === 'interact' && room.status === 'playing' && p.hp > 0) {
    const chest = room.chests.find(c => !c.opened && Math.hypot(c.x-p.x,c.y-p.y) < 86);
    if (chest) {
      chest.opened = true;
      p.credits += 45;
      if (chest.reward === 'power') p.power = (p.power || 0) + 6;
      if (chest.reward === 'vitality') { p.maxHp = (p.maxHp || 100) + 15; p.hp = Math.min(p.maxHp, p.hp + 45); }
      if (chest.reward === 'credits') p.credits += 35;
      room.message = chest.reward === 'power' ? `${p.name} found a hidden Power Core! +45 Bits and stronger hits!` : chest.reward === 'vitality' ? `${p.name} found a Vitality Module! +45 Bits and increased health!` : `${p.name} opened a hidden chest! +80 Bits`;
    } else {
      const fallen = room.players.get(action.target);
      if (fallen && fallen.hp <= 0 && Math.hypot(fallen.x-p.x,fallen.y-p.y) < 120) { fallen.hp = Math.min(fallen.maxHp || 100, 45); p.credits += 20; room.message = `${p.name} brought ${fallen.name} back! +20 Bits`; }
      else room.message = 'Explore the path for hidden chests, or use the Armory terminal for upgrades.';
    }
  } else if (action.type === 'start' && room.status === 'lobby' && p.id === room.host) {
    if (room.players.size < 2 && !action.practice) { room.message = 'Invite at least one ally to start!'; return; }
    room.practice = Boolean(action.practice);
    room.status = 'intro'; Object.assign(room, worldObjects(0)); room.bossActive = false; room.bossReady = false; room.message = 'A massive ship looms over Gop City. Red side pods are detaching—enemy troops are descending to seize buildings and steal Bits.';
    let slot = 0;
    for (const hero of room.players.values()) { hero.hp = 100; hero.x = 480 + ((slot % 4) - 1.5) * 48; hero.y = 438 - Math.floor(slot / 4) * 18; slot++; }
  } else if (action.type === 'continue-story' && room.status === 'intro' && room.chapterIntro === 'moon') {
    room.status='playing';room.chapterIntro=null;
    room.message='Moon mission: Fly UP and NORTH to the enormous Riftship to reach Level 2. Defeating the Moon Warlord is optional. Press G or FLY to take off.'; // FIX134
    let slot=0;for(const hero of room.players.values()){hero.x=480+((slot%4)-1.5)*42;hero.y=438-Math.floor(slot/4)*24;hero.hp=hero.maxHp||100;slot++;}
  } else if (action.type === 'continue-story' && room.status === 'intro') {
    room.status = 'tutorial';room.tutorialStage='find-training-entrance';room.trainingHits=0;room.trainingDodges=0;room.trainingEntrance={x:1020,y:390};
    room.trainingDummies=[[1200,379],[1182,381],[1218,381],[1190,365],[1210,365]].map(([x,y],i)=>({id:`training-dummy-${i}`,x,y}));
    room.trainingLasers=[[1200,350],[1150,310],[1250,270]].map(([x,y],i)=>({id:`training-laser-${i}`,x,y}));room.trainingDoor={x:1200,y:230};
    let slot=0;for(const hero of room.players.values()){hero.x=950+slot*6;hero.y=390;slot++;}
    room.enemies=[];room.chests=[];room.bitsDrops=[];
    room.message = 'Exa is waiting beside the training warehouse, off the road. Follow him to the glowing entrance door.';
  } else if (action.type === 'again' && (room.status === 'won' || room.status === 'lost') && p.id === room.host) {
    room.status = 'playing'; room.worldIndex = 0; room.world = worlds[0]; room.boss = { hp: worlds[0].hp, maxHp: worlds[0].hp }; room.bossActive = false; room.bossReady = false; Object.assign(room, worldObjects(0)); room.lastTransition = 0;
    for (const hero of room.players.values()) { hero.hp = hero.maxHp || 100; restoreGroundOutfit(hero); hero.rage = 0; hero.score = 0; hero.x = 480; hero.y = 438; hero.elevation=0;hero.zipTravel=null;hero.fallTravel=null;hero.jumpTravel=null; }
    room.status = 'intro'; room.message = 'The invasion ship returns above Gop City. Its red pods are opening again—drive the invaders out and recover the stolen Bits.';
  }
}

try{
  const saved=JSON.parse(await readFile(roomSavePath,'utf8'));
  if(Array.isArray(saved))for(const data of saved){if(!data?.code||!Array.isArray(data.players))continue;const room=newRoom(data.code);Object.assign(room,data,{players:new Map(data.players),clients:new Set()});rooms.set(room.code,room);}
}catch(error){if(error.code!=='ENOENT')console.warn('Previous game progress could not be restored:',error.message);}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' }); return res.end(); }
  if (url.pathname.startsWith('/api/')) {
    // RIFT_FIX73_MANUAL_RAGE_SERVER: Zo holds 100% Rage for the F / iPad finisher button.
    if(url.pathname==='/api/health'&&req.method==='GET')return send(res,200,{rageManual73:true,ipadStableMenu67:true,rageFinisher63:true,movement49:true,collision47:true,collision46:true,baseFloor45:true,walkable43:true,walkable42:true,ok:true,features:{repairedOrie:ORIE_ENABLED}});
    if(url.pathname==='/api/state'&&req.method==='GET'){
      const room=rooms.get((url.searchParams.get('room')||'').toUpperCase());
      return room?send(res,200,snapshot(room)):roomError(res,'That room has ended or does not exist.',404);
    }

    if (url.pathname === '/api/room' && req.method === 'POST') {
      const data = await json(req); const name = String(data.name || 'Zo').slice(0, 18);
      let code; do { code = randomBytes(2).toString('hex').toUpperCase(); } while (rooms.has(code));
      const room = newRoom(code); const id = String(data.id || randomBytes(8).toString('hex'));
      room.host = id; room.players.set(id, { id, name, hero: 'Zo', x: 175, y: 265, hp: 100, maxHp: 100, power: 0, rage: 0, rageUntil: 0, dodgeUntil: 0, credits: 0, score: 0, weapon: 'riftblades', owned: ['riftblades','spark'], weaponsDrawn: true, lastAttack: 0, lastHurt: 0 });
      rooms.set(code, room); broadcast(room); return send(res, 200, snapshot(room));
    }
    if (url.pathname === '/api/join' && req.method === 'POST') {
      const data = await json(req); const room = rooms.get(String(data.code || '').toUpperCase());
      if (!room) return roomError(res, 'That room code was not found.', 404);
      const id = String(data.id || randomBytes(8).toString('hex'));
      if (!room.players.has(id) && room.players.size >= 8) return roomError(res, 'This room is full. Rooms hold up to 8 players.');
      if (!room.players.has(id)) {
        const hero = ['Nova','Rook','Nyx','Patch','Blitz','Exa','Urite','Withal',...(ORIE_ENABLED?['Orie']:[])].includes(data.hero) ? data.hero : 'Nova';
        const color = { Nova:'#ff9b55', Rook:'#83bbff', Nyx:'#c79aff', Patch:'#90e19e', Blitz:'#4be1eb', Exa:'#16a6ad', Urite:'#e1b84a', Withal:'#45dce8', Orie:'#b58cff' }[hero];
        const starter = hero === 'Exa' ? 'exa-rifle' : hero === 'Withal' ? 'withal-blasters' : 'spark';
        room.players.set(id, { id, name: String(data.name || 'Hero').slice(0, 18), hero, color, spaceSuit:false, x: 185 + Math.random() * 120, y: 200 + Math.random() * 160, hp: 100, maxHp: 100, power: 0, rage: 0, rageUntil: 0, dodgeUntil: 0, credits: 0, score: 0, weapon: starter, owned: ['spark', ...(hero === 'Exa' ? ['exa-rifle'] : []), ...(hero === 'Withal' ? ['withal-blasters'] : [])], lastAttack: 0, lastHurt: 0 });
      }
      room.message = `${room.players.get(id).name} joined the crew.`; broadcast(room); return send(res, 200, snapshot(room));
    }
    if (url.pathname === '/api/events' && req.method === 'GET') {
      const room = rooms.get((url.searchParams.get('room') || '').toUpperCase());
      if (!room) return roomError(res, 'That room has ended or does not exist.', 404);
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'access-control-allow-origin': '*' });
      room.clients.add(res); res.write(`data: ${JSON.stringify(snapshot(room))}\n\n`);
      const heartbeat=setInterval(()=>{if(!res.destroyed)res.write(': keep-alive\n\n');},15000);
      req.on('close', () => {clearInterval(heartbeat);room.clients.delete(res);}); return;
    }
    if (url.pathname === '/api/action' && req.method === 'POST') {
      const data = await json(req); const room = rooms.get(String(data.room || '').toUpperCase());
      const p = room?.players.get(String(data.id));
      if (!room || !p) return roomError(res, 'Room or player not found.', 404);
      if (data.action?.type === 'leave') {
        room.players.delete(p.id);
        if (room.host === p.id) room.host = room.players.keys().next().value || null;
        if (room.players.size) { room.message = `${p.name} returned to the main menu.`; broadcast(room); }
        else rooms.delete(room.code);
        return send(res, 200, { ok: true });
      }
      applyAction(room, p, data.action || {}); broadcast(room); return send(res, 200, { ok: true });
    }
    return roomError(res, 'Not found', 404);
  }
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = normalize(join(root, pathname));
  try {
    if (!file.startsWith(root)) throw new Error('bad path');
    const details=await stat(file);
    if(!details.isFile())throw new Error('not a file');
    const type=mime[extname(file)]||'application/octet-stream';
    // FIX67: Streaming large GLBs, movies and textures keeps huge 3D files
    // out of the Node heap. This reduces iPad-loading RAM spikes on the Mac.
    if(details.size>524288){
      let start=0,end=details.size-1,status=200;
      const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
      if(range){
        if(range[1]===''&&range[2]!==''){start=Math.max(0,details.size-Number(range[2]));}
        else {start=Number(range[1]||0);end=range[2]===''?end:Number(range[2]);}
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=details.size||end<start){
          res.writeHead(416,{'content-range':`bytes */${details.size}`});res.end();return;
        }
        end=Math.min(end,details.size-1);status=206;
      }
      const headers={'content-type':type,'cache-control':'no-store','accept-ranges':'bytes','content-length':end-start+1};
      if(status===206)headers['content-range']=`bytes ${start}-${end}/${details.size}`;
      res.writeHead(status,headers);
      const stream=createReadStream(file,{start,end});
      stream.on('error',error=>{console.warn('Asset stream interrupted:',error.message);res.destroy(error);});
      res.on('close',()=>{if(!res.writableEnded)stream.destroy();});
      stream.pipe(res);return;
    }
    const data=await readFile(file);send(res,200,data,type);
  }catch(error){if(!res.headersSent)send(res,404,'Not found','text/plain; charset=utf-8');}
});
const port = Number(process.env.PORT || 4175);
setInterval(() => {
  const now = Date.now();
  for (const room of rooms.values()) {
    let zipChanged=false;
    for(const hero of room.players.values())if(trainingLaserDamage(room,hero))zipChanged=true;
    for(const hero of room.players.values()){
      if(hero.poundUntil){const t=1-(hero.poundUntil-now)/850;hero.elevation=t<.45?hero.poundStart+Math.sin(t/.45*Math.PI/2)*6:(hero.poundStart+6)*Math.max(0,1-(t-.45)/.55);if(now>=hero.poundUntil)applyAction(room,hero,{type:'orie-power',power:'impact'});zipChanged=true;}
    }
    for(const enemy of room.enemies)if(enemy.grippedBy){const owner=room.players.get(enemy.grippedBy);if(!owner||enemy.gripUntil<now){enemy.grippedBy=null;if(owner)owner.gripTarget=null;}else{enemy.x=owner.x-Math.sin(owner.facing||0)*3/.06;enemy.y=owner.y-Math.cos(owner.facing||0)*3/.12;zipChanged=true;}}
    // RIFT_FIX46_SOLID_CITY: advance ledge climbing alongside existing jumps.
    for(const hero of room.players.values())if(hero.ledgeClimb46){
      const grab=hero.ledgeClimb46,t=Math.max(0,Math.min(1,(now-grab.started)/grab.duration));
      // RIFT_FIX47_WALL_CLIMB: hold the ledge briefly, then lift first and
      // move onto the roof at the end, rather than diagonal-teleporting up.
      const liftT=Math.max(0,Math.min(1,(t-.18)/.82));
      const lift=liftT*liftT*(3-2*liftT);
      const acrossT=Math.max(0,Math.min(1,(liftT-.28)/.72));
      const across=acrossT*acrossT*(3-2*acrossT);
      hero.x=grab.startX+(grab.endX-grab.startX)*across;
      hero.y=grab.startY+(grab.endY-grab.startY)*across;
      hero.elevation=grab.startHeight+(grab.endHeight-grab.startHeight)*lift;
      if(t>=1)hero.ledgeClimb46=null;
      zipChanged=true;
    }
    // RIFT_FIX63_RAGE_FINISHER: reserve robots until the cinematic impact.
    for(const hero of room.players.values()){
      const seq=hero.riftFinisher63;if(!seq)continue;
      if(!seq.done&&now-seq.started>=3250){
        seq.done=true;
        for(const targetId of seq.targets){
          const robot=room.enemies.find(e=>e.id===targetId&&e.riftFinisher63?.owner===hero.id);
          if(!robot)continue;
          robot.hp=0;hero.score=(hero.score||0)+50;hero.credits=(hero.credits||0)+5;
          room.bitsDrops||=[];
          room.bitsDrops.push({id:robot.id+'-rage-bits',x:robot.x,y:robot.y,amount:30});
        }
        room.enemies=room.enemies.filter(e=>e.hp>0);
        if(!room.enemies.length){room.bossReady=true;awakenBossIfFound(room,hero);}
        room.message=hero.name+' completes the twin Riftblade finisher!';
        zipChanged=true;
      }
      if(now-seq.started>=seq.duration){hero.riftFinisher63=null;zipChanged=true;}
    }
    for(const hero of room.players.values())if(hero.zipTravel){
      const trip=hero.zipTravel,t=Math.max(0,Math.min(1,(now-trip.started)/trip.duration)),ease=t*t*(3-2*t);
      hero.x=480+(trip.start.x+(trip.target.x-trip.start.x)*ease)/.06;hero.y=438+(trip.start.z+(trip.target.z-trip.start.z)*ease)/.12;hero.elevation=trip.start.y+(trip.target.y-trip.start.y)*ease;
      if(t>=1)hero.zipTravel=null;zipChanged=true;
    }
    for(const hero of room.players.values())if(hero.fallTravel&&!hero.zipTravel){
      const fall=hero.fallTravel,seconds=Math.max(0,(now-fall.started)/1000);
      hero.elevation=Math.max(fall.floor,fall.start-14*seconds*seconds);
      if(hero.elevation<=fall.floor){hero.fallTravel=null;hero.jumpTravel=null;hero.jumpUntil=now+160;}
      zipChanged=true;
    }
    for(const hero of room.players.values())if(hero.jumpTravel&&!hero.zipTravel){
      const jump=hero.jumpTravel,seconds=Math.max(0,(now-jump.started)/1000),height=jump.start+jump.velocity*seconds-14*seconds*seconds;
      hero.elevation=Math.max(jump.floor,height);
      if(seconds>jump.velocity/28&&height<=jump.floor){hero.jumpTravel=null;hero.jumpUntil=now+160;}
      zipChanged=true;
    }
    // FIX122: Don't duplicate full-state broadcasts while playing.
    if(room.status!=='playing'){if(zipChanged)broadcast(room);continue;}
    // FIX121: Land gradually, instead of teleporting from a high flight.
    for(const flyer of room.players.values()){
      if(flyer.landing121 && !flyer.flying && room.worldIndex===1){
        flyer.elevation=Math.max(0,(flyer.elevation||0)-1.65);
        if(flyer.elevation<=0)flyer.landing121=false;
        zipChanged=true;
      }
    }
    if(zipChanged)broadcast(room);
    // After the Moon Warlord, entering the large ship's boarding zone advances
    // automatically; BOARD remains a fallback for touch and keyboard players.
    // FIX134: Any living Moon flyer reaching the ship boards; boss combat is optional.
    if(room.worldIndex===1){
      const candidate=[...room.players.values()].find(hero=>hero.hp>0&&hero.flying&&(hero.elevation||0)>=29&&(hero.elevation||0)<=57&&worldDistance(hero,moonBoardTarget121)<19);
      if(candidate){boardMoonShip121(room,candidate);continue;}
    }
    if(room.world.name==='Gop City'&&room.bossReady&&!room.bossActive){
      const hero=[...room.players.values()].find(p=>p.hp>0);if(hero)awakenBossIfFound(room,hero);
    }
    if (now >= (room.nextEnemyUpdate || 0)) {
      room.nextEnemyUpdate = now + 650;
      const living = [...room.players.values()].filter(hero => hero.hp > 0);
      let changed = false;
      for (const enemy of room.enemies) {
        if(enemy.grippedBy||enemy.riftFinisher63)continue;
        if (!living.length) break;
        const target = living.reduce((best,hero)=>worldDistance(hero,enemy)<worldDistance(best,enemy)?hero:best,living[0]);
        const dx=(target.x-enemy.x)*.06,dz=(target.y-enemy.y)*.12,d=Math.hypot(dx,dz)||1;
        if(d>2.6){const step=1.25;enemy.x+=(dx/d)*step/.06;enemy.y+=(dz/d)*step/.12;changed=true;}
        else if(now >= enemy.attackAt && (room.worldIndex!==1 || (target.elevation||0)<=5 || enemy.kind==='fighter')){enemy.attackAt=now+1450;applyAction(room,target,{type:'hurt'});room.message=`${enemy.name} attacked ${target.name}!`;changed=true;} // FIX134 ground robots cannot strike high flyers
      }
      if(changed)broadcast(room);
    }
    if (!room.bossActive) continue;
    const living = [...room.players.values()].filter(hero => hero.hp > 0);
    if (!living.length) continue;
    if(room.world.name==='Gop City'){
      const pos=room.bossPosition||{x:480,y:25};
      const closest=living.reduce((a,b)=>worldDistance(pos,a)<worldDistance(pos,b)?a:b);
      const dx=(closest.x-pos.x)*.06,dz=(closest.y-pos.y)*.12,distance=Math.hypot(dx,dz);
      if(distance>2.65){
        // 0.72 world units per tick, with correct x/z coordinate conversion.
        const step=Math.min(.72,distance-2.45),unitX=dx/distance,unitZ=dz/distance;
        pos.x+=unitX*step/.06;pos.y+=unitZ*step/.12;
        room.bossPosition=pos;broadcast(room);
      }
      const closeEnough=worldDistance(pos,closest)<=2.85;
      if(!closeEnough||now<(room.nextBossAttack||0))continue;
      const rageWasActive=closest.rageUntil>now;
      if(closest.dodgeUntil>now)room.message=`${closest.name} dodged the Pod Commander's close-range strike!`;
      else applyAction(room,closest,{type:'hurt'});
      room.nextBossAttack=now+(room.practice?3200:2300);
      if(closest.hp>0&&!(closest.rageUntil>now&&!rageWasActive))room.message=`Pod Commander struck ${closest.name} at close range!`;
      broadcast(room);continue;
    }
    if(now<(room.nextBossAttack||0))continue;
    // FIX134: No magical Moon boss hit from the surface while the crew flies to the ship.
    const reachable=room.worldIndex===1?living.filter(hero=>!hero.flying||(hero.elevation||0)<=5):living;
    if(!reachable.length)continue;
    const target = reachable[Math.floor(Math.random() * reachable.length)];
    const rageWasActive = target.rageUntil > now;
    if (target.dodgeUntil > now) room.message = `${target.name} dodged ${room.world.title}'s strike!`;
    else applyAction(room, target, { type: 'hurt' });
    room.nextBossAttack = now + (room.practice ? 3600 : 2600);
    if (target.hp > 0 && !(target.rageUntil > now && !rageWasActive)) room.message = `${room.world.title} struck ${target.name}!`;
    broadcast(room);
  }
}, 250);
server.listen(port, '0.0.0.0', () => console.log(`Zo & the Riftbreakers is live on http://localhost:${port}`));
