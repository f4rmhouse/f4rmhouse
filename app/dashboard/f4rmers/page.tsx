import ErrorType from "@/app/components/types/ErrorType";
import User from "@/app/microstore/User";
import Vendor from "@/app/microstore/Vendor";
import getSession from "@/app/context/getSession";
import F4rmerType from "@/app/components/types/F4rmerType";
import F4rmerListItem from "@/app/components/ui/list/F4rmerListItem";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

/**
 * F4rmers display lists of f4rmers registered by the user
 * @param param0 
 * @returns 
 */
export default async function F4rmers({ params }: { params: { product_id: string } }) {
  const session = await getSession()
  const user = new User(session.user.email, session.provider, session.access_token);

  let data:F4rmerType[] = []
  let error:ErrorType|null = null

  try {
    data = await user.getF4rmers() 
    // user.deleteF4rmer()
  }
  catch(err) {
    console.error("Could not get user usage")
    error = {code: 400, message: "Looks like we can't fetch the data from our server currently. Don't worry we're handling it!", link: "More updates at: /"}
    console.log(error)
  }

  return(
    <div className="w-[50vw]">
      <Link href="/dashboard" className=""><FaArrowLeft size={30} className="transition-all hover:opacity-100 bg-neutral-500 p-2 rounded-full opacity-50" /></Link>
      <p className="text-xl mt-2">my f4rmers</p>
      <div className="flex w-full mb-2">
        <Link className="transition-all ml-auto text-white rounded-md p-2 pr-4 pl-4 text-sm hover:bg-neutral-800" href="f4rmers/create">Create</Link>
      </div>
      <div className="">
        <div className="flex border border-neutral-700">
          <p className="pl-4 text-neutral-100 border-r border-neutral-700 w-[80%]">Title</p>
          <p className="pl-1 text-neutral-100 border-neutral-700 w-[20%]">Created</p>
        </div>
        <div className="">
          {data.map((f4, i) => <F4rmerListItem key={i} index={i} f4rmer={f4} status="PENDING"/>)}
        </div>
      </div>
    </div>
  )
}