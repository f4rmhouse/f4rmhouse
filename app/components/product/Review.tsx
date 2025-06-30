import ReviewType from "../types/ReviewType";
import RatingStars from "./RatingStars";
import RateReviewButton from "../ui/button/RateReviewButton";
import { useTheme } from "../../context/ThemeContext";

/**
 * Review shows the title, text and content of a reivew.
 */
export default function Review({review}: {review: ReviewType}) {
  const { theme } = useTheme();
  
  return (
    <div>
      <div className={`p-5 border rounded-md mt-2 ${theme.backgroundColor || 'bg-zinc-900'} ${theme.textColorPrimary || 'text-white'} border-neutral-800`}>
        <div className="flex">
        <div>
          <p className={`font-bold pb-0 ${theme.textColorPrimary || 'text-white'}`}>{review.title}</p>
          <RatingStars value={review.value} size={15} color="yellow-500"/>
        </div>
        <div className="ml-auto">
          <p className={`opacity-80 ${theme.textColorSecondary || 'text-neutral-300'}`}>{review.creator}</p>
          <p className={`text-xs opacity-50 ${theme.textColorSecondary || 'text-neutral-400'}`}>{review.date}</p>
        </div>
        </div>
        <div className="mt-2">
          <p className={`${theme.textColorPrimary || 'text-white'}`}>{review.content}</p>
        </div>
        <div className="mt-2">
          <RateReviewButton rid={review.pid} uid={review.uid} rating={String(review.rating)} rated={review.rated}/>
        </div>
      </div>
    </div>
  )
}