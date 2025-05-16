/**
 * InteractiveStars is a UI element. 5 stars empy stars shown in a row. 
 * The stars are filled based on the users mouse in the star order. 
 * If third star is hovered over then three stars are filled. 
 * This was inspired by Amazons review page.
 */
"use client"

import { useState } from "react";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";

/**
 * 
 * @param param0 
 * @returns 
 */
export default function InteractiveStars({setStars}: {setStars: (n:number) => void}) {
  const [currentHover, setCurrentHover] = useState<number>(0);
  const helpers = ["Unusable!", "Not good.", "It's OK.", "It's useful.", "I love it!"]

  return (
    <div className="flex">
      {[0,1,2,3,4].map((e:number) => {
        if(currentHover+1 <= e) {
          return <FaRegStar key={e} className="text-yellow-500" onMouseEnter={() => {setCurrentHover(e); setStars(e)}} />
        }
        else {
          return <FaStar key={e} className="text-yellow-500" onMouseEnter={() => {setCurrentHover(e); setStars(e)}} />
        }
      })}
      <p className="text-xs m-auto ml-2">{helpers[currentHover]}</p>
    </div>
  )
}
