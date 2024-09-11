#define R iResolution.xy
#define ss(a,b,t) smoothstep(a,b,t)
#define N normalize
#define T(uv) texture(iChannel0, uv).r

uniform vec2 iResolution;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform float iFrame;
uniform float uProgress;

varying vec2 vUv;


// Dave Hoskins https://www.shadertoy.com/view/4djSRW
float hash13(vec3 p3)
{
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}
// Martijn Steinrucken youtube.com/watch?v=b0AayhCO7s8
float gyroid (vec3 seed)
{
    return dot(sin(seed),cos(seed.yzx));
}

void main()
{
    vec2 uv = gl_FragCoord.xy/iResolution.xy;
    
    // normal
    float rng = hash13(vec3(gl_FragCoord.xy, iFrame));
    vec3 unit = vec3(vec2(.1), 0.);
    vec3 normal = normalize(vec3(T(uv-unit.xz)-T(uv+unit.xz),
                                 T(uv-unit.zy)-T(uv+unit.zy),
                                 .0001));
    // distort
    gl_FragColor = texture(iChannel1, vUv+(.1*normal.xy*uProgress));
}