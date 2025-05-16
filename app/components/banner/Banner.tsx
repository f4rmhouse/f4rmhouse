/**
 * The banner is used to display messages in a larger view. The banner
 * is used for marketing purposes. 
 */

"use client"

import React, { useEffect, useState } from "react";
import AppCardType from "../types/AppCardType";

import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import Image from 'next/image'
import { usePostHog } from "posthog-js/react";

// SimpleBannerItem shows an image and a message to the left side of it
function SimpleBannerItem({item}: {item: AppCardType}) {

  const st = item.style;

  return (
    <div className="grid grid-cols-12 p-0 w-full">
      <div className={"pl-4 pt-4 text-black lg:pl-10 col-span-12 lg:col-span-4 lg:mt-[25%]"}>
          <h1 className="font-bold lg:text-4xl whitespace-normal pr-5 text-lg">{item.title}</h1>
          <p className="font-sans lg:mt-1 whitespace-normal pr-5">{item.description}</p>
      </div>
      <div className="w-full h-full lg:col-span-8 col-start-0 col-span-12 m-auto">
          <Image 
            className="w-full lg:m-auto mt-2 sm:mt-12 lg:m-0"
            src={item.decorator} 
            alt="missing image"
            width={200}
            height={200}
            loading="eager"
          />
      </div>
    </div>
  )
}

// FullWidthBannerItem will show an image and on top of it some text
function FullWidthBannerItem({item}: {item: AppCardType}) {

  return (
    <div className="bg-blue-500 top-0 h-full w-full">
        <div className="bg-blue-800 absolute w-full bottom-0 top-0">
        </div>
        <div className="absolute top-10 whitespace-normal w-full">
          <h1 className={"text-[48px] sm:text-[150px] text-red-500 top-0 p-0 m-2 leading-[50px] sm:leading-[100px] " + item.style}>{item.title}</h1>
          <h1 className={"text-red-500 p-10 text-center"}>it's fun {":)"}</h1>
        </div>
    </div>

  )
}
// CentralBannerItem shows and image and text on top of it. The text is in the center
function CentralBannerItem({item}: {item: AppCardType}) {
  return (
    <div className={"bg-blue-500 top-0 h-full w-full " + item.style}>
        <div className={"absolute top-0 w-full h-full " + item.style}>
          <Image 
            className="w-full h-full object-cover"
            src={item.decorator} 
            alt="central banner item"
            width={1000}
            height={1000}
            loading="eager"
          />
        </div>
        <div className="absolute top-[20%] whitespace-normal w-full pl-2">
          <h1 className={"font-roboto text-6xl p-0 m-0 sm:text-8xl " + item.style}>{item.title}</h1>
          <p className={"pt-5 sm:ml-5 font-sans text-center"}>{item.description}</p>
        </div>
    </div>
  )
}

// CentralBannerItem shows and image and text on top of it. The text is in the center
function CentralTextBannerItem({item}: {item: AppCardType}) {
  return (
    <div className={"top-0 w-full h-full bg-blue-500"}>
      <div className="bg-yellow-400 absolute w-full bottom-0 top-0">
      </div>
      <div className="absolute top-10 whitespace-normal w-full">
        <h1 className={"font-roboto text-4xl sm:text-[120px] text-black-500 top-0 p-0 m-2 leading-[32px] sm:leading-[100px]"}>{item.title}</h1>
      </div>
    </div>
  )
}

/**
 * Banner shows stylized images with text, these are called pages. 
 * A user can browse through by pressing '</>' buttons. It takes an 
 * array of AppCardType which contains all data needed to display the page
**/
export default function Banner() {
  const posthog = usePostHog()

  const [currentPage, setCurrentPage] = useState<number>(0)

  // Mocked pages, in prod these should be returned from a server
  const pages = [
    {"deploymentType": "na", "deployed":false,"uti": "", "link": "", "id": "0", "price": "0.0", "disclaimer": "", "type": "simple", "title": "WELCOME TO THE ACTION STORE!", "description": "super-charge your work with the largest marketplace for AI actions", "decorator": "https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/banner_item-1.webp", "style": ""},
    {"deploymentType": "na", "deployed":false,"uti": "", "link": "", "id": "9", "price": "0.0", "disclaimer": "", "type": "central-image", "title": "How?", "description": "", "decorator": "https://t3.ftcdn.net/jpg/05/58/45/02/360_F_558450244_JVL848woVRCZmFXWQqD0imauEyfSgKnU.jpg", "style": "text-center"},
    {"deploymentType": "na", "deployed":false,"uti": "", "link": "", "id": "3", "price": "0.0", "disclaimer": "", "type": "central-text", "title": "1. Developers create actions.", "description": "", "decorator": "", "style": ""},
    {"deploymentType": "na", "deployed":false,"uti": "", "link": "", "id": "8", "price": "0.0", "disclaimer": "", "type": "central-text", "title": "2. You connect actions to an LLM.", "description": "", "decorator": "", "style": "font-arial text-black text-5xl bg-yellow-400"},
    {"deploymentType": "na", "deployed":false,"uti": "", "link": "", "id": "7", "price": "0.0", "disclaimer": "", "type": "central-text", "title": "3. Automate everything.", "description": "", "decorator": "", "style": "font-arial text-black bg-yellow-400"},
    {"deploymentType": "na", "deployed":false,"uti": "", "link": "", "id": "1", "price": "0.0", "disclaimer": "", "type": "full", "title": "Join the revolution!", "description": "i hope this webp isnt copyright i really like the y2k aesthetic!", "decorator": "", "style": "font-rocket text-blue-900"},
    //{"uti": "", "link": "", "id": "4", "price": "0.0", "disclaimer": "", "type": "simple", "title": "F4RMHOUSE EXPOSED!", "description": "as the most user friendly way for anyone to create AI agents!", "decorator": "https://media.tenor.com/-MrMt3zY6OwAAAAe/caught-emote-caught-emoji.png", "style": ""},
    //{"uti": "", "link": "", "id": "6", "price": "0.0", "disclaimer": "", "type": "central-text", "title": "you're not using AI yet?? 😂🫵🫵😂🫵", "description": "", "decorator": "https://cdn.prod.website-files.com/5a9ee6416e90d20001b20038/6289efcc9a52f65ff46e8400_white-gradient.png", "style": ""},
    //{"uti": "", "link": "", "id": "5", "price": "0.0", "disclaimer": "", "type": "central-text", "title": "Welcome to software 2.0", "description": "The dawn of a new era in computing", "decorator": "https://fs.artdevivre.com/storage/articles/main-photos-articles/3ddd1d005abe8cc1789152da71cee3e0.jpg", "style": "font-sunflower text-6xl sm:text-8xl m-auto text-black text-yellow-500"},
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage(p => (p+1)%pages.length)
    }, 10000)
    return () => clearInterval(interval)
  },[])

  /** renderBannerItem will detirmine what banner type to render based 
   * on the "type" field in the AppCardType
   *
   * @param banner -- the page to be rendered
   * @returns React component
  **/
  const renderBannerItem = (banner: AppCardType) => {
    switch (banner.type ){
      case "simple":
        return <SimpleBannerItem item={banner} />
      case "full":
        return <FullWidthBannerItem item={banner}/>
      case "central-image": 
        return <CentralBannerItem item={banner}/>
      case "central-text": 
        return <CentralTextBannerItem item={banner}/>
      default: 
        return <SimpleBannerItem item={banner} />
    }
  }

  const nextPage = () => {
    setCurrentPage((p) => (p+1)%pages.length)
  }

  const previousPage = () => {
    setCurrentPage((p) => (p-1+pages.length)%pages.length)
  }

  const selectPage = (i:number) => {
    setCurrentPage(i)
  }

  return (
    <div>
      <div className="flex w-full">
        <button onClick={() => previousPage()} className="transition-all text-neutral-600 hover:text-sky-500 h-[50vh] rounded-md bg-transparent hidden md:block" id="previous image" aria-label="previous image"><FaAngleLeft size="40" /></button>
        <div className="overflow-hidden h-[35vh] md:h-[50vh] md:min-h-[320px] bg-white sm:bg-white text-black flex w-full rounded-md border border-black">
          <div className="transition-all w-full h-full duration-[300ms] ease-in-out" style={{ transform: `translate3d(${-currentPage* 100}%, 0, 0)` }}>
          <div className="whitespace-nowrap">
              {
                pages.map((e,i) => {
                  return(
                    <div key={i} className="h-full w-full inline-block">
                      {renderBannerItem(e)}
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
        <button onClick={() => nextPage()} className="transition-all hover:text-sky-500 text-neutral-600 h-[50vh] rounded-md bg-transparent hidden md:block" id="next image" aria-label="next image"><FaAngleRight size="40" /></button>
      </div>
      <div className="flex w-full mt-2">
        <div className="flex m-auto">
        <button onClick={() => previousPage()} className="transition-all mr-5 text-neutral-500 hover:text-white flex text-xs" id="previous image" aria-label="previous image"><FaAngleLeft size="15" /></button>
        <div className="flex m-auto">
          {
            pages.map((e,i) => {
              return(
                <div key={i} onClick={() => selectPage(i)} className={`m-auto ${i == currentPage ? "bg-neutral-100" : "hover:bg-neutral-400 bg-neutral-700"} transition-all rounded-full p-1 mr-2 cursor-pointer`}>
                </div>
              )
            })
          }
        </div>
        <button onClick={() => nextPage()} className="transition-all ml-5 text-neutral-500 hover:text-white" id="next image" aria-label="next image"><FaAngleRight size="15" /></button>
        </div>
      </div>
    </div>
  )
}