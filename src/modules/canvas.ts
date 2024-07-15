import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

import normalMaterial from "./normalMaterial";
import computeMaterial from "./computeMaterial";
import causticsMaterial from "./causticsMaterial";

import targetVert from "../glsl/targetVert.glsl"
import targetFrag from "../glsl/targetFrag.glsl"
import floorVert from "../glsl/floorVert.glsl"
import floorFrag from "../glsl/floorFrag.glsl"
import mainVert from "../glsl/mainVert.glsl"
import mainFrag from "../glsl/mainFrag.glsl"

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
  private scene: THREE.Scene;

  private scroll = 0;
  private scrollTarget = 0;
  private currentScroll = 0;

  private clock: THREE.Clock;

  //texture
  private images: string[]
  private textures: THREE.Texture[]

  //RT
  private normRT: THREE.WebGLRenderTarget;
  private compRT: THREE.WebGLRenderTarget;
  private shadowRT: THREE.WebGLRenderTarget;

  //FOB1
  private normMat: THREE.ShaderMaterial;
  private normCam: THREE.PerspectiveCamera;

  //FBO2
  private compMat: THREE.ShaderMaterial;
  private compCam: THREE.OrthographicCamera;
  private compMesh: THREE.Mesh;


  //exist Mesh
  private target: THREE.Mesh;
  private caustics: THREE.Mesh;
  private mainMeshes: THREE.Mesh[]

  private settings: {
    light: THREE.Vector3,
    intensity: number,
    chromaticAberration: number,
    uFrequency: number,
    uAmplitude: number,
    uSpeed: number,
  };
  private gui: GUI;

  //renderer
  private size: { width: number; height: number };
  private aspectRatio: number;
  private perspective: number;
  private fov: number;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbitControls: OrbitControls;
  private stats: Stats


  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock()
    this.images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10]
    this.textures = []
    this.mainMeshes = []
    this.scroll = 0;
    this.scrollTarget = 0;
    this.currentScroll = 0;

    this.setDimension();
    this.setGUI();
    this.setupRenderer();
    this.resize();
    this.setTexture();
    this.setFBO();
    this.setEvent();
    this.createMesh();
    this.animate();
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
    const aspect = window.innerWidth / window.innerHeight;
    const desiredHeight = 2; // Meshの高さ
    const distance = desiredHeight / (2 * Math.tan((camera.fov / 2) * Math.PI / 180));
    camera.position.set(0, distance, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }


  //texture
  private setTexture() {
    const loader = new THREE.TextureLoader()
    this.textures = this.images.map(image => loader.load(image));
  }


  //GUI
  private setGUI(): void {
    this.settings = {
      light: new THREE.Vector3(0, 1, 0),
      intensity: 0.45,
      chromaticAberration: 0.15,
      uFrequency: 0.76,
      uAmplitude: 0.27,
      uSpeed: 2.5,
    }
    this.gui = new GUI()

    this.gui.add(this.settings.light, "x", 0, 100, 0.01).onChange((value: number) => {
      this.compMat.uniforms.uLight.value.x = value
    })

    this.gui.add(this.settings.light, "y", 0, 100, 0.01).onChange((value: number) => {
      this.compMat.uniforms.uLight.value.y = value
    })

    this.gui.add(this.settings.light, "z", 0, 100, 0.01).onChange((value: number) => {
      this.compMat.uniforms.uLight.value.z = value
    })

    this.gui.add(this.settings, "intensity", 0, 5.0, 0.01).onChange((value: number) => {
      this.compMat.uniforms.uIntensity.value = value
    })

    this.gui.add(this.settings, "chromaticAberration", 0, 0.40, 0.01).onChange((value: number) => {
      this.caustics.material.uniforms.uChromaticAberration.value = value
    })
    this.gui.add(this.settings, "uFrequency", 0, 5.0, 0.01).onChange((value: number) => {
      this.settings.uFrequency = value
    })
    this.gui.add(this.settings, "uAmplitude", 0, 1.0, 0.01).onChange((value: number) => {
      this.settings.uAmplitude = value
    })
    this.gui.add(this.settings, "uSpeed", 0, 3.0, 0.01).onChange((value: number) => {
      this.settings.uSpeed = value
    })
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
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom);

    this.ajustCamera(this.camera)
    this.camera.position.z = 0.8;
    this.camera.lookAt(0, -1.8, -0.4)
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
    this.normMat = normalMaterial;
    this.normCam = new THREE.PerspectiveCamera(65, 1, 0.01, 1000);  //caustics light
    this.ajustCamera(this.normCam)
    this.normCam.position.y = -0.9 * this.normCam.position.y;
    this.normCam.lookAt(0, 0, 0);

    //FBO2
    const comGeo = new THREE.PlaneGeometry(2, 2);
    this.compMat = computeMaterial;
    this.compCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.compMesh = new THREE.Mesh(comGeo, this.compMat)
  }


  private createMesh(): void {
    //targetMesh
    const targetGeo = new THREE.PlaneGeometry(2, 2, 256, 256);
    // const targetGeo = new THREE.SphereGeometry(3, 256, 256);
    // const targetGeo = new THREE.TorusKnotGeometry(4, 0.8, 600, 16,);
    const targetMat = new THREE.ShaderMaterial({
      vertexShader: targetVert,
      fragmentShader: targetFrag,
      uniforms: {
        time: { value: 0 },
        uFrequency: { value: 0 },
        uAmplitude: { value: 0 },
        uSpeed: { value: 0 },
        uLight: { value: this.settings.light },
        uAspect: { value: new THREE.Vector2(this.aspectRatio, 1.0) }
      },
      transparent: true
    });
    this.target = new THREE.Mesh(targetGeo, targetMat);
    this.target.rotation.set(-Math.PI / 2, 0, 0);

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

    this.scene.add(this.target, this.caustics, floorMesh)


    // //mainMesh
    const mainMat = new THREE.ShaderMaterial({
      vertexShader: mainVert,
      fragmentShader: mainFrag,
      uniforms: {
        uTexture: { value: null },
        uCaustics: { value: null }
      },
    });
    const MAX_MESH_LENGTH = this.images.length;
    this.shadowScene = new THREE.Scene()
    for (let i = 0; i < MAX_MESH_LENGTH; i++) {
      const mainGeo = new THREE.PlaneGeometry(1, 1);
      const mainMesh = new THREE.Mesh(mainGeo, mainMat.clone());
      mainMesh.rotation.set(-Math.PI / 2, 0, 0);
      mainMesh.material.uniforms.uTexture.value = this.textures[i];
      mainMesh.material.uniforms.uCaustics.value = this.compRT.texture
      this.shadowScene.add(mainMesh)
      mainMesh.position.y = 0.2;
      this.scene.add(mainMesh);
      this.mainMeshes.push(mainMesh);
    }
  }


  // user events
  private setEvent() {
    this.scroll = 0;
    document.addEventListener("wheel", (e: WheelEvent) => {
      this.scrollTarget = e.deltaY * 0.3;
    })
  }
  private updateMeshes() {
    const margin = 1.2;
    const wholeWidth = margin * this.mainMeshes.length;
    this.mainMeshes.forEach((mesh, index) => {
      const newPosition = (margin * index + this.currentScroll + 10000 * wholeWidth) % wholeWidth - (wholeWidth / 2 * margin);
      mesh.position.x = newPosition
    })
  }

  //ANIMATION
  private animate(): void {
    this.stats.begin()

    this.scroll += (this.scrollTarget - this.scroll) * 0.1;
    this.scroll *= 0.9;
    this.scrollTarget *= 0.9;
    this.currentScroll += this.scroll * 0.01;
    this.updateMeshes()

    const originalMat = this.target.material //materialを一時的に保存

    /*normalRT settings---------------------------------------------------*/
    this.target.material = this.normMat  //normalを取得
    this.target.material.uniforms.time.value = this.clock.getElapsedTime();
    this.target.material.uniforms.uFrequency.value = this.settings.uFrequency;
    this.target.material.uniforms.uAmplitude.value = this.settings.uAmplitude;
    this.target.material.uniforms.uSpeed.value = this.settings.uSpeed;
    this.renderer.setRenderTarget(this.normRT);
    this.renderer.render(this.target, this.normCam);  //normalのテクスチャを作成

    /*targetMesh settings---------------------------------------------------*/
    this.target.material = originalMat //元のmaterialに戻す
    // this.target.material.uniforms.time.value = this.clock.getElapsedTime();
    // this.target.material.uniforms.uFrequency.value = this.settings.uFrequency;
    // this.target.material.uniforms.uAmplitude.value = this.settings.uAmplitude;
    // this.target.material.uniforms.uSpeed.value = this.settings.uSpeed;

    /*compRT settings---------------------------------------------------*/
    this.compMat.uniforms.uTexture.value = this.normRT.texture; //normalを渡す
    this.compMat.uniforms.uLight.value = this.settings.light; //normalを渡す
    this.compMat.uniforms.uIntensity.value = this.settings.intensity; //normalを渡す
    this.renderer.setRenderTarget(this.compRT)
    this.renderer.render(this.compMesh, this.compCam);  //normalから計算しデータをテクスチャとして取得


    /*caustics render settings---------------------------------------------------*/
    this.caustics.material.uniforms.uTexture.value = this.compRT.texture;
    this.caustics.material.uniforms.uChromaticAberration.value = this.settings.chromaticAberration;


    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
    this.stats.end()
    requestAnimationFrame(this.animate.bind(this));
  }
}

