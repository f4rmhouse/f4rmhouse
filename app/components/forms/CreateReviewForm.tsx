"use client"
import Review from "@/app/components/product/Review";
import InteractiveStars from "@/app/components/ui/misc/InteractiveStars";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation'
import ReviewType from "@/app/components/types/ReviewType";
import User from "@/app/microstore/User";
import { useSession } from '../../context/SessionContext';

/**
 * CreateReviewForm is a form used to post reviews. User has to be authenticated for
 * review to be created. 
 * @param product_id 
 * @param username 
 * @returns 
 */
export default function CreateReviewForm({ product_id, username }: { product_id: string, username: string }) {
  const router = useRouter()
  const session = useSession()

  const [stars, setStars]             = useState<number>(1)
  const [title, setTitle]             = useState<string>("")
  const [content, setContent]         = useState<string>("")
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const publishReview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

  return (
    <form onSubmit={publishReview} className="grid grid-cols-2 gap-10">
      <div className="mt-0 ml-14">
        <h1 className="">Write a review for <Link href={`/detail/${product_id}`} className="underline text-blue-500">{product_id}</Link></h1>
        <h2 className="text-xl font-bold mt-10 mb-2">Start here</h2>
        <div className="flex">
          <p>1. How would you rate this product?</p>
          <div className="mt-auto mb-auto ml-2">
            <InteractiveStars setStars={setStars}/>
          </div>
        </div>
        <div className="mt-2">
          <p>2. Please write a title for your review.</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent rounded-md"/>
        </div>
        <h2 className="text-xl font-bold mt-10 mb-2">Share your thoughts</h2>
        <div>
          <p>3. Write a review</p>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="bg-transparent w-full" rows={10}/>
        </div>
        <div className="w-full flex justify-end">
          <button onClick={(e) => {e.preventDefault(); setShowPreview(p => !p)}} className="bg-neutral-700 font-bold rounded-full mt-2 text-sm text-white pl-4 pr-4 p-1 hover:bg-neutral-500">Preview review</button>
        </div>
      </div>
      <div className="mt-20">
        {
            showPreview ?
            <div className="mr-10">
              <h1>Remember to follow our community guidelines</h1>
              <Review review={{pid: product_id, uid: "unused", title: title, value: String(stars+1), content: content, creator: username.split(" ")[0], creator_uid: session.user.email, date: "2024-09-26", rating: 0, rated:false}}/>
              <div className="flex w-full justify-end">
                <button className="bg-yellow-500 font-bold rounded-full mt-2 text-sm text-black pl-4 pr-4 p-1 hover:bg-yellow-300">Publish review</button>
              </div>
            </div>
            :
            <></>
          }
      </div>
    </form>
  );
}