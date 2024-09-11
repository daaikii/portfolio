uniform sampler2D uTexture;
uniform sampler2D uCloud;
varying vec2 vUv;

void main(){
  vec4 t = texture2D(uTexture,vUv);
  vec4 c = texture2D(uCloud,vUv);
  vec4 color = t*c;
  gl_FragColor=color;
}