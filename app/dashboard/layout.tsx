import type { Metadata } from "next";
import "../globals.css";
import Sidebar from "../components/ui/sidebar/Sidebar";
import { SessionProvider } from '../context/SessionContext';
import getSession from "../context/getSession";
import { redirect } from 'next/navigation'
import User from "../microstore/User";
import KeyboardHandlerWrapper from "../components/KeyboardHandlerWrapper";

export const metadata: Metadata = {
  title: "f4rmhouse",
  description: "A marketplace for cloud apps",
};

export default async function DashboardLayout({children,}: Readonly<{children: React.ReactNode}>) {
  const session = await getSession()
  const user = new User(session.user.email, session.provider, session.access_token)
  var err = false

  // If user has no token user is not authorized to be here
  if(session.access_token == 'undefined') {
    redirect("/login")
  }
  // Validate token everytime user opens dashboard. This avoids situations where user
  // has a token stored locally but the token is not valid
  try {
    let res = await user.isValidSession()
    if (res.Code == 403) {
      err = true
    }
    res = await user.doesUserExist()
    if (res.Exists == false) {
      console.log("Create new analytics record")
      user.createUserRecord()
    }

  } catch (err) {
    err = true
  } finally {
    if(err) {
      redirect("/login")
    }
  }

  return (
    <SessionProvider session={session}>
      <div className="flex">
        <div className="relative col-span-2">
          <Sidebar username={String(session?.user?.name)} img={String(session?.user?.image)}/>
        </div>
        <KeyboardHandlerWrapper />
        <div>
          <div className="flex md:mt-0">
            <div>{children}</div>
              <div>
              {err ? 
                <p>no auth</p>
                :
                <></>
              }
              </div>
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
