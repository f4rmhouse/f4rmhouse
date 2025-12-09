"use client"
import SectionType from "../components/types/SectionType";
import SmallAppCardGrid from "../components/grid/SmallAppCardGrid";
import InfoCardGrid from "../components/grid/InfoCardGrid";
import Banner from "../components/banner/Banner";
import Link from "next/link";
import { Hammer } from "lucide-react";
import PostHogPageView from "../PostHogPageView";
import { useTheme } from "../context/ThemeContext";
import LargeAppCardGrid from "../components/grid/LargeAppCardGrid";
import { useEffect, useState } from "react";
import F4rmerSelectModal from "../components/ui/modal/F4rmerSelectModal";
import ProductType from "../components/types/ProductType";
import { useSession } from "next-auth/react";
import Store from "../microstore/Store";
import User from "../microstore/User";

const AppMocks = {
  "bApps": {
    "type": "small_cards",
    "header": "Apps to streamline your business",
    "content": "trending"
  },
}

export default function Home() {

  const { theme } = useTheme();
  const { data: session, status } = useSession();

  const [repoServers, setRepoServers] = useState([])
  const [isF4rmerModalOpen, setIsF4rmerModalOpen] = useState(false)
  const [selectedServer, setSelectedServer] = useState<any>(null)

  // let product: ProductType = {
  //   uid: "randomd-uuid",
  //   title: serverName,
  //   uti: serverName,
  //   description: serverDescription,
  //   rating: 0,
  //   price: 0,
  //   thumbnail: "none",
  //   overview: "none",
  //   communityURL: "none",
  //   reviews: 0,
  //   developer: "local",
  //   pricingType: "none",
  //   releaseType: "none",
  //   version: "1",
  //   showcase: [],
  //   tags: [],
  //   deployed: false,
  //   deployment_type: selectedTransport,
  //   server: {
  //     transport: selectedTransport,
  //     uri: serverUrl,
  //     authorization: {
  //       authorization_url: "",
  //       token_url: "",
  //       revocation_url: "",
  //       redirect_url: ""
  //     },
  //     auth_provider: authProvider
  //   }
  // } 

  const [currentProduct, setCurrentProduct] = useState<ProductType>({
    uid: "",
    title: "",
    uti: "",
    description: "",
    rating: 0,
    price: 0,
    thumbnail: "",
    overview: "",
    communityURL: "",
    reviews: 0,
    developer: "",
    pricingType: "",
    releaseType: "",
    version: "",
    showcase:[],
    tags: [],
    deployed: false,
    deployment_type: "",
    server: {
      transport: "",
      uri:"", 
      authorization: {
        authorization_url: "", 
        token_url: "", 
        revocation_url: "", 
        redirect_url: "", 
      },
      auth_provider: "oauth"
    } 
  })

  useEffect(() => {
    getServers().then((res) => setRepoServers(res.servers.filter((r:any) => r.remotes != "")))
  },[])

  const getServers = async () => {
    let res = await fetch("/api/index")  
    return res.json()
  } 

  const addToolToToolbox = async (agent: any) => {
    let product = {
      uid: "mcp-repo-" + selectedServer.name.replace("/", "-"),
      title: selectedServer.name.replace("/", "-"),
      uti: selectedServer.name.replace("/", "-"),
      description: selectedServer.description,
      rating: 0,
      price: 0,
      thumbnail: "https://images.icon-icons.com/3685/PNG/512/github_logo_icon_229278.png",
      overview: "none",
      communityURL: "none",
      reviews: 0,
      developer: "mcp-repo",
      pricingType: "none",
      releaseType: "none",
      version: "1",
      showcase:[],
      tags: [],
      deployed: false,
      deployment_type: selectedServer.remotes[0].type.replace("-", "_"),
      server: {
        transport: selectedServer.remotes[0].type.replace("-", "_"),
        uri:selectedServer.remotes[0].url, 
        authorization: {
          authorization_url: "", 
          token_url: "", 
          revocation_url: "", 
          redirect_url: "", 
        },
        auth_provider: "oauth"
      } 
    }

    let store = new Store()
    if(session && session.user && session.user.email){
      let selectedAgent = await store.getF4rmer(session.user?.email, agent)
      if(selectedAgent) {
        selectedAgent?.toolbox.push(product)
        console.log("f4rmer: ", selectedAgent)
        console.log("USER: ", session.user)
        // @ts-expect-error
        let user = new User(session.user.email, session.provider, session.access_token)
        user.updateF4rmer(selectedAgent).then((e:any) => alert("Tool added successfully"))
      }
    }
  } 
  

  const renderSection = (type: string, section: SectionType) => {

    switch (type) {
      case "small_cards":
        return (
          <div className="">
            <SmallAppCardGrid title="Verified Servers" apps={section.content}/>
          </div>
        )
      case "medium_cards":
        return (
          <div className="">
            <LargeAppCardGrid apps={section.content} />
          </div>
        )
      case "info_cards":
        return(
          <div className="">
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
      <div className="max-w-screen-2xl w-[100vw] sm:w-[95vw] justify-between mx-auto pt-12 md:pt-16">
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
          <h2 className={`m-auto sm:w-[40%] mt-10 text-xl ${theme.textColorPrimary}`}>All Servers</h2>
          <div>
          {
            repoServers.map((server:any, i:number) => {
              return(
                <div key={i} className="sm:grid sm:grid-cols-1 mt-5 gap-2 w-[90%] sm:w-[40%] m-auto flex">
                  <div className="flex">
                    <img alt="action-thumbnail" className="h-10 my-auto rounded-full aspect-square object-cover" height={10} src="https://images.icon-icons.com/3685/PNG/512/github_logo_icon_229278.png"/>
                    <div className="w-full">
                      <div className="mt-auto mb-auto ml-4">
                        <p className={`text-xs ${theme.textColorSecondary}`}>{server.remotes.map((e:any) => {
                            return JSON.stringify(e.type).replaceAll('"', "") + " "
                        })}</p>
                        <p className={`group-hover:underline text-sm pb-1 ${theme.textColorPrimary}`}>{server.name.split("/")[1]}</p>
                        <div className="flex w-full">
                          <p className={`text-xs ${theme.textColorSecondary}`}>{server.description}</p>
                          <button onClick={() => {setSelectedServer(server);setIsF4rmerModalOpen(true)}} className={`rounded-full text-xs border ml-auto ${theme.textColorSecondary} hover:${theme.hoverColor} px-4 h-5 flex items-center`}>Add</button>
                        </div>
                      </div>
                      <p className={`ml-4 w-full text-xs ${theme.textColorSecondary}`}>Remotes: {server.remotes.map((e:any) => {
                        return JSON.stringify(e.url).replaceAll('"', "") + " "
                      })}</p>
                    </div>
                  </div>
                </div>
              )
            })
          }
          <F4rmerSelectModal
            open={isF4rmerModalOpen}
            onClose={() => setIsF4rmerModalOpen(false)}
            product={null}
            onAddToF4rmer={addToolToToolbox}
          />
          </div>
        </div>
        <footer className="my-10 flex">
          <Link href="/submit" className={`hover:${theme.textColorPrimary} mx-auto ${theme.textColorSecondary}`}>Submit a Server</Link>
        </footer>
      </div>
    </div>
  );
}
