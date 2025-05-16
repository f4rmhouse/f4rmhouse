import { FaArrowLeft } from "react-icons/fa6";
import { signIn } from "../auth"
import Link from "next/link";
import OAuthLoginButton from "../components/ui/button/OAuthLoginButton";

/**
 * Login is a page that provides user with all the login options and redirects to the dashboard.
 * @returns 
 */
export default function Login() {
  return (
    <div className="absolute z-0 w-[100vw] h-[100vh]">
      <div className='relative flex h-full'>
        <div className='m-auto rounded-md w-[100%] md:w-[75%] lg:w-[25%] p-2'>
          <div className="flex relative mb-10">
            <Link href="/" className="absolute mt-auto mb-auto m-2"><FaArrowLeft size={30} className="transition-all hover:bg-zinc-600 bg-zinc-700 p-2 rounded-full" /></Link>
            <h1 className='text-center text-xl m-auto'>Login</h1>
          </div>
          <div className='flex flex-col'>
            <form action={async () => {
              "use server"
              await signIn("google", {redirectTo: "/dashboard"})
            }}>
              <OAuthLoginButton provider="Google" logo="https://f4-public.s3.eu-central-1.amazonaws.com/public/google-logo.png" />
            </form>
            <form action={async () => {
              "use server"
              await signIn("github", {redirectTo: "/dashboard"})
            }}>
              <OAuthLoginButton provider="GitHub" logo="https://f4-public.s3.eu-central-1.amazonaws.com/public/github-logo.webp" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  }