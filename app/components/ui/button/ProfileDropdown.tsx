"use client"
import Link from "next/link";

/**
 * ProfileDropdown by default shows the user pfp. onClick a dropdown is shown that 
 * shows links that the user can click on: the links are: Dashboard, Market, Account
 * @param param0 
 * @returns 
 */
export default function ProfileDropdown({imgSrc, id}:{imgSrc:string, id:string}) {

  return (
    <div className="w-full md:w-auto">
        <Link href="/dashboard" className="" aria-label="Go to dashboard">
          <img className="w-8 rounded-full p-1" src={imgSrc}></img>
        </Link>
    </div>
  )
}