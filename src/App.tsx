import { useEffect, useState, useRef } from 'react'
import clsx from 'clsx';

import Canvas from "./modules/canvas"
import './App.css'



function App() {
  const [canvas, setCanvas] = useState<Canvas>()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoading2, setIsLoading2] = useState<boolean>(true)
  const mainMeshRef = useRef(null)


  useEffect(() => {
    const canvas = Canvas.instance
    setCanvas(canvas)

    const observer = new IntersectionObserver(
      ([entry]) => {
        canvas.viewEntry(entry.isIntersecting)
      },
      { threshold: 1.0 }
    )

    canvas.init()
      .then(() => {
        canvas.animate()
        setTimeout(() => {
          setIsLoading(false)
          // }, 1)
        }, 4000)
        setTimeout(() => {
          setIsLoading2(false)
          canvas.pointCenter()
          document.getElementById("header")?.classList.add("down")
          document.getElementById("main")?.classList.add("down")

          //ビューポートに入ると表示
          if (mainMeshRef.current) observer.observe(mainMeshRef.current)
          // }, 1)
        }, 5000)
      })
      .catch((error) => {
        console.error('予期せぬエラーが発生しました', error)
      })

    return () => { if (mainMeshRef.current) observer.unobserve(mainMeshRef.current) }
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
        <canvas id="canvas"></canvas >


        <header id="header"><h1 className="header-title">Portfolio</h1></header>


        {!isLoading &&
          <div id='main'>
            <section id="description" className='section'>
              <h2 className='section-title'>Description</h2>
              <p className='desc-text'>This is <br /> Daiki Ikeda's <br /> Portfolio site.</p>
            </section>

            <section id='portfolios' className='section'>
              <h2 className='section-title'>Portfolios</h2>
              <div className="">
                <ul>
                  <li onClick={() => canvas?.titleClick(1)}>Title</li>
                  <li onClick={() => canvas?.titleClick(2)}>Title</li>
                  <li onClick={() => canvas?.titleClick(3)}>Title</li>
                  <li onClick={() => canvas?.titleClick(4)}>Title</li>
                  <li onClick={() => canvas?.titleClick(5)}>Title</li>
                  <li onClick={() => canvas?.titleClick(6)}>Title</li>
                </ul>
                <div ref={mainMeshRef}>これ</div>
              </div>
            </section>

            <section id="skill" className='section'>
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
              canvas && canvas.toggleClick()
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
