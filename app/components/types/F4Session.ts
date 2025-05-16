/**
 * F4Session represents a session in f4rmhouse
 */
type F4Session = {
  access_token: string
  provider: string
  expires: string
  user: {
    name: string,
    email: string,
    image: string
  }
}
  
export default F4Session