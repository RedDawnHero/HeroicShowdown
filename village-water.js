/* Smooth river waves, depth coloration, advected foam and light caustics. */
(() => {
  window.createVillageWater=(T,root)=>{
    const touch=matchMedia('(pointer:coarse)').matches;
    const uniforms={time:{value:0},fogColor:{value:new T.Color(0x14263c)}};
    
const skyFallback = new T.DataTexture(
  new Uint8Array([50, 80, 110, 255]),
  1, 1,
  T.RGBAFormat
);
skyFallback.colorSpace = T.SRGBColorSpace;
skyFallback.needsUpdate = true;

uniforms.skyMap = { value: skyFallback };

const skySource = window.villageNightPhotos?.sky;

if (skySource) {
  new T.TextureLoader().load(
    skySource,
    texture => {
      texture.colorSpace = T.SRGBColorSpace;
      uniforms.skyMap.value = texture;
    },
    undefined,
    () => console.warn("Using fallback village sky.")
  );
}

    const material=new T.ShaderMaterial({uniforms,side:T.FrontSide,
      vertexShader:`
        uniform float time; varying vec3 worldPoint; varying float crest;
        float wave(vec2 p){return sin(p.y*1.35-time*2.1+p.x*.35)*.12+sin(p.x*2.3+p.y*.62-time*1.7)*.065+sin(p.y*3.7-p.x*1.4-time*3.8)*.028;}
        void main(){vec3 p=position; p.z=wave(p.xy);crest=p.z;worldPoint=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(worldPoint,1.);}`,
      fragmentShader:`
        uniform float time;uniform vec3 fogColor;uniform sampler2D skyMap;varying vec3 worldPoint;varying float crest;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
        float detail(vec2 p){return noise(p)*.57+noise(p*2.1)*.28+noise(p*4.3)*.15;}
        float wave(vec2 p){return sin(p.y*1.35-time*2.1+p.x*.35)*.12+sin(p.x*2.3+p.y*.62-time*1.7)*.065+sin(p.y*3.7-p.x*1.4-time*3.8)*.028;}
        void main(){
          vec2 p=vec2(worldPoint.x,-worldPoint.z-55.);vec2 flow=p+vec2(time*.12,-time*1.15);
          float h=wave(p),dx=(wave(p+vec2(.035,0))-h)/.035,dz=(wave(p+vec2(0,.035))-h)/.035;
          float micro=detail(flow*3.);vec3 n=normalize(vec3(-dx+(micro-.5)*.08,1.,dz));
          vec3 viewDir=normalize(cameraPosition-worldPoint);float fresnel=pow(1.-max(dot(n,viewDir),0.),4.);
          float bank=smoothstep(3.9,6.6,abs(worldPoint.x));
          vec3 deep=vec3(.004,.018,.055),aqua=vec3(.012,.055,.12);
          vec3 color=mix(deep,aqua,.36+bank*.45+crest*.7);
          float veins=pow(1.-abs(sin(flow.x*2.2+detail(flow)*6.)*cos(flow.y*2.8+detail(flow*.7)*4.)),12.);
          color+=vec3(.015,.035,.07)*veins*.12;
          vec3 reflected=reflect(-viewDir,n);vec2 skyUV=vec2(fract(.5+atan(reflected.x,-reflected.z)/6.283185),clamp(.12+asin(clamp(reflected.y,-1.,1.))*.55,0.,1.));
          vec3 reflection=texture2D(skyMap,skyUV).rgb;float silver=smoothstep(.55,.9,max(reflection.r,max(reflection.g,reflection.b)));color=mix(color,reflection, .26+fresnel*.5);color+=silver*vec3(.22,.28,.36);
          float cells=detail(flow*1.8+vec2(micro));
          float foam=smoothstep(.10,.20,crest)*smoothstep(.36,.68,cells);
          foam+=bank*smoothstep(.58,.76,cells)*.65;
          float filaments=1.-smoothstep(.015,.07,abs(cells-.54));foam+=filaments*smoothstep(.04,.18,crest)*.42;
          color=mix(color,vec3(.84,.94,.93),clamp(foam*.15,0.,.16));
          float distanceToCamera=length(cameraPosition-worldPoint);color=mix(color,fogColor,smoothstep(35.,145.,distanceToCamera));
          gl_FragColor=vec4(color,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    });
    const water=new T.Mesh(new T.PlaneGeometry(13.7,2400,touch?24:40,touch?480:800),material);
    water.rotation.x=-Math.PI/2;water.position.set(0,-.72,-55);water.name='Endless moonlit dark blue water';root.add(water);
    // Fine spray where the current breaks along the banks; circular point fragments.
    const count=touch?110:200,positions=new Float32Array(count*3),seeds=new Float32Array(count);
    for(let i=0;i<count;i++){positions[i*3]=(i%2?1:-1)*(5.7+(i%7)*.12);positions[i*3+1]=-.6;positions[i*3+2]=17-(i*1.37)%145;seeds[i]=i*.618;}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('seed',new T.BufferAttribute(seeds,1));
    const spray=new T.Points(geo,new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
      vertexShader:`uniform float time;attribute float seed;varying float alpha;void main(){float age=fract(time*.6+seed);vec3 p=position;p.y+=sin(age*3.14159)*.42;p.z+=age*.7;vec4 v=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*v;gl_PointSize=clamp(27./max(1.,-v.z),1.,3.);alpha=sin(age*3.14159)*.5;}`,
      fragmentShader:`varying float alpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(.75,.92,.95,alpha*(1.-smoothstep(.15,.5,r)));}`
    }));root.add(spray);
    return {update(t,p){uniforms.time.value=t;if(p)water.position.z=Math.floor(p.z/100)*100;}};
  };
})();
