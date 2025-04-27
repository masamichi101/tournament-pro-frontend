import React from "react";
import Login from "@/components/Login";
import Progress from "@/components/Progress";
import { getAuthSession } from "lib/nextauth";
import { redirect } from "next/navigation"

export const metadata = {
  title: "Digital Market Place NEXT Js Template",
  description:
    "DpMarket – Digital Products Marketplace NEXT JS Template – A versatile and meticulously designed set of templates crafted to elevate your Digital Products Marketplace content and experiences.",
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
