//AppCardType represent a card shown on the main page
type AppCardType = {
    id: string,
    uti:string,
    decorator: string 
    title: string
    description: string
    price: string
    disclaimer: string
    type?: string
    style: string
    link: string
    deployed: boolean
    deploymentType: string
}

export default AppCardType;