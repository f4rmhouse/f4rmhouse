/**
 * PricingCard shown on the product page. This card is used to show 
 * pricng of app. 
 * 
 *|--------------------------|  
 *|                          |    
 *|        old_price?        |         
 *|        current_price     |   
 *|        deal?             |     
 *|                          |       
 *|  features                |         
 *|                          |     
 *|  but_button              |         
 *| -------------------------|    
**/

import React, { useEffect, useState } from "react";
import PricingType from "../types/PricingType";
import { useSession } from "next-auth/react";
import F4rmerType from "../types/F4rmerType";
import User from "@/app/microstore/User";
import { useRouter } from 'next/navigation'
import ConfirmModal from "../ui/modal/ConfirmModal";
import ErrorModal from "../ui/modal/ErrorModal";
import ProductType from "../types/ProductType";

export default function PricingCard({pricing, product}: {pricing: PricingType, product:ProductType}) {
  const router = useRouter()
  const { data: session, status } = useSession();

  const [f4rmers, setF4rmers] = useState<F4rmerType[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [error, setOpenError] = useState<boolean>(false)
  const [id, setId] = useState<string>("-1")
  const [serverError, setServerError] = useState<boolean>(false)

  useEffect(() => {
    if(session?.user && session.user.email) {
      // @ts-expect-error
      const user = new User(session.user.email, session.provider, session.access_token);

      let data:F4rmerType[] = [] 
      user.getF4rmers().then(res => {
        data = res
        setF4rmers(data)
      }).catch(err => setServerError(true))
    }
  }, [pricing])

  const addTool = (value:string) => {
    setOpen(false)
    if(isNaN(Number(value))) {
      alert("Invalid id")
      return
    }
    if(session?.user && session.user.email) {
      // @ts-expect-error
      const user = new User(session.user.email, session.provider, session.access_token);
        user.addTool(session.user.email, f4rmers[Number(value)].uid, product.uid).then(res => {
          console.log("res", res)
          router.push(`/dashboard/f4rmers/details/${session?.user?.email}/${f4rmers[Number(value)].uid}`)
        }).catch(err => setOpenError(true))
    }
  }

  return (
    <div className={`flex flex-col border rounded-md border-neutral-800 bg-zinc-900 p-2`}>
      <div className="">
        <h3 className="font-bold text-sm text-neutral-300">{pricing.name.toLocaleUpperCase()}</h3>
        {pricing.price == 0.0 ?
          <h3 className="text-2xl text-sm text-white font-bold">Free</h3>
          :
          <div className="flex">
            <div>
              <h3 className="text-xl text-sm font-bold">$0.00/{pricing.pricePeriod}</h3>
            </div>
          </div>
        }
        <p>{pricing.disclaimer}</p>
      </div>
      <ul className="list-disc pl-5 mb-2">
        {pricing.features.map((f,i) => {
          return(<li key={i}>{f}</li>)
        })}
      </ul>
      {serverError ?
          <p className="text-white font-mono rounded-full text-center text-xs bg-gray-700 p-2">PLEASE LOGIN TO USE ACTION</p>
        :
          <>
            {f4rmers.length > -1 ?
              <div>
                {product.deployed ? 
                <select onChange={(e) => {setId(e.target.value);setOpen(true)}} title="Add to" className={`border-none cursor-pointer text-center m-auto w-full rounded-full bg-blue-500 p-1 hover:bg-blue-800 transition-all text-white`}>
                  <option>Add</option>
                  {f4rmers.map((f4rmer:F4rmerType, i:number) => <option value={i}>{f4rmer.title}</option>)}
                </select>
                :
                <div>
                  <p className="text-center">Product has not yet been deployed</p>
                  <button className={`border-none cursor-pointer text-center m-auto w-full rounded-full bg-blue-500 p-1 hover:bg-blue-800 transition-all text-white`}>
                    Poke dev 
                  </button>
                  <p className="text-center text-neutral-500 mt-2 text-sm">Poke dev to show your interest</p>
                </div>
                }
              </div>

              :
              <></>
            }
          </>
      }
      <ConfirmModal content={`You're adding: '${product.title}' to the tool box of 'Default F4rmer'. The tool will immediately be available to the f4rmer that you chose. If you confirm, you will be redirected to your f4rmers prompt page.`} open={open} setIsOpen={setOpen} title="Are you sure you want to add this tool?" action={() => addTool(id)}/>
      <ErrorModal content="Could not add tool to toolbox. Maybe the tool already is in the toolbox?" open={error} setIsOpen={setOpenError} title="An error occured" />
    </div>
  )
}