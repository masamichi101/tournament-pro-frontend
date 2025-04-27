import { redirect } from "next/navigation";

import Preloader from "@/helper/Preloader";
import MasterLayout from "@/layout/MasterLayout";
import { getAuthSession } from "lib/nextauth";
import TournamentList from "@/components/TournamentList";

export const metadata = {
  title: "トーナメント作成",
  description:
    "DpMarket – Digital Products Marketplace NEXT JS Template – A versatile and meticulously designed set of templates crafted to elevate your Digital Products Marketplace content and experiences.",
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
