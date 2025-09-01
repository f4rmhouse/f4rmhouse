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
import { BadgeDollarSign, Github, Shield } from "lucide-react";
import ThemeToggleButton from "../components/ui/ThemeToggleButton";
import HelpModal from "../components/ui/HelpModal";
import FPSCounter from "../components/ui/FPSCounter";
import config from "@/f4.config";
import { Toaster } from "sonner";
import SendFeedback from "../components/ui/SendFeedback";

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ? process.env.NEXT_PUBLIC_POSTHOG_KEY : "", {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
})

async function Dashboard() {

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

  let f4s:F4rmerType[] = [data]

  try {
    let remote_f4s = await user.getF4rmers()
    if (remote_f4s.length == 0) {
      await user.createF4rmer(data)
      f4s = [data]
    }
    else {
      f4s = remote_f4s
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
      <div>
        <div>
        <div className="mt-5">
          <div className="overflow-hidden">
            <div>
              <Boxes f4rmers={f4s} session={session}/>
              <RightSidebar />
            </div>
          </div>
        </div>
        <div className="absolute hidden sm:flex bottom-0 flex right-24">
          <a 
            href="https://github.com/f4rmhouse/f4rmhouse" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-neutral-500 flex hover:text-white px-1 underline text-xs"
          >
            <Github className="w-4 h-4" />
            GitHub 
          </a>
          <ThemeToggleButton />
          <HelpModal />
          <SendFeedback />
          <p className="text-neutral-500 text-xs">v{config.version}</p>
        </div>
        {error && (
          <div className="p-4 rounded absolute bottom-10 right-24">
            <p className="text-xs">Running in local mode</p>
          </div>
          )}
        </div>
      </div>
    </main>
  );
}

Dashboard.getLayout = (page: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Dashboard;