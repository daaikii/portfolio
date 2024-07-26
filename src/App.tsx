import { useEffect, useState } from 'react'
import { TbExchange } from "react-icons/tb";
import { FaGithub } from "react-icons/fa";

import './App.css'
import Canvas from "./modules/canvas"

function App() {
  const [canvas, setCanvas] = useState<Canvas>()
  const [isShow, setIsShow] = useState<boolean>(false)
  const [disable, setDisable] = useState<boolean>(false)
  useEffect(() => {
    const canvas = Canvas.instance
    setCanvas(canvas)
    return () => { }
  }, [])
  return (
    <>
      <canvas id="canvas" ></canvas >
      <div className="container">
        <header>
          <h1>Portfolio</h1>
          <nav>
            <ul>
              <li>
                <button
                  disabled={disable}
                  onClick={() => {
                    if (isShow) {
                      setDisable(true)
                      canvas && canvas.removePos()
                      setIsShow(false)
                      setTimeout(() => {
                        setDisable(false)
                      }, 1100)
                    } else {
                      setDisable(true)
                      canvas && canvas.showAll()
                      setIsShow(true)
                      setTimeout(() => {
                        setDisable(false)
                      }, 1100)
                    }
                  }}
                >
                  <TbExchange size={"2rem"} />
                </button>
              </li>
              <li><a href='https://github.com/daaikii/portfolio.git'><FaGithub size={"2rem"} /></a></li>
            </ul>
          </nav>
        </header>
      </div >
    </>
  )
}

export default App
