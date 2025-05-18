/**
 * The dashboard should provides an easy onboarding experience for new users and
 * an easy way to navigate different f4rmers for experiences users.
 */
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";
import DashboardLayout from "./layout";
import F4rmerType from "@/app/components/types/F4rmerType";
import RightSidebar from "@/app/components/ui/sidebar/RightSidebar";
import getSession from "@/app/context/getSession";
import Boxes from "./components/ui/chat-window/Boxes";
import Store from "./microstore/Store";
import { CircleHelp, Github } from "lucide-react";
import FPSCounter from './components/ui/FPSCounter';
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggleButton from "./components/ui/ThemeToggleButton";
import config from "../f4.config";

async function Dashboard() {

  const session = await getSession()
  var error: Error | null = null
  var toolbox = [] 

  const store = new Store()
  try {
    let result = await store.getProduct("html-upload")
    toolbox.push(result.Message)
  } catch(err) {
    error = err as Error
    console.error(err)
  }

  let data:F4rmerType = {
    uid: '',
    title: 'Default F4rmer',
    jobDescription: "You are a helpful assistant known as a 'f4rmer' on the 'f4rmhouse' platform. You know how to be helpful and write very nicely formatted markdown answers to user prompts. Users asking you questions will be able to give you tools to make you even more useful. Always reason through step by step when answering complex question if you can't answer some question be sure to remind users that there are tools available on the platform that can help them.",
    toolbox: toolbox, 
    creator: "f4rmhouse", 
    created: '2025-04-11 15:54:31'
  }

  // Different tutorials to help user get accustomed with the platform
  return (
    <ThemeProvider>
      <main className="flex overflow-hidden w-full h-[99vh] relative">
        <p>Loading...</p>
      </main>
    </ThemeProvider>
  );
}

Dashboard.getLayout = (page: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Dashboard;