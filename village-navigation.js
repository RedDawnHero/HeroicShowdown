/* Follow the authored village ground; never move through water or roof edges. */
(() => {
  let grid=null;const routes=new Map(),step=.4;
  window.resetVillageNavigation=player=>routes.delete(player?.id||'host');
  const world=p=>({x:(p.x-500)*.055,z:(p.y-300)*.055});
  function terrain(){
    const data=window.level3Terrain;if(!data||!window.modelVillageHeight||!window.homeVillageWalkable)return null;
    if(grid?.data===data)return grid;
    const min=data.min,max=min+(data.n-1)*data.step,n=Math.round((max-min)/step)+1,h=new Float32Array(n*n),open=new Uint8Array(n*n);
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=min+i*step,z=min+j*step,k=j*n+i,height=window.modelVillageHeight(x,z);h[k]=height??-999;open[k]=Number.isFinite(height)&&window.homeVillageWalkable(x/.055+500,z/.055+300)?1:0;}
    grid={data,min,max,n,h,open};routes.clear();return grid;
  }
  function segment(a,b){
    const count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.1));let previous=window.modelVillageHeight(a.x,a.z);if(!Number.isFinite(previous))return false;
    for(let i=1;i<=count;i++){const x=a.x+(b.x-a.x)*i/count,z=a.z+(b.z-a.z)*i/count,h=window.modelVillageHeight(x,z);if(!Number.isFinite(h)||!window.homeVillageWalkable(x/.055+500,z/.055+300)||h>previous+1.2)return false;previous=h;}return true;
  }
  function plan(start,goal,radius){
    const g=terrain();if(!g)return null;const{n,min,open}=g,point=k=>({x:min+(k%n)*step,z:min+Math.floor(k/n)*step});
    const ix=Math.round((start.x-min)/step),iz=Math.round((start.z-min)/step);let first=-1,best=Infinity;
    for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const x=ix+dx,z=iz+dz,k=z*n+x;if(x<0||z<0||x>=n||z>=n||!open[k])continue;const p=point(k),d=Math.hypot(start.x-p.x,start.z-p.z);if(d<best&&segment(start,p)){best=d;first=k;}}
    if(first<0)return null;
    const parents=new Int32Array(n*n);parents.fill(-1);const queue=new Int32Array(n*n);queue[0]=first;parents[first]=first;let head=0,tail=1,last=-1;
    while(head<tail){const k=queue[head++],a=point(k);if(Math.hypot(a.x-goal.x,a.z-goal.z)<=radius){last=k;break;}const x=k%n,z=Math.floor(k/n);
      for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const xx=x+dx,zz=z+dz,j=zz*n+xx;if(xx<0||zz<0||xx>=n||zz>=n||parents[j]!==-1||!open[j])continue;const b=point(j);if(g.h[j]>g.h[k]+1.2||!segment(a,b))continue;parents[j]=k;queue[tail++]=j;}
    }
    if(last<0)return null;const path=[];for(let k=last;;k=parents[k]){path.push(point(k));if(k===first)break;}return path.reverse();
  }
  window.villagePathDirection=(player,target)=>{
    if(player.seated||player.inspectingPhoto||player.villageAirborne)return{x:0,y:0,done:false};
    const start=world(player),goal=world(target),radius=target.clueGuide?2.6:.22,key=player.id||'host',now=performance.now();let saved=routes.get(key);
    if(Math.hypot(start.x-goal.x,start.z-goal.z)<=radius){routes.delete(key);return{x:0,y:0,done:true};}
    if(saved&&Math.hypot(saved.x-start.x,saved.z-start.z)>.025){saved.x=start.x;saved.z=start.z;saved.progress=now;}
    const offRoute=saved?.path?.length&&Math.hypot(saved.path[0].x-start.x,saved.path[0].z-start.z)>2;
    if(!saved||offRoute||saved.tx!==target.x||saved.ty!==target.y||now-saved.progress>1200){saved={tx:target.x,ty:target.y,x:start.x,z:start.z,progress:now,path:plan(start,goal,radius*.8)};routes.set(key,saved);}
    if(!saved.path)return{x:0,y:0,done:true,blocked:true};
    while(saved.path.length&&Math.hypot(saved.path[0].x-start.x,saved.path[0].z-start.z)<.14)saved.path.shift();
    if(!saved.path.length){routes.delete(key);return{x:0,y:0,done:true,blocked:Math.hypot(start.x-goal.x,start.z-goal.z)>radius};}
    const next=saved.path[0],dx=next.x-start.x,dz=next.z-start.z,d=Math.hypot(dx,dz)||1,strength=Math.min(1,d/.6);return{x:dx/d*strength,y:dz/d*strength,done:false};
  };
})();
