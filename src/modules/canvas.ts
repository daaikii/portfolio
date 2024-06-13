import * as THREE from "three";

import img1 from "/image1.jpg";
import img2 from "/image2.jpg";
import img3 from "/image3.jpg";
import img4 from "/image4.jpg";

import vertex from "../glsl/planeVertex.glsl";
import fragment from "../glsl/planeFragment.glsl";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default class Canvas {
  private canvas: HTMLCanvasElement | null;
  private scene: THREE.Scene;
  private textureLoader: THREE.TextureLoader;
  private images: string[];
  private textures: THREE.Texture[];
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
    this.images = [img1, img2, img3, img4];
    this.textures = [];
    this.meshes = [];

    this.setDimension();
    this.setTexture();
    this.setGUI();
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

  private setTexture() {
    for (let i = 0; i < this.images.length; i++) {
      const texture = this.textureLoader.load(this.images[i])
      this.textures.push(texture)
    }
  }

  private setGUI(): void {
    this.settings = {
      progress: 0
    }
    this.gui = new GUI()
    this.gui.add(this.settings, "progress", 0, 1, 0.01).onChange((value: number) => {
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
      const mesh = new MeshItem(this.textures, this.scene, i);
      this.meshes.push(mesh);
    }
  }

  private animate(): void {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}

class MeshItem {
  private textures: THREE.Texture[];
  private scene: THREE.Scene;
  private index: number;
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(textures: THREE.Texture[], scene: THREE.Scene, index: number) {
    this.textures = textures;
    this.scene = scene;
    this.index = index;

    this.createMesh();
  }

  private createMesh(): void {
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTexture: { value: this.textures[this.index] },
        uProgress: { value: 0 },
        uIndex: { value: this.index }
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
}