import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer"

import computeMaterial from "./computeMaterial";
import causticsMaterial from "./causticsMaterial";

import floorVert from "../glsl/floorVert.glsl"
import floorFrag from "../glsl/floorFrag.glsl"
import mainVert from "../glsl/mainVert.glsl"
import mainFrag from "../glsl/mainFrag.glsl"
import shadowVert from "../glsl/shadowVert.glsl"
import shadowFrag from "../glsl/shadowFrag.glsl"
import heightmapFragment from "../glsl/heightmapFrag.glsl"

import img from "/bathroom-blue-tiles-texture-background.jpg"
import img1 from "/images/img1.jpg"
import img2 from "/images/img2.jpg"
import img3 from "/images/img3.jpg"
import img4 from "/images/img4.jpg"
import img5 from "/images/img5.jpg"
import img6 from "/images/img6.jpg"
import img7 from "/images/img7.jpg"
import img8 from "/images/img8.jpg"
import img9 from "/images/img9.jpg"
import img10 from "/images/img10.jpg"




export default class Canvas {
  //base
  private static _instance: Canvas | null;
  private canvas: HTMLCanvasElement | null;
  private container: HTMLElement | null;
  private scene: THREE.Scene;
  private clock: THREE.Clock;

  //texture
  private images: string[]
  private textures: THREE.Texture[]

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
  private mainMeshes: THREE.Mesh[]
  private shadowMeshes: THREE.Mesh[]

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
  private gui: GUI;

  //renderer
  private size: { width: number; height: number };
  private aspectRatio: number;
  private fov: number;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbitControls: OrbitControls;
  private stats: Stats

  //event
  private currentScroll;


  private isUpdateMeshes: boolean
  private showAllMeshes: boolean

  private mouseMoved: boolean
  private originalData: THREE.Object3D | null
  private intersectsObject: THREE.Object3D | null
  private raycaster: THREE.Raycaster
  private pointer: THREE.Vector2
  private clickEvent


  private frame: number


  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.container = document.getElementById("container")
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock()

    this.images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10]
    this.textures = []
    this.mainMeshes = []
    this.shadowMeshes = [];

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

    // Events
    this.currentScroll = 0;
    this.isUpdateMeshes = true
    this.showAllMeshes = false

    //RayCaster
    this.mouseMoved = false
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    this.clickEvent = this.onClick.bind(this)

    this.frame = 0
  }

  public async init() {
    this.setDimension();
    // this.setGUI();
    this.setupRenderer();
    this.resize();
    await this.setTexture();
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


  //texture
  private async setTexture() {
    const loader = new THREE.TextureLoader()
    this.textures = this.images.map(image => loader.load(image));
  }


  //GUI
  private setGUI(): void {
    // this.gui = new GUI()
    // this.gui.add(this.settings, "mouseSize", 0.0, 1.0, 0.01).onChange((newVal: number) => {
    //   this.heightmapVariable.material.uniforms['mouseSize'].value = newVal
    // })
    // this.gui.add(this.settings, "viscosity", 0.9, 0.999, 0.001).onChange((newVal: number) => {
    //   this.heightmapVariable.material.uniforms['viscosityConstant'].value = newVal
    // })
    // this.gui.add(this.settings, "waveHeight", 0.1, 2.0, 0.05).onChange((newVal: number) => {
    //   this.heightmapVariable.material.uniforms['waveheightMultiplier'].value = newVal
    // })

    // this.gui.add(this.settings.light, "x", 0, 100, 0.01).onChange((value: number) => {
    //   this.compMat.uniforms.uLight.value.x = value
    // })

    // this.gui.add(this.settings.light, "y", 0, 100, 0.01).onChange((value: number) => {
    //   this.compMat.uniforms.uLight.value.y = value
    // })

    // this.gui.add(this.settings.light, "z", 0, 100, 0.01).onChange((value: number) => {
    //   this.compMat.uniforms.uLight.value.z = value
    // })

    // this.gui.add(this.settings, "intensity", 0, 5.0, 0.01).onChange((value: number) => {
    //   this.compMat.uniforms.uIntensity.value = value
    // })

    // this.gui.add(this.settings, "chromaticAberration", 0, 0.40, 0.01).onChange((value: number) => {
    //   this.caustics.material.uniforms.uChromaticAberration.value = value
    // })
    // this.gui.add(this.settings, "uFrequency", 0, 5.0, 0.01).onChange((value: number) => {
    //   this.settings.uFrequency = value
    // })
    // this.gui.add(this.settings, "uAmplitude", 0, 1.0, 0.01).onChange((value: number) => {
    //   this.settings.uAmplitude = value
    // })
    // this.gui.add(this.settings, "uSpeed", 0, 3.0, 0.01).onChange((value: number) => {
    //   this.settings.uSpeed = value
    // })

  }


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
    this.normRT = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    this.compRT = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
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
    const comGeo = new THREE.PlaneGeometry(2, 2);
    this.compMat = computeMaterial;
    this.compCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.compMesh = new THREE.Mesh(comGeo, this.compMat)
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
    const loader = new THREE.TextureLoader()
    const texture = loader.load(img)
    const floorGeo = new THREE.PlaneGeometry(2, 2);
    const floorMat = new THREE.ShaderMaterial({
      vertexShader: floorVert,
      fragmentShader: floorFrag,
      uniforms: {
        uTexture: { value: texture },
        uAspect: { value: new THREE.Vector2(this.aspectRatio, 1.0) }
      }
    })
    const floorMesh = new THREE.Mesh(floorGeo, floorMat)
    floorMesh.rotation.set(-Math.PI / 2, 0, 0)
    this.scene.add(this.caustics, floorMesh)


    // //mainMesh
    const mainGeo = new THREE.PlaneGeometry(0.5, 0.5, 100, 100);  //Main,Shadow Geometry
    const mainMat = new THREE.ShaderMaterial({  //Main Material
      vertexShader: mainVert,
      fragmentShader: mainFrag,
      uniforms: {
        uTexture: { value: null },
        uTime: { value: 0 },
        uTotalMeshes: { value: this.textures.length },
        uIndex: { value: 0 },
      },
      side: THREE.DoubleSide,
      transparent: true
    });

    const shadowMat = new THREE.ShaderMaterial({  //Shadow Material
      vertexShader: shadowVert,
      fragmentShader: shadowFrag,
      uniforms: {
        uTexture: { value: 0 }
      },
      transparent: true
    })

    for (let i = 0; i < this.images.length; i++) {
      const mainMesh = new THREE.Mesh(mainGeo, mainMat.clone());
      mainMesh.rotation.set(-Math.PI / 2, 0, 0);
      mainMesh.position.y = 0.2;

      mainMesh.material.uniforms.uTexture.value = this.textures[i];
      mainMesh.material.uniforms.uIndex.value = i;

      const shadowMesh = new THREE.Mesh(mainGeo, shadowMat.clone())
      shadowMesh.material.uniforms.uTexture.value = this.textures[i];
      shadowMesh.rotation.set(-Math.PI / 2, 0, 0);
      shadowMesh.position.y = 0.002;

      // this.scene.add(mainMesh, shadowMesh);
      this.mainMeshes.push(mainMesh);
      this.shadowMeshes.push(shadowMesh)
    }
  }


















  /* EVENT----------------------------------------------------- */


  //Pointer Event
  private onPointerMove(event: PointerEvent) {
    if (event.isPrimary === false) return
    // -1から1の値に正規化
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1
    this.mouseMoved = true

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


  // Click Event    カーソルの合ったmeshを選択し拡大 + 移動
  private onClick(event: MouseEvent) {
    if (!this.intersectsObject) { //Meshが既に選択されている場合実行しない
      if (this.mainMeshes) {
        const intersects = this.raycaster.intersectObjects(this.mainMeshes)
        if (intersects.length > 0) {  //カーソルが合っている場合実行
          this.isUpdateMeshes = false;
          document.removeEventListener("click", this.clickEvent)
          document.getElementById("detail")?.classList.add("open")

          this.intersectsObject = intersects[0].object  //選択したObjectを保存
          this.originalData = this.intersectsObject.clone() //元の位置を保存

          const distance = 1.0 / (2 * Math.tan((this.camera.fov / 2) * Math.PI / 180));
          //位置を変更
          this.intersectsObject.position.x = -0.25;
          this.intersectsObject.position.y = distance
          this.intersectsObject.position.z = 0;
          //サイズを変更
          this.intersectsObject.scale.x = 2;
          this.intersectsObject.scale.y = 2;
        }
      }
    }
    console.log("click!!")
  }



  //選択を解除    reactコンポーネントから呼び出し
  public restoredPos() {
    if (this.intersectsObject) {  //Meshが選択されていない場合実行しない

      if (!this.originalData) {
        return
      }
      //元の位置に戻す
      this.intersectsObject.position.x = this.originalData.position.x;
      this.intersectsObject.position.y = this.originalData.position.y;
      this.intersectsObject.position.z = this.originalData.position.z;
      //元の大きさに戻す
      this.intersectsObject.scale.x = this.originalData.scale.x;
      this.intersectsObject.scale.y = this.originalData.scale.y;

      this.intersectsObject = null;
      this.originalData = null;
      if (!this.showAllMeshes) this.isUpdateMeshes = true;
    }
    console.log("restored")
    setTimeout(() => {  //画面全体の適用されているonClickが誤って実行されるのを防ぐ
      document.addEventListener("click", this.clickEvent)
    }, 2100)
  }



  private setEvent() {
    document.addEventListener('pointermove', this.onPointerMove.bind(this))
    document.addEventListener('click', this.clickEvent)
  }



  //無限スクロール
  private updateMeshes() {
    const margin = .6;
    const wholeWidth = margin * this.mainMeshes.length;
    this.mainMeshes.forEach((mesh, index) => {
      const newPosition = (margin * index + this.currentScroll + 100000 * wholeWidth) % wholeWidth - (wholeWidth / 1 * margin);
      //スクロール方向を変える為,反転
      mesh.position.x = -newPosition
      this.shadowMeshes[index].position.x = -newPosition
    })
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

    this.currentScroll += 0.005;
    if (this.isUpdateMeshes) {
      this.updateMeshes()
    }

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


    this.renderer.setRenderTarget(null);
    const elapsedTime = this.clock.getElapsedTime()
    for (let i = 0; i < this.mainMeshes.length; i++) {
      (this.mainMeshes[i].material as THREE.ShaderMaterial).uniforms.uTime.value = elapsedTime;
    }


    this.renderer.render(this.scene, this.camera);

  }

}

