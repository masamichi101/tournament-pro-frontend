"use client";

import { useState } from "react";

import { updatePassword } from "@/action/user";
import { UserType } from "lib/nextauth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingModal from "../modal/LoadingModal";



interface PropsType {
  user: UserType;
}



const ChangePasswordForm = ({ user }: PropsType) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== reNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { success } = await updatePassword({
        accessToken: user.accessToken,
        currentPassword,
        newPassword,
        reNewPassword,
      });

      if (success) {
        alert("Password updated successfully. Redirecting to login...");

        // サインアウトしてログインページへリダイレクト
        await signOut({ redirect: true, callbackUrl: "/login" });
      } else {
        setErrorMessage("An error occurred.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsLoading(false); // ローディング終了
    }

  };

  return (
    <section className="cart-personal padding-y-120">
      <LoadingModal show={isLoading} />
      <div className="container container-two">
        <div className="row gy-5">
          <div className="col-lg-8 pe-sm-5">
            <div className="cart-personal__content">
              <h5 className="cart-personal__title mb-32">Change Password</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="form-label font-18 mb-2 fw-500 font-heading">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="common-input"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="form-label font-18 mb-2 fw-500 font-heading">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="common-input"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="reNewPassword" className="form-label font-18 mb-2 fw-500 font-heading">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="common-input"
                    id="reNewPassword"
                    value={reNewPassword}
                    onChange={(e) => setReNewPassword(e.target.value)}
                    required
                  />
                </div>
                {successMessage && <p className="text-success">{successMessage}</p>}
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                <button type="submit" className="btn btn-main btn-md py-3 px-sm-5 px-4">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChangePasswordForm;


