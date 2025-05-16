/**
 * InfoCard consists of a title and subtitle with an image to the right. 
 * It is used to portray general use cases of f4rmhouse and usually links
 * to a curated list.
 * 
 * ------------------------------------
 * |title                    |         |
 * |subtitle                 | img     |
 * |                         |         |
 * ------------------------------------
 */

import React from "react";
import AppCardType from "../types/AppCardType";
import Link from "next/link";

export default function InfoCard({app}: {app: AppCardType}) {
  return (
    <Link href={app.link}>
      <div className="transition-all border border-neutral-800 hover:bg-neutral-800 ml-2 rounded-xl bg-neutral-900 p-6 border-neutral-700">
        <div className="lg:flex">
          <div className="pr-5">
            <p className="text-xl pt-1 pb-2">{app.title}</p>
            <p className="text-xs text-gray-200 hidden lg:block">{app.description}</p>
          </div>
          <div className="ml-auto">
            {app.decorator.length > 0 ?
              <div className="m-auto h-[150px] w-[150px]">
                <img className="object-cover rounded-full h-full w-full"  src={app.decorator}/>
              </div>
              :
              <div className="bg-gradient-to-br from-emerald-600 to-green-400 rounded-full m-auto p-16 h-[150px] w-[150px]">
                <p>img</p>
              </div>
            }
          </div>
        </div>
      </div>
    </Link>
  )
}