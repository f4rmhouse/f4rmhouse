"use client"
import Vendor from "@/app/microstore/Vendor"
import { useState } from "react"
import Modal from "../modal/Modal"
import CopyableParagraph from "../text/CopyableParagraph"

/**
 * CreateAPIKeyButton creates an API key for the user that click on it
 * @param email
 * @param provider 
 * @param access_token 
 * @returns 
 */
export default function CreateAPIKeyButton({email, provider, access_token}:{email:string,provider:string,access_token:string}) {
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [apiKey, setApiKey] = useState<string>("")

  const createKey = () => {
    let vendor = new Vendor(email, provider, access_token)
    vendor.createKey().then(e => {
      console.log(e)
      if(e.Code == 200) {
        setApiKey(e.Message)
        setShowInfo(true)
      }
    }).catch(err => console.log(err))
  } 

  return (
    <>
      <button onClick={() => createKey()} className="hover:bg-teal-700 border-2 border-teal-700 ml-auto bg-teal-600 rounded-md mb-2 p-1 text-sm pr-5 pl-5">Create key</button>
      <Modal title="API KEY" open={showInfo}>
        <div className="p-2">
        <p className="text-sm mb-5">New API key sucessfully generated:</p>
        <CopyableParagraph text={apiKey}/>
        <p className="text-sm mt-5 mb-5">Please store this safely. You will not be able to view the raw key again.</p>
        </div>
        <button onClick={() => {setShowInfo(false);window.location.reload()}} className="hover:bg-teal-700 border-2 border-teal-700 flex ml-auto text-sm bg-teal-600 rounded p-1 pr-5 pl-5">Hide forever</button>
      </Modal>
    </>
  )
}