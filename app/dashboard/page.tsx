/**
 * The dashboard should provides an easy onboarding experience for new users and
 * an easy way to navigate different f4rmers for experiences users.
 */
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";
import DashboardLayout from "./layout";
import ErrorType from "@/app/components/types/ErrorType";
import F4rmerType from "@/app/components/types/F4rmerType";
import RightSidebar from "@/app/components/ui/sidebar/RightSidebar";
import getSession from "@/app/context/getSession";
import User from "@/app/microstore/User";
import Boxes from "../components/ui/chat-window/Boxes";
import { PostHog } from 'posthog-node'
import Link from "next/link";
import { Plus } from "lucide-react";

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ? process.env.NEXT_PUBLIC_POSTHOG_KEY : "", {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
})

async function Dashboard({ params }: { params: { username: string, uid: string } }) {

  const session = await getSession()
  const user = new User(session.user.email, session.provider, session.access_token);

  posthog.capture({
    distinctId: session.user.email,
    event: 'Dashboard was loaded'
  })

  let error:ErrorType|null = null
  let data:F4rmerType = {
      uid: "default-f4rmer", 
      title: "Default F4rmer", 
      jobDescription: "You are a helpful assistant known as a 'f4rmer' on the 'f4rmhouse' platform. You know how to be helpful and write very nicely formatted markdown answers to user prompts. Users asking you questions will be able to give you tools to make you even more useful. Always reason through step by step when answering complex question if you can't answer some question be sure to remind users that there are tools available on the platform that can help them.", 
      toolbox: [], 
      creator: "", 
      created: "0"
  }

  try {
    let f4s = await user.getF4rmers()
    if (f4s.length == 0) {
      await user.createF4rmer(data)
    }
    else {
      console.log("F4rmers: ", f4s)
      data = f4s[0]
    }
  }
  catch(err) {
    console.error("Could not get user usage")
    error = {code: 400, message: "Looks like we can't fetch the data from our server currently. Don't worry we're handling it!", link: "More updates at: /"}
    console.log(error)
  }

  // Different tutorials to help user get accustomed with the platform
  return (
    <main>
      <div className="flex">
        <div className="w-full">
        <div className="overflow-none">
          <Link href="/dashboard/f4rmers/create" className="group absolute top-16 left-28 flex rounded-md p-2 pl-4 pr-4 hover:bg-blue-500 hover:border-blue-500 transition-all">
            <button className="text-center rounded-full group-hover:rotate-90 transition-all"><Plus size={15} /></button>
            <p className="transition-all text-neutral-300 m-auto text-xs ml-1">New agent</p>
          </Link>
          <div className="flex">
          <Boxes data={data} session={session}/>
          <RightSidebar f4rmer={data}/>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}

Dashboard.getLayout = (page: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Dashboard;