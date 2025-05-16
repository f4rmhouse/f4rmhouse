/**
 * Footer is shown at the bottom of the dashboard page. Contains three links to help center
 * Cook book and status page
 */

import { IoIosHelpCircleOutline } from "react-icons/io";
import { BsBook } from "react-icons/bs";
import { SiStatuspal } from "react-icons/si";

/**
 * 
 * @param param0 
 * @returns 
 */
export default function Footer () {
  return (
    <div className="mt-20 mb-10">
      <div className="grid grid-cols-3 gap-5">
        <div className="transition-all hover:bg-[#201d22] cursor-pointer bg-transparent rounded-md flex">
          <div className="m-auto text-center p-10">
            <IoIosHelpCircleOutline size={30} className="m-auto mb-2"/>
            <h1 className="">Help center</h1>
            <p className="text-xs">Frequently asked questions</p>
          </div>
        </div>
        <div className="transition-all hover:bg-[#201d22] cursor-pointer bg-transparent rounded-md flex">
          <div className="m-auto text-center p-10">
            <BsBook size={25} className="m-auto mb-2"/>
            <h1 className="">Cookbook</h1>
            <p className="text-xs">Open source collection of best practises and cool tricks</p>
          </div>
        </div>
        <div className="transition-all hover:bg-[#201d22] cursor-pointer bg-transparent rounded-md flex">
          <div className="m-auto text-center p-10">
            <SiStatuspal size={25} className="m-auto mb-2"/>
            <h1 className="">Status</h1>
            <p className="text-xs">Check the status of our services</p>
          </div>
        </div>
      </div>
    </div>
  )
}
