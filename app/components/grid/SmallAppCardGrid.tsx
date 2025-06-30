"use client"
import AppCardType from "../types/AppCardType";
import SmallAppCard from "../card/SmallAppCard";

import Store from "../../microstore/Store"
import { useEffect, useState } from "react";
import ProductType from "../types/ProductType";

/**
 * SmallAppCardGrid shows SmallAppCards in a 3x3 grid.
 */
export default function SmallAppCardGrid({apps}: {apps: AppCardType[]|string}) {

  const [values, setValues] = useState<AppCardType[]>([]);
  const [error, setError] = useState<string>("");
  const store = new Store();

  useEffect(() => {
    if(Array.isArray(apps)) {
      setValues(apps)
    }
    else {
      store.trending().then(arr => {
        // why this name??
        const _values = arr.map((e:ProductType)=> {
          const card:AppCardType = {
            id: String(e.uid),
            uti: e.uti,
            title: e.title,
            description: e.description,
            price: String(e.price),
            type: "",
            style: "",
            decorator: "",
            disclaimer: "",
            link: "",
            deployed: e.deployed,
            deploymentType: e.server.transport == "" ? "custom" : e.server.transport
          } 
          return card
          }
        )
        setValues(_values);
      }).catch(() => setError("Connection error: Huh... seems we can't fetch any actions at the moment, please revisit the website later."));
    }
  },[apps])

  return (
    <div className="sm:grid sm:grid-cols-3 mt-5 gap-2 w-[95%] m-auto">
        {values.slice(0,9).map((app,i) => {
          return <SmallAppCard key={i} app={app}/>
        })} 
        {error ? 
          <div className="col-span-3 m-auto w-[50%]">
          <p className="text-red-500 text-center rounded-full p-2">{error}</p>
          </div>
          :
          <></>
        }
    </div>
  )
}