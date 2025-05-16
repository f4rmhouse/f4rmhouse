// ProductData is a summary of a product
type ProductData = {
    product_id: string,
    product_name: string,
    price: number,
    num_requests: number
}

// SectionType represents a section on the main page
type UsageType = {
    customer_id: string,
    timestamp: string,
    paid_requests: number,
    free_requests: number,
    products: {[key:string]: ProductData}
}

export default UsageType;