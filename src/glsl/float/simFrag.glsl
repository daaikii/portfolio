
// Fragment shader (simShader.frag)
uniform vec2 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform sampler2D iChannel0; // Previous frame (double buffering)
uniform sampler2D iChannel1; // External texture (obstacles or mask)
uniform vec3 iMouse;
uniform int iFrame;

varying vec2 vUv;
#define R iResolution.xy
#define ss(a,b,t) smoothstep(a,b,t)
#define N normalize
#define T(uv) texture(iChannel0, uv).r

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
float hash11(float p)
{
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}
float hash13(vec3 p3)
{
	p3  = fract(p3 * .111031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}
vec2 hash23(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// Martijn Steinrucken youtube.com/watch?v=b0AayhCO7s8
float gyroid (vec3 seed)
{
    return dot(sin(seed),cos(seed.yzx));
}


/////////// spicy noise
float fbm (vec3 seed)
{
    // thebookofshaders.com/13
    float result = 0.;
    float a = .5;
    for (int i = 0; i < 4; ++i)
    {
        // distort
        seed += result / 2.;
        
        // animate
        seed.y -= .1*iTime/a;
        
        // accumulate
        result += gyroid(seed/a)*a;
        
        // granule
        a /= 3.;
    }
    return result;
}

void main()
{

    /////////// coordinates
    vec2 uv = vUv;
    vec2 p = (gl_FragCoord.xy-R)/R.y;
    
    // salt
    float rng = hash13(vec3(gl_FragCoord.xy, iFrame));
    
    // noise
    vec3 seed = vec3(p * vec2(1,.2), length(p) + iTime) * 2.;
    float noise = fbm(seed);
    float a = noise * 3.14;
    
    // normal
    vec3 unit = vec3(vec2(.005), 0.);
    vec3 normal = normalize(vec3(T(uv-unit.xz)-T(uv+unit.xz),
                                 T(uv-unit.zy)-T(uv+unit.zy),
                                 unit.y));
    
    // mouse
    vec2 mouse = iMouse.xy/R;
    float clic = step(0., iMouse.z);
    
    
    ////////// shape
    float shape = 1.;
    
    // bottom line
    shape *= ss(.1,.0,1.-uv.y);
    
    // wave
    shape *= ss(0.,1.,4.);
    
    // salt
    shape *= pow(rng, 1.);
    
    
    
    ////////// forces field
    vec2 offset = vec2(0);
            
    // turbulence                     
    offset -= vec2(cos(a),sin(a)) * fbm(seed+.195);

    // slope
    // offset -= normal.xy * .5;
    
    // gravity
    offset += vec2(1,1);
    
    // obstacle
    // offset *= texture(iChannel1, uv).r;
    
    // mouse
    vec2 velocity = vec2(0);

    // inertia
    velocity = clamp(texture(iChannel0, uv).yz * .99 + velocity * .5,-1.,1.);
    
    // inertia
    offset += velocity;
    
    // apply
    uv += .01 * offset;
    
    
    
    ////////// frame buffer
    vec4 frame = texture(iChannel0, uv);
    
    // fade out
    float fade = iTimeDelta*.2;
    shape = max(shape, frame.r - fade);
    
    // result
    shape = clamp(shape, 0., 1.);
    gl_FragColor = vec4(shape, velocity, 0.1);
}