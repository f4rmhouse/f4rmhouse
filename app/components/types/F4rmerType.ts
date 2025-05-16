import ProductType from "./ProductType"

// F4rmerType describes all meta data of a f4rmer
type F4rmerType = {
    uid: string
    title: string
    jobDescription: string
    toolbox: ProductType[]
    creator: string
    created: string
}
  
export default F4rmerType;