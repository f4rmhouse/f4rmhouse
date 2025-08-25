/**
 * The dashboard should provides an easy onboarding experience for new users and
 * an easy way to navigate different f4rmers for experiences users.
 */
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";
import { redirect } from "next/navigation";
import DashboardLayout from "./layout";
import F4rmerType from "@/app/components/types/F4rmerType";
import RightSidebar from "@/app/components/ui/sidebar/RightSidebar";
import getSession from "@/app/context/getSession";
import Boxes from "./components/ui/chat-window/Boxes";
import Store from "./microstore/Store";
import { Github } from "lucide-react";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggleButton from "./components/ui/ThemeToggleButton";
import HelpModal from "./components/ui/HelpModal";
import config from "../f4.config";
import ProductType from "./components/types/ProductType";

async function Dashboard() {

  const session = await getSession()
  var error: Error | null = null
  var toolbox : ProductType[] = [] 

  let data:F4rmerType[] = [{
    uid: '',
    title: 'default',
    jobDescription: "You are a helpful assistant known as a 'f4rmer' on the 'f4rmhouse' platform. You know how to be helpful and write very nicely formatted markdown answers to user prompts. Users asking you questions will be able to give you tools to make you even more useful. Always reason through step by step when answering complex question if you can't answer some question be sure to remind users that there are tools available on the platform that can help them.",
    toolbox: toolbox, 
    creator: "f4rmhouse", 
    created: '2025-04-11 15:54:31'
  }]

  console.log("session: ", session.user)

  if(session.user && session.user.name !== "undefined") {
    redirect("/dashboard")
  }

  const store = new Store()
  try {
    let result = await store.getDefaultF4rmers()
    data = result
    
    // Move Default F4rmer to the front of the array
    const default_f4rmer = data.filter(e => e.title === "default")
    const other_f4rmers = data.filter(e => e.title !== "default")
    data = [...default_f4rmer, ...other_f4rmers]

  } catch(err) {
    error = err as Error
    console.error(err)
  }

  // Different tutorials to help user get accustomed with the platform
  return (
    <ThemeProvider>
      <main className="flex overflow-hidden w-full h-[99vh] relative">
        <div className="mt-10">
          <div className="overflow-hidden">
            <div>
              <Boxes f4rmers={data} session={session}/>
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
          <p className="text-neutral-500 text-xs">v{config.version}</p>
        </div>
        {error && (
          <div className="p-4 rounded absolute bottom-10 right-24">
            <p className="text-xs">Running in local mode</p>
          </div>
          )}
      </main>
    </ThemeProvider>
  );
}

Dashboard.getLayout = (page: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Dashboard;