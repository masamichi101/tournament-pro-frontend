import { redirect } from "next/navigation";

import Preloader from "@/helper/Preloader";
import MasterLayout from "@/layout/MasterLayout";
import { getAuthSession } from "lib/nextauth";
import TournamentList from "@/components/TournamentList";

export const metadata = {
  title: "トーナメントPRO",
  description:
    "柔道のトーナメントを管理するためのアプリケーションです。",
};

const page = async() => {
  const user = await getAuthSession()
  if (!user) {
    redirect("/login");  // ✅ 認証されていない場合 /login にリダイレクト
  }

  return (
    <>
      <MasterLayout user={user}>
        {/* Preloader */}
        <Preloader />

        {/* DashboardInner */}
        <TournamentList user={user}/>

      </MasterLayout>

    </>
  );
};

export default page;
