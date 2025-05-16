"use client"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProductType from '../components/types/ProductType'
import ProductPreview from '../components/product/ProductPreview'
import OCI from '../microstore/OCI'

/**
 * SearchResultPage shows the results of a search in a grid
 * @returns 
 */
export default function SearchResultPage() {

  // const searchParams = useSearchParams()
 
  //const query = searchParams.get('query')
  //const oci = new OCI()

  const [results, setResults] = useState<ProductType[]>([])

  useEffect(() => {
    //oci.search(String(query)).then(res => {
    //  setResults(res)
    //})
  }, [])

  return (
    <div className="m-auto">
      {
      //<div className="relative max-w-screen-2xl w-[90vw] justify-between mx-auto pt-20">
      //  <div className='grid grid-cols-12'>
      //    <div className='col-span-2'></div>
      //    <div className='col-span-10'>
      //      <h3 className="text-2xl border-b border-neutral-600">Results for: {query}</h3>
      //      <div className='grid grid-cols-2 gap-10'>
      //        {results.map((result,i) => {
      //          return(
      //            <ProductPreview key={i} product={result}/>
      //          )
      //        })}
      //      </div>
      //    </div>
      //  </div>
      //</div>
      }
    </div>
  );
  }