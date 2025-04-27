"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import React from "react";
import { temporarrySignup } from "@/action/user"


const schema = z.object({
  name: z.string().min(2, { message: "2文字以上入力する必要があります" }),
  email: z.string().email({ message: "メールアドレスの形式ではありません" }),
  password: z.string().min(8, { message: "8文字以上入力する必要があります" }),
})

type InputType = z.infer<typeof schema>

const Register = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージ用 state

  // 🔹 errorMessage が更新されたら alert を表示
  useEffect(() => {
    if (errorMessage) {
      alert(errorMessage);
    }
  }, [errorMessage]);



  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputType>({
    resolver: zodResolver(schema),
  });


  const onSubmit: SubmitHandler<InputType> = async (data) => {
    setIsLoading(true)

    try {
      // アカウント仮登録
      const res = await temporarrySignup({
        name: data.name,
        email: data.email,
        password: data.password,
        rePassword: data.password,
      })

      if (!res.success) {
        console.error("🚨 登録失敗:", res.error);

        if (typeof res.error === "string") {
          setErrorMessage(res.error);
        } else if (typeof res.error === "object") {
          setErrorMessage(
            Object.entries(res.error)
              .map(([key, messages]) => `${key}: ${messages}`)
              .join("\n")
          );
        } else {
          setErrorMessage("サインアップに失敗しました。");
        }
        return;
      }

      setIsSignUp(true);
    } catch (error) {
      console.error("サインアップに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* ================================== Account Page Start =========================== */}
      <section className="account d-flex justify-content-center">
        <div className="account__center  padding-y-120 flx-align">
          {isSignUp ? (
        <>
          <div className="text-2xl font-bold text-center mb-10">仮登録完了</div>
          <div className="">
            アカウント本登録に必要なメールを送信しました。
            <br />
            メールのURLより本登録画面へ進んでいただき、本登録を完了させてください。
            <br />
            ※メールが届かない場合、入力したメールアドレスが間違っている可能性があります。
            <br />
            お手数ですが、再度、新規登録からやり直してください。
          </div>
        </>
      ) : (

          <div className="account-content">
            <Link scroll={false} href="/" className="logo mb-64">
              <img
                src="/assets/images/logo/logo.png"
                alt=""
                className="white-version"
              />
            </Link>
            <h4 className="account-content__title mb-48 text-capitalize">
              Create A Free Account
            </h4>
            <form onSubmit={handleSubmit(onSubmit)} className="w-100">
              <div className="row gy-4">
                <div className="col-12">
                  <label
                    htmlFor="name"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Full Name
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="common-input common-input--bg common-input--withIcon"
                      id="name"
                      placeholder="Your full name"
                      {...register("name")}
                    />
                    {errors.name && <p className="text-danger">{errors.name.message}</p>}
                    <span className="input-icon">
                      <img src="/assets/images/icons/user-icon.svg" alt="" />
                    </span>
                  </div>
                </div>
                <div className="col-12">
                  <label
                    htmlFor="email"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Email
                  </label>
                  <div className="position-relative">
                    <input
                      type="email"
                      className="common-input common-input--bg common-input--withIcon"
                      id="email"
                      placeholder="infoname@mail.com"
                      {...register("email")}
                    />
                    {errors.email && <p className="text-danger">{errors.email.message}</p>}
                    <span className="input-icon">
                      <img src="/assets/images/icons/envelope-icon.svg" alt="" />
                    </span>
                  </div>
                </div>
                <div className="col-12">
                  <label
                    htmlFor="your-password"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Password
                  </label>
                  <div className="position-relative">
                    <input
                      type="password"
                      className="common-input common-input--bg common-input--withIcon"
                      id="your-password"
                      placeholder="6+ characters, 1 Capital letter"
                      {...register("password")}
                    />
                    {errors.password && <p className="text-danger">{errors.password.message}</p>}
                    <span
                      className="input-icon toggle-password cursor-pointer"
                      id="#your-password"
                    >
                      <img src="/assets/images/icons/lock-icon.svg" alt="" />
                    </span>
                  </div>
                </div>
                <div className="col-12">
                  <div className="common-check my-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="checkbox"
                      id="agree"
                    />
                    <label
                      className="form-check-label mb-0 fw-400 font-16 text-body"
                      htmlFor="agree"
                    >
                      I agree to the terms &amp; conditions
                    </label>
                  </div>
                </div>
                <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-main w-100"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing Up..." : "Create An Account"}
                </button>

                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-outline-light btn-lg-icon btn-lg w-100 pill"
                  >
                    <span className="icon icon-left">
                      <img src="/assets/images/icons/google.svg" alt="" />
                    </span>
                    Sign up with google
                  </button>
                </div>
                <div className="col-sm-12 mb-0">
                  <div className="have-account">
                    <p className="text font-14">
                      Already a member?{" "}
                      <Link scroll={false}
                        className="link text-main text-decoration-underline  fw-500"
                        href="/login"
                      >
                        Login
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
      )}
        </div>
      </section>
      {/* ================================== Account Page End =========================== */}
    </>
  );
};

export default Register;
