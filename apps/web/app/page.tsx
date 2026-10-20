import React from "react";
import { Button, cn } from "@repo/ui";
import { createClient } from "@supabase/supabase-js";

export default async function Home() {
  
 return (
    <div>
      <div className="p-5 bg-shop-light-pink">
        <h1 className="text-xl font-semibold text-shop-dark-green">
          E-Commerce avec Next.js
        </h1>
        <h3 className="font-poppins text-shop-orange font-medium mt-2">
          Utilisation de Atomic Design
        </h3>
        <p className="mt-2 text-darkColor">
          L'Atomic Design est une méthodologie de conception de systèmes d'interface utilisateur 
          créée par Brad Frost en 2013. Elle s'inspire de la chimie pour structurer les interfaces 
          web et mobiles de manière modulaire, évolutive et cohérente.
        </p>
        </div>

      
       
     
    </div>
  );
}