import { Star } from "lucide-react";
import ProductType from "../types/ProductType";
import { useEffect, useState } from "react";
import Store from "@/app/microstore/Store";
import Link from "next/link";
import { useTheme } from "@/app/context/ThemeContext";

interface ProductPreviewCardProps {
  name: string
}

export default function ProductPreviewCard({ 
  name 
}: ProductPreviewCardProps) {

  const { theme } = useTheme();

  const [product, setProduct] = useState<ProductType>();

  useEffect(() => {
    let store = new Store()
    store.getProduct(name).then(product => {
      if(product.Message != undefined) {
        setProduct(product.Message)
      }
    })
  },[])

  return (
    <Link href={`/detail/${product?.uti}`} className={`flex rounded-lg overflow-hidden hover:${theme.secondaryHoverColor} cursor-pointer`}>
      <img alt="action-thumbnail" className="h-10 my-auto rounded-full aspect-square object-cover" height={10} src={"https://f4-public.s3.eu-central-1.amazonaws.com/showcases/" + product?.uti + "/thumbnail.jpg"}/>
      <div className="p-3">
        <h3 className="font-medium mb-1 truncate">{product?.title}</h3>
        <div className="flex items-center mb-2">
          <div className="flex mr-1">
            {[...Array(5)].map((_, j) => (
              <Star 
                key={j} 
                size={12} 
                className={j < 10 ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"} 
              />
            ))}
          </div>
          <span className="text-xs text-neutral-400">(10)</span>
        </div>
        <p className="text-sm text-neutral-400 mb-2 line-clamp-2">{product?.description}</p>
      </div>
    </Link>
  );
}
