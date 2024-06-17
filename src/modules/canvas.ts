import * as THREE from "three";

import img1 from "/image1.jpg";
import img2 from "/image2.jpg";
import img3 from "/image3.jpg";
import img4 from "/image4.jpg";

import vertex from "../glsl/vertex.glsl";
import fragment from "../glsl/fragment.glsl";
import vertex2 from "../glsl/vertex2.glsl";
import fragment2 from "../glsl/fragment2.glsl";
import vertex3 from "../glsl/vertex3.glsl";
import fragment3 from "../glsl/fragment3.glsl";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default class Canvas {
  private static _instance: Canvas | null;
  private canvas: HTMLCanvasElement | null;
  private scene: THREE.Scene;

  private settings: {};
  private gui: GUI;

  private images: string[];
  private textures: THREE.Texture[]
  private meshes: THREE.Mesh[];

  private size: { width: number; height: number };
  private aspectRatio: number;
  private perspective: number;
  private fov: number;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbitControls: OrbitControls;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.images = [img1, img2, img3, img4];
    this.textures = [];
    this.meshes = [];

    this.setDimension();
    this.setTextures()
    this.setGUI();
    this.setupRenderer();
    this.resize();
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


  private setTextures(): void {
    const loader = new THREE.TextureLoader()
    for (let i = 0; i < this.images.length; i++) {
      const texture = loader.load(this.images[i]);
      this.textures.push(texture);
    }
  }


  private setGUI(): void {
    this.settings = {
      progress: 0
    }
    this.gui = new GUI()
    this.gui.add(this.settings, "progress", 0, 3, 0.01).onChange((value: number) => {
      for (let i = 0; i < this.meshes.length; i++) {
        if (!this.meshes[i].material) return
        this.meshes[i].material.uniforms.uProgress.value = value;
      }
    })
  }


  private setupRenderer(): void {
    this.perspective = 2;
    this.fov = 50;
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 0.1, 1000);
    this.camera.position.z = this.perspective;
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas!,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
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


  private createMesh(): void {
    for (let i = 0; i < this.images.length; i++) {
      const mesh = new FirstMesh(this.textures[i], i);
      this.scene.add(mesh.mesh)
      this.meshes.push(mesh.mesh);
    }
    const mesh2 = new SecondMesh(this.textures[1], Math.PI / 2);
    const mesh3 = new thirdMesh(this.textures[0], Math.PI);
    this.scene.add(mesh2.mesh, mesh3.mesh)
    this.meshes.push(mesh2.mesh, mesh3.mesh)
  }


  private animate(): void {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}








/*FirstMesh------------------------------------------------------------------------- */
class FirstMesh {
  private texture: THREE.Texture;
  private index: number;
  private geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, index: number) {
    this.texture = texture
    this.index = index
    this.createMesh();
  }

  private createMesh(): void {
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uIndex: { value: this.index }
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  public update(value: number): void {
    this.material.uniforms.uProgress.value = value;
  }
}






/*SecondMesh------------------------------------------------------------------ */
class SecondMesh {
  private texture: THREE.Texture;
  private angle: number;
  private geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, angle: number) {
    this.texture = texture;
    this.angle = angle;

    this.createMesh();
  }

  private createMesh(): void {
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex2,
      fragmentShader: fragment2,
      uniforms: {
        uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uAngle: { value: this.angle }
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  public update(value: number): void {
    this.material.uniforms.uProgress.value = value;
  }
}





/*SecondMesh------------------------------------------------------------------ */
class thirdMesh {
  private texture: THREE.Texture;
  private angle: number;
  private geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, angle: number) {
    this.texture = texture;
    this.angle = angle;

    this.createMesh();
  }

  private createMesh(): void {
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex3,
      fragmentShader: fragment3,
      uniforms: {
        uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uAngle: { value: this.angle }
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  public update(value: number): void {
    this.material.uniforms.uProgress.value = value;
  }
}