/* Main campaign: the user's sky references surround, rather than replace, the playable 3D world. */
(()=>{
  window.createScenicBackground=(T,scene)=>{
    const shared=window.heroScenicSkyCache||(window.heroScenicSkyCache={textures:new Map(),pending:new Set(),failed:new Set()});const{textures,pending,failed}=shared;
    const paths={village:'assets/village-sunset-horizon.jpg',canyon:'assets/canyon-red-horizon.jpg'};
    const keyFor=round=>round===3?'village':[1,4].includes(round)?'canyon':null;
    const uniforms={horizon:{value:null},sunset:{value:0},redHorizon:{value:null},redMix:{value:0},night:{value:0},villageDay:{value:0}};
    const material=new T.ShaderMaterial({side:T.BackSide,depthTest:false,depthWrite:false,fog:false,uniforms,
      vertexShader:'varying vec3 viewDirection;void main(){viewDirection=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
      fragmentShader:`varying vec3 viewDirection;uniform sampler2D horizon;uniform float sunset;uniform sampler2D redHorizon;uniform float redMix;uniform float night;uniform float villageDay;
      void main(){vec3 d=normalize(viewDirection);float angle=atan(d.x,-d.z)/6.2831853+.5;
        // Mirror the horizon at the back of the world to join both edges without a visible seam.
        float u=1.-abs(fract(angle*2.+.25)*2.-1.);
        // At eye level use the distant mountain ridge. The foreground path, grass,
        // river and rocks in the reference are excluded from the sky projection.
        float elevation=asin(clamp(d.y,-1.,1.));float row=clamp(.485-elevation*.40,.012,.54);
        vec3 color=mix(texture2D(horizon,vec2(u,1.-row)).rgb,texture2D(redHorizon,vec2(u,1.-row)).rgb,redMix);
        float zenith=smoothstep(.8,1.5,elevation);vec3 top=mix(vec3(.16,.21,.31),vec3(.20,.045,.055),sunset);
        color=mix(color,top,zenith*.65);color=mix(color,vec3(dot(color,vec3(.2126,.7152,.0722))),.08);
        vec3 haze=mix(vec3(.66,.51,.39),vec3(.57,.24,.15),sunset);
        if(villageDay>.5){float luminance=dot(color,vec3(.2126,.7152,.0722));float cloud=smoothstep(.25,.82,luminance);vec3 blue=mix(vec3(.38,.60,.78),vec3(.16,.39,.67),clamp(d.y,0.,1.));color=mix(blue,vec3(.88,.92,.96),cloud*.82);haze=vec3(.68,.78,.86);}
        color=mix(color,haze,(1.-smoothstep(-.12,.01,elevation)));color*=1.-night*.55;gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
    const dome=new T.Mesh(new T.SphereGeometry(500,48,24),material);dome.name='Scenic sunset clouds and distant mountain horizon';dome.frustumCulled=false;dome.renderOrder=-100;dome.visible=false;scene.add(dome);
    function request(key){if(!key||textures.has(key)||pending.has(key)||failed.has(key))return;pending.add(key);new T.TextureLoader().load(paths[key]+'?v=reference-1',texture=>{texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;textures.set(key,texture);pending.delete(key);},undefined,error=>{pending.delete(key);failed.add(key);console.warn('Scenic sky reference unavailable; retaining the original sky.',error);});}
    window.retryScenicSky=()=>failed.clear();
    window.heroScenicSkyReady=round=>textures.has(keyFor(round));
    return {dome,update(state,camera){const cinematic=state?.round===4?state.cosmicArrival:null;const key=state?.phase==='game'?(cinematic?'village':keyFor(state.round)):null;request(key);if(cinematic)request('canyon');const texture=textures.get(key);dome.visible=!!texture;if(!texture)return;uniforms.villageDay.value=state.round===3?1:0;uniforms.horizon.value=texture;uniforms.redHorizon.value=textures.get('canyon')||texture;const a=cinematic?.age||0;uniforms.redMix.value=cinematic?T.MathUtils.smoothstep(a,10,15):0;uniforms.night.value=cinematic?T.MathUtils.smoothstep(a,14,17):0;uniforms.sunset.value=cinematic?uniforms.redMix.value:key==='canyon'?1:0;dome.position.copy(camera.position);scene.background=null;}};
  };
})();

