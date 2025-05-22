"use client"
import PricingCard from "@/app/components/card/PricingCard";
import ReviewProgress from "@/app/components/product/ReviewProgress";
import Review from "@/app/components/product/Review";
import Property from "@/app/components/product/Property";
import ImageBanner from "@/app/components/banner/PrimitiveImageBanner";
import ProductType from "@/app/components/types/ProductType";
import { useEffect, useState, use } from "react";
import OCI from "@/app/microstore/OCI";

import Store from "@/app/microstore/Store";
import ReviewType from "@/app/components/types/ReviewType";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import { remark } from 'remark';
import html from 'remark-html';
import { ArrowLeft, UsersRound } from "lucide-react";

type Params = Promise<{ slug: string }>

/**
 * DetailPage shows all the information about a product that a user needs to make a decision.
 * @param param0 
 * @returns 
 */
export default function DetailPage({ params }: { params: Params }) {
    const { data: session, status } = useSession();
    const oci = new OCI();
    const store = new Store();
    const ps = use(params)
    var sc = [
      "https://cdnp.kittl.com/51d12197-8a4c-47ad-a1ea-96d4b1a329b0_kittl-ai-image-generator-2-dalle-3-black-model-bpoc-galactic-fashion-retro-space-ship-illustration.jpg?auto=compress,format",
      "https://images.ctfassets.net/kftzwdyauwt9/Nw3a33C8bfO7VJMCTNgSz/3633c190fd7309970a9ac85d7c7d3989/avocado-square.jpg?w=3840&q=90&fm=webp",
      "https://static1.srcdn.com/wordpress/wp-content/uploads/2022/06/DALL-E-mini-Shiba-inu.jpg",
      "https://miro.medium.com/v2/resize:fit:1400/1*0FwivlgxFRvSoPFl5xQpFw.png",
      "https://images.ctfassets.net/kftzwdyauwt9/5VVBxDWhs6Cp6REifYnloS/81c02b5d73db5dc85365e15feb3b58e4/Anastronautridingahorseinaphotorealisticstyle9.jpg",
      "https://upload.wikimedia.org/wikipedia/en/4/41/DALL-E_2_artificial_intelligence_digital_image_generated_photo.jpg",
      "https://s.yimg.com/ny/api/res/1.2/0wl0v9nGN6azAn0SmTOKxQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTQ2Nw--/https://s.yimg.com/os/creatr-uploaded-images/2022-04/cacc8fa0-b652-11ec-af75-438ac34a567d"
    ]

    const [product, setProduct] = useState<ProductType|null>(null)
    const [reviews, setReviews] = useState<ReviewType[]>([]);
    const [serverError, setServerError] = useState<boolean>(false)

    const [showcase, setShowcase] = useState<string[]>([])
    const [readme, setReadme] = useState<string>("") 
    const [histogram, setHistogram] = useState<number[]>([0,0,0,0,0]) // x = review rating, y = amount
    const [rating, setRating] = useState<number>(0.0)
    const [ratingDescriptions, setRaingDescriptions] = useState<string[]>(["No rating", "😡 Bad", "😐 OK", "🙂 Decent", "😄 Solid", "🤩 Amazing"])
    const [requestsAmt, setRequestAmt] = useState<number>(0)
    const [noActionFound, setNoActionFound] = useState<boolean>(false)
    const [noServerConnection, setNoServerConnection] = useState<boolean>(false)

    useEffect(() => {
      try{
      oci.getByUTI(ps.slug).then(e => {
        const res = e.Message;
        if(e.Code == 201){
          setNoActionFound(true)
          return
        }
        res.showcase = sc;
        getShowcase(res.uti)
        setProduct(res)
        axios.get(`https://f4-public.s3.eu-central-1.amazonaws.com/showcases/${res.uti}/README.md`).then(async e => {
          const processedContent = await remark()
            .use(html)
            .process(e.data);
          setReadme(processedContent.toString())
        })
        store.getActionAnalytics(res.uti).then(e => setRequestAmt(e.length))
      }).catch(error => {
        console.error(error)
        setNoActionFound(true)
      })
      
      if (session != null && session != undefined && session.user != null && session.user != undefined && session?.user) {
        store.getReviews(String(session.user.email), ps.slug).then(e => {
          setReviews(e.Reviews)
        }).catch(err => setServerError(true))

      } 
      else {
        store.getReviews("", ps.slug).then(e => {
          setReviews(e.Reviews)
        }).catch(err => setServerError(true))
      }
    } catch(e:any) {
      setNoActionFound(true)
      return
    }
    },[session])

    useEffect(() => {
      if(reviews.length > 0) {
        let _tmp = [0,0,0,0,0]
        let _tmpRating = 0.0
        reviews.map(r => {
          _tmp[Number(r.value)-1] += 1/reviews.length
          _tmpRating += Number(r.value)
        })
        setHistogram(_tmp)
        setRating(Math.floor(_tmpRating/reviews.length*100)/100)
      }
    },[reviews])

    const getReviewDescription = (rs:number) => {
      if(rs < 5) {
        return "Minimal"
      }
      if (rs < 10) {
        return "Few"
      }
      return "Massive"
    }

    const getAnalyticsDescription = (amt:number) => {
      if (amt < 10) {
        return "Almost none"
      }
      
      if(amt < 100) {
        return "Minimal"
      }
      
      if (amt < 1000) {
        return "Moderate"
      }

      return "High"
    }

    const getShowcase = (uti:string) => {
        oci.getShowcase(uti).then(imgs => {
          if (imgs.length > 0){
            
            let items = imgs
              .filter((img:string) => !img.toLowerCase().includes("thumbnail") && !img.toLocaleLowerCase().includes("readme"))
              .map((img:string) => "https://f4-public.s3.eu-central-1.amazonaws.com/" + img)
            
            setShowcase(items)
          }
          else {
            setShowcase([])
          }
        })
    }

    return (
      <div className="m-auto">
        <div className="relative max-w-screen-2xl w-[90vw] justify-between mx-auto pt-20">
          {!noActionFound ?
          <div>
          {product?
          <>
          <div className="flex flex-col sm:flex-row mb-2">
          <Link href="/store" className="transition-all hover:bg-neutral-700 cursor-pointer text-neutral-500 hover:text-neutral-300 rounded-full mt-auto mb-auto p-2 mr-5"><ArrowLeft/></Link>
          <div className="flex">
            <img className="h-10 rounded-full aspect-square object-cover" height={10} src={"https://f4-public.s3.eu-central-1.amazonaws.com/showcases/" + product.uti + "/thumbnail.jpg"}/>
            <div className="pl-5">
              <p className="text-xs font-mono text-neutral-400">{product.uid}</p>
              <h1 className="text-sm sm:text-2xl">{product.title}</h1>
              <p className="text-neutral-400 text-xs sm:text-sm">{product.description}</p>
              <p className="text-neutral-400 text-xs sm:text-sm">{product.uti} {product.version}</p>
            </div>
          </div>
            <div className="hidden sm:ml-auto">
              <button className="transition-all bg-opacity-50 bg-blue-500 text-white p-2 pr-4 pl-4 text-sm rounded-md text-blue-100 hover:bg-blue-500 hover:text-white flex"><UsersRound className="mr-2 m-auto" size={15}/>Community</button>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-12 gap-2 mb-5">
            <div className="sm:col-span-8 rounded-xl relative">
              {showcase.length > 0 ? 
                <ImageBanner images={showcase} />
                :
                <p>No showcase</p>
              }
            </div>
            <div className="col-span-12 md:col-span-4 p-5 flex-col">
              <div className="border p-2 rounded border-neutral-800 bg-zinc-900">
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: readme}} />
                <p>{product.overview}</p>
              </div>
              <div className="w-full mt-2">
                <PricingCard product={product} pricing={{name: "", type: "primary", features: [], disclaimer: "", cta: "+ Add", deal: "deal", price: 0.01, pricePeriod: "request"}}/>
              </div>
            </div>
          </div>
          <div className="gap-8 mt-2 sm:flex grid grid-cols-3 border border-neutral-800 bg-zinc-900 rounded p-4 justify-between">
            <Property type="Rating" title={String(rating)} subtitle={ratingDescriptions[Math.round(rating)]}/>
            <Property type="Reviews" title={String(reviews.length)} subtitle={getReviewDescription(reviews.length)}/>
            <Property type="Developer" title={String(product.developer)} subtitle="A+"/>
            <div className="sm:hidden">
              <Property type="" title="" subtitle=""/>
            </div>
            <Property type="Usage in 24hrs" title={String(requestsAmt)} subtitle={getAnalyticsDescription(requestsAmt)}/>
            <div className="sm:hidden">
              <Property type="" title="" subtitle=""/>
            </div>
          </div>
          <div className="mt-2 mb-10">
            <h2 className="text-xl mt-5 font-bold mb-5">Reviews & ratings</h2>
            <div className="sm:grid sm:grid-cols-12 gap-2">
              <div className="col-span-3 bg-zinc-900 self-start border border-neutral-800 rounded p-2">
                <div>
                  <div className="flex">
                    <h3 className="text-8xl font-bold opacity-80 font-sans">{rating}</h3>
                    <p className="mt-auto">out of 5</p>
                  </div>
                  <ReviewProgress value="5" percentage={`${Math.floor(histogram[4]*100)}%`}/> 
                  <ReviewProgress value="4" percentage={`${Math.floor(histogram[3]*100)}%`}/> 
                  <ReviewProgress value="3" percentage={`${Math.floor(histogram[2]*100)}%`}/> 
                  <ReviewProgress value="2" percentage={`${Math.floor(histogram[1]*100)}%`}/> 
                  <ReviewProgress value="1" percentage={`${Math.floor(histogram[0]*100)}%`}/> 
                </div>
                <div className="mt-10 border-t border-neutral-600">
                  <h2 className="font-bold">Review this product</h2>
                  <p className="text-sm">Share your thoughts with other users</p>
                  <Link href={`/dashboard/create/review/${product.uti}`} className="">
                    <p className="text-center rounded-full w-[100%] border mt-5 border-neutral-500 text-center hover:bg-gray-800 transition-all text-sm p-1">Write a review</p>
                  </Link>
                </div>
              </div>
              <div className="col-span-9">
                <div>
                  <p>{reviews.length} Reviews</p>
                </div>
                {serverError || reviews.length == 0 ?
                  <div className="text-center">
                    <p className="text-4xl">😔</p>
                    <p className="font-mono">No reviews found for this tool.</p>
                  </div>
                  :
                  <>
                    {reviews.map((review, i) => {
                      if (review != undefined) {
                        return <Review key={i} review={review} />
                      }
                    })}
                  </>
                }
              </div>
            </div>
          </div>
          </>
          :
          <div className="grid grid-cols-3 gap-10 h-6 animate-pulse">
            <div className="h-[5vh] col-span-3 bg-neutral-800 rounded-xl"></div>
            <div className="h-[60vh] col-span-2 bg-neutral-800 rounded-xl"></div>
            <div className="h-[60vh] col-span-1 bg-neutral-800 rounded-xl"></div>
            <div className="h-[5vh] col-span-3 bg-neutral-800 rounded-xl"></div>
            <div className="h-[50vh] col-span-3 bg-neutral-800 rounded-xl"></div>
          </div>
          }
          </div>
          :
          <div className="flex"><p className="m-auto text-xl">This action doesn't exist 😞</p></div>}
        </div>
      </div>
    );
  }
  