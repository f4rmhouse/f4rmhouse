import { useState } from "react";
import { LangchainMessageType } from "../../types/LangchainMessageType";
import { CirclePlus } from "lucide-react";

export default function InitToolCall({message, debug}:{message:string, debug: Object}) {
  const [showMore, setShowMore] = useState<boolean>(false)
  return (
    <div className="">
      <div className="flex">
        <button className=" bg-neutral-900 rounded text-neutral-400" onClick={() => setShowMore(p => !p)}>
          <CirclePlus size={15}/>
        </button>
        <p className="text-xs font-mono mt-auto ml-2">action call</p>
      </div>
      <div className=''>
          <div className="w-full">
          {
            showMore ?
            <div className="w-full">
              <div className="block w-full text-neutral-400 text-xs font-mono">{<div><pre>{JSON.stringify(debug, null, 2)}</pre></div>}</div>
              <button className="flex bg-neutral-900 rounded w-[100%] text-neutral-400 p-1" onClick={() => setShowMore(p => !p)}>
              <CirclePlus size={15}/>
              <p className="text-xs font-mono bg-neutral-900 ml-2">{String("view full message")}</p>
              </button>
            </div>
            :
            <></>
          }
          </div>
      </div>
    </div>
  )
}