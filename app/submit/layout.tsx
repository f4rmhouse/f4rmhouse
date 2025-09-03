import type { Metadata } from "next";
import "../globals.css";
import { SessionProvider } from '../context/SessionContext';
import getSession from "../context/getSession";
import User from "../microstore/User";

export const metadata: Metadata = {
  title: "f4rmhouse",
  description: "A marketplace for cloud apps",
};

export default async function DashboardLayout({children,}: Readonly<{children: React.ReactNode}>) {
  const session = await getSession()
  const user = new User(session.user.email, session.provider, session.access_token)
  var err = false

  return (
    <SessionProvider session={session}>
      <div className="grid grid-cols-12">
        <div className="relative col-span-2 hidden md:block">
        </div>
        <div className="col-span-12 md:col-span-10">
          <div>
            <div className="">
              <div className="h-full w-full mt-20">{children}</div>
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
      </div>
    </SessionProvider>
  );
}
