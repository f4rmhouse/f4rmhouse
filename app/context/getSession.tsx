import { auth } from "../auth"
import F4Session from "../components/types/F4Session"

async function getSession(): Promise<F4Session> {
    const session = await auth()
    let s:F4Session = {
      //@ts-ignore
      access_token: String(session?.access_token), 
      //@ts-ignore
      provider: String(session?.provider), 
      expires: String(session?.expires), 
      user: {
        name: String(session?.user?.name),
        email: String(session?.user?.email),
        image: String(session?.user?.image) 
      }
    } 
    return s 
}

export default getSession;