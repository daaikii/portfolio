import * as THREE from "three";
import gsap from "gsap";
// import GUI from "lil-gui";
// import { OrbitControls } from "three/examples/jsm/Addons.js";
// import Stats from "three/examples/jsm/libs/stats.module.js";
//modules
import Water from "./water";
import Cloud from "./cloud"
import Float from "./float"
import Portfolios from "./portfolio";
import computeMaterial from "./materials/computeMaterial";
import causticsMaterial from "./materials/causticsMaterial";
//shader
import floorVert from "../glsl/floor/vertex.glsl"
import floorFrag from "../glsl/floor/fragment.glsl"
//仮
import fv from "../glsl/finalVert.glsl"
import ff from "../glsl/finalFrag.glsl"
//floor image
import img from "/bathroom-blue-tiles-texture-background.jpg"




export default class Canvas {
  //base
  private static _instance: Canvas | null;
  private canvas: HTMLCanvasElement | null;
  private scene: THREE.Scene;
  private frame: number
  //renderer
  private size!: { width: number; height: number };
  private aspectRatio!: number;
  private fov!: number;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  // private orbitControls: OrbitControls;
  // private stats: Stats
  //texture
  private floorTexture: THREE.Texture;
  //RT
  private normRT!: THREE.WebGLRenderTarget;
  private compRT!: THREE.WebGLRenderTarget;
  //normRT
  private normCam!: THREE.PerspectiveCamera;
  //compRT
  private compMat!: THREE.ShaderMaterial;
  private compCam!: THREE.OrthographicCamera;
  private compMesh!: THREE.Mesh;
  //sourceRT
  private sourceRT!: THREE.WebGLRenderTarget;
  //Mesh
  private water!: Water
  private caustics!: THREE.Mesh;
  private portfolios!: Portfolios
  private cloud!: Cloud;
  private float!: Float;
  private floorMesh!: THREE.Mesh
  private finalMesh!: THREE.Mesh
  // private gui: GUI;
  //event
  private raycaster: THREE.Raycaster
  private pointer: THREE.Vector2
  public viewEntry!: (isEntry: boolean) => void
  //settings
  private settings: {
    light: THREE.Vector3,
    intensity: number,
    chromaticAberration: number,
    uFrequency: number,
    uAmplitude: number,
    uSpeed: number,
  };


  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.scene = new THREE.Scene()
    //Settings
    this.settings = {
      light: new THREE.Vector3(0, 1, 0),
      intensity: 0.5,
      chromaticAberration: 0.03,
      uFrequency: 0.5,
      uAmplitude: 0.27,
      uSpeed: 0.5,
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


  //GUI settings
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


  //base settings
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
    this.caustics && ((this.caustics.material as unknown as THREE.ShaderMaterial).uniforms.uAspect.value = new THREE.Vector2(this.aspectRatio, 1.0));
    this.floorMesh && ((this.floorMesh.material as unknown as THREE.ShaderMaterial).uniforms.uAspect.value = new THREE.Vector2(this.aspectRatio, 1.0));
  }


  private setFBO() {
    //FBO1  //下から見たnormalを取得する必要があるため
    this.normRT = new THREE.WebGLRenderTarget(this.size.width, this.size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    this.normCam = new THREE.PerspectiveCamera(50, this.aspectRatio, 0.01, 1000);  //caustics light
    this.ajustCamera(this.normCam)
    this.normCam.position.y = -1 * this.normCam.position.y;
    this.normCam.lookAt(0, 0, 0);

    //FBO2  
    this.compRT = new THREE.WebGLRenderTarget(this.size.width, this.size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    this.compCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.compCam.lookAt(0, 0, 0)
    const comGeo = new THREE.PlaneGeometry(2, 2);
    this.compMat = computeMaterial;
    this.compMesh = new THREE.Mesh(comGeo, this.compMat)

    //sourceRT
    this.sourceRT = new THREE.WebGLRenderTarget(this.size.width, this.size.height)
  }




  /* create meshes----------------------------------------------------------- */
  private createMesh(): void {
    //water
    this.water = new Water(this.renderer, this.aspectRatio)

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
    this.portfolios = new Portfolios()
    if (this.portfolios.mesh) this.scene.add(this.portfolios.mesh)
    this.viewEntry = this.portfolios.viewEntry.bind(this.portfolios)

    //finalMesh
    const finalGeo = new THREE.PlaneGeometry(2 * this.aspectRatio, 2)
    const finalMat = new THREE.ShaderMaterial({
      vertexShader: fv,
      fragmentShader: ff,
      uniforms: {
        iChannel0: { value: null },
        iChannel1: { value: null },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iFrame: { value: 1.0 },
        uProgress: { value: 0. },
      },
      transparent: true
    })
    this.finalMesh = new THREE.Mesh(finalGeo, finalMat)
    this.finalMesh.rotation.x = -Math.PI / 2

    //cloud Effect
    this.cloud = new Cloud(this.renderer, this.size)

    //float Effect
    this.float = new Float(this.renderer, this.size)
  }



  /* EVENT----------------------------------------------------- */
  //Pointer Event
  private onPointerMove(event: PointerEvent) {
    if (event.isPrimary === false) return
    // -1から1の値に正規化
    this.pointer.x = (event.clientX / this.size.width) * 2 - 1
    this.pointer.y = - (event.clientY / this.size.height) * 2 + 1

    this.raycaster.setFromCamera(this.pointer, this.camera)

    const intersects = this.raycaster.intersectObject(this.water.waterMesh)
    if (intersects.length > 0) {
      const point = intersects[0].point
      // point is in world coordinates
      this.water.heightmapVariable.material.uniforms['mousePos'].value.set(point.x, point.z)
    }
  }




  public scrollEvent() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - this.size.height;
    const scrollPercent = scrollTop / docHeight
    const cloudMat = this.cloud.mesh.material as unknown as THREE.ShaderMaterial
    cloudMat.uniforms.uProgress.value = scrollPercent
    this.compMat.uniforms.uProgress.value = scrollPercent
    this.water.heightmapVariable.material.uniforms.uProgress.value = scrollPercent;
  }

  private setEvent() {
    document.addEventListener('pointermove', this.onPointerMove.bind(this))
    document.addEventListener('scroll', this.scrollEvent.bind(this))
  }

  //ロード終了後に一つ波を発生させる。
  public pointCenter() {
    this.water.heightmapVariable.material.uniforms['mousePos'].value.set(0, 0)
  }

  //タイトルクリック時
  public titleClick(index: number) {
    const prog = (this.finalMesh.material as unknown as THREE.ShaderMaterial).uniforms.uProgress
    const pos = this.portfolios.mesh.position
    gsap.timeline()
      .to(prog, { value: 1.0, duration: 1. })
      .to(prog, { value: 0.0, duration: 1. });
    gsap.timeline()
      .to(pos, {
        x: -2,
        z: 0.2,
        duration: 0.3,
        onComplete: () => {
          pos.x = 2,
            pos.z = -0.2,
            this.portfolios.titleClick(index)
        }
      })
      .to(pos, { x: 0, z: 0, duration: 0.5 });
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

    //water effect
    this.water.animate()

    this.renderer.setRenderTarget(this.normRT);
    this.renderer.render(this.water.waterMesh, this.normCam);  //normalのテクスチャを作成

    // /*compute settings*/
    this.compMat.uniforms.uTexture.value = this.normRT.texture; //normalを渡す
    this.compMat.uniforms.uLight.value = this.settings.light;
    this.compMat.uniforms.uIntensity.value = this.settings.intensity;
    this.renderer.setRenderTarget(this.compRT)
    this.renderer.render(this.compMesh, this.compCam);  //normalから計算しデータをテクスチャとして取得

    //caustics settings
    (this.caustics.material as unknown as THREE.ShaderMaterial).uniforms.uTexture.value = this.compRT.texture;
    (this.caustics.material as unknown as THREE.ShaderMaterial).uniforms.uChromaticAberration.value = this.settings.chromaticAberration;

    //add cloud effect to the floor
    this.cloud.animate();
    (this.floorMesh.material as unknown as THREE.ShaderMaterial).uniforms.uCloud.value = this.cloud.renderTarget.texture;

    //multiple meshes into one mesh
    this.renderer.setRenderTarget(this.sourceRT)
    this.renderer.render(this.scene, this.camera);

    //float effect
    (this.finalMesh.material as unknown as THREE.ShaderMaterial).uniforms.iChannel1.value = this.sourceRT.texture;
    (this.finalMesh.material as unknown as THREE.ShaderMaterial).uniforms.iChannel0.value = this.float.fboA.texture;
    this.float.simMaterial.uniforms.iChannel1.value = this.sourceRT.texture
    this.float.animate()

    //result
    this.renderer.setRenderTarget(null);
    this.renderer.clear()
    this.renderer.render(this.finalMesh, this.camera)

    this.float.swapRT()
  }

}

