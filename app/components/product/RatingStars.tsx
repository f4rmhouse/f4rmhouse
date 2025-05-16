import React from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

/**
 * RatingStars shows the value of a rating value in the amount of stars
 * that it has out of five.
 */
export default function RatingStars({value, size, color}: {value: string, size:number, color:string}) {

  return (
    <div className={`flex text-${color}`}>
      {Array.from(Array(Number(value.split(".")[0]))).map((_,i) => <FaStar size={size} key={i} />)}
      {value.includes(".") ? 
        <FaStarHalfAlt size={size}/>
        :
        <></>
      }
      {Array.from(Array(5 - Math.ceil(Number(value)))).map((_,i) => <FaRegStar size={size} key={i} />)}
    </div>
  )
}