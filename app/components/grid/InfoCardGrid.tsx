"use client"

import React, { useState } from "react";
import AppCardType from "../types/AppCardType";
import InfoCard from "../card/InfoCard";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";

/**
 * InfoCardGrid shows InfoCards in a Banner format letting a user view two 
 * InfoCards at a time and letting the user press next/prev button to see
 * more.
 */
export default function InfoCardGrid({apps}: {apps: AppCardType[]|string}) {

  const [currentPage, setCurrentPage] = useState<number>(0);

  return (
    <div className="group/roller hidden sm:flex">
      <div onClick={() => setCurrentPage((p) => (p-2+apps.length)%apps.length)} className="transition-all opacity-0 group-hover/roller:opacity-100 group flex flex-1 cursor-pointer">
        <button className="flex m-auto transition-all text-neutral-600 group-hover:text-sky-500 rounded-md bg-transparent"><FaAngleLeft size="40" /></button>
      </div>
      <div className="w-full overflow-hidden">
        <div className="transition-all h-full duration-[300ms] ease-in-out" style={{ transform: `translate3d(${-currentPage* 50}%, 0, 0)` }}>
          <div className="whitespace-nowrap w-full">
            {Array.isArray(apps) ?
              <>
              {
                apps.map((app, i) => {
                  return <div key={i} className={`inline-block w-[50%]`}><InfoCard app={app} /></div>
                })
              }
              </>
              :
              <p>get async</p>
            }
          </div>
        </div>
      </div>
      <div onClick={() => setCurrentPage((p) => (p+2)%apps.length)} className="transition-all opacity-0 group-hover/roller:opacity-100 group flex flex-1 cursor-pointer">
        <button className="flex m-auto transition-all text-neutral-600 group-hover:text-sky-500 rounded-md bg-transparent"><FaAngleRight size="40" /></button>
      </div>
    </div>
  )
}