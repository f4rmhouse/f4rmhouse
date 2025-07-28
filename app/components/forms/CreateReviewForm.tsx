"use client"
import Review from "@/app/components/product/Review";
import InteractiveStars from "@/app/components/ui/misc/InteractiveStars";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation'
import ReviewType from "@/app/components/types/ReviewType";
import User from "@/app/microstore/User";
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * CreateReviewForm is a form used to post reviews. User has to be authenticated for
 * review to be created. 
 * @param product_id 
 * @param username 
 * @returns 
 */
export default function CreateReviewForm({ product_id, username }: { product_id: string, username: string }) {
  const router = useRouter()
  const session = useSession();
  const { theme } = useTheme();

  const [stars, setStars]             = useState<number>(1)
  const [title, setTitle]             = useState<string>("")
  const [content, setContent]         = useState<string>("")
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const publishReview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(session){
      // A user will create the review
      const user = new User(session.user.email, session.provider, session.access_token)

      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      const data: ReviewType = {
        pid: product_id, 
        uid: "",
        title: title, 
        value: String(stars+1),  // stars are 0-indexed
        content: content, 
        creator: username.split(" ")[0], 
        creator_uid: session.user.email, 
        date: formattedDate,
        rating: 0,
        rated: false
      }

      user.createReview(data).then((e) => {
        if (e.Code == 201) {
          alert("You need to use an action to give it a review!")
        }
        router.push(`/detail/${product_id}`)
      })
    }
  }

  return (
    <form onSubmit={publishReview} className={`grid grid-cols-2 gap-10 w-[100vw] ${theme.backgroundColor || 'bg-black'}`}>
      <div className={`mt-0 ml-14 mt-10 ${theme.textColorPrimary || 'text-white'}`}>
        <Link href={`/detail/${product_id}`} className={`inline-flex items-center mb-4 ${theme.textColorSecondary || 'text-neutral-400'} hover:${theme.textColorPrimary || 'hover:text-white'} transition-colors`}>
          <ArrowLeft size={16} className="mr-2" />
          Back to product
        </Link>
        <h1 className={`${theme.textColorPrimary || 'text-white'}`}>Write a review for <Link href={`/detail/${product_id}`} className="underline">{product_id}</Link></h1>
        <h2 className={`text-xl font-bold mt-10 mb-2 ${theme.textColorPrimary || 'text-white'}`}>Start here</h2>
        <div className="flex">
          <p className={`${theme.textColorSecondary || 'text-neutral-300'}`}>1. How would you rate this product?</p>
          <div className="mt-auto mb-auto ml-2">
            <InteractiveStars setStars={setStars}/>
          </div>
        </div>
        <div className="mt-2">
          <p className={`${theme.textColorSecondary || 'text-neutral-300'}`}>2. Please write a title for your review.</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full rounded-md border px-3 py-2 ${theme.backgroundColor || 'bg-neutral-800'} ${theme.textColorPrimary || 'text-white'} border-neutral-600 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.primaryColor || 'focus:ring-blue-500'}`}/>
        </div>
        <h2 className={`text-xl font-bold mt-10 mb-2 ${theme.textColorPrimary || 'text-white'}`}>Share your thoughts</h2>
        <div>
          <p className={`${theme.textColorSecondary || 'text-neutral-300'}`}>3. Write a review</p>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`w-full rounded-md border px-3 py-2 ${theme.backgroundColor || 'bg-neutral-800'} ${theme.textColorPrimary || 'text-white'} border-neutral-600 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.primaryColor || 'focus:ring-blue-500'} resize-vertical`} rows={10}/>
        </div>
        <div className="w-full flex justify-end">
          <button onClick={(e) => {e.preventDefault(); setShowPreview(p => !p)}} className={`font-bold rounded-full mt-2 text-sm pl-4 pr-4 p-1 transition-colors ${theme.secondaryColor || 'bg-neutral-700'} ${theme.textColorPrimary || 'text-white'} hover:opacity-80`}>Preview review</button>
        </div>
      </div>
      <div className="mt-20">
        {
            showPreview ?
            <div className="mr-10">
              <h1 className={`${theme.textColorPrimary || 'text-white'}`}>Remember to follow our community guidelines</h1>
              <Review review={
                {
                  pid: product_id, 
                  uid: "unused", 
                  title: title, 
                  value: String(stars+1), 
                  content: content, 
                  creator: username.split(" ")[0], 
                  creator_uid: session?.user.email ?? "", 
                  date: "2024-09-26", 
                  rating: 0, 
                  rated:false
                }
              }/>
              <div className="flex w-full justify-end">
                <button className={`font-bold rounded-full mt-2 text-sm pl-4 pr-4 p-1 transition-colors ${theme.primaryColor || 'bg-yellow-500'} text-black hover:opacity-80`}>Publish review</button>
              </div>
            </div>
            :
            <></>
          }
      </div>
    </form>
  );
}