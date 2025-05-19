import { Star } from "lucide-react";

/**
 * ReviewProgress is a progress bar showing the percentage of stars
 * that were a given value.
 * @param param0 
 * @returns 
 */
export default function ReviewProgress({value, percentage}: {value:string, percentage:string}) {
  return (
    <div className="flex">
      <Star size={10} className="mt-auto mb-auto opacity-80"/> 
      <p className="text-xs">{value}</p>
      <div className="w-full m-auto bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div className="bg-neutral-400 h-2.5 rounded-full" style={{"width": `${percentage}`}}></div>
      </div>
      <p className="text-xs m-auto opacity-80">({percentage})</p>
    </div>
  )
}