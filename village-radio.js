(() => {
  window.villageRadio={x:191,y:-9}; // Inside the open doorway on the west bank.
  let radioButton,indicator,playFace,activeCamera,roomOrigin;
  window.createVillageRadioRoom=(T,root,placement={x:-17,y:0,z:-17})=>{
    const room=new T.Group();room.position.set(placement.x,placement.y,placement.z);roomOrigin=room.position.clone();root.add(room);
    const wood=new T.MeshStandardMaterial({color:0x493527,roughness:.9}),wall=new T.MeshStandardMaterial({color:0x8b806b,roughness:1}),dark=new T.MeshStandardMaterial({color:0x252729,roughness:.5,metalness:.4});
    const box=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);room.add(o);return o;};
    box(4,.2,7,0,-.1,0,wood);box(.15,5,7,-2,2.5,0,wall);box(.15,5,7,2,2.5,0,wall);box(4,5,.15,0,2.5,-3.5,wall);
    // A wide open front and cutaway roof keep the actor and interaction visible.
    box(.45,5,.2,-1.8,2.5,3.5,wood);box(.45,5,.2,1.8,2.5,3.5,wood);box(4,.3,.4,0,4.85,3.5,wood);
    box(2.7,.2,1.1,0,1.8,-2,wood);for(const x of [-1.1,1.1])box(.15,1.8,.8,x,.9,-2,wood);
    const radio=box(2.1,.85,.5,0,2.32,-2,dark);
    const tex=new T.TextureLoader().load(window.radioCassetteImage);tex.colorSpace=T.SRGBColorSpace;
    const tape=new T.Mesh(new T.PlaneGeometry(1.1,.62),new T.MeshStandardMaterial({map:tex,roughness:.8}));tape.position.set(0,2.32,-1.735);room.add(tape);
    for(const x of [-.8,.8])for(let i=0;i<7;i++)box(.32,.025,.02,x,2.08+i*.075,-1.73,wood);
    radioButton=box(.24,.09,.22,.65,2.79,-1.9,dark);
    const label=document.createElement('canvas');label.width=256;label.height=96;const ctx=label.getContext('2d');ctx.fillStyle='#f1c56e';ctx.fillRect(0,0,256,96);ctx.fillStyle='#172b21';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText('▶ PLAY',128,64);
    playFace=new T.Mesh(new T.PlaneGeometry(1.35,.5),new T.MeshBasicMaterial({map:new T.CanvasTexture(label)}));playFace.position.set(0,3.12,-1.65);room.add(playFace);
    const wrap=document.querySelector('.arena-wrap'),ray=new T.Raycaster();
    wrap.addEventListener('pointerdown',e=>{const state=window.heroArena3DState?.()?.state;if(state?.round!==3||!activeCamera||!root.visible)return;const rect=wrap.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),activeCamera);if(ray.intersectObject(playFace).length){e.preventDefault();e.stopImmediatePropagation();window.playVillageRadio?.();}},true);
    indicator=box(.08,.05,.02,-.6,2.62,-1.73,new T.MeshBasicMaterial({color:0x392e23}));
    const lamp=new T.PointLight(0xffc885,12,10);lamp.position.set(0,4,1);room.add(lamp);
  };
  window.updateVillageRadioCamera=(T,state,camera,rigs)=>{
    activeCamera=camera;const scene=state?.round===3?state.radioScene:null;if(playFace)playFace.visible=!scene;if(!scene)return;
    const hero=rigs.get(scene.heroId)||rigs.get(scene.ally?.id);if(!hero)return;
    for(const [id,actor] of rigs){if(state.players[id]&&actor!==hero){actor.visible=false;actor.userData.radioHidden=true;}}
    const phase=scene.phase,t=scene.age;hero.visible=true;hero.rotation.y=Math.PI;
    const head=hero.position.clone().add(new T.Vector3(0,2.05*hero.scale.y,0));
    if(phase==='approach'){
      const pull=T.MathUtils.smoothstep(t,1.5,4);camera.position.copy(head).add(new T.Vector3(1.05+pull*.15,.15,-2.4));camera.lookAt(head.clone().add(new T.Vector3(0,-.3*pull,-.35*pull)));
    }else if(phase==='listen'){
      camera.position.copy(roomOrigin).add(new T.Vector3(1.35,4.1,-3.05));camera.lookAt(roomOrigin.clone().add(new T.Vector3(0,3.15,-1.35)));
    }else{
      camera.position.copy(roomOrigin).add(new T.Vector3(1.5,3.5,-.2));camera.lookAt(roomOrigin.clone().add(new T.Vector3(.65,2.79,-1.9)));
      const reach=Math.sin(Math.min(1,t/1.1)*Math.PI/2);
      for(const g of [hero.userData.glbRig,hero.userData.helmetedRig].filter(Boolean)){g.arms[0].rotation.x=-1.1*reach;g.forearms[0].rotation.x=-.3*reach;}
    }
    if(indicator)indicator.material.color.setHex(phase==='listen'?0xffae40:0x392e23);
    if(radioButton)radioButton.position.y=phase==='off'&&t>=1.1?2.75:2.79;
  };
})();
