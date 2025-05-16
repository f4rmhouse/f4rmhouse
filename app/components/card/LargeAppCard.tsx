"use client"
/**
 * Large app card consists of a large image, title and description.
 * It usually links to an app or a curated list
 * 
 * 
 *|-----------------------------|
 *|                             |   
 *|           img               |   
 *|                             |   
 *|                             |   
 *|-----------------------------| 
 *|Title                        |   
 *|                             |     
 *|subtitle                     |    
 *|                             |   
 *|-----------------------------|-
 */

import React from "react";
import AppCardType from "../types/AppCardType";
import Link from "next/link";
import Image from 'next/image'
import { useInView } from "react-intersection-observer";

export default function LargeAppCard({app}: {app: AppCardType}) {

  const { ref, inView, entry } = useInView({
    /* Optional options */
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Link ref={ref} href={`${app.link}`} className="transition-all rounded hover:bg-neutral-800">
      <div className="h-[200px] bg-neutral-500 rounded-t-md relative">
      {inView && (
        <Image loading="lazy" src={app.decorator} width={1000} height={1000} alt="img" className="rounded-t-md h-full w-full object-cover"/>
      )}
      </div>
      <div className="pt-5 pb-5">
        <p className="sm:text-xl text-base">{app.title}</p>
        <p className="pt-0 text-sm text-neutral-400">{app.description}</p>
      </div>
    </Link>
  )
}