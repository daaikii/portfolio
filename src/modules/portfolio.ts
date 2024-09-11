import * as THREE from "three";

import simVert from "../glsl/main/simVert.glsl"
import simFrag from "../glsl/main/simFrag.glsl"
import vertex from "../glsl/main/vertex.glsl";
import fragment from "../glsl//main/fragment.glsl";

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
import gsap from "gsap";


type Size = { width: number, height: number };




export default class Portfolios {
  //base
  private renderer: THREE.WebGLRenderer;
  private size: Size;
  private camera: THREE.OrthographicCamera;
  //fbo
  private fboA: THREE.WebGLRenderTarget;
  private fboB: THREE.WebGLRenderTarget;
  //Obj
  private simMaterial: THREE.ShaderMaterial
  private fboMesh: THREE.Mesh;
  private material: THREE.ShaderMaterial
  public mesh: THREE.Mesh;
  //texture
  private images: string[]
  private textures: THREE.Texture[]

  constructor(renderer: THREE.WebGLRenderer, size: Size) {
    //base
    this.renderer = renderer;
    this.size = size;
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10]
    this.textures = []

    this.setTexture()
    this.createMesh()
  }


  //texture loading
  public async setTexture() {
    const loader = new THREE.TextureLoader()
    this.textures = this.images.map(image => loader.load(image));
  }

  private createMesh() {
    this.fboA = new THREE.WebGLRenderTarget(this.size.width, this.size.height);
    this.fboB = new THREE.WebGLRenderTarget(this.size.width, this.size.height);

    //FBOMesh
    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: simVert,
      fragmentShader: simFrag,
      uniforms: {
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iTime: { value: 0 },
        iTimeDelta: { value: 0 },
        iMouse: { value: new THREE.Vector3() },
        iChannel0: { value: this.fboA.texture },  // Previous frame texture
        iChannel1: { value: this.textures[0] },
        iFrame: { value: 0 }
      },
    });
    this.fboMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simMaterial);

    //mainMesh
    const geometry = new THREE.PlaneGeometry(1, 1, 100, 100);  //Main,Shadow Geometry
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        iChannel0: { value: null },
        iChannel1: { value: this.textures[0] },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iFrame: { value: 1.0 },
        uProgress: { value: 0. },
      },
      transparent: true
    })
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.rotation.set(-Math.PI / 2, 0, 0);
    this.mesh.position.y = -0.2;
  }


  public animate() {
    this.simMaterial.uniforms.iTime.value += 0.05;

    // Swap buffers and render to FBO
    this.renderer.setRenderTarget(this.fboB);
    this.renderer.render(this.fboMesh, this.camera);
    this.renderer.setRenderTarget(null);

    // Swap fboA and fboB for next frame
    const temp = this.fboA;
    this.fboA = this.fboB;
    this.fboB = temp;

    this.simMaterial.uniforms.iChannel0.value = this.fboA.texture;
    this.material.uniforms.iChannel0.value = this.fboA.texture;
  }


  public viewEntry(isEntry: boolean) {
    console.log(isEntry)
    if (isEntry) {
      gsap.to(this.mesh.position, {
        y: 0.2,
        duration: 0.1,
      })

    } else {
      gsap.to(this.mesh.position, {
        y: -0.2,
        duration: 0.1,
      })
    }
  }


  //タイトルを選んだ時
  public titleClick(index: number) {
    this.material.uniforms.iChannel1.value = this.textures[index];
    this.simMaterial.uniforms.iChannel1.value = this.textures[index];

    const prog = this.material.uniforms.uProgress
    gsap.timeline()
      .to(prog, { value: 1.0, duration: .5 })
      .to(prog, { value: 0.0, duration: .5 });
  }


  //メッシュ選択解除
  public toggleClick() {

  }


}