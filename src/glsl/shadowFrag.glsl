uniform sampler2D uTexture;
varying vec2 vUv;

void main(){
  // vec3 color = texture2D(uTexture,vUv).rgb;
  vec3 color = vec3(0.0);
  
  gl_FragColor =vec4(color,0.3);
}