import * as THREE from "three"
import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js"

import heightmapFragment from "../glsl/heightmapFrag.glsl"


export default class Water {
  private renderer: THREE.WebGLRenderer
  private aspectRatio: number
  private gpuCompute!: GPUComputationRenderer
  private waterMat!: THREE.MeshPhongMaterial
  public waterMesh!: THREE.Mesh
  public heightmapVariable!: Variable
  private settings: {
    mouseSize: number,
    viscosity: number,
    waveHeight: number
  }

  constructor(renderer: THREE.WebGLRenderer, aspectRatio: number) {
    this.renderer = renderer
    this.aspectRatio = aspectRatio
    this.settings = {
      mouseSize: 0.1,
      viscosity: 0.93,
      waveHeight: 0.1,
    }

    this.createMesh()
  }

  //WATER MESH
  private createMesh() {
    const width = 2 * this.aspectRatio;
    const height = 2;
    const fbo_width = 128 * this.aspectRatio;
    const fbo_height = 128;
    const waterGeo = new THREE.PlaneGeometry(width, height, fbo_width - 1, fbo_height - 1)
    this.waterMat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
    this.waterMat.userData.heightmap = { value: null }

    this.waterMat.onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.heightmap = this.waterMat.userData.heightmap;

      shader.vertexShader = shader.vertexShader.replace('#include <common>', `
        uniform sampler2D heightmap;
        #include <common>
      `);

      shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `
        // Compute normal from heightmap
        vec2 cellSize = vec2( 1.0 / (${fbo_width.toFixed(1)}), 1.0 / ${fbo_height.toFixed(1)} );
        vec3 objectNormal = vec3(
          ( texture2D( heightmap, uv + vec2( - cellSize.x, 0 ) ).x - texture2D( heightmap, uv + vec2( cellSize.x, 0 ) ).x ) * ${fbo_width.toFixed(1)} / ${width.toFixed(1)},
          ( texture2D( heightmap, uv + vec2( 0, - cellSize.y ) ).x - texture2D( heightmap, uv + vec2( 0, cellSize.y ) ).x ) * ${fbo_height.toFixed(1)} / ${height.toFixed(1)},
          1.0
        );  
        vNormal = normalize(objectNormal);
        // update objectNormal to reflect the calculated normal
        objectNormal = vNormal;  
      `);

      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        float heightValue = texture2D( heightmap, uv ).x;
        vec3 newPosition = vec3( position.x, position.y, heightValue );
        vec3 transformed = newPosition;  // Assign newPosition to transformed
      `);

      shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `
        // Output the normal as color
        gl_FragColor = vec4( normalize(vNormal) * 0.5 + 0.5, 1.0 );
        #include <dithering_fragment>
      `);
    };

    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMat)
    this.waterMesh.rotation.x = - Math.PI / 2
    // as the mesh is static, we can turn auto update off: https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
    this.waterMesh.matrixAutoUpdate = false
    this.waterMesh.updateMatrix()

    //FBO  
    this.gpuCompute = new GPUComputationRenderer(fbo_width, fbo_height, this.renderer);
    if (this.renderer.capabilities.isWebGL2 === false) {
      this.gpuCompute.setDataType(THREE.HalfFloatType)
    }

    const heightmap0 = this.gpuCompute.createTexture()

    // //最初のレンダリング時に発生する波-----------------
    // function fillTexture(texture: GPUComputationRenderer.texture) {
    //   const waterMaxHeight = 0.5;

    //   const centerX = fbo_width / 4;
    //   const centerY = fbo_height / 2;

    //   function dropShape(x: number, y: number) {
    //     const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    //     const radius = Math.min(fbo_width, fbo_height) / 8;
    //     if (distance < radius) {
    //       return (1 - distance / radius) * waterMaxHeight;
    //     }
    //     return 0;
    //   }

    //   const pixels = texture.image.data;
    //   let p = 0;

    //   for (let j = 0; j < fbo_height; j++) {
    //     for (let i = 0; i < fbo_width; i++) {
    //       // キャンバス座標の設定を修正
    //       const x = i;
    //       const y = j;

    //       const drop = dropShape(x, y); // 水滴の形状
    //       pixels[p + 0] = drop;
    //       pixels[p + 1] = 0;
    //       pixels[p + 2] = 0;
    //       pixels[p + 3] = 1;

    //       p += 4;
    //     }
    //   }
    // }
    // fillTexture(heightmap0)

    this.heightmapVariable = this.gpuCompute.addVariable('heightmap', heightmapFragment, heightmap0);

    //オフスクリーンレンダリングに使用するuniforms,defines
    this.heightmapVariable.material.uniforms['uTime'] = { value: 0 };
    this.heightmapVariable.material.uniforms['uProgress'] = { value: 0 };
    this.heightmapVariable.material.uniforms['mousePos'] = { value: new THREE.Vector2(10000, 10000) }
    this.heightmapVariable.material.uniforms['mouseSize'] = { value: this.settings.mouseSize }
    this.heightmapVariable.material.uniforms['viscosityConstant'] = { value: this.settings.viscosity }
    this.heightmapVariable.material.uniforms['waveheightMultiplier'] = { value: this.settings.waveHeight }
    this.heightmapVariable.material.defines.GEOM_WIDTH = width.toFixed(1)
    this.heightmapVariable.material.defines.GEOM_HEIGHT = height.toFixed(1)

    this.gpuCompute.setVariableDependencies(this.heightmapVariable, [this.heightmapVariable])
    const error = this.gpuCompute.init()
    if (error !== null) {
      console.error(error)
    }
  }


  public animate() {
    this.heightmapVariable.material.uniforms.uTime.value += 0.01;
    this.gpuCompute.compute()
    this.waterMat.userData.heightmap.value = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable).texture
  }
}