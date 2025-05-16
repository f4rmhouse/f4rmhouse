"use client"
/**
 * ImageBanner shows an array of images in a view frame. There are controls that 
 * lets users select next and previous image.
 */
import React, { useState } from "react";

import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import Image from 'next/image'

export default function ImageBanner({images}: {images: string[]}) {

  const [currentPage, setCurrentPage] = useState<number>(0)

  return (
    <div className="w-full">
      <div className="flex">
        <button onClick={() => setCurrentPage((p) => (p-1+images.length)%images.length)} className="hidden md:block transition-all text-neutral-600 hover:text-sky-500 rounded-md bg-transparent"><FaAngleLeft size="40" /></button>
        <div className="overflow-hidden bg-transparent text-black flex rounded-xl">
          <div className="transition-all h-full duration-[300ms] ease-in-out" style={{ transform: `translate3d(${-currentPage* 100}%, 0, 0)` }}>
            <div className="whitespace-nowrap md:h-[50vh] relative">
              {
                images.map((e,i) => {
                  return(
                    <div key={i} className="md:h-[50vh] w-full inline-block">
                      <img
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
        <button onClick={() => setCurrentPage((p) => (p+1)%images.length)} className="hidden md:block transition-all hover:text-sky-500 text-neutral-600 rounded-md bg-transparent"><FaAngleRight size="40" /></button>
      </div>
      <div className="flex w-full mt-2">
      <div className="flex m-auto">
      <button onClick={() => setCurrentPage((p) => (p-1+images.length)%images.length)} className="transition-all mr-5 text-neutral-500 hover:text-white flex text-xs" id="previous image" aria-label="previous image"><FaAngleLeft size="15" /></button>
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
        <button onClick={() => setCurrentPage((p) => (p+1)%images.length)} className="transition-all ml-5 text-neutral-500 hover:text-white" id="next image" aria-label="next image"><FaAngleRight size="15" /></button>
        </div>
      </div>
    </div>
  )
}