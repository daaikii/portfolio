import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer"

import Cloud from "./cloud"
import Portfolios from "./portfolio";
import computeMaterial from "./materials/computeMaterial";
import causticsMaterial from "./materials/causticsMaterial";

import floorVert from "../glsl/floor/vertex.glsl"
import floorFrag from "../glsl/floor/fragment.glsl"
import heightmapFragment from "../glsl/heightmapFrag.glsl"

import img from "/bathroom-blue-tiles-texture-background.jpg"




export default class Canvas {
  //base
  private static _instance: Canvas | null;
  private canvas: HTMLCanvasElement | null;
  private scene: THREE.Scene;
  private frame: number
  //renderer
  private size: { width: number; height: number };
  private aspectRatio: number;
  private fov: number;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbitControls: OrbitControls;
  private stats: Stats
  //texture
  private floorTexture: THREE.Texture;
  //RT
  private normRT: THREE.WebGLRenderTarget;
  private compRT: THREE.WebGLRenderTarget;
  //FOB1
  private normCam: THREE.PerspectiveCamera;
  //FBO2
  private compMat: THREE.ShaderMaterial;
  private compCam: THREE.OrthographicCamera;
  private compMesh: THREE.Mesh;
  //GPGPU
  private gpuCompute: GPUComputationRenderer
  private waterMat: THREE.MeshPhongMaterial
  private waterMesh: THREE.Mesh
  private heightmapVariable: GPUComputationRenderer
  //Mesh
  private caustics: THREE.Mesh;
  private portfolios: Portfolios
  private cloud: Cloud;
  private floorMesh: THREE.Mesh
  private gui: GUI;
  //event
  private raycaster: THREE.Raycaster
  private pointer: THREE.Vector2
  public viewEntry
  public titleClick
  public toggleClick
  //settings
  private settings: {
    light: THREE.Vector3,
    intensity: number,
    chromaticAberration: number,
    uFrequency: number,
    uAmplitude: number,
    uSpeed: number,
    mouseSize: number,
    viscosity: number,
    waveHeight: number,
  };


  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    //Settings
    this.settings = {
      light: new THREE.Vector3(0, 1, 0),
      intensity: 0.2,
      chromaticAberration: 0.03,
      uFrequency: 0.5,
      uAmplitude: 0.27,
      uSpeed: 0.5,
      mouseSize: 0.1,
      viscosity: 0.93,
      waveHeight: 0.1,
    }
    //RayCaster
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.frame = 0
    this.floorTexture = new THREE.TextureLoader().load(img)
  }


  public async init() {
    this.setDimension();
    // this.setGUI();
    this.setupRenderer();
    this.resize();
    this.createWaterMesh();
    this.setFBO();
    this.createMesh();
    this.setEvent();
  }


  static get instance() {
    if (!this._instance) {
      this._instance = new Canvas()
    }
    return this._instance;
  }


  private setDimension(): void {
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.aspectRatio = this.size.width / this.size.height;
  }


  private ajustCamera(camera: THREE.PerspectiveCamera) {
    const desiredHeight = 2; // Meshの高さ
    const distance = desiredHeight / (2 * Math.tan((camera.fov / 2) * Math.PI / 180));
    camera.position.set(0, distance, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }


  //GUI
  // private setGUI(): void {
  //   this.gui = new GUI()
  //   this.gui.add(this.settings, "mouseSize", 0.0, 1.0, 0.01).onChange((newVal: number) => {
  //     this.heightmapVariable.material.uniforms['mouseSize'].value = newVal
  //   })
  //   this.gui.add(this.settings, "viscosity", 0.9, 0.999, 0.001).onChange((newVal: number) => {
  //     this.heightmapVariable.material.uniforms['viscosityConstant'].value = newVal
  //   })
  //   this.gui.add(this.settings, "waveHeight", 0.1, 2.0, 0.05).onChange((newVal: number) => {
  //     this.heightmapVariable.material.uniforms['waveheightMultiplier'].value = newVal
  //   })

  //   this.gui.add(this.settings.light, "x", 0, 100, 0.01).onChange((value: number) => {
  //     this.compMat.uniforms.uLight.value.x = value
  //   })

  //   this.gui.add(this.settings.light, "y", 0, 100, 0.01).onChange((value: number) => {
  //     this.compMat.uniforms.uLight.value.y = value
  //   })

  //   this.gui.add(this.settings.light, "z", 0, 100, 0.01).onChange((value: number) => {
  //     this.compMat.uniforms.uLight.value.z = value
  //   })

  //   this.gui.add(this.settings, "intensity", 0, 5.0, 0.01).onChange((value: number) => {
  //     this.compMat.uniforms.uIntensity.value = value
  //   })

  //   this.gui.add(this.settings, "chromaticAberration", 0, 0.40, 0.01).onChange((value: number) => {
  //     this.caustics.material.uniforms.uChromaticAberration.value = value
  //   })
  //   this.gui.add(this.settings, "uFrequency", 0, 5.0, 0.01).onChange((value: number) => {
  //     this.settings.uFrequency = value
  //   })
  //   this.gui.add(this.settings, "uAmplitude", 0, 1.0, 0.01).onChange((value: number) => {
  //     this.settings.uAmplitude = value
  //   })
  //   this.gui.add(this.settings, "uSpeed", 0, 3.0, 0.01).onChange((value: number) => {
  //     this.settings.uSpeed = value
  //   })

  // }


  private setupRenderer(): void {
    this.fov = 50;
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 0.01, 1000);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas!,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0xADD8E6, 1.); // 背景色を透明にする

    //OrbitControls
    // this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

    //Stats
    // this.stats = new Stats()
    this.ajustCamera(this.camera)
  }


  private resize(): void {
    window.addEventListener("resize", () => {
      this.setDimension();
      this.camera.aspect = this.aspectRatio;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.size.width, this.size.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }


  private setFBO() {
    //RT
    this.normRT = new THREE.WebGLRenderTarget(this.size.width, this.size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    this.compRT = new THREE.WebGLRenderTarget(this.size.width, this.size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });

    //FBO1
    this.normCam = new THREE.PerspectiveCamera(50, this.aspectRatio, 0.01, 1000);  //caustics light
    this.ajustCamera(this.normCam)
    this.normCam.position.y = -.9 * this.normCam.position.y;
    this.normCam.lookAt(0, 0, 0);

    //FBO2
    this.compCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const comGeo = new THREE.PlaneGeometry(2, 2);
    this.compMat = computeMaterial;
    this.compMesh = new THREE.Mesh(comGeo, this.compMat)

    //finalFBO
    this.finalFBO = new THREE.RenderTarget(this.size.width, this.size.height)
  }










  //WATER MESH
  private createWaterMesh() {
    const width = 2 * this.aspectRatio;
    const height = 2;
    const fbo_width = 128 * this.aspectRatio;
    const fbo_height = 128;
    const waterGeo = new THREE.PlaneGeometry(width, height, fbo_width - 1, fbo_height - 1)
    this.waterMat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
    this.waterMat.userData.heightmap = { value: null }

    this.waterMat.onBeforeCompile = (shader: THREE.ShaderMaterial) => {
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


    //最初のレンダリング時に発生する波
    function fillTexture(texture: GPUComputationRenderer.texture) {
      const waterMaxHeight = 0.5;

      const centerX = fbo_width / 4;
      const centerY = fbo_height / 2;

      function dropShape(x: number, y: number) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const radius = Math.min(fbo_width, fbo_height) / 8;
        if (distance < radius) {
          return (1 - distance / radius) * waterMaxHeight;
        }
        return 0;
      }

      const pixels = texture.image.data;
      let p = 0;

      for (let j = 0; j < fbo_height; j++) {
        for (let i = 0; i < fbo_width; i++) {
          // キャンバス座標の設定を修正
          const x = i;
          const y = j;

          const drop = dropShape(x, y); // 水滴の形状
          pixels[p + 0] = drop;
          pixels[p + 1] = 0;
          pixels[p + 2] = 0;
          pixels[p + 3] = 1;

          p += 4;
        }
      }
    }
    fillTexture(heightmap0)


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









  private createMesh(): void {
    //causticsMesh
    const causticsGeo = new THREE.PlaneGeometry(2, 2);
    const causticsMat = causticsMaterial;
    causticsMat.transparent = true;
    causticsMat.blending = THREE.CustomBlending;
    causticsMat.blendSrc = THREE.OneFactor;
    causticsMat.blendDst = THREE.SrcAlphaFactor;
    causticsMat.needsUpdate = true;
    causticsMat.uniforms.uAspect.value = new THREE.Vector2(this.aspectRatio, 1.0);
    this.caustics = new THREE.Mesh(causticsGeo, causticsMat);
    this.caustics.position.set(0, 0.001, 0)
    this.caustics.rotation.set(-Math.PI / 2, 0, 0)

    //floorMesh
    const floorGeo = new THREE.PlaneGeometry(2, 2);
    const floorMat = new THREE.ShaderMaterial({
      vertexShader: floorVert,
      fragmentShader: floorFrag,
      uniforms: {
        uTexture: { value: this.floorTexture },
        uCloud: { value: null },
        uAspect: { value: new THREE.Vector2(this.aspectRatio, 1.0) }
      }
    })
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat)
    this.floorMesh.rotation.set(-Math.PI / 2, 0, 0)
    this.scene.add(this.caustics, this.floorMesh)

    //portfolios
    this.portfolios = new Portfolios(this.renderer, this.size)
    if (this.portfolios.mesh) this.scene.add(this.portfolios.mesh)
    this.viewEntry = this.portfolios.viewEntry.bind(this.portfolios)
    this.titleClick = this.portfolios.titleClick.bind(this.portfolios)
    this.toggleClick = this.portfolios.toggleClick.bind(this.portfolios)

    //cloud
    this.cloud = new Cloud(this.renderer, this.size)

    //finalMesh
    const finalGeo = new THREE.PlaneGeometry(2, 2)
    const finalMat = new THREE.MeshBasicMaterial({ map: this.finalFBO.texture });
    this.finalMesh = new THREE.Mesh(finalGeo, finalMat)
  }


















  /* EVENT----------------------------------------------------- */


  //Pointer Event
  private onPointerMove(event: PointerEvent) {
    if (event.isPrimary === false) return
    // -1から1の値に正規化
    this.pointer.x = (event.clientX / this.size.width) * 2 - 1
    this.pointer.y = - (event.clientY / this.size.height) * 2 + 1

    this.raycaster.setFromCamera(this.pointer, this.camera)

    const hmUniforms = this.heightmapVariable.material.uniforms
    const intersects = this.raycaster.intersectObject(this.waterMesh)
    if (intersects.length > 0) {
      const point = intersects[0].point

      // point is in world coordinates
      hmUniforms['mousePos'].value.set(point.x, point.z)
    }
  }

  public pointCenter() {
    console.log("called")
    const hmUniforms = this.heightmapVariable.material.uniforms
    hmUniforms['mousePos'].value.set(0, 0)
  }

  public scrollEvent() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - this.size.height;
    const scrollPercent = scrollTop / docHeight
    this.cloud.mesh.material.uniforms.uProgress.value = scrollPercent
    this.compMat.uniforms.uProgress.value = scrollPercent
    this.heightmapVariable.material.uniforms.uProgress.value = scrollPercent;
  }



  private setEvent() {
    document.addEventListener('pointermove', this.onPointerMove.bind(this))
    document.addEventListener('scroll', this.scrollEvent.bind(this))
  }




















  /*ANIMATION--------------------------------------------------------------*/
  public animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    // フレーム数をインクリメント
    this.frame++;

    // フレーム数が2で割り切れなければ描画しない
    if (this.frame % 2 == 0) {
      return;
    }


    this.heightmapVariable.material.uniforms.uTime.value += 0.01;
    this.gpuCompute.compute()
    this.waterMat.userData.heightmap.value = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable).texture

    this.renderer.setRenderTarget(this.normRT);
    this.renderer.render(this.waterMesh, this.normCam);  //normalのテクスチャを作成

    // /*compRT settings*/
    this.compMat.uniforms.uTexture.value = this.normRT.texture; //normalを渡す
    this.compMat.uniforms.uLight.value = this.settings.light; //normalを渡す
    this.compMat.uniforms.uIntensity.value = this.settings.intensity; //normalを渡す
    this.renderer.setRenderTarget(this.compRT)
    this.renderer.render(this.compMesh, this.compCam);  //normalから計算しデータをテクスチャとして取得


    /*caustics settings*/
    this.caustics.material.uniforms.uTexture.value = this.compRT.texture;
    this.caustics.material.uniforms.uChromaticAberration.value = this.settings.chromaticAberration;

    this.cloud.animate()
    this.floorMesh.material.uniforms.uCloud.value = this.cloud.renderTarget.texture;

    this.renderer.setRenderTarget(null);


    this.portfolios.animate()

    this.renderer.render(this.scene, this.camera);

  }

}

