/**
 * Property is used to showcase metadata about a product 
 **/
export default function Property({type, title, subtitle}: {type: string, title: string, subtitle: string}) {
  return (
    <div className="text-center justify-center">
      <p className="text-xs opacity-75 font-bold">{type.toLocaleUpperCase()}</p>
      <p className="text-xs sm:text-sm">{title}</p> 
      <p className="text-xs opacity-75">{subtitle}</p> 
    </div>
  )
}