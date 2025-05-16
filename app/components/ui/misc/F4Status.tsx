import Vendor from "@/app/microstore/Vendor";
import getSession from "@/app/context/getSession";

/**
 * F4Status displays the login status of a user (logged in/logged out)
 * @param param0 
 * @returns 
 */
async function F4Status({name}:{name:string}) {
  const session = await getSession()
  const vendor = new Vendor(session.user.email, session.provider, session.access_token);
  let status = await vendor.getEndpoint(name)

  return <p className="text-xs font-mono rounded-full">{status.Message}</p>
}


export default F4Status