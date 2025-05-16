import Usage from "../../components/async/Usage";
import ErrorType from "../../components/types/ErrorType";
import UsageType from "../../components/types/UsageType";
import User from "../../microstore/User";
import getSession from "@/app/context/getSession";

/**
 * UsagePage is a dashboard showing the users usage over the current month.
 * @returns 
 */
export default async function UsagePage() {
  const session = await getSession()
  const user = new User(session.user.email, session.provider, session.access_token);

  let data:UsageType[] = []
  let error:ErrorType|null = null

  try {
    data = await user.usage();
  }
  catch(err) {
    console.error("Could not get user usage")
    error = {code: 400, message: "Looks like we can't fetch the data from our server currently. Don't worry we're handling it!", link: "More updates at: /"}
    console.log(error)
  }

  return (
    <div className="m-auto">
      <div className="relative justify-between p-5">
        <div className="text-xl border-b border-neutral-700 ml-6 mr-6">
          <h1 className="">Monthly Overview</h1>
        </div>
        <Usage usage={data} error={error}/>
        </div>
    </div>
  );
}