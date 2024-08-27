import { useEffect, useState } from 'react'

import './App.css'
import Canvas from "./modules/canvas"
import clsx from 'clsx';



function App() {
  const [canvas, setCanvas] = useState<Canvas>()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoading2, setIsLoading2] = useState<boolean>(true)

  useEffect(() => {
    const canvas = Canvas.instance
    setCanvas(canvas)

    canvas.init().then(() => {
      canvas.animate()
      setTimeout(() => {
        setIsLoading(false)
      }, 4000)
      setTimeout(() => {
        setIsLoading2(false)
        canvas.pointCenter()
        document.getElementById("header")?.classList.add("down")
        document.getElementById("main")?.classList.add("down")
      }, 5000)
    }).catch((error) => {
      console.error('Three.jsの初期化に失敗しました。', error)
    })
  }, [])

  return (
    <>

      {isLoading2 &&
        <>
          <div className={clsx("loading", `${isLoading ? "display" : "hidden"}`)}></div>
          <div className={clsx("drop", !isLoading2 && "hidden")}></div>
        </>
      }




      <div className={clsx("content",
        `${isLoading ? "hidden" : "display"}`)}
      >
        <canvas id="canvas" ></canvas >


        <header id="header">
          <h1>Portfolio</h1>
        </header>


        {!isLoading &&
          <div id='main'>
            <section id="description">
              <h2 className='section-title'>Description</h2>
              <p className='section-text'>This is <br /> Daiki Ikeda's <br /> Portfolio site.</p>
            </section>

            <section id='portfolios'>
            </section>

            <section id="skill">
              <h2 className="section-title">Skill</h2>
              <div className='categories'>
                <div className='category'>
                  <h3 className='category-title'>Technology</h3>
                  <p>HTML</p>
                  <p>CSS</p>
                  <p>JavaScript</p>
                  <p>glsl</p>
                </div>
                <div className='category'>
                  <h3 className='category-title'>Frameworks</h3>
                  <p>React</p>
                  <p>Next</p>
                  <p>react-three-fiber</p>
                </div>
                <div className='category'>
                  <h3 className='category-title'>Workflow</h3>
                  <p>Git</p>
                  <p>Docker</p>
                  <p>Vite</p>
                  <p>Webpack</p>
                </div>
              </div>
            </section>
          </div>
        }



        <div id="detail">
          <div
            className="detail-button"
            onClick={() => {
              canvas && canvas.restoredPos()
              document.getElementById("detail")?.classList.remove("open")
            }}
          >
            <span></span>
            <span></span>
          </div>
        </div>



      </div >
    </>
  )
}

export default App
