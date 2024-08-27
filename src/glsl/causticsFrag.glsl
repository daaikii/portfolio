uniform sampler2D uTexture;
uniform sampler2D tileTexture;
uniform float uChromaticAberration;

varying vec2 vUv;

const int num_iter = 16;

float random(vec2 p){
  return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

void main() {
  vec2 uv = vUv;
  vec4 color = vec4(0.0);

  vec3 refractCol = vec3(0.0);

  float flip = -0.5;

  for ( int i = 0; i < num_iter; i ++ ) {
    float noiseIntensity = 0.01;
    float noise = random(uv) * noiseIntensity;
    float slide = float(i) / float(num_iter) * 0.1 + noise;

    // float mult = i % 2 == 0 ? 1.0 : -1.0;
    // flip *= mult;

    // vec2 dir = i % 2 == 0 ? vec2(flip, 0.0) : vec2(0.0, flip);

    refractCol.r += texture2D(uTexture, uv + (uChromaticAberration * slide * 1.0) ).r;
    refractCol.g += texture2D(uTexture, uv + (uChromaticAberration * slide * 2.0) ).g;
    refractCol.b += texture2D(uTexture, uv + (uChromaticAberration * slide * 3.0) ).b;
  }

  refractCol /= float(num_iter);
  refractCol = sat(refractCol, 1.265);

  color = vec4(refractCol.r, refractCol.g, refractCol.b, 1.0);

  gl_FragColor = vec4(color.rgb, 1.0);

  // vec4 c = texture2D(uTexture,vUv);

  // gl_FragColor = c;
  
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}