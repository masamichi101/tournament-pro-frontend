
import MatchOrder from "@/components/MatchOrder";
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
  const user = await getAuthSession();

    if (!user) {
      redirect("/login");
    }

  return (
    <>
      <MasterLayout user={user}>
        {/* Preloader */}
        <Preloader />


        {/* DashboardFollowers */}
        <MatchOrder user={user}/>


      </MasterLayout>

    </>
  );
};

export default page;
