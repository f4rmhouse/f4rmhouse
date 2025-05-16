"use client"
/**
 */
import Link from "next/link";
import F4rmerType from "../../types/F4rmerType";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * F4rmerListItem is a component that summarizes a f4rmer in an itemized list
 */
export default function F4rmerListItem({f4rmer, status, index}:{f4rmer:F4rmerType, status:string, index:number}) {

  const [showMore, setShowMore] = useState<boolean>(false)

  return (
    <div className={`border border-neutral-700 ${index % 2 == 0 ? "" : ""}`}>
      <div className="flex">
        <button className={`${showMore ? "rotate-180" : ""} text-neutral-100 mr-1 transition-all`} onClick={() => setShowMore(p => !p)}><ChevronDown size={15}/></button>
        <div className="w-[80%]">
          <Link href={`/dashboard/f4rmers/details/${f4rmer.creator}/${f4rmer.uid}`} className="hover:underline ">{f4rmer.title}</Link>
        </div>
        <p className="text-xs text-neutral-400 w-[20%]">{f4rmer.created}</p>
      </div>
      {showMore ?
        <div>
        <p className="text-xs text-neutral-400">{f4rmer.jobDescription}</p>
        </div>
        :
        <></>
      }
    </div>
  )
}
