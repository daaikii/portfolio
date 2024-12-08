import * as THREE from "three";

import simVert from "../glsl/float/simVert.glsl";
import simFrag from "../glsl/float/simFrag.glsl";


type Size = { width: number, height: number };


export default class Float {

  //base
  private renderer: THREE.WebGLRenderer;
  private size: Size;
  private camera: THREE.OrthographicCamera;
  //Obj
  private fboQuad: THREE.Mesh;
  public simMaterial: THREE.ShaderMaterial
  //FBO
  public fboA: THREE.WebGLRenderTarget;
  public fboB: THREE.WebGLRenderTarget;


  constructor(renderer: THREE.WebGLRenderer, size: Size) {
    //base
    this.renderer = renderer;
    this.size = size;
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    //fbo
    this.fboA = new THREE.WebGLRenderTarget(this.size.width, this.size.height);
    this.fboB = new THREE.WebGLRenderTarget(this.size.width, this.size.height);

    //fbo Mesh
    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: simVert,
      fragmentShader: simFrag,
      uniforms: {
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iTime: { value: 0 },
        iTimeDelta: { value: 0 },
        iMouse: { value: new THREE.Vector3() },
        iChannel0: { value: this.fboA.texture },  // Previous frame texture
        iChannel1: { value: null },
        iFrame: { value: 0 }
      },
    });
    this.fboQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simMaterial);
  }


  public animate() {
    this.simMaterial.uniforms.iTime.value += 0.05;

    this.simMaterial.uniforms.iChannel0.value = this.fboA.texture;

    this.renderer.setRenderTarget(this.fboB);
    this.renderer.render(this.fboQuad, this.camera);
  }


  public swapRT() {
    const temp = this.fboA;
    this.fboA = this.fboB;
    this.fboB = temp;
  }


}



