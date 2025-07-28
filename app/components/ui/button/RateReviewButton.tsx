import { useSession } from "next-auth/react";
import User from "@/app/microstore/User"
import { useEffect, useState } from "react"
import { Heart } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

/**
 * RateReviewButton is a thumbs up button that will increment a counter if it has not been 
 * pressed by the user or decrement a counter if user has already liked the review.
 * @returns 
 */
export default function RateReviewButton({rid, uid, rating, rated}:{rid:string, uid:string, rating:string, rated:boolean}) {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [r, setR] = useState<number>(Number(rating))
  const [currentRated, setCurrentRated] = useState<boolean>(rated)

  useEffect(() => {
    setCurrentRated(rated)
  },[rated])

  const rate = () => {
    // @ts-expect-error
    let provider: string|undefined = session.provider
    // @ts-expect-error
    let access_token: string|undefined = session.access_token

    if(session != null && session.user && session.user.email != null && provider && access_token) {
      const user = new User(session.user.email, provider, access_token)
      user.rateReview(rid, uid)
        .then(e => {
          if (currentRated) {
            setR(p => p - 1)
          } else {
            setR(p => p + 1)
          }
          setCurrentRated(!currentRated)
        })
        .catch(err => alert("an error occured when trying to rate a review"))
    }else {
      alert("Please login to rate a review")
    }
  }

  return (
    <button 
      onClick={() => rate()} 
      className={`transition-all flex items-center gap-1 hover:opacity-80 ${
        currentRated 
          ? `${theme.textColorPrimary}` 
          : `${theme.textColorSecondary}`
      }`}
    >
      <Heart size={15} className={currentRated ? "fill-current" : ""}/>
      <p className="text-xs">{r}</p>
    </button>
  )
}