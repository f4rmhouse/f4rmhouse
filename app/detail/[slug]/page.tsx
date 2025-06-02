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
import { ArrowLeft, UsersRound, Star, ShoppingCart, Heart, Shield, Award, CheckCircle2, PackagePlus } from "lucide-react";

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
    const [endpoints, setEndpoints] = useState<any[]>([])

    useEffect(() => {
      try{
      oci.getByUTI(ps.slug).then(e => {
        const res = e.Message;
        console.log(res)
        if(e.Code == 201){
          setNoActionFound(true)
          return
        }
        res.showcase = [];
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
      <div className="m-auto bg-zinc-950">
        <div className="relative max-w-screen-2xl w-[95vw] justify-between mx-auto pt-10">
          {!noActionFound ?
          <div>
          {product?
          <>
          <div className="flex flex-row mb-4 text-sm text-neutral-400 border-b border-neutral-800 pb-2">
            <Link href="/store" className="hover:text-blue-400 transition-colors flex items-center"><ArrowLeft size={14} className="mr-1"/>Back to Store</Link>
            <span className="mx-2">/</span>
            <Link href="/store/category" className="hover:text-blue-400 transition-colors">AI Tools</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-300">{product.title}</span>
          </div>
          <div className="sm:grid sm:grid-cols-12 gap-6 mb-8">
            <div className="sm:col-span-5 lg:col-span-7 rounded-lg overflow-hidden bg-zinc-900 border border-neutral-800 sticky top-5 self-start">
              {showcase.length > 0 ? 
                <div className="relative">
                  <ImageBanner images={showcase} />
                </div>
                :
                <div className="aspect-square flex items-center justify-center bg-zinc-900 border-neutral-800">
                  <img 
                    className="w-3/4 h-3/4 object-contain opacity-90" 
                    src={"https://f4-public.s3.eu-central-1.amazonaws.com/showcases/" + product.uti + "/thumbnail.jpg"}
                    alt={product.title}
                  />
                </div>
              }
            </div>
            
            <div className="col-span-12 sm:col-span-7 lg:col-span-5 flex flex-col mt-4 sm:mt-0">
              <div className="mb-4">
                <div className="flex items-center">
                  <p className="text-xs font-medium bg-blue-600 text-white px-2 py-0.5 rounded mr-2">VERIFIED</p>
                  <p className="text-xs font-mono text-neutral-400">{product.uid}</p>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-1">{product.title}</h1>
                
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"} />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-300 mr-1">{rating}</span>
                  <a href="#reviews" className="text-sm text-blue-400 hover:underline">({reviews.length} reviews)</a>
                  <span className="mx-2 text-neutral-600">|</span>
                  <span className="text-sm text-neutral-300">{requestsAmt} uses in last 24h</span>
                </div>
                <p className="text-neutral-400 text-xs">Version {product.version} • By <span className="text-blue-400 hover:underline cursor-pointer">{product.developer}</span></p>
              </div>
              
              <div className="bg-zinc-900 border border-neutral-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xl font-bold text-white">$0.01 <span className="text-sm font-normal text-neutral-400">per request</span></p>
                    <div className="flex items-center mt-1">
                      <CheckCircle2 size={14} className="text-green-500 mr-1" />
                      <span className="text-sm text-green-500">Deployed</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-md mr-2 transition-colors flex items-center">
                      <PackagePlus size={16} className="mr-1" />
                      Add to toolbox 
                    </button>
                    <button className="p-2 rounded-md border border-neutral-700 hover:bg-neutral-800 transition-colors">
                      <Heart size={16} className="text-neutral-400" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 mt-3">
                  <div className="flex items-center text-sm text-neutral-300">
                    <CheckCircle2 size={14} className="text-green-500 mr-2" />
                    Unlimited access to this tool
                  </div>
                  <div className="flex items-center text-sm text-neutral-300">
                    <CheckCircle2 size={14} className="text-green-500 mr-2" />
                    Pay only for what you use
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-900 border border-neutral-800 rounded-lg p-4 mb-4">
                <h2 className="text-lg font-bold mb-3">About this tool</h2>
                <div className="markdown-body text-sm text-neutral-300" dangerouslySetInnerHTML={{ __html: readme}} />
                <p className="text-sm text-neutral-300 mt-2">{product.overview}</p>
              </div>
            </div>
          </div>


          <div className="bg-zinc-900 border border-neutral-800 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-bold mb-3 flex items-center">
              <Shield className="mr-2 text-blue-400" size={18} />
              Technical Specifications
            </h2>
            
            {product.endpoints.length > 0 ? 
              <div className="space-y-4">
                {product.endpoints.map((e:any, j:number) => {
                  return (
                    <div key={j} className="mb-4">
                      <p className="text-base font-medium text-white mb-2 pb-1 border-b border-neutral-700">{e.name}</p>
                      <table className="w-full border-collapse my-2">
                        <thead>
                          <tr className="text-left bg-zinc-800">
                            <th className="py-2 px-3 font-medium text-xs uppercase tracking-wider text-neutral-300 rounded-tl">Parameter</th>
                            <th className="py-2 px-3 font-medium text-xs uppercase tracking-wider text-neutral-300">Type</th>
                            <th className="py-2 px-3 font-medium text-xs uppercase tracking-wider text-neutral-300 rounded-tr">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                        {e.parameters.map((p:any, i:number) => {
                          return (
                            <tr key={i} className="border-b border-neutral-800 hover:bg-zinc-800 transition-colors">
                              <td className="py-2 px-3 text-sm font-mono text-white">{p.parameter.name}</td>
                              <td className="py-2 px-3 text-sm text-blue-400 font-medium">{p.parameter.type}</td>
                              <td className="py-2 px-3 text-sm text-neutral-400">{p.parameter.description}</td>
                            </tr>
                          )
                        })}
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
              :
              <p className="text-neutral-400 text-sm italic">No technical specifications available for this product.</p>
            }
          </div>
          
          <div className="bg-zinc-900 border border-neutral-800 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-bold mb-3 flex items-center">
              <Award className="mr-2 text-green-500" size={18} />
              Security & Compliance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start p-3 bg-zinc-800 rounded-lg">
                <Shield className="text-green-500 mr-2 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-white">Data Protection</p>
                  <p className="text-xs text-neutral-400">Your data is encrypted and securely processed</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-zinc-800 rounded-lg">
                <CheckCircle2 className="text-green-500 mr-2 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-white">Compliance Certified</p>
                  <p className="text-xs text-neutral-400">Meets industry standards for AI safety</p>
                </div>
              </div>
            </div>
          </div>

          <div id="reviews" className="mb-12 border-t border-neutral-800 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <Link href={`/dashboard/create/review/${product.uti}`} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center">
                <Star size={16} className="mr-1" />
                Write a Review
              </Link>
            </div>
            
            <div className="sm:grid sm:grid-cols-12 gap-6">
              <div className="col-span-4 lg:col-span-3 bg-zinc-900 self-start border border-neutral-800 rounded-lg p-4 sticky top-5">
                <div className="text-center mb-4">
                  <h3 className="text-6xl font-bold text-white mb-1">{rating}</h3>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"} />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-400">{reviews.length} global ratings</p>
                </div>
                
                <div className="space-y-2">
                  <ReviewProgress value="5" percentage={`${Math.floor(histogram[4]*100)}%`}/> 
                  <ReviewProgress value="4" percentage={`${Math.floor(histogram[3]*100)}%`}/> 
                  <ReviewProgress value="3" percentage={`${Math.floor(histogram[2]*100)}%`}/> 
                  <ReviewProgress value="2" percentage={`${Math.floor(histogram[1]*100)}%`}/> 
                  <ReviewProgress value="1" percentage={`${Math.floor(histogram[0]*100)}%`}/> 
                </div>
                
                <div className="mt-6 pt-4 border-t border-neutral-700">
                  <h3 className="font-bold mb-1">Review this product</h3>
                  <p className="text-sm text-neutral-400 mb-3">Share your experience with the community</p>
                  <Link href={`/dashboard/create/review/${product.uti}`} className="block">
                    <p className="text-center rounded-md w-full border border-neutral-600 hover:bg-neutral-800 transition-all text-sm py-2 font-medium">Write a customer review</p>
                  </Link>
                </div>
              </div>
              
              <div className="col-span-8 lg:col-span-9 mt-6 sm:mt-0">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800">
                  <p className="text-lg font-medium">{reviews.length} Customer Reviews</p>
                  <div className="flex items-center">
                    <span className="text-sm text-neutral-400 mr-2">Sort by:</span>
                    <select className="bg-zinc-800 border border-neutral-700 text-sm rounded-md py-1 px-2 text-neutral-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>Most recent</option>
                      <option>Highest rated</option>
                      <option>Lowest rated</option>
                    </select>
                  </div>
                </div>
                
                {serverError || reviews.length == 0 ?
                  <div className="text-center py-10 bg-zinc-900 border border-neutral-800 rounded-lg">
                    <p className="text-4xl mb-2">😔</p>
                    <p className="font-medium text-neutral-300 mb-1">No reviews yet</p>
                    <p className="text-sm text-neutral-500">Be the first to review this product</p>
                  </div>
                  :
                  <div className="space-y-4">
                    {reviews.map((review, i) => {
                      if (review != undefined) {
                        return <Review key={i} review={review} />
                      }
                    })}
                  </div>
                }
              </div>
            </div>
          </div>
          
          <div className="mb-12 border-t border-neutral-800 pt-8">
            <h2 className="text-2xl font-bold mb-6">Customers also viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-zinc-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition-colors">
                  <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">AI</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white mb-1 truncate">Similar AI Tool {i}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={12} className={j < 4 ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"} />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-400">(24)</span>
                    </div>
                    <p className="text-sm text-neutral-400 mb-2 line-clamp-2">Another useful AI tool for your workflow</p>
                    <p className="text-sm font-medium">$0.01 <span className="text-xs text-neutral-500">per request</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
          :
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="h-6 col-span-12 bg-neutral-800 rounded-md mb-4"></div>
            
            {/* Product image skeleton */}
            <div className="h-[60vh] col-span-12 md:col-span-5 bg-neutral-800 rounded-lg"></div>
            
            {/* Product details skeleton */}
            <div className="col-span-12 md:col-span-7 space-y-4">
              <div className="h-8 w-3/4 bg-neutral-800 rounded-md"></div>
              <div className="h-4 w-1/4 bg-neutral-800 rounded-md"></div>
              <div className="h-20 bg-neutral-800 rounded-md"></div>
              <div className="h-40 bg-neutral-800 rounded-md"></div>
              <div className="h-60 bg-neutral-800 rounded-md"></div>
            </div>
            
            {/* Reviews skeleton */}
            <div className="h-[30vh] col-span-12 bg-neutral-800 rounded-lg mt-6"></div>
          </div>
          }
          </div>
          :
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">😞</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
            <p className="text-neutral-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/store" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
              Return to Store
            </Link>
          </div>}
        </div>
      </div>
    );
  }
  