"use client"
import SectionType from "../components/types/SectionType";
import SmallAppCardGrid from "../components/grid/SmallAppCardGrid";
import InfoCardGrid from "../components/grid/InfoCardGrid";
import Banner from "../components/banner/Banner";
import Link from "next/link";
import { Hammer } from "lucide-react";
import PostHogPageView from "../PostHogPageView";
import { useTheme } from "../context/ThemeContext";

const AppMocks = {
  "banner": {
    "type": "banner",
    "header": "", 
    "content": [

    ]
  },
  "bApps": {
    "type": "small_cards",
    "header": "Apps to streamline your business",
    "content": "trending"
  },
  "articles": {
    "type": "medium_cards",
    "header": "Welcome to f4rmhouse",
    "content": []}
}

export default function Home() {

  const { theme } = useTheme();

  const renderSection = (type: string, section: SectionType) => {

    switch (type) {
      case "small_cards":
        return (
          <div className="mt-10 mb-10 sm:ml-12">
            <h2 className={`sm:pl-0 text-xl ${theme.textColorPrimary}`}>Popular Servers</h2>
            <SmallAppCardGrid apps={section.content}/>
          </div>
        )
      case "medium_cards":
        return (
          <div className="mt-20 border-neutral-700 pt-5 pr-5 pl-5 sm:pr-0 sm:pl-0">
            {
            // <LargeAppCardGrid apps={section.content} />
            }
          </div>
        )
      case "info_cards":
        return(
          <div className="mt-5">
            <InfoCardGrid apps={section.content} />
          </div>
        )
      case "banner":
        return (
          <Banner />
        )
    }
  }

  return (
    <div className="m-auto">
      <PostHogPageView/>
      <div className="relative max-w-screen-2xl w-[100vw] sm:w-[95vw] justify-between mx-auto pt-12 md:pt-16">
        <div className="">
          {
            Object.values(AppMocks).map((section:SectionType, i:number) => {
              return(
                <div key={i} className="">
                  {renderSection(section.type, section)}
                </div>
              )
            })
          }
        </div>
        <footer className="px-5 sm:pr-0 sm:pl-0">
          <div className="flex">
            <Link href="/docs" className={`m-auto hover:${theme.textColorPrimary} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer flex ${theme.textColorSecondary} text-base gap-3 my-auto`}><Hammer size={20}/> Submit a Server</Link>
          </div>
          <div className="grid grid-cols-2 pt-5 pb-5">
          </div>
        </footer>
      </div>
    </div>
  );
}
