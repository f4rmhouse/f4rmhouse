/**
 */

"use client"
import { useEffect, useState, useRef } from "react";
import ErrorType from "../types/ErrorType";
import APIKeyType from "../types/APIKeyType";
import F4Session from "../types/F4Session";
import Vendor from "@/app/microstore/Vendor";
import ConfirmModal from "../ui/modal/ConfirmModal";
import { Trash2 } from "lucide-react";

/**
 * KeyTable displays all API keys that are available to a user
 * 
 * @params ks -- an array of keys as APIKeyType
 * @params session -- an F4Session object
 */
export default function KeyTable({ks, session}:{ks:APIKeyType[], error: ErrorType|null, session: F4Session}) {
  const [keys, setKeys] = useState<APIKeyType[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false)
  const [keyToDelete, setKeyToDelete] = useState<string>("")

  // ks are fetched async so we need to update the array as soon as they're avaialble 
  useEffect(() => {
    setKeys(p => p = ks)
  }, [ks])

  // deleteKey will send a request to delete a key
  const deleteKey = () => {
    const vendor = new Vendor(session.user.email, session.provider, session.access_token);
    vendor.deleteKey(keyToDelete).then(e => {
      if (e.Code == 200) {
        window.location.reload()
      }
    })
  }

  return (
    <div className="p-5 w-[100%]">
      <p>Don't share your API keys with anyone else and don't expose them in the browser or client-side code. To protect your account's security f4rmhouse may automatically disable any API key that has leaked publicly. If you suspect someone has unauthorized access to your key please delete the key that they have access to.</p>
      <table className="table-auto w-[100%] h-[100%] text-white mt-10">
        <thead className="border-b border-neutral-700">
          <tr>
            <th className="text-left text-xs">KEY</th>
            <th className="text-left text-xs">CREATED</th>
          </tr>
        </thead>
        <tbody>
          {keys.length > 0 ?
            <>
            {keys.map((e, i) => {
              return (
                <tr key={i}>
                  <td className="text-sm">
                    <p className="m-auto ml-0 mr-0 font-mono">{e.Partial}</p>
                  </td>
                  <td className="text-sm mt-auto mb-auto"><p>{(new Date(e.Created).toISOString().replace("T"," ").replace("Z", " ").slice(0,-5))}</p></td>
                  <td className="text-red-500  mt-auto mb-auto"><button onClick={() => {setKeyToDelete(e.Partial);setShowModal(true)}} className="transition-all hover:bg-red-800 cursor-pointer rounded-full"><Trash2 /></button></td>
                </tr>
              )
            })}
            </>
            :
            <tr><td className="animate-pulse font-mono text-sm">Fetching rows...</td></tr>
          }
        </tbody>
      </table>
      <ConfirmModal action={() => deleteKey()} title="Delete" content={`Are you sure you want to delete the key that looks like: ${keyToDelete}`} open={showModal} setIsOpen={(b) => setShowModal(b)}/>
    </div>
  );
  }