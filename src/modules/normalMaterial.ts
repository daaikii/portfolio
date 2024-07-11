import { ShaderMaterial } from "three";

import vertex from "../glsl/normalVert.glsl"
import fragment from "../glsl/normalFrag.glsl"

const normalMaterial = new ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    time: { value: 0 },
    uFrequency: { value: 0 },
    uAmplitude: { value: 0 },
    uSpeed: { value: 0 },
  }
})

export default normalMaterial;