"use client"
import { ChevronRight, LockKeyhole, LogOut, Trash } from 'lucide-react';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import ProductType from '../../types/ProductType';
import { useAgent } from '@/app/context/AgentContext';
import { MCPConnectionStatus } from '../../types/MCPConnectionStatus';
import ServerSummary from './ServerSummary';
import ConfirmModal from '../modal/ConfirmModal';
import MCPAuthHandler, { OAuthClient } from '@/app/MCPAuthHandler';
import User from '@/app/microstore/User';
import { useSession } from "next-auth/react";
import { ServerSummaryType } from '../../types/MCPTypes';
import { Toaster, toast } from 'sonner';

export default function RightSidebarItem(
  {
    id, 
    tool, 
    trustedServers, 
    setTrustedServers
  }
  : 
  {
    id: number, 
    tool: ProductType, 
    trustedServers: { [key: string]: boolean }, 
    setTrustedServers: Dispatch<SetStateAction<{ [key: string]: boolean }>>
  }) 
  {
  const { theme } = useTheme()
  const { selectedAgent, setSelectedAgent, client } = useAgent();
  const { data: session } = useSession();

  const [pingTime, setPingTime] = useState<number>(0)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [summary, setSummary] = useState<ServerSummaryType|null>(null)
  const [isOnline, setIsOnline] = useState<MCPConnectionStatus>({ status: "error" })
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)

  useEffect(() => {
    if (tool) {
      setIsExpanded(false)
      connectToTool(tool.uti)
    }
  }, [tool, session, selectedAgent])

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

  const toggleToolSummary = (index: number) => {
    if (isExpanded) {
      setIsExpanded(false)
    }
    else {
      setIsExpanded(true)
      if(selectedAgent?.toolbox[index]){
        // Handle connection with proper error handling
        const tool = selectedAgent.toolbox[index];
        client?.getStructuredJSON(tool.uti).then((data) => {
          setSummary(data)
        })
      }
    }
  }

  const registerClient = async (
    uti: string, 
    registerEndpoint: string, 
    serverMetadata?: any) => 
  {
    let redirect_uri = window.location.origin + "/callback/mcp/oauth"
    
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

    console.log("oauthClientParams", oauthClientParams)

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
      redirect_uris: ["https://app.f4rmhouse.com/callback/mcp/oauth", "http://localhost:3000/callback/mcp/oauth"],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      scope: "email",
      token_endpoint_auth_method: "none",
      application_type: "native"
    }; 

    console.log("oauthClientParams", oauthClientParams)

    const authHandler = new OAuthClient(oauthClientParams, serverMetadata);
    const authUrl = authHandler.getAuthorizationURL(
      tool.uti, 
      "github", 
      oauthClientParams.redirect_uris[0], 
      oauthClientParams.scope
    )
    window.open(authUrl, '_blank')
  }

  const login = async () => {
    if(!session) {
      alert("You need to login or sing up to use tools that require authentication.")
      return;
    }
    if (tool) {

      let clientRegistrationURL = isOnline
        .remoteAuthServerMetadata
        ?.registration_endpoint

      if(clientRegistrationURL) {
        registerClient(
          tool.uti, 
          clientRegistrationURL, 
          isOnline.remoteAuthServerMetadata
        )
      }
      else {
        authenticateUser(
          tool, 
          isOnline.remoteAuthServerMetadata
        )
      }
    }
    setShowConfirmModal(false);
  }

  const connectToTool = async (uti: string) => {

    let _isOnline = { status: "connecting" } as MCPConnectionStatus
    let connectionStatus: MCPConnectionStatus
    setIsOnline(_isOnline)

    try {

      const startsWithHTTP = tool.server.uri.startsWith("http")

      // Only connect with remote servers (no stdio)
      if(startsWithHTTP){
        let user = new User("undefined", "undefined", "undefined") 
        if(session) {
          // @ts-expect-error
          user = new User(session?.user.email, session?.provider, session?.access_token) 
        }
        client.setUser(user)

        connectionStatus = await client.connect(
          uti, 
          tool.server.uri, 
          tool.server.transport, 
          tool.server.auth_provider
        )

        _isOnline = connectionStatus
      }
    } catch (error) {
      _isOnline = { status: "error" } as MCPConnectionStatus
      toast.error('Failed to connect MCP server: ' + tool.uti)
    }
    setIsOnline(_isOnline)
  }

  const signOut = async (uti: string) => {
    if(!session?.user) return;
    // @ts-expect-error
    const user = new User(session?.user.email, session?.provider, session?.access_token) 
    await user.deleteToken(uti).then(() => {
      connectToTool(uti); 
      client.close(uti)
    })  
  }

  const removeTool = (uti:string) => {
    if (!selectedAgent || !session?.user) return;
    
    let newF4rmer = {...selectedAgent}
    newF4rmer.toolbox = selectedAgent.toolbox.filter((e:ProductType) => e.uti != uti)
    // @ts-expect-error
    let user = new User(session.user.email, session.provider, session.access_token)
    user.updateF4rmer(newF4rmer).then(() => {
      alert("Tool removed successfully")
      setSelectedAgent(newF4rmer)
    })
  }

  return (
    <div key={id} className="pl-1 pb-2">
      <div onClick={() => toggleToolSummary(id)} className={`flex w-full rounded-md}`}>
        <img alt="?" className="ml-2 h-6 my-auto rounded-full aspect-square object-cover" height={15} src={"https://f4-public.s3.eu-central-1.amazonaws.com/showcases/" + tool.uti + "/thumbnail.jpg"}/>
        {isOnline && getStatusIndicator(isOnline.status)}
        <p className={`ml-2 text-base hover:cursor-pointer ${theme.textColorPrimary} w-[90%]`}>{tool.title}</p>
        <ChevronRight 
          size={20} 
          className={`cursor-pointer transition-all hover:text-red-400 ${theme.textColorPrimary} mr-2 m-auto transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
      </div>
      <div className="">
        {isExpanded ? 
          <div className={`flex flex-col text-sm ${theme.textColorSecondary} rounded-md shadow p-0 pr-2 pl-2 ${theme.secondaryColor}`}>
            {summary && <ServerSummary summary={summary}/>}
            {isOnline.status === "error" ? (
              <div className="text-xs text-red-400 mt-1 mb-2">
                <p>Connection error: Unable to connect to server</p>
                <button 
                  className="text-xs bg-neutral-700 hover:bg-neutral-600 text-white px-2 py-1 rounded mt-1"
                  onClick={() => connectToTool(tool.uti)}
                >
                  Retry connection
                </button>
              </div>
            ) : isOnline.status === "connecting" ? (
              <div className="text-xs text-blue-400 mt-1 mb-2 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div>
                <p>Connecting to server...</p>
              </div>
            ) : isOnline.status === "authenticate" ? (
              <div className="text-xs mt-1 mb-2">
                <p>Authentication required</p>
                <button 
                  className="text-xs bg-black hover:bg-neutral-500 text-white px-2 py-1 rounded mt-1"
                  onClick={() => {
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
                        setPingTime(result.pingTimeMs)
                      }
                    });
                  }} 
                  className="transition-all text-xs bg-blue-500 bg-opacity-50 hover:bg-opacity-100 text-white font-bold px-2 py-1 rounded"
                >
                  Ping
                </button>
                {pingTime !== undefined && (
                  <span className="text-xs ml-2">
                    {pingTime.toFixed(2)}ms
                  </span>
                )}
              </div>
            )}
            {isOnline.status === "success" && (
              <label className="mt-5 mb-2 inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={trustedServers[tool.uti] || false} 
                  onChange={() => setTrustedServers(prev => ({...prev, [tool.uti]: !prev[tool.uti]}))}
                  className="rounded"
                />
                <span className={`ml-2 text-sm font-medium ${theme.textColorPrimary}`}>I trust this server</span>
                </label>
              )}
            {trustedServers[tool.uti] && (
              <div className={`rounded text-xs ${theme.textColorSecondary}`}>
                You're allowing an LLM to perform all of these servers actions on your behalf without needing your permission.
              </div>
            )}
            <div className="flex">
              {isOnline.status === "success" && (
                <button className={`${theme.textColorPrimary} hover:${theme.hoverColor} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer ${theme.textColorSecondary} text-base gap-1 my-auto flex text-xs`} onClick={() => signOut(tool.uti)}><LogOut size={15} /> Sign out</button>
              )}
              <button className={`${theme.textColorPrimary} hover:${theme.hoverColor} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer ${theme.textColorSecondary} text-base gap-1 my-auto flex text-xs`} onClick={() => removeTool(tool.uti)}><Trash className="m-auto" size={15} /> Remove</button>
            </div>
          </div>
          :
          <></>
        }
      </div>
      {showConfirmModal && (
        <ConfirmModal 
          open={showConfirmModal}
          setIsOpen={setShowConfirmModal}
          title="Authentication Warning"
          content="You are about to authenticate with an external MCP server. f4rmhouse can't enforce any security measures on the server side. All requests are encrypted end-to-end so no one other than the MCP server and yourself get access to it."
          action={login}
        />
      )}
    </div>
  )
}