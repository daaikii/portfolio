varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uLight;
uniform float uIntensity;

void main() {
    vec2 uv = vUv;

    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLight);

    // 青い色のベースを設定
    vec3 deepWaterColor = vec3(0.0, 0.2, 0.8); // 深い青
    vec3 shallowWaterColor = vec3(0.0, 0.7, 1.0); // 浅い青

    // 法線と光の方向から反射光の計算
    vec3 reflectedLight = reflect(lightDir, normal);
    float fresnelEffect = dot(normal, -lightDir);
    fresnelEffect = clamp(pow(1.0 - fresnelEffect, 3.0), 0.0, 1.0);

    // 深さに応じて色を変える
    float depth = length(vPosition) * 0.1; // 深さのスケール調整
    vec3 waterColor = mix(shallowWaterColor, deepWaterColor, depth);

    // 照明効果の計算
    float lightIntensity = max(dot(normal, lightDir), 0.0) * uIntensity;
    vec3 finalColor = waterColor * lightIntensity + waterColor * 0.3; // 基本色を強調

    // フレネル効果を適用して反射光を追加
    finalColor = mix(finalColor, vec3(1.0), fresnelEffect * 0.2);

    // gl_FragColor = vec4(finalColor, 0.1);
    gl_FragColor = vec4(finalColor, 0.0);
}
