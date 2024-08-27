varying vec2 vUv;
uniform float uTime;
uniform float uTotalMeshes;  // メッシュの総数
uniform float uIndex;        // メッシュのインデックス

void main(){
  vUv = uv;

  vec3 newPos = position;
  float totalWidth = uTotalMeshes; // メッシュ全体の幅
  float currentOffset = uIndex - uTotalMeshes / 2.0; // 中央からのオフセット
  float wavePosition = (position.x + currentOffset) / totalWidth  * 3.14159;

  newPos.z = sin(wavePosition + uTime*0.2) * 0.1 ;  // 周期を調整し、振幅を0.1に設定


  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
