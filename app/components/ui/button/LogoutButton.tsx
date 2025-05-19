"use client"
import { signOut } from "next-auth/react";
import { handleSignOut } from "@/app/context/handleLogout";
import { useState } from "react";
import { LogOut } from "lucide-react";

/**
 * ProfileDropdown by default shows the user pfp. onClick a dropdown is shown that 
 * shows links that the user can click on: the links are: Dashboard, Market, Account
 * @param param0 
 * @returns 
 */
export default function LogoutButton({session}:{session:any}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="w-full md:block md:w-auto">
      <button onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} onClick={() => handleSignOut(session).then(() => signOut())} className="h-full hover:bg-neutral-700 transition-all rounded-md text-xs p-2 right-0" ><LogOut size={15}/></button> 
      <div className={`text-sm transition-all bg-black rounded-md text-center p-1 pl-4 pr-4 translate-x-[-17px] translate-y-[5px] absolute opacity-0 ${showTooltip ? 'opacity-100' : ''}`}><p>Logout</p></div> 
    </div>
  )
}