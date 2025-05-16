/**
 * @param param0 
 * @returns 
 */
export default function OAuthLoginButton({provider, logo}:{provider:string, logo:string}) {

  return (
    <button type="submit" className='flex transition-all hover:bg-neutral-700 rounded-full border border-neutral-700 text-center w-full p-2 mt-2 bg-neutral-800 rounded'>
      <img className="h-8 mt-auto mb-auto" src={logo} />
      <span className="m-auto">
        Sign in with {provider} 
      </span>
    </button>
  )
}