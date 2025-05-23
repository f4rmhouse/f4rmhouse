"use client"
/**
 * ImageBanner shows an array of images in a view frame. There are controls that 
 * lets users select next and previous image.
 */
import React, { useState } from "react";

import Image from 'next/image'
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageBanner({images}: {images: string[]}) {

  const [currentPage, setCurrentPage] = useState<number>(0)

  return (
    <div className="w-full">
      <div className="flex">
        <button onClick={() => setCurrentPage((p) => (p-1+images.length)%images.length)} className="transition-all text-neutral-600 hover:text-sky-500 h-[50vh] rounded-md bg-transparent"><ChevronLeft size="40" /></button>
        <div className="overflow-hidden h-[50vh] bg-transparent text-black flex rounded-xl">
          <div className="transition-all h-full duration-[300ms] ease-in-out" style={{ transform: `translate3d(${-currentPage* 100}%, 0, 0)` }}>
            <div className="whitespace-nowrap h-[50vh] relative">
              {
                images.map((e,i) => {
                  return(
                    <div key={i} className="h-[50vh] w-full inline-block">
                      <Image 
                        className="flex m-auto object-cover max-h-full max-w-full"
                        src={images[i]} 
                        alt="missing image"
                        width={1000}
                        height={1000}
                      />
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
        <button onClick={() => setCurrentPage((p) => (p+1)%images.length)} className="transition-all hover:text-sky-500 text-neutral-600 h-[50vh] rounded-md bg-transparent"><ChevronRight size="40" /></button>
      </div>
      <div className="flex w-full mt-2">
        <div className="flex m-auto">
          {
            images.map((e,i) => {
              return(
                <div key={i} onClick={() => setCurrentPage(i)} className={`m-auto ${i == currentPage ? "bg-neutral-100" : "hover:bg-neutral-400 bg-neutral-700"} transition-all rounded-full p-1 mr-2 cursor-pointer`}>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}