/* Photo scenery with separate moving layers. No WebGL texture uploads or pixel
 * readback: the same renderer also works when index.html is opened from disk. */
(() => {
  'use strict';
  const W = 1376, H = 768, TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const fract = v => v - Math.floor(v);
  const random = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
  const pictures = new Map();
  function load(src) {
    const image = new Image(); image.src = 'assets/' + src;
    pictures.set(src, image); return image;
  }
  const sources = {
    1: load('level-one-ruined-plaza.png'), 2: load('level-two-future-snow.jpg'),
    3: load('meteor-lake-grounded.png'), 4: load('level-four-future-city.jpg'),
    5: load('level-five-final-city.jpg'), forest: load('forest-river.jpg')
  };
  const originalMeteors = load('level-one-meteor.jpg');
  const ready = image => image && image.complete && image.naturalWidth > 0;
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function snapshot(c) {
    if (typeof createImageBitmap === 'function') createImageBitmap(c).then(bitmap => { c.bitmap = bitmap; }).catch(() => {});
    return c;
  }
  const plates = new Map(), fragments = new Map();
  function plateFor(level) {
    if (plates.has(level)) { const cached=plates.get(level); return cached.bitmap || cached; }
    const source = sources[level]; if (!ready(source)) return null;
    const c = canvas(W, H); c.getContext('2d').drawImage(source, 0, 0, W, H);
    plates.set(level, snapshot(c)); return c;
  }
  function polygon(g, points) {
    g.beginPath(); points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y)); g.closePath();
  }
  function cutout(image, crop, index, round = false) {
    const c = canvas(96,96), g = c.getContext('2d');
    const points = Array.from({length: round ? 16 : 7}, (_, i) => {
      const angle = i / (round ? 16 : 7) * TAU;
      const radius = (round ? 42 : 31) + random(index * 19 + i) * (round ? 4 : 14);
      return [48 + Math.cos(angle) * radius,48 + Math.sin(angle) * radius];
    });
    polygon(g,points); g.clip(); g.drawImage(image,...crop,0,0,96,96);
    if(!round){const shade=g.createLinearGradient(5,5,85,90);shade.addColorStop(0,'rgba(16,19,23,.08)');shade.addColorStop(1,'rgba(12,15,19,.65)');g.fillStyle=shade;g.fillRect(0,0,96,96);}
    return snapshot(c);
  }
  function rubbleFor(level) {
    if (fragments.has(level)) return fragments.get(level);
    const p = plateFor(level); if (!p) return [];
    const patches = level===2 ? [[25,240,65,75],[302,320,50,75],[911,467,50,80],[853,644,65,65],[133,680,65,65],[1090,665,70,70]] :
      [[36,212,65,80],[141,327,65,80],[351,318,55,80],[887,470,40,75],[1090,618,65,65],[257,593,65,65]];
    const result = patches.map((crop,i) => cutout(p,crop,i)); fragments.set(level,result); return result;
  }
  let meteorSprites;
  function rocks() {
    if (!meteorSprites && ready(originalMeteors)) {
      const p = canvas(W,H); p.getContext('2d').drawImage(originalMeteors,0,0,W,H);
      meteorSprites = [[434,110,49,49],[1095,208,46,48],[817,45,47,48]].map((crop,i)=>cutout(p,crop,i,true));
    }
    return meteorSprites || [];
  }
  // Cached, irregular alpha textures keep smoke volumetric and avoid hard circles.
  function plume(rgb, seed) {
    const c = canvas(160,160),g=c.getContext('2d');
    for(let i=0;i<72;i++) {
      const a=random(seed+i)*TAU,r=Math.sqrt(random(seed+i+121))*51;
      const x=80+Math.cos(a)*r,y=80+Math.sin(a)*r,s=9+random(seed+i+51)*30;
      const grad=g.createRadialGradient(x,y,0,x,y,s);
      grad.addColorStop(0,`rgba(${rgb},${.06+random(i+seed)*.11})`);grad.addColorStop(1,`rgba(${rgb},0)`);
      g.fillStyle=grad;g.fillRect(x-s,y-s,s*2,s*2);
    }
    return snapshot(c);
  }
  const smoke=plume('36,32,31',71),fog=plume('178,188,193',93),dust=plume('131,115,100',39);
  const flame=plume('255,139,35',44),core=plume('255,241,175',12);
  function sprite(g,img,x,y,size,alpha=1,rotation=0,stretch=1) {
    if(alpha<=0||size<=0)return;
    g.save();g.globalAlpha=alpha;g.translate(x,y);g.rotate(rotation);g.drawImage(img.bitmap || img,-size/2,-size*stretch/2,size,size*stretch);g.restore();
  }
  function glow(g,x,y,r,color,alpha) {
    g.save();g.globalCompositeOperation='screen';g.globalAlpha=alpha;
    const grd=g.createRadialGradient(x,y,0,x,y,r);grd.addColorStop(0,color);grd.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=grd;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
  }
  // Render water pixels in narrow moving bands, with motion growing toward the viewer.
  function water(g,p,t,level) {
    const start=level===3?515:level==='forest'?470:493;
    g.save();
    const outline=level===1?[[0,475],[1376,490],[1376,560],[900,580],[450,580],[0,550]]:
      level==='forest'?[[600,466],[800,470],[925,589],[1200,552],[1376,612],[1376,768],[566,768],[446,620]]:
      [[0,515],[1376,525],[1376,592],[0,592]];
    polygon(g,outline);g.clip();
    for(let y=start;y<H;y+=3){const depth=(y-start)/(H-start),offset=Math.sin(y*.075-t*2.4)*(.6+depth*4.2)+Math.sin(y*.027+t*1.2)*depth*2;
      g.drawImage(p,0,y,W,3,offset-5,y,W+10,3.3);}
    g.restore();
  }
  function sky(g,p,t) {
    // Broad cloud motion, restricted above the mountain/city silhouette.
    g.save();g.globalAlpha=.42;
    for(let y=0;y<185;y+=5){const strength=Math.sin(Math.PI*y/185),dx=Math.sin(t*.19+y*.016)*strength*7;
      g.drawImage(p,0,y,W,5,dx-8,y,W+16,5.3);}
    g.restore();
  }
  function fire(g,p,t,level) {
    const areas=level===1?[[155,340,140,145],[710,360,150,120],[1040,330,160,140]]:
      level===3?[[16,320,210,210],[510,420,175,130],[1158,340,185,235]]:
      level===4||level===5?[[277,525,110,120],[1070,540,95,125]]:[];
    for(const [x,y,w,h] of areas){
      g.save();g.globalAlpha=.48+.12*Math.sin(t*11+x);
      for(let row=0;row<h;row+=4){const k=Math.sin(Math.PI*row/h),dx=Math.sin(t*6-row*.1+x)*k*2.7;
        g.drawImage(p,x,y+row,w,4,x+dx,y+row,w,4.3);}
      g.restore();
      glow(g,x+w*.5,y+h*.8,w*.65,'#ff7f27',.05+.045*Math.sin(t*8+x));
      for(let i=0;i<6;i++){const age=fract(t*.12+i*.164+x*.01);
        sprite(g,smoke,x+w*.5+age*35+Math.sin(i+t*.5)*20,y+h*.45-age*185,70+age*160,Math.sin(age*Math.PI)*.18,.2);}
    }
  }
  function splash(g,x,y,age,size,t) {
    const fade=clamp(1-age/1.7); if(!fade)return;
    g.save();g.strokeStyle=`rgba(235,217,182,${fade*.33})`;g.lineWidth=1.1;
    for(let r=0;r<3;r++){g.beginPath();g.ellipse(x,y,Math.max(1,age*90+size+r*15),Math.max(1,(age*90+size+r*15)*.18),0,0,TAU);g.stroke();}
    g.restore();
    for(let j=0;j<23;j++) {const a=(random(j+40)-.5)*2.5,speed=38+random(j+7)*85;
      const dx=Math.sin(a)*speed*age,dy=-Math.cos(a)*speed*age+83*age*age;
      sprite(g,fog,x+dx,y+dy,9+age*12,fade*.5,0,1.5);
    }
  }
  const meteorData=Array.from({length:12},(_,i)=>({duration:5.1+random(i+1)*4.4,offset:random(i+20)*11,
    x:80+random(i+30)*1180,y:345+random(i+40)*205,dx:160+random(i+50)*260,size:12+random(i+90)*25}));
  function meteors(g,t,level) {
    const images=rocks();if(!images.length)return;
    for(let i=0;i<meteorData.length;i++){
      const m=meteorData[i],age=(t+m.offset)%m.duration,flight=m.duration-1.8,p=clamp(age/flight),sy=-160-random(i+8)*180;
      const x=m.x+m.dx*(1-p),y=sy+(m.y-sy)*p*p;
      if(age<flight){
        for(let j=19;j>=1;j--){const q=Math.max(0,p-j*.017),tx=m.x+m.dx*(1-q),ty=sy+(m.y-sy)*q*q;
          sprite(g,smoke,tx+Math.sin(t+j)*j*.5,ty, m.size*(1.3+j*.1),.88*(1-j/25),j*.3);}
        g.save();g.globalCompositeOperation='screen';
        for(let j=7;j>=0;j--){const q=Math.max(0,p-j*.009),tx=m.x+m.dx*(1-q),ty=sy+(m.y-sy)*q*q;
          sprite(g,flame,tx+Math.sin(t*19+j)*2,ty,m.size*(1.9-j*.13),.9-j*.08,-.35,1.4);}
        sprite(g,core,x,y,m.size*1.5,.9);g.restore();
        sprite(g,images[i%images.length],x,y,m.size,.95,t*(.4+random(i)));
      }else{
        const impactAge=age-flight,fade=1-impactAge/1.8;
        if(m.y>(level===3?520:490)&&m.y<(level===3?590:565)){splash(g,m.x,m.y,impactAge,m.size,t);}
        else{glow(g,m.x,m.y,22+impactAge*90,'#ffbd60',Math.pow(fade,3)*.6);
          sprite(g,dust,m.x+impactAge*22,m.y-impactAge*40,m.size*2+impactAge*110,fade*.48);}
      }
    }
  }
  function fallingCity(g,t,level) {
    const images=rubbleFor(level); if(!images.length)return;
    for(let i=0;i<26;i++){
      const duration=4.1+random(i+104)*4.7,age=(t+random(i+203)*20)%duration,life=duration-1.1,p=clamp(age/life);
      const sx=i<16?555+random(i+300)*290:(i%2?150+random(i)*90:1170+random(i)*130);
      const sy=i<16?180+random(i+40)*210:50+random(i+12)*370;
      const dx=(random(i+60)-.5)*150,drop=240+random(i+80)*210;
      const x=sx+dx*p,y=sy+drop*p*p,size=6+random(i+10)*25;
      if(age<life){
        sprite(g,images[i%images.length],x,y,size,clamp(p*10)*clamp((1-p)*7),t*(random(i+2)-.5)*2, .8+random(i+42)*.5);
        if(i%3===0)sprite(g,level===2?fog:dust,x,y-12,size*1.5,.16);
      }else{const q=(age-life)/1.1;sprite(g,level===2?fog:dust,sx+dx,sy+drop-q*30,30+q*80,Math.sin(q*Math.PI)*.27);}
    }
    // Tiny dimensional fragments drift around the photographed collapsing tower.
    for(let i=0;i<9;i++){
      const x=650+Math.sin(t*.23+i*2)*126,y=270+Math.cos(t*.31+i)*94;
      sprite(g,images[i%images.length],x,y,7+i%3*5,.7,t*.18+i);
    }
    glow(g,1060,344,140,level===2?'#8ed3f5':'#877dff',.04+.035*Math.sin(t*1.4));
  }
  function atmosphere(g,t,level) {
    const snowy=level===2,forest=level==='forest';
    for(let i=0;i<12;i++){
      const age=fract(t*(.025+random(i)*.012)+i*.083),x=fract(i*.147+age*.15)*W;
      const y=forest?440+random(i+44)*150:340+random(i+42)*220-age*70;
      sprite(g,snowy||forest?fog:smoke,x,y,220+random(i+20)*260,Math.sin(age*Math.PI)*(snowy?.13:forest?.13:.18),Math.sin(t*.07+i)*.15,.65);
    }
    if(snowy){
      g.save();g.fillStyle='#e1edf5';
      for(let i=0;i<190;i++){
        const depth=.3+random(i+18),x=fract(random(i+21)+t*(.006+depth*.009)+Math.sin(t*.6+i)*.003)*W;
        const y=fract(random(i+150)+t*(.035+depth*.06))*H,r=.65+depth*1.5;
        g.globalAlpha=.24+depth*.35;g.beginPath();g.ellipse(x,y,r,r*(1+depth*.65),-.35,0,TAU);g.fill();
      }g.restore();
    }else{
      g.save();g.globalCompositeOperation='screen';
      for(let i=0;i<52;i++){
        const age=fract(t*(.025+random(i)*.04)+random(i+6)),x=fract(random(i+21)+age*.14+Math.sin(t*.4+i)*.008)*W,y=H*(1-age);
        g.globalAlpha=Math.sin(age*Math.PI)*.65;g.fillStyle=forest?'#e8d6a6':level>=4?'#baa798':'#ffb15e';
        g.fillRect(x,y,random(i+1)*1.5+.5,random(i+51)*2+.6);
      }g.restore();
    }
  }
  function trees(g,p,t) {
    // Wind bends the outer foliage by a few pixels; the river stays independently animated.
    for(const [x,w] of [[0,350],[1040,336]]){
      g.save();g.globalAlpha=.38;
      for(let y=0;y<500;y+=6){const dx=Math.sin(t*.7+y*.009)*2.1*(1-y/560);g.drawImage(p,x,y,w,6,x+dx,y,w,6.2);}
      g.restore();
    }
  }
  function mountainCollapse(g,t){
    const chunks=rubbleFor(3);if(!chunks.length)return;
    for(let site=0;site<3;site++){
      const age=(t+site*5.1)%18,fall=Math.max(0,age-2),sx=330+site*335,sy=310-site%2*35;
      if(age<2||age>10)continue;
      for(let i=0;i<18;i++){const delay=i*.13,q=clamp((fall-delay)/4);if(q<=0||q>=1)continue;
        const x=sx+(random(site*41+i)-.5)*95+Math.sin(i*4)*q*70,y=sy+q*q*225;
        sprite(g,chunks[i%chunks.length],x,y,5+random(i+31)*18,Math.sin(q*Math.PI),q*(i%2?3:-3));
        if(i%3===0)sprite(g,dust,x,y-15,45+q*90,Math.sin(q*Math.PI)*.25);
      }
      const bloom=clamp((fall-2)/4);sprite(g,dust,sx,sy+135,90+bloom*175,Math.sin(bloom*Math.PI)*.35);
    }
  }
  function draw(ctx,width,height,level,time) {
    const key=level==='forest'?'forest':Math.max(1,Math.min(5,Math.floor(level||1)));
    const p=plateFor(key);if(!p)return false;
    const t=Number.isFinite(time)?time:performance.now()/1000;
    const scale=Math.max(width/W,height/H);
    ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();
    ctx.translate((width-W*scale)/2,(height-H*scale)/2);ctx.scale(scale,scale);
    ctx.drawImage(p,0,0);
    sky(ctx,p,t);
    if(key===3||key==='forest')water(ctx,p,t,key);
    if(key==='forest')trees(ctx,p,t);
    else if(key===1){fire(ctx,p,t,key);fallingCity(ctx,t,key);}
    else{fire(ctx,p,t,key);if(key===3){meteors(ctx,t,key);mountainCollapse(ctx,t);}else fallingCity(ctx,t,key);}
    window.drawAnimatedGroundFires?.(ctx,t,key);
    atmosphere(ctx,t,key);ctx.restore();return true;
  }
  window.heroBackdrop={draw,ready:level=>ready(sources[level]),levels:[1,2,3,4,5,'forest']};
})();
