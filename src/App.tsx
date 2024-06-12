import { useEffect } from 'react'

import './App.css'
import Canvas from "./modules/canvas"

function App() {
  useEffect(() => {
    new Canvas()
  }, [])
  return (
    <canvas id="canvas" style={{ width: "100%", height: "100vh" }}></canvas>
  )
}

export default App
