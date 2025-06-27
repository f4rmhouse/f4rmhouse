/**
 * SideBar is shown on the dashboard for logged in users. It let's users navigate the 
 * f4rmhouse playground.
 */

"use client"
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import User from '@/app/microstore/User';
import ProductType from '../../types/ProductType';
import { BadgeCheck, Bot, BrainCircuit, ChevronRight, Hammer, HardDrive, LockKeyhole, QrCode, Server, Store as StoreIcon} from "lucide-react";
import { Delete, PanelLeftClose, PanelRightClose, Repeat2, Wrench } from 'lucide-react';
import { useTheme } from "../../../context/ThemeContext";
import { useAgent } from "../../../context/AgentContext";
import F4MCPClient from '@/app/microstore/F4MCPClient';
import { ServerSummaryType } from '@/app/components/types/MCPTypes';
import ServerSummary from './ServerSummary';
import { MCPConnectionStatus } from '../../types/MCPConnectionStatus';
import ConfirmModal from "../modal/ConfirmModal";
import MCPAuthHandler, { OAuthClient } from '@/app/MCPAuthHandler';

export default function RightSidebar() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const { selectedAgent, setSelectedAgent, client } = useAgent();

  const [qrImageURL, setQrImageURL] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [openList, setOpenList] = useState<boolean[]>(selectedAgent?.toolbox?.map(_ => false) || [])
  const [isOnline, setIsOnline] = useState<MCPConnectionStatus[]>(selectedAgent?.toolbox?.map(_ => ({ status: "connecting" })) || [])

  const [summary, setSummary] = useState<Map<string, ServerSummaryType>>(new Map())

  const [visible, setVisible] = useState<boolean>(false)
  
  // Track ping times for each server
  const [pingTimes, setPingTimes] = useState<{[key: string]: number}>({})

  // Track trusted servers
  const [trustedServers, setTrustedServers] = useState<{[key: string]: boolean}>({})

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loginToolIndex, setLoginToolIndex] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false)

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
    if (!selectedAgent || !session?.user) return;
    
    let newF4rmer = {...selectedAgent}
    newF4rmer.toolbox = selectedAgent.toolbox.filter((e:ProductType) => e.uti != uti)
    setSelectedAgent(newF4rmer)
  }

  const toggleToolSummary = (index: number) => {
    if (openList[index]) {
      setOpenList(openList.map((item, i) => 
        i === index ? false : item
      ));
    }
    else {
      setOpenList(openList.map((item, i) => 
        i === index ? true : item
      ));
      if(selectedAgent?.toolbox[index]){
        // Handle connection with proper error handling
        const tool = selectedAgent.toolbox[index];
        client?.getStructuredJSON(tool.uti).then((data) => {
          setSummary(new Map(summary.set(tool.uti, data)))
        })
      }
    }
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
    if (selectedAgent && session && !isConnecting) {
      setIsConnecting(true)
      setOpenList(selectedAgent.toolbox.map(_ => false))
      let _isOnline = selectedAgent.toolbox.map((_): MCPConnectionStatus => ({ status: "error" })) 
      let connectionStatus: MCPConnectionStatus
      // Connect to each tool server
      const connectToTool = async (uti:string, index:number) => {
        try {
          const tool = selectedAgent.toolbox[index];
          if(!(_isOnline[index].status == "connecting") && (tool.server.uri.startsWith("http://") || tool.server.uri.startsWith("https://"))) {
            // @ts-expect-error
            let user = new User(session?.user.email, session?.provider, session?.access_token) 
            if(!tool.server.uri.endsWith("/sse") && tool.server.transport == "sse") {
              client.setUser(user)
              connectionStatus = await client.connect(uti, tool.server.uri + "/sse", tool.server.transport)
            }
            else {
              client.setUser(user)
              connectionStatus = await client.connect(uti, tool.server.uri, tool.server.transport)
            }
            _isOnline = _isOnline.map((item, i) => i === index? connectionStatus : item)
            setIsConnecting(false)
          }
        } catch (error) {
          _isOnline = _isOnline.map((item, i) => i === index? { status: "error" } as MCPConnectionStatus : item)
          setIsConnecting(false)
        }
        setIsOnline(_isOnline)
      }
          
      selectedAgent.toolbox.map((tool, index) => connectToTool(tool.uti, index))
    }
  }, [selectedAgent, session])

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case "success":
        return <div className={`bg-green-500 rounded-full p-1 mt-auto ml-[-7px] border-2 border-${theme.secondaryColor?.replace("bg-", "")}`}></div>
      case "authenticate":
        return <div className={`bg-black rounded-full mt-auto ml-[-7px] p-1`}><LockKeyhole className="text-white" size={10}/></div>
      case "connecting":
        return <div className={`bg-blue-500 rounded-full p-1 mt-auto ml-[-7px] border-2 border-${theme.secondaryColor?.replace("bg-", "")} animate-pulse`}></div>
      case "error":
      default:
        return <div className={`bg-red-500 rounded-full p-1 mt-auto ml-[-7px] border-2 border-${theme.chatWindowStyle?.replace("bg-", "")}`}></div>
    }
  }

  const registerClient = async (uti: string, registerEndpoint: string, serverMetadata?: any) => {
    let redirect_uri = "http://localhost:3000/callback/mcp/oauth"
    
    const codeVerifier = MCPAuthHandler.generateCodeVerifier();
    const codeChallenge = await MCPAuthHandler.generateCodeChallenge(codeVerifier);
    
    // Store code verifier for token exchange
    localStorage.setItem('pkce_code_verifier', codeVerifier);
    
    // Base client configuration following RFC 7591
    let oauthClientParams: OauthClientType = {
      id: uti,
      client_name: "MCP Client Application",
      redirect_uris: [redirect_uri],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      scope: "email",
      token_endpoint_auth_method: "none",
      application_type: "native"
    };

    // Adapt based on server metadata if available
    const authHandler = new OAuthClient(oauthClientParams, serverMetadata);
    const encodedURL = registerEndpoint;
    authHandler.create(codeChallenge)
    const authUrl = await authHandler.register(encodedURL)
    window.open(authUrl, '_blank')

  }

  const authenticateUser = async (tool: ProductType, serverMetadata?: any) => {
    let oauthClientParams: OauthClientType = {
      id: tool.uti,
      client_name: "MCP Client Application",
      redirect_uris: ["http://localhost:3000/callback/mcp/oauth"],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      scope: "email",
      token_endpoint_auth_method: "none",
      application_type: "native"
    }; 

    const authHandler = new OAuthClient(oauthClientParams, serverMetadata);
    const authUrl = authHandler.getAuthorizationURL(tool.uti, "github", oauthClientParams.redirect_uris[0], oauthClientParams.scope)
    window.open(authUrl, '_blank')
  }

  return (
    <div>
    <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} className={`p-2 fixed right-0 w-[50%] sm:w-[25%] mt-9 h-[92vh] z-10 top-0 border-${theme.secondaryColor?.replace("bg-", "")} ${theme.chatWindowStyle} transition-transform duration-300 ease-in-out rounded-md transform p-3 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className='h-[95%] flex flex-col'>
        <p className={`pl-2 pb-2 flex text-base flex mb-2 ${theme.textColorPrimary}`}><span className="mr-2 bg-yellow-500 rounded-md p-1 text-yellow-900"><Bot size={20}/></span><span className='my-auto'>{selectedAgent?.title}</span></p>
        <p className={`pl-2 text-base flex mb-2 ${theme.textColorPrimary} w-[100%]`}>MCP Servers</p>
        {selectedAgent?.toolbox ?
        <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
          {selectedAgent.toolbox.map((tool, index) => (
            <div key={index} className="pl-1 pb-2">
              <div onClick={() => toggleToolSummary(index)} className={`flex w-full rounded-md}`}>
                <img alt="action-thumbnail" className="ml-2 h-6 my-auto rounded-full aspect-square object-cover" height={15} src={"https://f4-public.s3.eu-central-1.amazonaws.com/showcases/" + tool.uti + "/thumbnail.jpg"}/>
                {isOnline[index] && getStatusIndicator(isOnline[index].status)}
                <p className={`ml-2 text-base hover:cursor-pointer ${theme.textColorPrimary} w-[90%]`}>{tool.title}</p>
                <ChevronRight 
                  size={20} 
                  className={`cursor-pointer transition-all hover:text-red-400 ${theme.textColorPrimary} mr-2 m-auto transform transition-transform duration-200 ${openList[index] ? 'rotate-90' : ''}`}
                />
              </div>
              <div className="">
                <p>{openList[0]}</p>
                {openList[index] ? 
                  <div className={`flex flex-col text-sm ${theme.textColorSecondary} p-0 pr-2 pl-2 ${theme.secondaryColor}`}>
                    <ServerSummary summary={summary.get(tool.uti)}/>
                    {isOnline[index].status === "error" ? (
                      <div className="text-xs text-red-400 mt-1 mb-2">
                        <p>Connection error: Unable to connect to server</p>
                        <button 
                          className="text-xs bg-neutral-700 hover:bg-neutral-600 text-white px-2 py-1 rounded mt-1"
                        >
                          Retry connection
                        </button>
                      </div>
                    ) : isOnline[index].status === "connecting" ? (
                      <div className="text-xs text-blue-400 mt-1 mb-2 flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div>
                        <p>Connecting to server...</p>
                      </div>
                    ) : isOnline[index].status === "authenticate" ? (
                      <div className="text-xs mt-1 mb-2">
                        <p>Authentication required</p>
                        <button 
                          className="text-xs bg-black hover:bg-neutral-500 text-white px-2 py-1 rounded mt-1"
                          onClick={() => {
                            setLoginToolIndex(index);
                            setShowConfirmModal(true);
                          }}
                        >
                          Login
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full mt-1">
                        <button 
                          onClick={() => {
                            client?.ping(tool.uti).then(result => {
                              if (result && typeof result.pingTimeMs === 'number') {
                                setPingTimes(prev => ({
                                  ...prev,
                                  [tool.uti]: result.pingTimeMs
                                }));
                              }
                            });
                          }} 
                          className="transition-all text-xs bg-blue-500 bg-opacity-50 hover:bg-opacity-100 text-white font-bold px-2 py-1 rounded"
                        >
                          Ping
                        </button>
                        {pingTimes[tool.uti] !== undefined && (
                          <span className="text-xs ml-2">
                            {pingTimes[tool.uti].toFixed(2)}ms
                          </span>
                        )}
                      </div>
                    )}
                    <label className="mt-5 mb-2 inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={trustedServers[tool.uti] || false} 
                        onChange={() => setTrustedServers(prev => ({...prev, [tool.uti]: !prev[tool.uti]}))}
                        className="rounded"
                      />
                      <span className={`ml-2 text-sm font-medium ${theme.textColorPrimary}`}>I trust this server</span>
                    </label>
                    {trustedServers[tool.uti] && (
                      <div className={`rounded text-xs ${theme.textColorSecondary}`}>
                        You're allowing an LLM to perform all of these servers actions on your behalf without needing your permission.
                      </div>
                    )}
                    <button onClick={() => alert("Do sign out")}>Sign out</button>
                    <button onClick={() => removeTool(tool.uti)}>remove</button>
                  </div>
                  :
                  <></>
                }
              </div>
            </div>
          ))}
        </div>
        :
        <p>No tools have been added yet</p>
        }
        <div className='flex gap-2 w-full pt-2'>
        <Link href="/store" className={`hover:${theme.textColorPrimary} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer flex ${theme.textColorSecondary} w-full text-base gap-3 my-auto`}><StoreIcon size={20}/><BadgeCheck className='ml-[-20px] rounded-full bg-blue-500 text-white' size={12}/> Browse verified servers</Link>
      </div>
        <div className=''>
        <Link href="/" className={`hover:${theme.textColorPrimary} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer flex ${theme.textColorSecondary} w-full text-base gap-3 my-auto`}><HardDrive size={20}/> Add local server</Link>
        <Link href="/" className={`hover:${theme.textColorPrimary} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer flex ${theme.textColorSecondary} w-full text-base gap-3 my-auto`}><BrainCircuit size={20}/> Add local model</Link>
          <button className={`hover:${theme.textColorPrimary} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer my-auto flex ${theme.textColorSecondary} w-full text-base gap-3`} onClick={() => getQR()}><QrCode size={20}/> Generate QR code</button>
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
    {showConfirmModal && (
      <ConfirmModal 
        open={showConfirmModal}
        setIsOpen={setShowConfirmModal}
        title="Authentication Warning"
        content="You are about to authenticate with an external MCP server. f4rmhouse can't enforce any security measures on the server side. Only autheticate to servers that you trust, and ALWAYS verify that the data sent by the LLM is information you are comfortable sharing with the server before sending it. All requests are encrypted end-to-end so no one other than the MCP server and yourself get access to it."
        action={async () => {
          // Handle the actual login logic here
          if (loginToolIndex !== null && selectedAgent) {
            const tool = selectedAgent.toolbox[loginToolIndex];
            let clientRegistrationURL = isOnline[loginToolIndex].remoteAuthServerMetadata?.registration_endpoint

            if(clientRegistrationURL) {
              registerClient(tool.uti, clientRegistrationURL, isOnline[loginToolIndex].remoteAuthServerMetadata)
            }
            else {
              authenticateUser(tool, isOnline[loginToolIndex].remoteAuthServerMetadata)
            }
          }
          setShowConfirmModal(false);
          setLoginToolIndex(null);
        }}
      />
    )}
    </div>
  )
}
