/* Collision and ground sampling share the exact scale/offset of the GLB. */
(() => {
  const originalData=window.heroFrozenCollision;
  const data=originalData?{...originalData}:null;
  if(!data)return;
  const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const tileCount=4,n=data.size,rows=(n-1)*tileCount+1,tileDepth=data.maxZ-data.minZ;
  const originalHeights=new Int16Array(decode(data.heights).buffer),originalWalkable=decode(data.walkable);
  const originalSpawnable=data.spawnable?decode(data.spawnable):originalWalkable;
  const heights=new Int16Array(n*rows),walkable=new Uint8Array(n*rows),spawnable=new Uint8Array(n*rows);
  for(let j=0;j<rows;j++){
    const segment=Math.min(tileCount-1,Math.floor(j/(n-1)));
    const tile=tileCount-1-segment,localRow=j-segment*(n-1);
    const sourceRow=tile%2?n-1-localRow:localRow;
    heights.set(originalHeights.subarray(sourceRow*n,(sourceRow+1)*n),j*n);
    walkable.set(originalWalkable.subarray(sourceRow*n,(sourceRow+1)*n),j*n);
    spawnable.set(originalSpawnable.subarray(sourceRow*n,(sourceRow+1)*n),j*n);
  }
  data.minZ-=tileDepth*(tileCount-1);
  // Missing terrain is supported by the continuous snow foundation.
  for(let i=0;i<heights.length;i++)if(heights[i]===-32768){walkable[i]=1;spawnable[i]=1;}
  const cellX=(data.maxX-data.minX)/(n-1),cellZ=(data.maxZ-data.minZ)/(rows-1);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const grid=(x,z)=>[(x-data.minX)/cellX,(z-data.minZ)/cellZ];
  function height(x,z){
    const [a,b]=grid(x,z),i=Math.floor(a),j=Math.floor(b);
    if(i<0||j<0||i>=n-1||j>=rows-1)return null;
    const q=[heights[j*n+i],heights[j*n+i+1],heights[(j+1)*n+i],heights[(j+1)*n+i+1]];
    if(q.some(v=>v===-32768))return 0;
    const u=a-i,v=b-j;return ((q[0]*(1-u)+q[1]*u)*(1-v)+(q[2]*(1-u)+q[3]*u)*v)/100;
  }
  function open(x,z){
    const [a,b]=grid(x,z),i=Math.floor(a),j=Math.floor(b);
    return i>=0&&j>=0&&i<n-1&&j<rows-1&&(!!walkable[j*n+i]||heights[j*n+i]===-32768)&&height(x,z)!==null;
  }
  const safe=[];
  const spawnSafe=[];
  for(let j=1;j<rows-2;j++)for(let i=1;i<n-2;i++){
    const x=data.minX+(i+.5)*cellX,z=data.minZ+(j+.5)*cellZ;
    if(open(x,z)){const point={x,z};safe.push(point);if(spawnable[j*n+i])spawnSafe.push(point);}
  }
  function nearest(x,z){let best=safe[0],distance=Infinity;for(const p of safe){const d=(p.x-x)**2+(p.z-z)**2;if(d<distance){distance=d;best=p;}}return best;}
  function world(p){return {x:(p.x-500)*.055,z:(p.y-300)*.055};}
  function place(p,x,z){p.x=x/.055+500;p.y=z/.055+300;p.groundY=height(x,z)||0;}
  function snap(p,occupied=[]){
    const q=world(p);let best=null,score=Infinity;
    for(const cell of spawnSafe){
      if(occupied.some(o=>Math.hypot(o.x-cell.x,o.z-cell.z)<1.35))continue;
      const d=(q.x-cell.x)**2+(q.z-cell.z)**2;if(d<score){score=d;best=cell;}
    }
    best=best||nearest(q.x,q.z);if(best){place(p,best.x,best.z);occupied.push(best);}
  }
  function resolve(p,previous){
    const desired=world(p),old=world(previous);
    if(!open(old.x,old.z)){snap(p);return;}
    let x=old.x,z=old.z;
    const canStep=(a,b)=>open(a,b)&&Math.abs(height(a,b)-height(x,z))<=.42;
    const dx=desired.x-x,dz=desired.z-z;
    // Small swept steps prevent fast dodges, knockback and dashes tunnelling.
    const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.09));
    for(let i=0;i<count;i++){
      const nx=x+dx/count,nz=z+dz/count;
      if(canStep(nx,nz)){x=nx;z=nz;}
      else if(canStep(nx,z))x=nx;
      else if(canStep(x,nz))z=nz;
    }
    place(p,x,z);
  }
  const routes=new Map();
  function route(start,goal){
    const toIndex=p=>{const [x,z]=grid(p.x,p.z);return clamp(Math.floor(z),0,rows-1)*n+clamp(Math.floor(x),0,n-1);};
    const cell=i=>({x:data.minX+(i%n+.5)*cellX,z:data.minZ+(Math.floor(i/n)+.5)*cellZ});
    const first=toIndex(start),last=toIndex(goal),parents=new Int32Array(n*rows);parents.fill(-1);
    const queue=new Int32Array(n*rows);queue[0]=first;parents[first]=first;let head=0,tail=1,best=first,bestD=Infinity;
    while(head<tail){
      const current=queue[head++],a=cell(current),d=(a.x-goal.x)**2+(a.z-goal.z)**2;
      if(d<bestD){bestD=d;best=current;}if(current===last)break;
      const x=current%n,z=Math.floor(current/n);
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        const xx=x+dx,zz=z+dz,k=zz*n+xx;
        if(xx<1||zz<1||xx>=n-2||zz>=rows-2||parents[k]!==-1||!walkable[k])continue;
        if(dx&&dz&&(!walkable[z*n+xx]||!walkable[zz*n+x]))continue;
        const b=cell(k);if(!open(b.x,b.z)||Math.abs(height(b.x,b.z)-height(a.x,a.z))>.42)continue;
        parents[k]=current;queue[tail++]=k;
      }
    }
    const path=[];for(let i=best;i!==first;i=parents[i])path.push(cell(i));path.reverse();return path;
  }
  function direction(player,target){
    const start=world(player),goal=world(target),key=player.id||'host';let saved=routes.get(key);
    if(!saved||saved.targetX!==target.x||saved.targetY!==target.y){saved={targetX:target.x,targetY:target.y,path:route(start,goal)};routes.set(key,saved);}
    while(saved.path.length&&Math.hypot(saved.path[0].x-start.x,saved.path[0].z-start.z)<.36)saved.path.shift();
    if(!saved.path.length)return {x:0,y:0,done:true};
    const next=saved.path[0],dx=next.x-start.x,dz=next.z-start.z,length=Math.hypot(dx,dz)||1;
    // Analog speed avoids overshooting close waypoints on the narrow paths.
    const strength=Math.min(1,length/.55);
    return {x:dx/length*strength,y:dz/length*strength,done:false};
  }
  window.heroIceTerrain={height,open,nearest,snap,resolve,world,direction,
    bounds:{minY:data.minZ/.055+300,maxY:data.maxZ/.055+300},
    raycast(ray){
      let previous=null;
      for(let d=0;d<140;d+=.16){
        const p=ray.at(d,new window.THREE.Vector3()),y=height(p.x,p.z);
        if(y!==null&&p.y<=y&&previous){let lo=previous,hi=d;for(let k=0;k<7;k++){const mid=(lo+hi)/2,q=ray.at(mid,new window.THREE.Vector3()),h=height(q.x,q.z);if(h!==null&&q.y<=h)hi=mid;else lo=mid;}return ray.at(hi,new window.THREE.Vector3());}
        previous=d;
      }return null;
    }
  };

  window.createFrozenLandscape=(T,scene)=>{
    const root=new T.Group();root.name='Walkable frozen landscape';root.visible=false;scene.add(root);
    const snowCanvas=document.createElement('canvas');snowCanvas.width=snowCanvas.height=256;
    const snowContext=snowCanvas.getContext('2d');snowContext.fillStyle='#bcced5';snowContext.fillRect(0,0,256,256);
    for(let i=0;i<16000;i++){const shade=170+Math.floor(Math.random()*65);snowContext.fillStyle='rgba('+shade+','+(shade+8)+','+Math.min(255,shade+16)+',0.24)';snowContext.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1);}
    const groundTexture=new T.CanvasTexture(snowCanvas);groundTexture.wrapS=groundTexture.wrapT=T.RepeatWrapping;groundTexture.repeat.set(10,32);
    const foundation=new T.Mesh(new T.PlaneGeometry(data.maxX-data.minX,data.maxZ-data.minZ),new T.MeshStandardMaterial({map:groundTexture,color:0xe0edf1,roughness:.87,metalness:.03}));
    foundation.name='Continuous connected frozen ground';foundation.rotation.x=-Math.PI/2;foundation.position.set((data.minX+data.maxX)/2,-.015,(data.minZ+data.maxZ)/2);foundation.receiveShadow=true;root.add(foundation);

    const notice=document.createElement('div');notice.className='frozen-loading';notice.hidden=true;
    notice.style.cssText='position:absolute;inset:0;z-index:14;display:none;place-content:center;text-align:center;background:#102331e8;color:#e5f6ff;font:600 16px sans-serif;padding:30px';
    document.querySelector('.arena-wrap').append(notice);
    let started=false,loaded=false,error=false,model=null;
    const skyColor=new T.Color(0x8babbc);
    const loader=new window.GLTFLoader();
    window.heroIceLandscapeStatus='idle';
    function fail(e){
      // The original GLB is optional on GitHub Pages. Never freeze Level 2
      // controls, enemies or the level transition while its download fails.
      console.warn('Original frozen landscape unavailable; using safe terrain preview',e);
      error=true;
      if(!model && n*rows<=250000){
        // Rebuild approximate snow surface from the real collision height grid.
        // The flat foundation stays underneath unmodeled sections.
        const points=new Float32Array(n*rows*3),faces=[];
        for(let j=0;j<rows;j++)for(let i=0;i<n;i++){
          const k=j*n+i,h=heights[k];
          points[k*3]=data.minX+i*cellX;
          points[k*3+1]=h===-32768?0:h/100;
          points[k*3+2]=data.minZ+j*cellZ;
        }
        for(let j=0;j<rows-1;j++)for(let i=0;i<n-1;i++){
          const a=j*n+i,b=a+1,c=a+n,d=c+1;
          if([a,b,c,d].some(k=>heights[k]===-32768))continue;
          faces.push(a,c,b,b,c,d);
        }
        const shape=new T.BufferGeometry();
        shape.setAttribute('position',new T.BufferAttribute(points,3));
        shape.setIndex(faces);
        shape.computeVertexNormals();
        const preview=new T.Mesh(shape,new T.MeshStandardMaterial({
          map:groundTexture,color:0xd9e6ed,roughness:.92,side:T.DoubleSide
        }));
        preview.name='Frozen terrain height-map fallback';
        preview.receiveShadow=true;root.add(preview);model=preview;
      }
      loaded=true;window.heroIceLandscapeStatus='ready';
      notice.textContent='Playing with lightweight frozen terrain';
      notice.style.display='none';
    }
    function accept(gltf){
      model=gltf.scene;model.scale.setScalar(data.scale);model.position.z=data.zOffset;
      model.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=false;}});
      root.add(model);
      for(let tile=1;tile<tileCount;tile++){
        const extension=model.clone(true);extension.name='Connected frozen landscape '+(tile+1);
        if(tile%2){
          extension.scale.z=-data.scale;
          extension.position.z=-data.zOffset+2*originalData.minZ-(tile-1)*tileDepth;
        }else extension.position.z=data.zOffset-tile*tileDepth;
        root.add(extension);
      }
      loaded=true;window.heroIceLandscapeStatus='ready';
    }
    function parse(raw){try{const bytes=decode(raw);loader.parse(bytes.buffer,'',accept,fail);}catch(e){fail(e);}}
    function load(){
      if(started)return;started=true;window.heroIceLandscapeStatus='loading';
      notice.textContent='Preparing the frozen landscape…';
      if(location.protocol==='file:'){
        const script=document.createElement('script');script.src='assets/frozen-landscape-data.js';
        script.onload=()=>{const raw=window.heroFrozenModel;delete window.heroFrozenModel;script.remove();parse(raw);};
        script.onerror=e=>{script.remove();fail(e);};document.head.append(script);
      }else loader.load('assets/frozen-landscape.glb',accept,undefined,fail);
    }
    window.loadFrozenLandscape=load;
    const snowCount=650*tileCount,positions=new Float32Array(snowCount*3);
    for(let i=0;i<snowCount;i++){positions[i*3]=Math.random()*50-25;positions[i*3+1]=Math.random()*30;positions[i*3+2]=data.minZ+Math.random()*(data.maxZ-data.minZ);}
    const snowGeo=new T.BufferGeometry();snowGeo.setAttribute('position',new T.BufferAttribute(positions,3));
    const snow=new T.Points(snowGeo,new T.PointsMaterial({color:0xe9f7ff,size:.065,transparent:true,opacity:.65,depthWrite:false}));root.add(snow);
    const fires=[],makeFire=window.createAnimatedFireFactory?.(T);
    if(makeFire)for(let i=0;i<6;i++){
      const p=nearest((i%2?1:-1)*(8+i),12-i*6);if(!p)continue;
      const fire=makeFire(900+i,.65);fire.root.position.set(p.x,height(p.x,p.z)+.02,p.z);root.add(fire.root);fires.push(fire);
    }
    let lastTime=null;
    return {root,update(active,position,t){
      root.visible=active;notice.hidden=!active||loaded;notice.style.display=active&&!loaded?'grid':'none';
      if(!active){lastTime=null;return;}
      load();if(!loaded)return;
      scene.background=skyColor;scene.fog.color.setHex(0xa3b9c5);scene.fog.near=25;scene.fog.far=105;
      const dt=lastTime===null?0:Math.min(.05,t-lastTime);lastTime=t;
      for(let i=0;i<snowCount;i++){const k=i*3;positions[k+1]-=dt*(.7+i%7*.12);positions[k]+=dt*.15;if(positions[k+1]<0)positions[k+1]=30;if(positions[k]>26)positions[k]=-26;}
      snowGeo.attributes.position.needsUpdate=true;
      fires.forEach(f=>f.update(t,position,f.root.position.z));
    }};
  };
})();
