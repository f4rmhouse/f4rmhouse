import { auth } from "@/app/auth";
import CreateReviewForm from "@/app/components/forms/CreateReviewForm";

type Params = Promise<{ slug: string[] }>

/**
 * WriteReviewPage 
 * @param params Contains the product_id from the URL
 * @returns Review form component
 */
export default async function WriteReviewPage({ params }: {params: Params}) {
  const session = await auth()

  const { slug } = await params;
   
  return(<CreateReviewForm product_id={slug[0]} username={String(session?.user?.name)}/>)
}