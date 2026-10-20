import React, { Children } from 'react'
import {cn} from '@repo/ui'; 
const Container = (
    {children, className} : {children : React.ReactNode, className?:string} ) => {
       return (
    <div className={cn(" max-w-7xl mx-auto px-4 grid grid-cols-[20%_50%_30%] items-center h-16 gap-0", className)}>
      {children}
    </div>
  );};

export default Container;