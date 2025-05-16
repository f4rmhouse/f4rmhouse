"use client"
import Link from "next/link";
import { useState } from "react";

/**
 * IconButton is a button that can be used to navigate to different pages
 * @param name - name of the button
 * @param href - url to navigate to
 * @returns 
 */
export default function IconButton({name, href, children}:{name:string, href:string, children:React.ReactNode}) {

  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <Link onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} aria-label={name} className="group transition-all text-sm rounded-md p-1 m-auto hover:bg-neutral-700 flex p-2 text-xs sm:text-sm" href={href}>
        {children}
      </Link>
      <div className={`text-sm transition-all bg-black border border-neutral-700 rounded-md text-center p-1 pl-4 pr-4 translate-x-[-17px] translate-y-[5px] absolute opacity-0 ${showTooltip ? 'opacity-100' : ''}`}><p>{name}</p></div>
    </div>
  )
}