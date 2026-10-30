/* The heroes' river village: solid architecture, flowing water, and evidence stations. */
(() => {
  window.homeClues=[
    {x:245,y:140,title:'The secret alliance',image:0,text:'Mr. Misfit and Dark Armored were photographed together. Their connection predates the battle.'},
    {x:755,y:-270,title:'The planning room',image:1,text:'The villains gathered around a map with an armed robot. The attack was planned by a team.'},
    {x:245,y:-720,title:'The robot army',image:2,text:'The same leaders marched with a robot army. Mr. Misfit was part of a much larger threat.'},
    {x:755,y:-1160,title:'The revenge note',image:3,text:'“I will come back for revenge.” The note is unsigned. Someone expected this defeat. Was Mr. Misfit a distraction?'}
  ];
  // Keep the clue system playable if the optional evidence-image bundle is missing.
  // Original photos are used when available; temporary cards appear only when needed.
  if (!Array.isArray(window.homeEvidenceImages)) window.homeEvidenceImages = [];
  const clueLabels = ['THE SECRET ALLIANCE','THE PLANNING ROOM','THE ROBOT ARMY','THE REVENGE NOTE'];
  for (let i = 0; i < clueLabels.length; i++) {
    if (typeof window.homeEvidenceImages[i] === 'string' && window.homeEvidenceImages[i]) continue;
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 432;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#192534'; ctx.fillRect(0, 0, 768, 432);
    ctx.strokeStyle = '#e3be76'; ctx.lineWidth = 5; ctx.strokeRect(20, 20, 728, 392);
    ctx.fillStyle = '#edc77b'; ctx.font = 'bold 23px sans-serif';
    ctx.fillText('HEROIC SHOWDOWN - VILLAGE EVIDENCE', 54, 88);
    ctx.fillStyle = '#fff2d6'; ctx.font = 'bold 39px sans-serif';
    ctx.fillText(clueLabels[i], 54, 220);
    ctx.fillStyle = '#c4cfdb'; ctx.font = '21px sans-serif';
    ctx.fillText('Original evidence photo unavailable in this build', 54, 291);
    window.homeEvidenceImages[i] = canvas.toDataURL('image/png');
  }
  const bridges=[4,-32,-68,-104];
  window.homeVillageWalkable=(x,y)=>Number.isFinite(x)&&Number.isFinite(y);
  window.homePhotoTexture=(T,i)=>{window.homePhotoTextures=window.homePhotoTextures||[];if(!window.homePhotoTextures[i]){const texture=new T.TextureLoader().load(window.homeEvidenceImages[i]);texture.colorSpace=T.SRGBColorSpace;window.homePhotoTextures[i]=texture;}return window.homePhotoTextures[i];};
  window.createHomeVillage=(T,scene)=>{
    const root=new T.Group();root.visible=false;scene.add(root);
    const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.92,...extra});
    const wood=mat(0x493c2c),beam=mat(0x241e18),plaster=mat(0x9b9580),stone=mat(0x58635e),moss=mat(0x344c2b),leaf=mat(0x203e2b),glow=mat(0xffb349,{emissive:0xff8b20,emissiveIntensity:2});
    function surface(kind){
      const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=kind==='wood'?'#b6a58b':kind==='stone'?'#a6b5af':'#98ab79';g.fillRect(0,0,256,256);
      for(let i=0;i<3500;i++){g.fillStyle='rgba(24,37,22,'+(Math.random()*.16)+')';g.fillRect(Math.random()*256,Math.random()*256,kind==='wood'?25+Math.random()*70:2+Math.random()*6,kind==='wood'?1:2+Math.random()*4);}
      g.strokeStyle='#25392b66';g.lineWidth=2;
      for(let y=0;y<256;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();if(kind!=='wood')for(let x=(y%64?24:0);x<256;x+=48){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke();}}
      const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;return tex;
    }
   
const photoMaterial = (...args) =>
  typeof window.villagePhotoMaterial === 'function'
    ? window.villagePhotoMaterial(T, ...args)
    : null;

wood.map = photoMaterial('wood')?.map ?? wood.map;
beam.map = wood.map;
stone.map = photoMaterial('stairs', [.38, 0, .25, .22])?.map ?? stone.map;
moss.map = photoMaterial('window', [.12, .75, .4, .22])?.map ?? moss.map;

    function box(parent,w,h,d,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
    // Wide, level stone promenade; the river is beside the walkable route.
    for(const side of [-1,1]){box(root,13,.5,140,side*13.5,-.27,-55,wood);
      for(let z=12;z>-123;z-=2.5){box(root,.15,1.1,.15,side*7,.55,z,beam);box(root,.15,.12,2.5,side*7,1.12,z,wood);}
    }
    const deck=window.createVillageEndlessDeck(T,root);
    const river=window.createVillageWater(T,root);
    const lanterns=[];
    const life=window.createVillageLife(T,root);
    const photoEffects=window.createVillagePhotoEffects(T,root);


    for(let row=0;row<10;row++)for(const side of [-1,1]){
      const z=12-row*14;window.createVillageHouse(T,root,side,row,{wood,beam,plaster,moss,glow});

    }
    for(const z of bridges){
      box(root,18,.5,5,0,-.25,z,wood);
      for(const side of [-1,1]){box(root,18,.16,.15,0,1.6,z+side*2.4,beam);for(let i=0;i<10;i++)box(root,.12,1.6,.12,-9+i*2,.8,z+side*2.4,beam);}
      for(let i=0;i<18;i++)box(root,.08,.03,5,-9+i,.015,z,beam);
    }
    for(const side of [-1,1])for(let i=0;i<22;i++){
      const rock=new T.Mesh(new T.IcosahedronGeometry(1,2),moss);rock.position.set(side*(38+(i%3)*5),1+(i%4),10-i*6);rock.scale.set(3+i%3,2+i%5,4);root.add(rock);
    }
    // Photo-textured stairways climb the outer hillside between the houses.
    for(const side of [-1,1])for(const z of [-9,-51,-93])for(let step=0;step<14;step++){
      box(root,3,.22+step*.25,.65,side*34,(.22+step*.25)/2,z-step*.6,stone);
      if(step%3===0){box(root,.12,1.2,.12,side*35.35,step*.25+.6,z-step*.6,beam);box(root,.22,.32,.22,side*35.35,step*.25+1.3,z-step*.6,glow);}
    }
    window.createVillageRadioRoom?.(T,root);
    const markers=[];
    window.homeClues.forEach((c,i)=>{const x=(c.x-500)*.055,z=(c.y-300)*.055;box(root,2.7,1.15,1.6,x,.575,z,wood);const photo=new T.Mesh(new T.PlaneGeometry(1.5,.84),new T.MeshStandardMaterial({map:window.homePhotoTexture(T,i),side:T.DoubleSide,roughness:1}));photo.rotation.x=-Math.PI/2;photo.position.set(x,1.16,z);root.add(photo);const ring=new T.Mesh(new T.TorusGeometry(1.5,.045,8,40),glow);ring.rotation.x=-Math.PI/2;ring.position.set(x,.07,z);root.add(ring);markers.push(ring);});
    const ambient=new T.HemisphereLight(0x8aaed9,0x172337,1.25);root.add(ambient);
    const light=new T.PointLight(0xffb86b,45,65);light.position.set(0,8,-15);root.add(light);
    const sky=new T.Color(0x071222);
    return {update(active,p,t){root.visible=active;if(!active)return;scene.background=sky;scene.fog.color.setHex(0x14263c);scene.fog.near=35;scene.fog.far=145;
      river.update(t,p);deck.update(p,t);life.update(t);photoEffects.update(t,p);window.updateVillageInteriors?.(p);
      lanterns.forEach((l,i)=>l.scale.setScalar(1+Math.sin(t*2+i)*.025));markers.forEach((m,i)=>{m.visible=!window.heroArena3DState?.()?.state?.homeStudy?.found?.[i];m.rotation.z=t*.2;});
    }};
  };
})();

