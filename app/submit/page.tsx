/**
 * The dashboard should provides an easy onboarding experience for new users and
 * an easy way to navigate different f4rmers for experiences users.
 */
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";
import DashboardLayout from "./layout";
import Article from "../components/docs/Article";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SubmitForm from "./SubmitForm";

async function Dashboard() {
  return (
    <main>
      <Link href="/store" className="mb-2"><ArrowLeft size={30} className="transition-all hover:opacity-100 bg-neutral-500 p-2 rounded-full opacity-50" /></Link>
      <div className="w-[100%] flex flex-col">
        <div className="w-[50%] ml-[15%] mt-[0%]">
          <SubmitForm />
        </div>
      </div>
    </main>
  );
}

Dashboard.getLayout = (page: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Dashboard;