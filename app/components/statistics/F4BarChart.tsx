"use client"

import React from 'react';
import { BarChart } from '@tremor/react';

/**
 * F4BarChart a standard barchart
 * @param keys -- an array of strings (x)
 * @param value -- an array of numbers (y)
 * @returns 
 */
export default function F4BarChart({keys, values}: {keys:string[], values:number[]}){
    return (
      <>
      <h3 className="text-lg font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">        
        Number of species threatened with extinction (2021)      
      </h3>
      <BarChart        
        className="h-72"        
        data={values}
        stack={true}
        index="date"
        categories={keys}
        colors={['emerald-500', 'rose-500', 'blue-500', 'orange-500']}
        yAxisWidth={30}
      />
      </>
    )
  }
  