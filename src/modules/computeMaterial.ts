import { ShaderMaterial } from "three"

import vertex from "../glsl/computeVert.glsl"
import fragment from "../glsl/computeFrag.glsl"

const computeMaterial = new ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTexture: { value: 0 },
    uLight: { value: 0 },
    uIntensity: { value: 0 },
  }
})

export default computeMaterial