/**
 * ConfirmImportantModal will ask used to write some word before they can confirm it
 * This is similar to AWS confirmations.
 */
"use client"
import { useState } from "react";
import Modal from "./Modal"
import { FiAlertTriangle } from "react-icons/fi";

export default function ConfirmImportantModal(
    {content,open,setIsOpen, title, action}: 
    Readonly<{content: string, open: boolean, setIsOpen: (b:boolean) => void, title:string, action: () => boolean}>) {

  const [value, setValue] = useState<string>("");

  return (
    <Modal open={open} title={title}>
      <div className="flex border-neutral-700">
        <div className="text-yellow-500 bg-opacity-50 rounded-full p-2">
          <FiAlertTriangle size={60} />
        </div>
        <p className="mt-auto mb-auto ml-5">{content}</p>
      </div>
      <div >
        <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-black" placeholder="Type confirm"/>
      </div>

      <div className="flex m-2">
        <div className="flex ml-auto">
            <button onClick={() => setIsOpen(false)} className="transition-all pl-2 pr-2 ml-auto hover:bg-gray-800 bg-neutral-700">Cancel</button>
            <button onClick={() => {if(value == "confirm") {action()}}} className="transition-all pl-2 pr-2 ml-auto hover:bg-orange-800 bg-orange-500 text-black font-bold">Confirm</button>
        </div>
      </div>
    </Modal>
  )
}
