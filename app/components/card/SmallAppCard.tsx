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
import { useTheme } from "../../context/ThemeContext";

export default function SmallAppCard({app}: {app: AppCardType}) {
  const { theme } = useTheme();
  return (
    <div className={`group p-1 transition-all cursor-pointer`}>
      <Link href={`/detail/${app.uti}`} className={`cursor-pointer`}>
        <div className="flex">
          <img alt="action-thumbnail" className="h-10 my-auto rounded-full aspect-square object-cover" height={10} src={"https://f4-public.s3.eu-central-1.amazonaws.com/showcases/" + app.uti + "/thumbnail.jpg"}/>
          <div className="mt-auto mb-auto ml-4">
          <p className={`text-[9px] mt-auto mb-auto ${theme.textColorSecondary} rounded-full`}>{app.deploymentType?.replace("_", " ").toUpperCase()}</p>
            <div className="flex">
              <p className={`group-hover:underline text-sm pb-1 ${theme.textColorPrimary}`}>{app.title}</p>
            </div>
            <p className={`text-xs ${theme.textColorSecondary}`}>{app.description}</p>
            <div className="flex gap-2">
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}