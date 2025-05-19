/**
 * SideBar is shown on the dashboard for logged in users. It let's users navigate the 
 * f4rmhouse playground.
 */

"use client"
import Link from "next/link";

import { usePathname } from 'next/navigation'
import { signOut } from "next-auth/react";
import { handleSignOut } from "@/app/context/handleLogout";
import { useContext, useState } from "react";
import { SessionContext } from "@/app/context/SessionContext";
import { ChartArea, CreditCard, LogOut, PanelRightClose, PanelRightOpen, Settings } from "lucide-react";
import config from "../../../../f4.config"

export default function SearchBar({username, img}:{username:string, img:string}) {
  const pathname = usePathname();
  const session = useContext(SessionContext)
  const [expand, setExpand] = useState<boolean>(false)

  const menuItems = [
    { href: '/dashboard', label: 'Chat', icon: "🧑‍🌾"},
    { href: '/dashboard/usage', label: 'Usage', icon: <ChartArea size={20}/>},
    { href: '/dashboard/billing', label: 'Billing', icon: <CreditCard size={20}/>},
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={20}/>},
  ];

  return (
    <div>
      <div onMouseEnter={() => setExpand(true)} onMouseLeave={() => setExpand(false)} className={`fixed w-[16%] h-[100vh] z-10 bg-neutral-900 border-r border-neutral-800 transition-transform duration-300 ease-in-out transform ${expand ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="text-sm p-2 pt-2">
          {menuItems.map((e,i) => {
            return <Link key={i} href={e.href} className={`${pathname.split("/").slice(0,3).join("/") === e.href ? "border-2 rounded-md bg-neutral-900 border-neutral-700" : "hover:text-white border-2 hover:border-neutral-700 border-transparent rounded-md"} transition-all hover:bg-neutral-800 cursor-pointer p-2 pl-3 flex text-neutral-400`}>
              <p className={`${pathname.split("/").slice(0,3).join("/") === e.href ? "text-white font-bold": ""} flex`}><span className="m-auto pr-2">{e.icon}</span> {e.label}</p>
            </Link>
          })}
        </div>
        <div className="absolute bottom-5 w-[90%] ml-2 mr-0 flex rounded-lg border-neutral-700">
          <img className="w-8 rounded-full" src={img}/>
          <div >
            <p className="pl-2 text-xs">{username}</p>
            <p className="text-xs text-neutral-400 pl-2">User</p>
          </div>
          <button className="absolute h-full transition-all rounded hover:bg-zinc-800 text-xs border border-zinc-700 p-2 text-zinc-500 text-white right-0" onClick={() => handleSignOut(session).then(() => signOut())}><LogOut size={15}/></button>
        </div>
      </div>
      <div onMouseEnter={() => setExpand(true)} className="fixed md:visible w-[50px] h-[100vh] z-0 bg-transparent">
        <button onClick={() => setExpand(p => !p)} className={`z-10 mt-16 ml-2 hover:text-white transition-all ${config.theme.textColorPrimary ? config.theme.textColorPrimary : "text-white"}`}><PanelRightClose /></button>
      </div>
    </div>
  )
}
