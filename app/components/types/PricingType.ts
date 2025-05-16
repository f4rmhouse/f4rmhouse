// PricingType is used to represent the different pricing tiers of a product
type PricingType = {
    name: string,
    price: number,
    deal: string,
    cta: string,
    features: string[],
    disclaimer: string,
    type: string
    pricePeriod: string
}
  
export default PricingType;