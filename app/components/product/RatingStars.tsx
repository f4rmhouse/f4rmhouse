import { Star } from "lucide-react";
import React from "react";

/**
 * RatingStars shows the value of a rating value in the amount of stars
 * that it has out of five.
 */
export default function RatingStars({value, size, color}: {value: string, size:number, color:string}) {

  return (
    <div className={`flex text-${color}`}>
      {Array.from(Array(Number(value.split(".")[0]))).map((_,i) => <Star size={size} key={i} />)}
      {value.includes(".") ? 
        <></>
        :
        <></>
      }
      {Array.from(Array(5 - Math.ceil(Number(value)))).map((_,i) => <Star size={size} key={i} />)}
    </div>
  )
}