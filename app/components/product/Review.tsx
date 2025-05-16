import ReviewType from "../types/ReviewType";
import RatingStars from "./RatingStars";
import RateReviewButton from "../ui/button/RateReviewButton";

/**
 * Review shows the title, text and content of a reivew.
 */
export default function Review({review}: {review: ReviewType}) {
  return (
    <div>
      <div className="p-5 border border-neutral-800 bg-zinc-900 rounded-md mt-2">
        <div className="flex">
        <div>
          <p className="font-bold pb-0">{review.title}</p>
          <RatingStars value={review.value} size={15} color="yellow-500"/>
        </div>
        <div className="ml-auto">
          <p className="opacity-80">{review.creator}</p>
          <p className="text-xs opacity-50">{review.date}</p>
        </div>
        </div>
        <div className="mt-2">
          <p>{review.content}</p>
        </div>
        <div className="mt-2">
          <RateReviewButton rid={review.pid} uid={review.uid} rating={String(review.rating)} rated={review.rated}/>
        </div>
      </div>
    </div>
  )
}