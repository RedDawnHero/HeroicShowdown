/* Local face morphs for the original unrigged GLBs; body geometry and limb bones stay unchanged. */
(()=>{
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 window.createDialogueMouth=(T,actor,kind)=>{
  const model=actor?.userData.glbModel;if(!model||!['golden','ecal'].includes(kind))return null;
  const meshes=[],mouthY=kind==='golden'?2.045:1.795,halfWidth=kind==='golden'?.115:.14,front=kind==='golden'?.105:.345;
  model.traverse(mesh=>{if(!mesh.isSkinnedMesh||mesh.name==='Red Dawn held helmet')return;const original=mesh.geometry,position=original.getAttribute('position');if(!position)return;const delta=new Float32Array(position.count*3);let count=0;
   for(let i=0;i<position.count;i++){const x=position.getX(i),y=position.getY(i),z=position.getZ(i),side=1-smooth((Math.abs(x)-halfWidth*.45)/(halfWidth*.55)),depth=smooth((z-front)/.065),lower=smooth((mouthY+.025-y)/.045)*(1-smooth((mouthY-.075-y)/.075));const weight=side*depth*lower*smooth((y-(kind==='golden'?1.9:1.70))/.035);if(weight<.001)continue;delta[i*3+1]=-.026*weight;delta[i*3+2]=.004*weight;count++;}
   if(!count)return;const geometry=original.clone();geometry.morphTargetsRelative=true;geometry.morphAttributes.position=[new T.Float32BufferAttribute(delta,3)];mesh.geometry=geometry;mesh.updateMorphTargets();meshes.push(mesh);
  });
  return{meshes,update(age,line){let amount=0;if(line){const t=Math.max(0,age-line.at),duration=line.end-line.at,fade=smooth(t/.15)*smooth((duration-t)/.3),syllable=Math.pow(Math.max(0,Math.sin(t*19)+.35*Math.sin(t*31+.6)),.8);amount=Math.min(1,syllable)*fade;}for(const mesh of meshes)mesh.morphTargetInfluences[0]=amount;},reset(){for(const mesh of meshes)mesh.morphTargetInfluences[0]=0;}};
 };
})();
