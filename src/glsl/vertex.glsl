const float PI = 3.14159265359;

varying vec2 vUv;

uniform float uProgress;
uniform float uIndex;




// rotation
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}
vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}





void main(){
  vUv = uv;
  float prog1 = clamp(uProgress,0.0,1.0); 

  //メッシュが重ならないようzを離す
  vec3 pos = vec3(position.xy,uIndex*1.1+0.001*uIndex);
  pos.z += 1.0;
  //uProgressで大きく 
  pos.xy -=pos.xy;
  pos += length(position)*normalize(position)*smoothstep(uIndex*0.2,1. ,uProgress);
  //山なりに丸みをつける
  pos.z+=sin(vUv.x*PI)*0.8*(1.0-prog1);
  pos.z+=sin(vUv.y*PI)*0.8*(1.0-prog1);
  //離した分戻す
  pos.z-= uIndex*1.1*prog1;



 
  //回転先1の位置の作成
  //90度回転
  vec3 rotPos = rotate(pos,vec3(1.0,0.0,0.0),-PI/2.);
  //回転先1へ移動
  pos += normalize(rotPos-pos)*length(rotPos-pos)*smoothstep(1.0,2.0,uProgress);

  //回転先2の位置の作成
  //90度回転
  vec3 rotPos2 = rotate(pos,vec3(1.0,0.0,0.0),-PI/2.);
  //回転先2へ移動
  pos += normalize(rotPos2-pos)*length(rotPos2-pos)*smoothstep(2.0,3.0,uProgress);



  vec4 mvPosition = modelViewMatrix * vec4(pos,1.0);

  gl_Position =projectionMatrix*mvPosition;
}