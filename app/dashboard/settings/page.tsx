import ErrorType from "../../components/types/ErrorType";
import Vendor from "@/app/microstore/Vendor";
import getSession from "@/app/context/getSession";
import APIKeyType from "@/app/components/types/APIKeyType";
import KeyTable from "@/app/components/async/KeyTable";
import CreateAPIKeyButton from "@/app/components/ui/button/CreateAPIKeyButton";
import DeleteUserAccountButton from "@/app/components/ui/button/DeleteUserAccountButton";

/**
 * Settings displays users api keys and lets them register new keys
 * @returns 
 */
export default async function Settings() {
  const session = await getSession()

  const vendor = new Vendor(session.user.email, session.provider, session.access_token);

  let data:APIKeyType[] = []
  let error:ErrorType|null = null

  try {
    data = await vendor.getKeys();
  }
  catch(err) {
    console.error("Could not get user usage")
    error = {code: 400, message: "Looks like we can't fetch the data from our server currently. Don't worry we're handling it!", link: "More updates at: /"}
    console.log(error)
  }

  return(
    <div className="m-auto w-[90%]">
      <div className="relative justify-between p-5">
        <div className="flex flex-col text-xl border-b border-neutral-700 ml-6 mr-6 pb-10 mb-10">
            <h1 className="border-b border-neutral-600">User settings</h1>
            <DeleteUserAccountButton email={session.user.email} provider={session.provider} access_token={session.access_token}/>
          <div className="text-base">
            <p>Email: {session.user.email}</p>
            <p>Name: {session.user.name}</p>
            <p>OAuth provider: {session.provider}</p>
            <p>Session expires: {session.expires}</p>
          </div>
        </div>
        <div className="flex text-xl border-b border-neutral-700 ml-6 mr-6">
          <h1 className="">Secret keys</h1>
          <CreateAPIKeyButton email={session.user.email} provider={session.provider} access_token={session.access_token}/>
        </div>
        <div className="flex">
          <KeyTable ks={data} error={error} session={session}/>
        </div>
      </div>
    </div>
  )
}