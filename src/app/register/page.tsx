import { redirect } from "next/navigation"
import React from "react";
import Register from "@/components/Register";
import Progress from "@/components/Progress";
import { getAuthSession } from "lib/nextauth";

export const metadata = {
  title: "トーナメントPRO",
  description:
    "柔道のトーナメントを管理するためのアプリケーションです。",
};

const page = async() => {
  const user = await getAuthSession()

  if (user) {
    redirect("/")
  }
  return (
    <>
      {/* Progress */}
      <Progress />

      {/* Login */}
      <Register />
    </>
  );
};

export default page;
