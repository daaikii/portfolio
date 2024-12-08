varying vec2 vUv;

uniform vec2 uAspect;

void main (){
  vUv = uv;
  
  vec4 mvPosition = modelViewMatrix * vec4(position.xy*uAspect,position.z,1.0);
  gl_Position=projectionMatrix*mvPosition;
}