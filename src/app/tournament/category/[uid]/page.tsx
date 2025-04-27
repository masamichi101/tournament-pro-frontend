
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

const page = async ({ params }: { params: { uid: string } }) => {
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

        <TournamentCategoryList uid={uid} user={user}/>

      </MasterLayout>

    </>
  );
};

export default page;
