
import TournamentCategoryList from "@/components/TournamentCategoryList";

import Preloader from "@/helper/Preloader";
import MasterLayout from "@/layout/MasterLayout";
import { getAuthSession } from "lib/nextauth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Digital Market Place NEXT Js Template",
  description:
    "DpMarket – Digital Products Marketplace NEXT JS Template – A versatile and meticulously designed set of templates crafted to elevate your Digital Products Marketplace content and experiences.",
};

interface PageProps {
  params: {
    uid: string; // 動的ルートの [uid] を受け取る
  };
}

const page = async({ params }: PageProps) => {
  const { uid } = params;

  const user = await getAuthSession();


      if (!user) {
        redirect("/login")
      }
  return (
    <>
      <MasterLayout user={user}>
        {/* Preloader */}
        <Preloader />

        {/* DashboardInner */}
        <TournamentCategoryList uid={uid} user={user}/>

      </MasterLayout>

    </>
  );
};

export default page;
