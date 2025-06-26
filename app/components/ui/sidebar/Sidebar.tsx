/**
 * SideBar is shown on the dashboard for logged in users. It let's users navigate the 
 * f4rmhouse playground.
 */

"use client"
import Link from "next/link";

import { usePathname } from 'next/navigation'
import { signOut } from "next-auth/react";
import { handleSignOut } from "@/app/context/handleLogout";
import { useContext, useState, useEffect } from "react";
import { SessionContext } from "@/app/context/SessionContext";
import { ChartArea, CreditCard, LogOut, PanelRightClose, PanelRightOpen, Settings } from "lucide-react";
import config from "../../../../f4.config"
import { useTheme } from "../../../context/ThemeContext";

export default function SearchBar({username, img}:{username:string, img:string}) {
  const pathname = usePathname();
  const session = useContext(SessionContext)
  const { theme } = useTheme();
  const [expand, setExpand] = useState<boolean>(false)
  
  // Add keyboard shortcut listener for Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+B (metaKey is Cmd on Mac, ctrlKey would be Ctrl on Windows)
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault(); // Prevent default browser behavior
        setExpand(prev => !prev); // Toggle sidebar state
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const menuItems = [
    { href: '/dashboard', label: 'Chat', icon: "🧑‍🌾"},
    { href: '/dashboard/usage', label: 'Usage', icon: <ChartArea size={20}/>},
    { href: '/dashboard/billing', label: 'Billing', icon: <CreditCard size={20}/>},
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={20}/>},
  ];

  return (
    <div className="z-10">
      <div 
        onMouseEnter={() => setExpand(true)} 
        onMouseLeave={() => setExpand(false)} 
        className={`fixed w-[16%] h-[100vh] z-10 ${theme.chatWindowStyle} transition-transform duration-300 ease-in-out transform ${expand ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="z-10 text-sm p-2 pt-2">
          {menuItems.map((e,i) => {
            return <Link key={i} href={e.href} className={`${pathname.split("/").slice(0,3).join("/") === e.href ? "border-2 rounded-md " + theme.primaryColor + " border-" + theme.secondaryColor?.replace("bg-", "") : "hover:" + theme.textColorPrimary + " border-2 hover:border-" + theme.secondaryColor?.replace("bg-", "") + " border-transparent rounded-md"} transition-all hover:${theme.hoverColor} cursor-pointer p-2 pl-3 flex ${theme.textColorSecondary}`}>
              <p className={`${pathname.split("/").slice(0,3).join("/") === e.href ? theme.textColorPrimary + " font-bold": ""} flex`}><span className="m-auto pr-2">{e.icon}</span> {e.label}</p>
            </Link>
          })}
        </div>
        <div className={`z-10 absolute bottom-5 w-[90%] ml-2 mr-0 flex rounded-lg border-${theme.secondaryColor?.replace("bg-", "")}`}>
          <img className="w-8 rounded-full" src={img}/>
          <div>
            <p className={`pl-2 text-xs ${theme.textColorPrimary}`}>{username}</p>
            <p className={`text-xs ${theme.textColorSecondary} pl-2`}>User</p>
          </div>
          <button className={`absolute h-full transition-all rounded hover:${theme.hoverColor} text-xs border border-${theme.secondaryColor?.replace("bg-", "")} p-2 ${theme.textColorSecondary} right-0`} onClick={() => handleSignOut(session).then(() => signOut())}><LogOut size={15}/></button>
        </div>
      </div>
      <div onMouseEnter={() => setExpand(true)} className={`bg-transparent absolute sm:fixed top-0 left-0 w-[50px] h-[10vh] sm:h-[100vh] z-0`}>
        <button onClick={() => setExpand(p => !p)} className={`z-0 mt-16 ml-2 hover:${theme.textColorPrimary} transition-all ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"}`}><PanelRightClose /></button>
      </div>
    </div>
  )
}
