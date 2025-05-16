import type { Metadata } from "next";
import "../globals.css";
import { SessionProvider } from '../context/SessionContext';
import getSession from "../context/getSession";
import User from "../microstore/User";
import { headers } from 'next/headers';
import F4Session from "../components/types/F4Session";

export const metadata: Metadata = {
  title: "f4rmhouse",
  description: "An open-source agent hub",
};

export default async function DashboardLayout({children,}: Readonly<{children: React.ReactNode}>) {
  var err = false

  // If user has no token user is not authorized to be here
  
  return (
      <div className="flex">
        <div className="relative col-span-2">
        </div>
        <div className="m-auto">
          <div>
            <div className="w-full">
              <div className="sm:mt-16">{children}</div>
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
  );
}
