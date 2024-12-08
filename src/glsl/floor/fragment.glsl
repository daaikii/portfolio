uniform sampler2D uTexture;
uniform sampler2D uCloud;
uniform vec2 uAspect;
varying vec2 vUv;

void main(){
  vec2 newUV = vUv-vec2(0.5);
  if(uAspect.x<1.0){
    newUV.x*=uAspect.x;
  }
  newUV+=vec2(0.5);

  vec4 t = texture2D(uTexture,newUV);
  vec4 c = texture2D(uCloud,newUV);
  vec4 color = t*c;
  gl_FragColor=color;
}