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
  endpoints: any[]
}

export default ProductType;