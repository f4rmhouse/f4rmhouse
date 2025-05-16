/**
 * Statistic is a value that can be formatted in some user friendly ways on a dashboard.
 * It's inspired by the top bar of this dashboard: https://dashboard.tremor.so/overview
 */

import { CategoryBar } from "./F4CategoryBar"
import {
  AvailableChartColorsKeys,
} from "../../lib/chartUtils"

type CategoryValue = {
  name: string,
  value: number
}

export default function Statistic(
  {name, value, type, categories=[], colors=[]}: 
  {name:string, value:number|string, type: string, categories?: CategoryValue[], colors?: AvailableChartColorsKeys[]}) 
{

  const precision = type == "currency" ? 2 : 0;

  const categoryValues:number[] = categories.map(e => Number(e.value));

  return (
    <div className="flex-1 bg-transparent p-2 rounded font-medium">
      <div className="">
        <p className="text-sm text-gray-50 tremor-metric font-bold">{name}</p>
      </div>
      <p className="text-2xl pt-2 font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {type == "currency" ? '$' : ""}
        {type == "number" ? new Intl.NumberFormat('en-us', {minimumFractionDigits:precision}).format(Number(value)) : value}
      </p>
      {type == "string" ?
      <></>
      :
      <></>
      }
      <CategoryBar showLabels={false} colors={colors} values={categoryValues} className="mx-auto max-w-sm" />
        {categories ?
            <div className="grid grid-cols-2 pt-2">
              {categories.map((c,i) => 
                <div key={i} className="relative pt-1">
                  <div className={`absolute bg-${colors[i]}-600 p-2 rounded`}></div>
                  <div>
                    <p className="text-xs pl-5 text-neutral-100">{c.name}<span className="text-neutral-400 pl-2">{c.value} ({(100*c.value / Number(value)).toFixed(0)}%)</span></p>
                  </div>
                </div>
              )}
            </div>
          :
          <></>
        }
    </div>
  )
}
