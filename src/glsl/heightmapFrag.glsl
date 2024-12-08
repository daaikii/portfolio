#define PI 3.1415926538

uniform vec2 mousePos;
uniform float mouseSize;
uniform float viscosityConstant;
uniform float waveheightMultiplier;
uniform float uTime;
uniform float uProgress;

float random(vec2 st, float seed) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123 + seed);
}

void main() {
    // The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader.
    // sizeX and sizeY are passed as params when you make a new GPUComputationRenderer instance.
    vec2 cellSize = 1.0 / resolution.xy;

    // gl_FragCoord is in pixels (coordinates range from 0.0 to the width/height of the window,
    // note that the window isn't the visible one on your browser here, since the gpgpu renders to its virtual screen
    // thus the uv still is 0..1
    vec2 uv = gl_FragCoord.xy * cellSize;

    // heightmapValue.x == height from previous frame
    // heightmapValue.y == height from penultimate frame
    // heightmapValue.z, heightmapValue.w not used
    vec4 heightmapValue = texture2D( heightmap, uv );

    // Get neighbours
    vec4 north = texture2D( heightmap, uv + vec2( 0.0, cellSize.y ) );
    vec4 south = texture2D( heightmap, uv + vec2( 0.0, - cellSize.y ) );
    vec4 east = texture2D( heightmap, uv + vec2( cellSize.x, 0.0 ) );
    vec4 west = texture2D( heightmap, uv + vec2( - cellSize.x, 0.0 ) );

    // https://web.archive.org/web/20080618181901/http://freespace.virgin.net/hugo.elias/graphics/x_water.htm
    // change in height is proportional to the height of the wave 2 frames older
    // so new height is equaled to the smoothed height plus the change in height
    float newHeight = ( ( north.x + south.x + east.x + west.x ) * 0.5 - heightmapValue.y ) * viscosityConstant;

    // Mouse influence
    float mousePhase = clamp( length( ( uv - vec2( 0.5 ) ) * vec2(GEOM_WIDTH, GEOM_HEIGHT) - vec2( mousePos.x, mousePos.y ) ) * PI / mouseSize, 0.0, PI );
    newHeight += ( cos( mousePhase ) + 1.0 ) * waveheightMultiplier;



    // 固定の seed 値を uTime を使って動的に変化させる
    float seed = 100.0;  // 任意の固定値
    float dynamicSeed = seed + uTime;

    // ランダムな値を生成して、水滴の発生を制御
    float dropChance = random(vec2(uTime, 1.0), dynamicSeed);

    if (dropChance < 0.03*uProgress) {  // 3%の確率で水滴を発生させる
        vec2 dropPosition = vec2(random(vec2(uTime, 0.0), dynamicSeed), random(vec2(0.0, uTime), dynamicSeed));
        float dropPhase = clamp(length((uv - dropPosition) * vec2(GEOM_WIDTH, GEOM_HEIGHT)) * PI / mouseSize, 0.0, PI);
        newHeight += (cos(dropPhase) + 1.0) * waveheightMultiplier;
    }




    heightmapValue.y = heightmapValue.x;
    heightmapValue.x = newHeight;

    gl_FragColor = heightmapValue;

}