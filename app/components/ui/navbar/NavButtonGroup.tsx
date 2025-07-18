import Link from "next/link"
import { auth, } from "../../../auth"
import ProfileDropdown from "../button/ProfileDropdown"
import { House, LogIn, MessageSquareText, Plus, SmilePlus, Store } from "lucide-react"
import LogoutButton from "../button/LogoutButton"
import IconButton from "../button/IconButton"

/**
 * ProfileButton shows a login button. If user not logged in and a ProfileDropdown 
 * if they're logged in.
 * @returns 
 */
export default async function NavButtonGroup() {

  const session = await auth()

  return (
    <div className="w-full md:block md:w-auto flex m-auto">
      {session ? 
        <div className="flex">
          <IconButton name="Store" href="/store"><Store className="m-auto" size={15}/></IconButton>
          <IconButton name="Home" href="/"><MessageSquareText className="m-auto" size={15}/></IconButton>
          <LogoutButton session={session}/>
          <ProfileDropdown imgSrc={String(session.user?.image)} id={String(session.user?.email)}/>
        </div>
        :
        <div className="flex gap">
          <IconButton name="Store" href="/store"><Store className="m-auto" size={15}/></IconButton>
          <IconButton name="Home" href="/"><House className="m-auto" size={15}/></IconButton>
          <Link aria-label="Login" className="group transition-all text-sm rounded-md p-1 m-auto hover:bg-neutral-700 flex sm:p-2 text-xs sm:text-sm p-1" href="/login"><LogIn className="m-auto sm:mr-0" size={15}/></Link>
        </div>
      }
    </div>
  )
}