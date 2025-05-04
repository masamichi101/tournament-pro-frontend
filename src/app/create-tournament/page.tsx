
import CreateStepLadder from "@/components/CreateStepLadder";
import Preloader from "@/helper/Preloader";
import MasterLayout from "@/layout/MasterLayout";
import { getAuthSession } from "lib/nextauth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "トーナメントPRO",
  description:
    "柔道のトーナメントを管理するためのアプリケーションです。",
};

const page = async() => {
  const user = await getAuthSession()

    if (!user) {
      redirect("/")
    }
  return (
    <>
      <MasterLayout user={user}>
        {/* Preloader */}
        <Preloader />

      {/* ProfileInner */}
      <CreateStepLadder user={user}/>

      </MasterLayout>

    </>
  );
};

export default page;
