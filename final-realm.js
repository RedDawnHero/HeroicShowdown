(()=>{
 let cityPromise;
 window.addConnectedCity=async(T,scene,cinematic=false)=>{
  if(!window.loadFinalCity)return;
  cityPromise=cityPromise||window.loadFinalCity();const source=await cityPromise;if(!source)return;
  const root=new T.Group();root.name='Connected imported futuristic city';scene.add(root);
  const bounds=new T.Box3().setFromObject(source),size=bounds.getSize(new T.Vector3()),scale=75/Math.max(size.x,size.z),center=bounds.getCenter(new T.Vector3());
  for(let i=0;i<4;i++){const tile=new T.Group(),m=source.clone(true);m.scale.setScalar(scale);m.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);tile.add(m);tile.position.set(i%2?56:-56,0,(Math.floor(i/2)*2-1)*74-(cinematic?100:0));root.add(tile);}
  const material=new T.MeshStandardMaterial({color:0x536178,metalness:.55,roughness:.55});
  for(const z of [-74,74]){const bridge=new T.Mesh(new T.BoxGeometry(42,1,8),material);bridge.position.set(0,5,z-(cinematic?100:0));root.add(bridge);}
  return root;
 };
})();
