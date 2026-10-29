(() => {
  let cache;
  window.villageWarmMaterials=T=>{
    if(cache)return cache;
    let seed=41;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
    function make(kind){
      const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');
      g.fillStyle=kind==='brick'?'#b3a18a':'#aa7d4e';g.fillRect(0,0,1024,1024);
      if(kind==='brick'){
        for(let row=0;row<16;row++)for(let col=-1;col<9;col++){
          const x=col*128+(row%2)*64,y=row*64,v=random();
          g.fillStyle=`rgb(${85+v*65},${51+v*53},${33+v*39})`;g.beginPath();g.roundRect(x+5+random()*3,y+4,117-random()*5,54-random()*3,3+random()*5);g.fill();
          g.strokeStyle='rgba(47,28,18,.35)';g.lineWidth=2;g.stroke();
          for(let chip=0;chip<9;chip++){const cx=x+7+random()*110,cy=y+(chip%2?5:54);g.fillStyle='#aa9981';g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+2+random()*7,cy+(chip%2?1:-1)*(2+random()*5));g.lineTo(cx+9,cy);g.fill();}
          if(random()>.58){g.strokeStyle='rgba(35,23,16,.45)';g.lineWidth=.8;g.beginPath();g.moveTo(x+35,y+8);g.lineTo(x+39,y+23);g.lineTo(x+34,y+31);g.lineTo(x+43,y+48);g.stroke();}
          for(let i=0;i<110;i++){g.fillStyle=random()>.5?'rgba(211,187,144,.23)':'rgba(27,20,15,.24)';g.fillRect(x+8+random()*109,y+8+random()*46,1+random()*5,1+random()*3);}
        }
      }else{
        for(let board=0;board<8;board++){
          const x=board*128,v=random();g.fillStyle=`rgb(${131+v*38},${88+v*32},${48+v*24})`;g.fillRect(x+2,0,124,1024);
          for(let i=0;i<180;i++){const u=x+random()*124;g.strokeStyle=random()>.4?'rgba(46,28,13,.16)':'rgba(233,193,133,.2)';g.lineWidth=.4+random()*1.8;g.beginPath();g.moveTo(u,0);for(let y=0;y<=1024;y+=16)g.lineTo(u+Math.sin(y*.014+i)*2+Math.sin(y*.033+i)*.7,y);g.stroke();}
          for(let k=0;k<4;k++){const u=x+15+random()*95,y=random()*1024;for(let r=1;r<13;r++){g.strokeStyle='rgba(46,27,12,.2)';g.beginPath();g.ellipse(u,y,r*.7,r*2.5,.08,0,Math.PI*2);g.stroke();}}
          for(let crack=0;crack<5;crack++){const cx=x+10+random()*107,cy=random()*950;g.strokeStyle='rgba(34,20,11,.65)';g.lineWidth=.7+random();g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+2,cy+21);g.lineTo(cx-1,cy+39);g.lineTo(cx+1,cy+70);g.stroke();}
          g.fillStyle='#402e1c';for(const y of [22,1002]){g.beginPath();g.arc(x+10,y,2.2,0,Math.PI*2);g.fill();}
        }
      }
      const map=new T.CanvasTexture(c);map.wrapS=map.wrapT=T.RepeatWrapping;map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
      const height=map.clone();height.colorSpace=T.NoColorSpace;return new T.MeshStandardMaterial({map,bumpMap:height,bumpScale:kind==='brick'?.065:.025,roughness:kind==='brick'?.97:.68,color:0xffffff});
    }
    const wood=window.villagePhotoMaterial?.(T,'wood')||make('wood'),brick=window.villagePhotoMaterial?.(T,'brick',[.02,.05,.43,.9])||make('brick'),beam=wood.clone();beam.color.setHex(0x6b5138);cache={wood,brick,beam};return cache;
  };
})();
