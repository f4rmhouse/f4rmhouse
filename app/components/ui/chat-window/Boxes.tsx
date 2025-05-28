"use client"
import F4Session from "../../types/F4Session";
import PromptBox from "./PromptBox";
import F4rmerType from "../../types/F4rmerType";
import { useState } from "react";
import config from "../../../../f4.config"
import User from "@/app/microstore/User";

/**
 * F4Status displays the login status of a user (logged in/logged out)
 * @param param0 
 * @returns 
 */
function Boxes({f4rmers, session}: {f4rmers:F4rmerType[],session:F4Session}) {
  const [state, setState] = useState<"canvas" | "chat" | "preview">(config.defaultState)
  return(
    <div className="flex overflow-hidden">
      <PromptBox f4rmers={f4rmers} state={state} setState={setState} session={session}/>
    </div>
  )
}


export default Boxes 