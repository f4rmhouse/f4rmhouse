import SmallAppCard from "@/app/components/card/SmallAppCard";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { FaFire } from "react-icons/fa";

import { MockAppCardType } from "@/app/components/mocks/MockAppCardType";

export default function Article() {

    return (
        <div className="pt-18 grid grid-cols-12">
          <div className="mt-10 col-span-4 bg-gradient-to-b from-blue-500 to-blue-700 h-[100vh] w-[30%] fixed">
            <p className="pt-10 pl-5 font-bold text-blue-200">GET STARTED</p>
          </div>
          <div className="col-start-6 col-span-6 pt-10">
            <Link href="/" className="bg-red-500 m-2 bg-red-500"><FaArrowLeft size={30} className="transition-all hover:bg-zinc-600 bg-zinc-700 p-2 rounded-full" /></Link>
            <p className="mt-12 text-xl text-zinc-400">
              <span className="text-white">Get started</span> by creating a f4rmer with access to actions.
            </p>
            <br />
            <p className="text-xl text-zinc-400">Let's check out some powerful actions we recommend to streamline your business and some that we like just for fun.</p>
            <hr className="border-neutral-600 mt-8" />
            <p className="mt-8 text-xl text-white ">Essential business actions to stay ahead of the competition</p>
            <p className="mt-4 text-xl text-zinc-400">
              Generate documents with google_docs and printable documents with pdf_generator. You can even display data on a TV using dashboarder or create AI secretaries with twilio!
            </p>
            <div className="grid grid-cols-2 mt-12 mb-12">
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
            </div>
            <p className="mt-8 text-xl text-white ">Must-use actions to have fun with</p>
            <p className="mt-4 text-xl text-zinc-400">
              Create a companion with a crazy personality, level up using a League of Legends coach or find out about a city using a virtual guide. AI is, and should be for the people.
            </p>
            <div className="grid grid-cols-2 mt-12 mb-12">
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
              <SmallAppCard app={MockAppCardType}/>
            </div>
            <p className="mt-20 text-xl text-center text-white">We love to see your creations (and sometimes abomonations)!</p>
            <div className="w-[50%] mt-6 m-auto flex">
              <Link href={"/"} className="m-auto text-center transition-all rounded-md m-auto p-2 bg-neutral-800 text-blue-500 pr-8 pl-8 hover:bg-neutral-700 flex"><span className="p-1"><FaFire /></span> Click for more recommendations</Link>
            </div>
            <hr className="border-neutral-600 mt-8 mb-8" />
          </div>
        </div>
    );
  }
  