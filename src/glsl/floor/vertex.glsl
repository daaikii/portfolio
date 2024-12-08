varying vec2 vUv;

uniform vec2 uAspect;

void main(){
  vUv = uv;

  vec3 newPos = vec3(position.xy*uAspect,position.z);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(newPos,1.0);
}