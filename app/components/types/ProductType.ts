// ProductType represents a single product in the f4rmhouse ecosystem
type ProductType = {
  uid: string,
  title: string,
  uti: string,
  description: string,
  rating: number,
  price: number,
  thumbnail: string,
  overview: string,
  communityURL: string,
  reviews: number,
  developer: string,
  pricingType: string,
  releaseType: string,
  version: string,
  showcase: string[],
  tags: string[],
  deployed: boolean,
  deployment_type: string
  server: Server
}

type Authorization = {
  authorization_url: string 
  token_url: string 
  revocation_url: string 
  redirect_url: string 
}
  
type Server = {
  transport: string        
  uri: string        
  authorization: Authorization 
  auth_provider: string
}
  




export default ProductType;