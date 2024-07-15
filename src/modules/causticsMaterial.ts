import * as THREE from "three"

import vertex from "../glsl/causticsVert.glsl"
import fragment from "../glsl/causticsFrag.glsl"



const causticsMaterial = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTexture: { value: 0 },
    uChromaticAberration: { value: 0 },
    uAspect: { value: 0 },
  }
})


export default causticsMaterial