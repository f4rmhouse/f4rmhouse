import AppCardType from "../types/AppCardType";
import LargeAppCard from "../card/LargeAppCard";

/**
 * LargeAppCardGrid show a set of LargeAppCards in a 3x3 grid
 */
export default function LargeAppCardGrid({apps}: {apps: AppCardType[]|string}) {
    return (
      <div className="sm:grid sm:grid-cols-3 gap-5 m-auto mt-[40vh]">
        {Array.isArray(apps) ?
          <>
            {apps.map((app,i) => {
                return (<LargeAppCard key={i} app={app}/>)
            })}
          </>
          :
          <p></p>
        }
      </div> 
    )
}