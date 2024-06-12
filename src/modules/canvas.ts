import * as THREE from "three";

import img1 from "/coffee-791439_960_720.jpg";
import img2 from "/man-8081871_1280.jpg";

import vertex from "../glsl/planeVertex.glsl";
import fragment from "../glsl/planeFragment.glsl";

export default class Canvas {
  private canvas: HTMLCanvasElement | null;
  private scene: THREE.Scene;
  private textureLoader: THREE.TextureLoader;
  private images: string[];
  private meshes: MeshItem[];
  private size: { width: number; height: number };
  private aspectRatio: number;
  private perspective: number;
  private fov: number;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.textureLoader = new THREE.TextureLoader();
    this.images = [img1, img2];
    this.meshes = [];

    this.setDimension();
    this.setupRenderer();
    this.resize();
    this.createMesh();
    this.animate();
  }

  private setDimension(): void {
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.aspectRatio = this.size.width / this.size.height;
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
      const texture = this.textureLoader.load(this.images[i]);
      const mesh = new MeshItem(texture, this.scene);
      this.meshes.push(mesh);
    }
  }

  private animate(): void {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}

class MeshItem {
  private scene: THREE.Scene;
  private texture: THREE.Texture;
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, scene: THREE.Scene) {
    this.scene = scene;
    this.texture = texture;
    this.texture.center.set(0.5, 0.5);

    this.createMesh();
  }

  private createMesh(): void {
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTexture: { value: this.texture },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
}
