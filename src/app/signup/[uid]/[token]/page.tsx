import { redirect } from "next/navigation"

import Link from "next/link"
import { getAuthSession } from "lib/nextauth"
import { completeSignup } from "@/action/user"
export const metadata = {
  title: "トーナメントPRO",
  description:
    "柔道のトーナメントを管理するためのアプリケーションです。",
};

interface CompleteSignupPageProps {
  params: {
    uid: string
    token: string
  }
}

// アカウント本登録ページ
const CompleteSignupPage = async ({ params }: CompleteSignupPageProps) => {
  const { uid, token } = params

  // 認証情報取得
  const user = await getAuthSession()

  if (user) {
    redirect("/")
  }

  // アカウント本登録
  const res = await completeSignup({ uid, token })

  if (res.success) {
    return (
      <div className="max-w-[400px] m-auto text-center">
        <div className="text-2xl font-bold mb-10">本登録完了</div>
        <div>アカウント本登録が完了しました</div>
        <div className="mb-5">ログインしてください</div>
        <button className="font-bold">
          <Link href="/login">ログイン</Link>
        </button>
      </div>
    )
  } else {
    return (
      <div className="max-w-[400px] m-auto text-center">
        <div className="text-2xl font-bold mb-10">本登録失敗</div>
        <div>アカウント本登録に失敗しました</div>
        <div className="mb-5">再度アカウント仮登録を行ってください</div>
        <button className="font-bold">
          <Link href="/register">新規登録</Link>
        </button>
      </div>
    )
  }
}

export default CompleteSignupPage