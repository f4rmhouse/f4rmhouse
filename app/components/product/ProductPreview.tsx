import React from "react";
import ProductType from "../types/ProductType";
import RatingStars from "./RatingStars";
import Link from "next/link";

/**
 * ProductPreview is the product format shown in a search result.
 */
export default function PricingCard({product}: {product: ProductType}) {

  return (
    <Link href={`/detail/${product.uid}`}>
      <div className="flex">
        <div className="p-5 bg-white rounded-full mb-auto mt-auto">
        </div>
        <div className="flex pt-5 pb-5 pl-2 w-full">
          <div>
            <h4 className="font-bold text-xl">{product.title}</h4>
            <p className="text-xs opacity-80 pb-2 flex">{product.tags.join(", ")}</p>
            <div className="flex">
              <RatingStars value={String(product.rating)} size={10} color="neutral-400 mt-auto mb-auto"/>
              <p className="text-xs mt-auto mb-auto font-bold ml-1">{product.reviews}</p>
            </div>
          </div>
          <p className="bg-blue-500 text-blue rounded-full p-1 pl-3 pr-3 ml-auto text-xs mb-auto mt-auto">Get</p>
        </div>
      </div>
      <img className="rounded-xl" src="https://cdnp.kittl.com/51d12197-8a4c-47ad-a1ea-96d4b1a329b0_kittl-ai-image-generator-2-dalle-3-black-model-bpoc-galactic-fashion-retro-space-ship-illustration.jpg?auto=compress,format"/>
    </Link>
  )
}