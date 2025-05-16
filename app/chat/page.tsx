/**
 * The dashboard should provides an easy onboarding experience for new users and
 * an easy way to navigate different f4rmers for experiences users.
 */
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, useState } from "react";
import DashboardLayout from "./layout";
import F4rmerType from "@/app/components/types/F4rmerType";
import RightSidebar from "@/app/components/ui/sidebar/RightSidebar";
import getSession from "@/app/context/getSession";
import Boxes from "../components/ui/chat-window/Boxes";
import Store from "../microstore/Store";
import Link from "next/link";

async function Dashboard({ params }: { params: { username: string, uid: string } }) {

  const session = await getSession()
  var error = null
  var toolbox = [] 

  const store = new Store()
  try {
    let result = await store.getProduct("html-upload")
    toolbox.push(result.Message)
  } catch(err) {
    // error = err
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
    <main className="">
      {error == null ?
        <div className="overflow-none">
          <Boxes data={data} session={session}/>
          <RightSidebar f4rmer={data}/>
        </div>
        :
        <div className="mt-16 text-center flex border border-neutral-700 p-4 rounded">
          <div className="m-auto">
            <p className="text-2xl">👩🏾‍💻⛓️‍💥🛜</p>
            <p className="text-xl">Can't connect to server right now</p>
            <Link href="/" className="flex w-full transition-all hover:bg-neutral-700 w-full bg-neutral-800 border border-zinc-700 pr-5 pl-5 text-blue-500 rounded"><p className="m-auto">Back</p></Link>
          </div>
        </div>
      }
    </main>
  );
}

Dashboard.getLayout = (page: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Dashboard;