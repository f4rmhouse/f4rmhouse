import { auth } from "@/app/auth";
import CreateReviewForm from "@/app/components/forms/CreateReviewForm";

type Params = Promise<{product_id:{product_id:string}}>

/**
 * WriteReviewPage 
 * @param params Contains the product_id from the URL
 * @returns Review form component
 */
export default async function WriteReviewPage({ params }: {params: Params}) {
  const session = await auth()
  const slug = (await params).product_id;
   
  return(<CreateReviewForm product_id={slug.product_id} username={String(session?.user?.name)}/>)
}