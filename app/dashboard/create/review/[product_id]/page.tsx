import { auth } from "@/app/auth";
import CreateReviewForm from "@/app/components/forms/CreateReviewForm";

/**
 * WriteReviewPage 
 * @param param0 
 * @returns 
 */
export default async function WriteReviewPage({ params }: { params: { product_id: string } }) {
  const session = await auth()
   
  return(<CreateReviewForm product_id={params.product_id} username={String(session?.user?.name)}/>)
}