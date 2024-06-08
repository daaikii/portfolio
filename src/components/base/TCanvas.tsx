import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import Plane from '../obj/Plane'

const TCanvas = () => {
  return (
    <Canvas >
      <Plane />
      <OrbitControls />
      <Stats />
    </Canvas>
  )
}

export default TCanvas