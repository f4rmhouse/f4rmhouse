import ErrorType from "@/app/components/types/ErrorType";
import F4rmerType from "@/app/components/types/F4rmerType";
import Boxes from "@/app/components/ui/chat-window/Boxes";
import RightSidebar from "@/app/components/ui/sidebar/RightSidebar";
import getSession from "@/app/context/getSession";
import User from "@/app/microstore/User";

/**
 * F4rmerDetailsPage is the UI page of the f4rmer. User can chat with the f4rmer that they have
 * created and add/remove tools from it.
 * @param param0 
 * @returns 
 */
export default async function F4rmerDetailsPage({ params }: { params: { username: string, uid: string } }) {
  const session = await getSession()
  const user = new User(session.user.email, session.provider, session.access_token);

  let error:ErrorType|null = null
  let data:F4rmerType = {
        uid: "someid",
        title: "Weather Master",
        jobDescription: "Gets the weather anywhere in the world",
        toolbox: [],
        creator: "filip",
        created: "2024-11-05"
    }

  try {
    data = await user.getF4rmer(params.username, params.uid);
  }
  catch(err) {
    console.error("Could not get user usage")
    error = {code: 400, message: "Looks like we can't fetch the data from our server currently. Don't worry we're handling it!", link: "More updates at: /"}
    console.log(error)
  }
  return(
    <div className="overflow-none">
      <Boxes data={data} session={session}/>
      <RightSidebar f4rmer={data}/>
    </div>
    )
}
