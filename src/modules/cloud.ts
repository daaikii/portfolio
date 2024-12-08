import * as THREE from "three";

import vertex from "../glsl/cloud/vertex.glsl";
import fragment from "../glsl//cloud/fragment.glsl";


type Size = { width: number, height: number };


export default class Cloud {

  //base
  private renderer: THREE.WebGLRenderer;
  private size: Size;
  private camera: THREE.OrthographicCamera;
  //Obj
  public mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial
  //FBO
  public renderTarget: THREE.WebGLRenderTarget;


  constructor(renderer: THREE.WebGLRenderer, size: Size) {
    //base
    this.renderer = renderer;
    this.size = size;
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    //rt
    this.renderTarget = new THREE.WebGLRenderTarget(this.size.width, this.size.height);

    //final result
    const geometry = new THREE.PlaneGeometry(2, 2)
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iTime: { value: 1.0 },
        uProgress: { value: 0.0 }
      },
      transparent: true
    })
    this.mesh = new THREE.Mesh(geometry, this.material)
  }




  public animate() {
    this.material.uniforms.iTime.value += 0.01;

    // Swap buffers and render to FBO
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.mesh, this.camera);
  }


}



