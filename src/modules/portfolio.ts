import * as THREE from "three";

import vertex from "../glsl/portfolio/vertex.glsl";
import fragment from "../glsl//portfolio/fragment.glsl";

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




export default class Portfolios {
  //base
  private material!: THREE.ShaderMaterial
  public mesh!: THREE.Mesh;
  //texture
  private images: string[]
  private textures: THREE.Texture[]

  constructor() {
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
    //mainMesh
    const geometry = new THREE.PlaneGeometry(1, 1, 100, 100);  //Main,Shadow Geometry
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTexture: { value: this.textures[0] },
        uProgress: { value: 0.0 },
      },
      transparent: true
    })
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.rotation.set(-Math.PI / 2, 0, 0);
    this.mesh.position.y = -0.2;
  }



  public viewEntry(isEntry: boolean) {
    if (isEntry) {
      gsap.to(this.mesh.position, {
        y: 0.2,
        z: 0,
        duration: 0.1,
      })
    } else {
      gsap.to(this.mesh.position, {
        y: -0.2,
        z: 4,
        duration: 0.1,
      })
    }
  }


  //タイトルを選んだ時
  public titleClick(index: number) {
    this.material.uniforms.uTexture.value = this.textures[index];
  }


}