import { useTheme } from "@/app/context/ThemeContext";
import { Star } from "lucide-react";

/**
 * ReviewProgress is a progress bar showing the percentage of stars
 * that were a given value.
 * @param param0 
 * @returns 
 */
export default function ReviewProgress({value, percentage}: {value:string, percentage:string}) {
  const { theme } = useTheme();
  return (
    <div className="flex">
      <Star size={10} className="mt-auto mb-auto opacity-80"/> 
      <p className="text-xs">{value}</p>
      <div className={`w-full m-auto ${theme.secondaryColor} rounded-full h-2.5`}>
      <div className={`${theme.accentColor} h-2.5 rounded-full`} style={{"width": `${percentage}`}}></div>
      </div>
      <p className="text-xs m-auto opacity-80">({percentage})</p>
    </div>
  )
}