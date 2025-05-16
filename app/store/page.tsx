import SectionType from "../components/types/SectionType";
import SmallAppCardGrid from "../components/grid/SmallAppCardGrid";
import InfoCardGrid from "../components/grid/InfoCardGrid";
import Banner from "../components/banner/Banner";
import Link from "next/link";
import { Hammer } from "lucide-react";
import PostHogPageView from "../PostHogPageView";

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

  const renderSection = (type: string, section: SectionType) => {

    switch (type) {
      case "small_cards":
        return (
          <div className="mt-10 mb-10 sm:ml-12">
            <h2 className="sm:pl-0 text-xl">Popular actions</h2>
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
        <footer className="border-neutral-700 pr-5 pl-5 sm:pr-0 sm:pl-0">
          <div className="flex">
            <Link href="/docs" className="transition-all bg-neutral-800 border border-neutral-700 p-2 pl-2 pr-4 rounded text-blue-500 hover:bg-neutral-700 flex w-[200px] m-auto"><div className="m-auto flex"><Hammer size={20} className="mr-1"/> For developers</div></Link>
          </div>
          <div className="grid grid-cols-2 pt-5 pb-5">
          </div>
        </footer>
      </div>
    </div>
  );
}
