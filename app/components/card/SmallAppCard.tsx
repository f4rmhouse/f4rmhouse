/**
 * SmallAppCard shows an app thunmbnail, name and it's price. It always links
 * to the app that it portrays.
 * 
 * ----------------------------------
 *         | name                       
 * img     |                    price 
 *         | tagline                    
 * ----------------------------------
 */

import React from "react";
import AppCardType from "../types/AppCardType";
import Link from "next/link";
import { Globe } from "lucide-react";
import config from "../../../f4.config";

export default function SmallAppCard({app}: {app: AppCardType}) {
  return (
    <div className={`rounded-lg p-4 hover:bg-neutral-800 transition-all cursor-pointer`}>
      <Link href={`/detail/${app.uti}`} className={`cursor-pointer`}>
        <div className="flex">
          <img alt="action-thumbnail" className="h-10 rounded-full aspect-square object-cover" height={10} src={"https://f4-public.s3.eu-central-1.amazonaws.com/showcases/" + app.uti + "/thumbnail.jpg"}/>
          <div className="mt-auto mb-auto ml-2">
          <p className="text-[9px] mt-auto mb-auto text-neutral-400 rounded-full">{app.deploymentType?.replace("_", " ").toUpperCase()}</p>
            <div className="flex">
              <p className="">{app.title}</p>
              <p className={`text-xs mt-auto mb-auto ml-auto flex ${app.deployed ? "text-blue-500" : "text-gray-500"}`}> <Globe size={12}/></p>
            </div>
            <p className="text-xs text-neutral-300">{app.description}</p>
            <div className="flex gap-2">
            </div>
          </div>
          <div className="text-xs text-center p-1 ml-auto mt-auto mb-auto">
            {app.price == "0.0" ?
              <button>Free</button>
              :
              `\$${app.price}/req`
            }
          </div>
        </div>
      </Link>
    </div>
  )
}