import * as THREE from "three"

import vertex from "../glsl/causticsVert.glsl"
import fragment from "../glsl/causticsFrag.glsl"

import img from "/bathroom-blue-tiles-texture-background.jpg"

const loader = new THREE.TextureLoader()
const texture = loader.load(img)

const causticsMaterial = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTexture: { value: 0 },
    tileTexture: { value: texture },
    uChromaticAberration: { value: 0 },
    uAspect: { value: 0 }
  }
})

console.log(texture)

export default causticsMaterial