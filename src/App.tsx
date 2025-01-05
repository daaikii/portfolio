import { useEffect, useState, useRef } from 'react'
import clsx from 'clsx';

import Canvas from "./modules/canvas"
import { titles } from './utils/constance';
import './App.css'



function App() {
  const [canvas, setCanvas] = useState<Canvas>()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoading2, setIsLoading2] = useState<boolean>(true)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [currentNum, setCurrentNum] = useState<number>(0)
  const mainMeshRef = useRef(null)


  useEffect(() => {
    const canvas = Canvas.instance
    setCanvas(canvas)

    const observer = new IntersectionObserver(
      ([entry]) => {
        canvas.viewEntry(entry.isIntersecting)
        if (!entry.isIntersecting) {
          setIsOpen(false)
        } else {
          setIsOpen(true)
        }
      },
      { threshold: 1.0 }
    )

    canvas.init()
      .then(() => {
        canvas.animate()
        setTimeout(() => {
          setIsLoading(false)
        }, 4000)
        setTimeout(() => {
          setIsLoading2(false)
          canvas.pointCenter()
          document.getElementById("header")?.classList.add("down")
          document.getElementById("main")?.classList.add("down")

          //mainMeshRefを対象に処理を実行する
          if (mainMeshRef.current) observer.observe(mainMeshRef.current)
        }, 5000)
      })
      .catch((error) => {
        console.error('予期せぬエラーが発生しました', error)
      })

    return () => { if (mainMeshRef.current) observer.unobserve(mainMeshRef.current) }
  }, [])

  const titleClick = (index: number) => {
    if (currentNum !== index) {
      setCurrentNum(index)
      canvas?.titleClick(index)
      setIsOpen(true);
    }
  }


  return (
    <>

      {isLoading2 &&
        <>
          <div className={clsx("loading", `${isLoading ? "display" : "hidden"}`)}></div>
          <div className={clsx("drop", !isLoading2 && "hidden")}></div>
        </>
      }


      <div className={clsx("container", `${isLoading ? "hidden" : "display"}`)} >
        <canvas id="canvas"></canvas >
        <header id="header"><h1 className="header-title">Portfolio</h1></header>
        {!isLoading &&
          <div id='main'>

            {/* section description */}
            <section id="description" className='section'>
              <h2 className='section-title'>Description</h2>
              <p className='desc-text'>Daiki Ikeda<br /><span> - Portfolio</span></p>
            </section>

            {/* section portfolios */}
            <section id='portfolios' className='section'>
              <h2 className='section-title'>Portfolios</h2>
              <ul ref={mainMeshRef}>
                {Object.keys(titles).map((_, index) => {
                  return (
                    <li key={index}
                      className={
                        clsx("portfolio-title", currentNum === index && "portfolio-title__current")
                      }
                      onClick={() => titleClick(index)}
                    >
                      {titles[index].title}
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* section skill */}
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
                  <p>Nextjs</p>
                  <p>React-three-fiber</p>
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


        {/* portfolio detail */}
        <div id="detail" className={`${isOpen ? "open" : ""}`}>
          <div className="detail-button"
            onClick={() => setIsOpen(false)}
          >
            <span></span>
            <span></span>
          </div>

          <div className="detail-content">
            <div>
              <h3>リポジトリー</h3>
              <a href={titles[currentNum].repository} target='_blank' rel="noopener noreferrer">{titles[currentNum].repository}</a>
            </div>

            {titles[currentNum].siteLink &&
              <div>
                <h3>サイトタイトル</h3>
                <a href={titles[currentNum].siteLink} target='_blank' rel="noopener noreferrer">{titles[currentNum].title}</a>
              </div>
            }
            {
              titles[currentNum].source && (
                <>
                  <div>
                    <h3>参考にしたサイト</h3>
                    {titles[currentNum].source && titles[currentNum].source?.links.map((link, index) =>
                      <a key={index} href={link.url} target='_blank' rel="noopener noreferrer">{link.siteTitle}</a>
                    )}
                  </div>
                  <div>
                    <h3>オリジナルの要素</h3>
                    <p>{titles[currentNum].source && titles[currentNum].source?.originalTec}</p>
                  </div>
                </>
              )
            }
            <div>
              <h3>制作に至った経緯</h3>
              <p>{titles[currentNum].purpose}</p>
            </div>
            <div>
              <h3>使用技術の概要</h3>
              <p>{titles[currentNum].technology}</p>
            </div>
            <div>
              <h3>使用ライブラリ</h3>
              <p>{titles[currentNum].library}</p>
            </div>

          </div>

        </div>


      </div >
    </>
  )
}

export default App