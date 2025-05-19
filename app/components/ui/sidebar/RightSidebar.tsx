/**
 * SideBar is shown on the dashboard for logged in users. It let's users navigate the 
 * f4rmhouse playground.
 */

"use client"
import axios from 'axios';
import F4rmerType from '../../types/F4rmerType';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import User from '@/app/microstore/User';
import ProductType from '../../types/ProductType';
import { ChevronDown, ChevronRight, QrCode, Store as StoreIcon} from "lucide-react";
import { Delete, PanelLeftClose, PanelRightClose, Repeat2, Wrench } from 'lucide-react';
import Store from '@/app/microstore/Store';
import { useTheme } from "../../../context/ThemeContext";

export default function RightSidebar({f4rmer}:{f4rmer:F4rmerType}) {
  const { theme } = useTheme();
  const { data: session, status } = useSession();

  const [qrImageURL, setQrImageURL] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [openList, setOpenList] = useState<any[]>(f4rmer.toolbox.map(e => {}))
  const [toolHasBeenDisabledByCreator, setToolHasBeenDisabledByCreator] = useState<Map<string, boolean>>(new Map())

  const [visible, setVisible] = useState<boolean>(false)

  const getQR = () => {
    setLoading(true)
    axios({
      method: 'post',
      url: 'https://graph.facebook.com/v21.0/491919314012886/message_qrdls',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.WHATSAPP_ACCESS_TOKEN 
      },
      data: {
        prefilled_message: "Hey Mathemagician! Could you help me with some arithmetic?🥺👉👈",
        generate_qr_image: "SVG"
      }
    }).then(response => {
      setQrImageURL(response.data.qr_image_url)
      setLoading(false)
    });
  }

  const removeTool = (uti:string) => {
    
    let newF4rmer = f4rmer
    newF4rmer.toolbox = f4rmer.toolbox.filter((e:ProductType) => e.uti != uti)
    // @ts-expect-error
    const user = new User(String(session.user.email), String(session.provider), String(session.access_token));
    user.updateF4rmer(f4rmer)
  }

  const getToolSummary = (uti:string, index: number) => {
    if (openList[index] && openList[index][0]) {
      closeSummary(index)
      return
    }
    const store = new Store();
    store.getEndpoint(uti).then((e:any) => {
      setOpenList(openList.map((item, i) => 
        i === index ? e : item
      ));
    })
  }
  const closeSummary = (index: number) => {
    setOpenList(openList.map((item, i) => 
      i=== index ? {} : item
    ));
  }

  const getProduct = (uti:string) => {
    const store = new Store();
    store.getProduct(uti).then((e:any) => {
      toolHasBeenDisabledByCreator.set(e.Message.uti, !e.Message.disabled)
    })
  }

  // Add keyboard shortcut listener for Cmd+M to toggle right sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+M (metaKey is Cmd on Mac, ctrlKey would be Ctrl on Windows)
      if ((event.metaKey || event.ctrlKey) && event.key === 'm') {
        event.preventDefault(); // Prevent default browser behavior
        setVisible(prev => !prev); // Toggle sidebar state
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  useEffect(() => {
    getProduct("html-upload")
  }, [])

  return (
    <div>
    <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} className={`p-2 fixed right-0 w-[50%] sm:w-[16%] h-[100vh] z-10 top-0 border-${theme.secondaryColor?.replace("bg-", "")} ${theme.chatWindowStyle} transition-transform duration-300 ease-in-out transform ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className='h-[95%] flex flex-col'>
        {f4rmer.toolbox ?
        <div className={`rounded-md`}>
          {f4rmer.toolbox.map((tool:any, i:number) => {
            return(
              <div key={i}> 
                {toolHasBeenDisabledByCreator.get(tool.uti) ?
                <div className={`transition-all w-full hover:${theme.primaryHoverColor} rounded-md`}>
                  <p className={`text-sm hover:cursor-pointer ${theme.textColorSecondary} w-[90%] line-through`}>{tool.title}</p>
                  <p className='text-xs hover:cursor-pointer text-red-500 w-[100%]'>This action has been disabled by the creator.</p>
                </div>
                :
                <div onClick={() => getToolSummary(tool.uti, i)} className={`flex w-full p-2 hover:${theme.secondaryHoverColor} rounded-md`}>
                  {openList[i] && openList[i][0] ?
                    <ChevronDown size={20} className={`cursor-pointer transition-all m-auto ${theme.textColorPrimary}`}/>
                    :
                    <ChevronRight size={20} className={`cursor-pointer transition-all m-auto ${theme.textColorPrimary}`}/>
                  }
                  <p className={`text-sm hover:cursor-pointer ${theme.textColorPrimary} w-[90%]`}>{tool.title}</p>
                  <Delete size={20} onClick={() => removeTool(tool.uti)} className='cursor-pointer transition-all hover:text-red-400 text-red-500 mr-2 m-auto'/>
                </div>
                }
                <div>
                  {openList[i] && openList[i][0] ? 
                    <div className={`text-sm ${theme.textColorSecondary} p-0 pr-2 pl-2 ${theme.secondaryColor}`}>
                      <p><span className='text-blue-400'>uti</span>: <span className='text-pink-400'>{openList[i][0].uti}</span></p>
                      <p><span className='text-blue-400'>endpoints</span>:</p> 
                      <div>
                        {
                          openList[i][0].endpoints.map((e:string, endpointIndex:number) => {
                            return(
                              <div key={endpointIndex} className='pl-2'>
                                <p className='text-blue-400'>{e}<span className='text-neutral-300 mr-5'>: </span></p>
                                <div className='flex'>
                                  <p className='text-blue-400 pl-2 mr-1'>description<span className='text-neutral-300 mr-5'>: </span></p>
                                  <p className='text-pink-400'>{openList[i][0].descriptions[endpointIndex]} </p>
                                </div>
                                <p><span className='text-blue-400 pl-2'>parameters</span>: <span className='text-pink-400'>{openList[i][0].parameters[endpointIndex]}</span></p>
                              </div>
                              )
                          })
                        }
                      </div>
                      <p><span className='text-blue-400'>cluster</span>:</p>
                      {openList[i][0].ips.map((e:string, j:number) => <p key={j} className='pl-2 text-pink-400'><span className='text-neutral-300 pr-1'>-</span>{e}</p>)}
                    </div>
                    :
                    <></>
                  }
                </div>
              </div>)
          })}
        </div>
        :
        <p>No tools have been added yet</p>
        }
        <div className='flex w-full'>
        <Link href="/" className={`hover:${theme.textColorPrimary} border-2 hover:border-${theme.secondaryColor?.replace("bg-", "")} border-transparent rounded-md transition-all hover:${theme.hoverColor} cursor-pointer p-2 pl-3 flex ${theme.textColorSecondary} w-full text-sm gap-3`}><StoreIcon size={20}/>Browse tools</Link>
      </div>
        <div className=''>
          <button className={`hover:${theme.textColorPrimary} border-2 hover:border-${theme.secondaryColor?.replace("bg-", "")} border-transparent rounded-md transition-all hover:${theme.hoverColor} cursor-pointer p-2 pl-3 flex ${theme.textColorSecondary} w-full text-sm gap-3`} onClick={() => getQR()}><QrCode size={20}/> Generate QR code</button>
          {
            qrImageURL.length > 0 ? 
            <div className='m-4'>
              <p className='text-sm'>WhatsApp:</p>
              <div className='bg-white rounded-md'>
                <img src={qrImageURL} className='w-full' height={100} width={100}/>
              </div>
            </div>
            :
            <div className='m-10 flex'>
              {
                loading ?
                <div className='m-auto animate-pulse w-40 h-40 bg-neutral-600 rounded-md flex'><p className='m-auto text-center text-xs font-mono'>Generating QR code</p></div>
                :
                <div></div>
              }
            </div>
          }
        </div>
      </div>
    </div>
    <div onMouseEnter={() => setVisible(true)} className="bg-transparent absolute sm:fixed top-16 right-0 w-[50px] h-[10vh] sm:h-[100vh] z-0">
      <button onClick={() => setVisible(p => !p)} className={`z-10 ml-4 ${theme.textColorPrimary ? theme.textColorPrimary : "text-white" }`}><PanelLeftClose /></button>
    </div>
    </div>
  )
}
