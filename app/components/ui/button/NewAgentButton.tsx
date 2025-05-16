import Link from "next/link";
import config from "@/f4.config";
import { Plus } from "lucide-react";

export default function NewAgentButton() {
    return(
      <Link href="/dashboard/f4rmers/create" className={`group absolute top-9 left-0 lg:left-24 z-99 flex rounded-md p-2 pl-4 pr-4 hover:${config.theme.accentColor ? config.theme.accentColor : "bg-blue-500"} transition-all`}>
        <button className={`text-center ${config.theme.textColorPrimary ? config.theme.textColorPrimary : "text-neutral-300"} rounded-full group-hover:rotate-90 transition-all`}><Plus size={15} /></button>
        <p className={`transition-all ${config.theme.textColorPrimary ? config.theme.textColorPrimary : "text-neutral-300"} m-auto text-xs ml-1`}>New agent</p>
      </Link>
    )
}