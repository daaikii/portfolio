import * as THREE from "three"

import vertex from "../glsl/normalVert.glsl"
import fragment from "../glsl/normalFrag.glsl"

const normalMaterial = (aspect: number) => new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    time: { value: 0 },
    uFrequency: { value: 0 },
    uAmplitude: { value: 0 },
    uSpeed: { value: 0 },
    uAspect: { value: new THREE.Vector2(aspect, 1.0) },
  },
  side: THREE.DoubleSide,
})

export default normalMaterial;