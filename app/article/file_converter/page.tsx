import SmallAppCard from "@/app/components/card/SmallAppCard";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { FaRobot } from "react-icons/fa";

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
              <span className="text-white">Ready to save time?</span> This f4rmer let's you convert between file formats in the blink of an eye without having to use sketchy sites you found on Google.
            </p>
            <br />
            <p className="text-xl text-zinc-400">Open the chat or scan the QR code to try it out!</p>
            <div className="grid grid-cols-2 mt-8">
                <div className="h-[100%] flex">
                    <Link href={"/"} className="text-center transition-all rounded-md p-2 bg-neutral-800 text-blue-500 hover:bg-neutral-700 flex m-auto"><span className="p-1"><FaRobot/></span>Open chat</Link>
                </div>
                <div className="m-auto">
                    <img className="h-[200px]" src="https://www.researchgate.net/publication/340398294/figure/fig3/AS:876175308103681@1585907880294/Sample-Figure-of-QR-Code-QR-code-works-in-a-simple-way-It-all-starts-of-by-feeding-in.ppm"/>
                </div>
            </div>
            <hr className="border-neutral-600 mt-8 mb-8" />
          </div>
        </div>
    );
  }
  