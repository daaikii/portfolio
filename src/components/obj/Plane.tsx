
import vertex from "../../glsl/planeVertex.glsl"
import fragment from "../../glsl/planeFragment.glsl"

const Plane = () => {

  return (
    <mesh >
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        attach="material"
        args={[
          {
            vertexShader: vertex,
            fragmentShader: fragment,
          }
        ]}
      />
    </mesh>
  )
}


export default Plane;