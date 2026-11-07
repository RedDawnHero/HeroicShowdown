/* Use the original model poses for the helmet cutaway; never deform arms or cape. */
(()=>{
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 window.sampleFinArrival=(T,a)=>{const legs=[[64,66,[5,1.2,-4],[9,0,-3]],[66,70,[9,0,-3],[9,0,-11]],[70,76,[9,0,-11],[-1,0,-8]]],leg=legs.find(l=>a<l[1])||legs[2],from=new T.Vector3(...leg[2]),to=new T.Vector3(...leg[3]);return{position:from.clone().lerp(to,ease((a-leg[0])/(leg[1]-leg[0]))),yaw:a<76?Math.atan2(to.x-from.x,to.z-from.z):Math.atan2(-5,0),walking:a>=64&&a<76};};
 window.createCinematicHelmet=(T,lead,scene)=>{
  const covered=lead.userData.helmetedModel,bare=lead.userData.glbModel,held=bare?.getObjectByName('Red Dawn held helmet');if(!covered||!bare||!held)return null;
  const geometry=held.geometry.index?held.geometry.toNonIndexed():held.geometry.clone();geometry.deleteAttribute('skinIndex');geometry.deleteAttribute('skinWeight');geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new T.Vector3());geometry.translate(-center.x,-center.y,-center.z);const prop=new T.Mesh(geometry,held.material);prop.name='Original Red Dawn helmet resting on the desk';prop.visible=false;scene.add(prop);lead.userData.cinematicArms=true;
  return{prop,handFocus(){lead.updateMatrixWorld(true);return lead.localToWorld(center.clone());},update(a,table){covered.visible=a<19.4;bare.visible=a>=19.4;held.visible=a>=19.4&&a<23.8;prop.visible=a>=24&&a<56;prop.position.copy(table);prop.rotation.set(.25,lead.rotation.y,0);}};
 };
})();
