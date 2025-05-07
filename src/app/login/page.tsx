import React from "react";
import Login from "@/components/Login";
import Progress from "@/components/Progress";
import { getAuthSession } from "lib/nextauth";
import { redirect } from "next/navigation"

export const metadata = {
  title: "トーナメントPRO",
  description:
    "柔道のトーナメントを管理するためのアプリケーションです。",
};

const page = async() => {
  const user = await getAuthSession();

  if (user) {
    redirect("/");
  }
  return (
    <>
      {/* Progress */}
      <Progress />

      {/* Login */}
      <Login />
    </>
  );
};

export default page;
