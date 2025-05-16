"use client"

/**
 * F4LineChartWithLabel is like a normal line chart but with a label above it showing the value of the point currently 
 * hovered over by the user.
 */

import React from "react"

import { LineChart, TooltipProps } from "./F4LineChart"
import DataItemType from "../types/DataItemType";

export default function LineChartCallbackExample({title, currency, data}: {title:string, currency: boolean, data:DataItemType[]}) {
  const [datas, setDatas] = React.useState<TooltipProps | null>(null)
  const currencyFormatter = (number: number) => currency ? `$${Intl.NumberFormat("sv-Sv").format(number)}` : number

  const payload = datas?.payload?.[0]
  const value = payload?.value

  const formattedValue = payload
    ? currencyFormatter(Number(value))
    : currencyFormatter(data[data.length - 1].value)

  return (
    <div>
      <p className="text-sm text-white dark:text-gray-300 font-bold">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-50">
        {formattedValue}
      </p>
      <LineChart
        data={data}
        index="date"
        categories={["value"]}
        showLegend={false}
        showYAxis={false}
        startEndOnly={true}
        className=""
        tooltipCallback={(props) => {
          if (props.active) {
            setDatas((prev) => {
              if (prev?.label === props.label) return prev
              return props
            })
          } else {
            setDatas(null)
          }
          return null
        }}
      />
    </div>
  )
}