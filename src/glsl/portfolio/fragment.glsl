uniform sampler2D uTexture;
uniform float uProgress;

varying vec2 vUv;


void main(){
    vec3 color = texture2D(uTexture,vUv).xyz;
    gl_FragColor =vec4(color,1.0);
}