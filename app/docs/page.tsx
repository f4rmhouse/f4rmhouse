/**
 * The dashboard should provides an easy onboarding experience for new users and
 * an easy way to navigate different f4rmers for experiences users.
 */
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";
import DashboardLayout from "./layout";
import Article from "../components/docs/Article";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

async function Dashboard() {
  // Different tutorials to help user get accustomed with the platform
  return (
    <main>
      <div className="w-[100%]">
          <div className="">
            <Link href="/" className="mb-2"><FaArrowLeft size={30} className="transition-all hover:opacity-100 bg-neutral-500 p-2 rounded-full opacity-50" /></Link>
            <Article fname={'https://f4-public.s3.eu-central-1.amazonaws.com/public/docs/main.md'}/>
          </div>
      </div>
    </main>
  );
}

Dashboard.getLayout = (page: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Dashboard;