"use client"
import F4LineChartWithLabel from "../statistics/F4LineChartWithLabel";
import Statistic from "../statistics/Statistic";

import { useEffect, useState, useRef } from "react";
import DataItemType from "../types/DataItemType";
import UsageType from "../types/UsageType";
import ErrorType from "../types/ErrorType";
import { CircleAlert } from "lucide-react";

/**
 * Usage will handle the parsing and display of user usage statistics on the dashboard.
 */
export default function Usage({usage, error}:{usage:UsageType[], error: ErrorType|null}) {
  const effectRan = useRef(false);

  const [freeRequests, setFreeRequests] = useState<number>(0);
  const [paidRequests, setPaidRequests] = useState<number>(0);
  const [totalSpent, setTotalSpent]     = useState<number>(0);
  const [productUsage, setProductUsage] = useState<{name: string, value: number}[]>([])
  const [timeseries, setTimeseries]     = useState<DataItemType[]>([])

  // fetch usage on-render
  useEffect(() => {
    if(effectRan.current === false) {
      const map:{[name:string]:{name:string, value:number}} = {} 

      usage.map((e:UsageType) => {

        // Sum #paid/free requests
        setFreeRequests(p => p += e.free_requests)
        setPaidRequests(p => p += e.paid_requests)

        const currentDay:DataItemType = {date: e.timestamp, value: 0}
        // Aggregate values in products list
        Object.keys(e.products).map((name:string) => {
          const p = e.products[name];
          setTotalSpent(pr => pr += p.price*p.num_requests);
          currentDay.value += Math.ceil(p.price*p.num_requests*100)/100
          map[name] = {name: name, value: p.num_requests}; 
        })
        // Timeseries is an array of values in this format: [{date: ..., value: ...}...]
        setTimeseries(pr => [...pr, currentDay])
      })
      setProductUsage(Object.values(map))
      return () => {
        effectRan.current = true
      }
    }
  }, [usage])

  return (
    <div className="col-span-9 grid grid-cols-12 gap-5">
      {error == null ?
        <>
          <div className="col-span-8 p-2 rounded">
            <div className="h-[100%] w-[100%] p-5">
              {timeseries.length > 0 ?
                <F4LineChartWithLabel title="Costs" currency={true} data={timeseries}/>
                :
                <></>
              }
            </div>
          </div>
          <div className="col-span-4 w-full gap-5 mt-10">
            <Statistic 
              type="number" 
              name="Usage" 
              value={paidRequests+freeRequests} 
              categories={[{name: "Free", value: freeRequests}, {name: "Paid", value: paidRequests}]}
              colors={["gray", "blue"]}
            />
            <Statistic 
              categories={productUsage} 
              type="currency" 
              name="Costs" 
              value={totalSpent.toFixed(2)} 
              colors={["blue", "emerald", "fuchsia", "pink", "lime", "cyan"]}
            />
          </div>
        </>
        :
        <div className="col-span-12 m-auto">
          <div className="mt-20 text-red">
            <div className="text-4xl text-red-500 flex m-auto align-center items-align-center justify-center">
              <CircleAlert />
            </div>
            <p className="text-white">{error.message}</p>
            <p className="text-white text-center">{error.link}</p>
          </div>
        </div>
      }
    </div>
  );
  }