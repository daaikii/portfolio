const float PI = 3.14;

varying vec2 vUv;

uniform float uProgress;
uniform float uIndex;

void main(){
  vUv = uv;

  vec3 pos = vec3(position.xy,uIndex*0.1);
  pos.xy -=pos.xy;
  pos += length(position)*normalize(position)*smoothstep(uIndex*0.1,1. ,uProgress);
  pos.z+=sin(vUv.x*PI)*0.1*(1.0-uProgress);
  pos.z+=sin(vUv.y*PI)*0.1*(1.0-uProgress);

  vec4 mvPosition = modelViewMatrix * vec4(pos,1.0);

  gl_Position =projectionMatrix*mvPosition;
}