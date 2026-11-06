/* Main-game ice movement: retain solid walls, repair false floor-mask seams. */
(() => {
  const installed=new WeakSet();
  window.installIceMovementSafety=terrain=>{
    const data=window.heroFrozenCollision;
    if(!data||!terrain?.height||!terrain.open||!terrain.world||!terrain.resolve||installed.has(terrain))return;
    installed.add(terrain);const originalOpen=terrain.open.bind(terrain),originalResolve=terrain.resolve.bind(terrain);
    const supported=(x,z)=>{
      if(!Number.isFinite(x)||!Number.isFinite(z)||x<data.minX||x>data.maxX)return false;
      const mapY=z/.055+300;if(mapY<terrain.bounds.minY||mapY>terrain.bounds.maxY)return false;
      if(originalOpen(x,z))return true;
      const h=terrain.height(x,z);if(!Number.isFinite(h))return false;
      // A mask seam on a continuous, gentle surface is not a physical wall.
      for(const[dx,dz]of[[.16,0],[-.16,0],[0,.16],[0,-.16]]){const q=terrain.height(x+dx,z+dz);if(!Number.isFinite(q)||Math.abs(q-h)>.45)return false;}
      return true;
    };
    terrain.open=supported;
    terrain.resolve=(p,previous)=>{
      if(!p?.hero||!previous)return originalResolve(p,previous);
      const from=terrain.world(previous),desired=terrain.world(p);
      if(!supported(from.x,from.z)||![desired.x,desired.z].every(Number.isFinite)){terrain.snap(p);return;}
      let lift=0;
      if(p.jump>0)lift=Math.sin(Math.max(0,Math.min(1,(.76-p.jump)/.76))*Math.PI)*1.15;
      if(p.finStunt?.kind==='jump')lift=Math.max(lift,Math.sin(Math.max(0,Math.min(1,p.finStunt.age/p.finStunt.duration))*Math.PI)*1.15);
      const rise=.42+lift,drop=lift>.1?2.5:.65,dx=desired.x-from.x,dz=desired.z-from.z,count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));let x=from.x,z=from.z;
      const canStep=(nx,nz)=>{if(!supported(nx,nz))return false;const a=terrain.height(x,z),b=terrain.height(nx,nz);return Number.isFinite(a)&&Number.isFinite(b)&&b-a<=rise&&a-b<=drop;};
      for(let i=0;i<count;i++){const nx=x+dx/count,nz=z+dz/count;if(canStep(nx,nz)){x=nx;z=nz;}else{const sx=Math.abs(nx-x)>1e-8&&canStep(nx,z),sz=Math.abs(nz-z)>1e-8&&canStep(x,nz);if(sx&&(!sz||Math.abs(dx)>=Math.abs(dz)))x=nx;else if(sz)z=nz;}}
      p.x=x/.055+500;p.y=z/.055+300;p.groundY=terrain.height(x,z);
    };
  };
})();
