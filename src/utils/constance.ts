type Properties = {
  title: string,
  source?: {
    links: {
      siteTitle: string
      url: string,
    }[],
    originalTec?: string
  },
  purpose: string,
  technology: string,
  library: string,
}

export const titles: { [key: string]: Properties } = {
  "0": {
    title: "OscarPico_clone",
    source: {
      links: [
        { siteTitle: "OscarPico", url: "https://www.oscarpico.es" }
      ],
      originalTec: "画像の変更時に現在の画像をモザイク状に変換し次の画像を表示するようにする",
    },
    purpose: "メッシュの動作、カメラの設定、shaderでの制御のやり方を覚えるために作成しました。",
    technology: "モザイクエフェクト、shaderChunkを使用した全shaderで使用する関数・変数の一括管理、画像の切り替え範囲をshaderで管理",
    library: "react、threejs、glsl、vite",
  },


  "1": {
    title: "mucap50th_clone",
    source: {
      links: [
        { siteTitle: "三菱UFJキャピタル50周年サイト", url: "https://www.mucap.co.jp/50th" }
      ],
      originalTec: "数字をうごかして表示する、ブラーエフェクト",
    },
    purpose: "複数のメッシュにランダムなテクスチャを割り当てる方法を覚えるために作成しました",
    technology: "慣性スクロール、gsapでのアニメーション、ノイズを使用したランダムなアイコンのスケール、alphaMap、postprocess+ピンポンループ、raycaster",
    library: "typescript、react、threejs、glsl、react-three-fiber、vite",
  },


  "2": {
    title: "fractal_image_slider",
    purpose: "cssの復習のため作成しました",
    technology: "webgl、_を使用したBEMのような命名規則、変数を使用した一括管理、レスポンシブ対応",
    library: "typescript、react、threejs、glsl、gsap、vite",
  },


  "3": {
    title: "matching_app",
    purpose: "nextjs、prisma、dockerで正常に動作するアプリの勉強の為に作成しました。",
    technology: "next-authでの認証、prisma+postgresql(supabaseまたはローカル)でのデータ管理、server-actionでのデータ操作、googleMapAPI、zodを使用してタイプセーフなデータ操作、DTOを作成して安全データを受け取る、dockerを使用した開発",
    library: "typescript、nextjs、react、zustand、aws-sdk、prisma、next-auth、react-hook-form、zod、bcrypt、tailwindcss",
  },
  "4": {
    title: "portfolio",
    source: {
      links: [
        { siteTitle: "caustics", url: "https://blog.maximeheckel.com/posts/caustics-in-webgl/" },
        { siteTitle: "float", url: "https://www.shadertoy.com/view/dslGW8" }
      ],
      originalTec: "",
    },
    purpose: "",
    technology: "GPGPU、postprocess、shadertoyのコードを反映",
    library: "typescript、react、threejs",
  },
}
