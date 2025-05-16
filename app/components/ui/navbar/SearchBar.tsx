/**
 * SearchBar let's user search over the products on f4rmhouse
 */

"use client"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState<string>("");
  const [searchIsFocused, setSearchIsFocused] = useState<boolean>(false);

  const searchRecommendations = [
    "",
    "photo studio",
    "levelio",
    "genai",
    "modd",
    "scoolio",
    "generate emojis with words",
    "knowledge base fase"
  ]

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleSearch = () => {
    if(query) {
      router.push(`/search?query=${query}`)
      setSearchIsFocused(false);
    }
  }

  const handleArrowNavigation = (e:React.KeyboardEvent<HTMLElement>) => {
    if(e.key == "ArrowDown"){
      setSelectedIndex(p => (p+1)%searchRecommendations.length)
      setQuery(searchRecommendations[selectedIndex+1%searchRecommendations.length])
    }
    if(e.key == "ArrowUp" && selectedIndex > 0){
      setSelectedIndex(p => p-1)
      setQuery(searchRecommendations[selectedIndex-1])
    }
    if(e.key == "Enter") {
      handleSearch();
    }
  } 

  return (
    <form action={handleSearch}>
      <div className="relative">
        <div className="flex rounded-md ">
          <CiSearch size={20} className="m-auto mr-2 ml-2"/>
          <input 
            placeholder="Search for tools, agents or software" 
            className="outline-none w-[60vw] border-none text-white rounded-md text-black text-md p-1 bg-transparent bg-neutral-900" type="text"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchIsFocused(true)}
            value={query}
            onKeyDown={handleArrowNavigation}
          />
          {
            searchIsFocused ?
            <button onClick={() => setQuery("")} className="m-auto mr-2 hover:bg-neutral-600 transition-all p-1 rounded-full"><IoMdCloseCircle /></button>
            :
            <></>
          }
        </div>
        {searchIsFocused ?
        <div className="bg-white rounded-b-md text-black text-base absolute z-10 w-full">
          <ul>
            {searchRecommendations.slice(1).map((s, i) => {

              return(
                <div key={i} className="flex group">
                  <Link onClick={() => setSearchIsFocused(false)} className={`${i+1 == selectedIndex ? "bg-gray-200": ""} w-full p-2 flex hover:bg-neutral-200 cursor-pointer`} href={`/search?query=${s}`}>{s}</Link>
                  <button className={`${i+1==selectedIndex?"bg-gray-200":""} group-hover:bg-neutral-200 m-auto hover:bg-neutral-200 p-3 pr-2`}><IoMdClose /></button>
                </div>)
            })}
          </ul>
        </div>
        :
        <></>
        }
      </div>
      {searchIsFocused ?
        <div onClick={() => setSearchIsFocused(false)} className="transition-all absolute bg-black bg-opacity-50 backdrop-blur-sm w-[100vw] h-[100vh] m-0 p-0 left-0">
        </div>
        :
        <></>
      }
    </form>
  )
}
