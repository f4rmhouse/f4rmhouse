"use client"
import { useContext, useState } from "react"
import Modal from "../modal/Modal"
import User from "@/app/microstore/User"
import { signOut } from "next-auth/react";
import { handleSignOut } from "@/app/context/handleLogout";
import { SessionContext } from "@/app/context/SessionContext";

/**
 * CreateAPIKeyButton creates an API key for the user that click on it
 * @param email
 * @param provider 
 * @param access_token 
 * @returns 
 */
export default function DeleteUserAccountButton({email, provider, access_token}:{email:string, provider:string, access_token:string}) {
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const session = useContext(SessionContext)

  const deleteAccount = async (e:any) => {
    if(!session) {
      alert("Cannot delete user. You're session is not valid. Please login and try again.")
    }
    e.preventDefault()
    const user = new User(email, provider, access_token);
    setShowInfo(true)
    try {
      await user.deleteAnalyticsRecord()
      let f4s = await user.getF4rmers()
      f4s.map(async f => {
        await user.deleteF4rmer(f.creator, f.uid);
      })
      if(session){
        await user.anonymizeReviews(session?.user.name.split(" ")[0]);
        await user.deleteInteractions(session?.user.email);
      }
      handleSignOut(session).then(() => signOut({ redirectTo: '/login', redirect: true }))
    } catch(err) {
      console.error("Could not delete user", err)
    }
  } 

  return (
    <>
      <button onClick={(e) => setShowInfo(true)} className="text-sm ml-auto mt-5 font-bold text-base rounded bg-red-500 text-red-200 p-1 pr-5 pl-5 border-2 border-red-700 hover:bg-red-600">Delete account</button>
      <Modal title="ACCOUNT DELETION" open={showInfo}>
        <div className="p-2">
        <p className="text-sm mb-5">⚠️ By clicking "DELETE MY ACCOUNT PERMANENTELY" your account and all associated information will be permanentely deleted.</p>
        </div>
        <div className="flex w-full">
            <div className="ml-auto flex gap-2">
                <button onClick={() => {setShowInfo(false);}} className="rounded hover:bg-neutral-600 border-2 border-neutral-700 flex text-sm bg-neutral-400 text-neutral-200 rounded p-1 pr-5 pl-5">CANCEL</button>
                <button onClick={(e) => deleteAccount(e)} className="font-bold hover:bg-red-700 border-2 border-red-700 flex text-sm bg-red-600 text-red-200 rounded p-1 pr-5 pl-5">DELETE MY ACCOUNT PERMANENTELY</button>
            </div>
        </div>
      </Modal>
    </>
  )
}