import { auth } from "@/app/auth";

export default async function WriteReviewPage() {
  const session = await auth()

  return(<div className="font-mono">
    <p>X-Username: {String(session?.user?.email)}</p>
    <br />
    <p>Authorization: {
      // @ts-expect-error
      String(session?.access_token)
      }</p>
    <br />
    <p>X-Provider: {
      // @ts-expect-error
      String(session?.provider)
    }</p>
    </div>)
}