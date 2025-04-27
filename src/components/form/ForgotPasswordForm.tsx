"use client";

import { useState } from "react";
import { forgotPassword } from "@/action/user";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingModal from "../modal/LoadingModal";
import MessageModal from "../modal/MessageModal"; // メッセージモーダルをインポート

// バリデーションスキーマ
const schema = z.object({
  email: z.string().email({ message: "メールアドレスの形式ではありません" }),
});

// 入力データの型を定義
type InputType = z.infer<typeof schema>;

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // フォームの状態
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  // 送信処理
  const onSubmit: SubmitHandler<InputType> = async ({ email }) => {
    setIsLoading(true);

    try {
      // パスワード再設定メールを送信
      const res = await forgotPassword({ email });

      if (!res.success) {
        alert("パスワード再設定メールの送信に失敗しました");
        return;
      }

      setShowMessageModal(true); // メール送信成功時にメッセージモーダルを表示
    } catch (error) {
      alert("パスワード再設定メールの送信に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="cart-personal padding-y-120">
      <LoadingModal show={isLoading} /> {/* ローディング中はモーダル表示 */}
      <MessageModal
        show={showMessageModal}
        title="メールを送信しました"
        message="パスワード再設定用のメールを送信しました。メールのURLから手続きを進めてください。"
        onClose={() => setShowMessageModal(false)}
      />

      <div className="container container-two">
        <div className="row gy-5">
          <div className="col-lg-8 pe-sm-5">
            <div className="cart-personal__content">
              <h5 className="cart-personal__title mb-32">パスワードを忘れましたか？</h5>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label font-18 mb-2 fw-500 font-heading">
                    メールアドレス <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="common-input"
                    id="email"
                    {...register("email")}
                    placeholder="example@example.com"
                    required
                  />
                  {errors.email && <p className="text-danger">{errors.email.message}</p>}
                </div>

                <button type="submit" className="btn btn-main btn-md py-3 px-sm-5 px-4" disabled={isLoading}>
                  {isLoading ? "送信中..." : "パスワードリセットメールを送信"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordForm;

