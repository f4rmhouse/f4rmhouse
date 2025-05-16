/**
 * SignOut button
 */
import { signOut } from "../../../auth"
 
export function SignOutButton() {
  return (
    <button onClick={() => signOut({ redirectTo: '/', redirect: true })}>Sign Out</button>
  )
}