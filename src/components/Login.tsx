"use client";

import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import { signIn } from "next-auth/react";
import LoadingModal from "./modal/LoadingModal";
import toast from "react-hot-toast";

// 入力データの検証ルールを定義
const schema = z.object({
  email: z.string().email({ message: "メールアドレスの形式ではありません" }),
  password: z.string().min(8, { message: "8文字以上入力する必要があります" }),
})

// 入力データの型を定義
type InputType = z.infer<typeof schema>


const Login = () => {
  const [isLoading, setIsLoading] = useState(false)

  // フォームの状態
  const { register, handleSubmit, formState: { errors } } = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    setIsLoading(true)

    signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false, // リダイレクトを無効化
    })
      .then((result) => {
        if (result?.error) {
          // エラーがある場合、エラーメッセージを表示
          toast.error("ログインに失敗しました: " + result.error);
        } else {
          // トップページにリダイレクト
          window.location.href = "/"
        }
      })
      .catch((error) => {
        toast.error("ログイン中にエラーが発生しました: " + error.message);
      })
      .finally(() => {
        setIsLoading(false)
      })
  }


  return (
    <>
      <LoadingModal show={isLoading} /> {/* ログイン処理中はローディングモーダルを表示 */}
      {/* ================================== Account Page Start =========================== */}
      <section className="account d-flex justify-content-center">
        <div className="account__center  padding-y-120 flx-align">
          <div className="account-content">
            <Link scroll={false} href="/" className="logo mb-64 d-flex justify-content-center">
              <img
                src="/assets/images/logo/logo.png"
                alt=""
                className="white-version"
              />
            </Link>
            <h4 className="account-content__title mb-48 text-capitalize">
              ログインしてください
            </h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row gy-4">
                <div className="col-12">
                  <label
                    htmlFor="email"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    メールアドレス
                  </label>
                  <div className="position-relative">
                    <input
                      {...register("email")}
                      type="email"
                      className="common-input common-input--bg common-input--withIcon"
                      id="email"
                      placeholder="infoname@mail.com"
                    />
                    <span className="input-icon">
                      <img src="/assets/images/icons/envelope-icon.svg" alt="" />
                    </span>
                  </div>
                  {errors.email && <p className="text-danger">{errors.email.message}</p>}
                </div>
                <div className="col-12">
                  <label
                    htmlFor="your-password"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    パスワード
                  </label>
                  <div className="position-relative">
                    <input
                      {...register("password")}
                      type="password"
                      className="common-input common-input--bg common-input--withIcon"
                      id="your-password"
                      placeholder="6+ characters, 1 Capital letter"
                    />
                    <span
                      className="input-icon toggle-password cursor-pointer"
                      id="#your-password"
                    >
                      <img src="/assets/images/icons/lock-icon.svg" alt="" />
                    </span>
                  </div>
                  {errors.password && <p className="text-danger">{errors.password.message}</p>}
                </div>
                <div className="col-12">
                  <div className="flx-between gap-1">
                    <div className="common-check my-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="checkbox"
                        id="keepMe"
                      />
                      <label
                        className="form-check-label mb-0 fw-400 font-14 text-body"
                        htmlFor="keepMe"
                      >
                        Keep me signed in
                      </label>
                    </div>
                    <Link scroll={false}
                      href="setting/forgot-password"
                      className="forgot-password text-decoration-underline text-main text-poppins font-14"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-main btn-lg w-100 pill"
                  >
                    {" "}
                    ログイン
                  </button>
                </div>

                <div className="col-sm-12 mb-0">
                  <div className="have-account">
                    <p className="text font-14">
                      New to the market?{" "}
                      <Link scroll={false}
                        className="link text-main text-decoration-underline fw-500"
                        href="/register"
                      >
                        sign up
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      {/* ================================== Account Page End =========================== */}
    </>
  );
};

export default Login;
