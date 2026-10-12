import React from "react";
import { Button } from "@/components/atoms/ui/button";
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home() {
  
  const { data, error } = await supabase.from("products").select("*");

  return (
    <div>
      <div className="p-5 bg-shop_light_pink">
        <h1 className="text-xl font-semibold text-shop_dark_green">
          E-Commerce avec Next.js
        </h1>
        <h3 className="font-poppins text-shop_orange font-medium mt-2">
          Utilisation de Atomic Design
        </h3>
        <p className="mt-2 text-darkColor">
          L'Atomic Design est une méthodologie de conception de systèmes d'interface utilisateur 
          créée par Brad Frost en 2013. Elle s'inspire de la chimie pour structurer les interfaces 
          web et mobiles de manière modulaire, évolutive et cohérente.
        </p>
        <Button> test shadcn</Button>
      </div>

      <div className="p-5">
        <h1 className="text-lg font-bold">Test Backend Supabase</h1>
        {error ? (
          <p className="text-red-500">Erreur : {error.message}</p>
        ) : (
          <div>
            <p>Réponse du backend :</p>
            <pre className="bg-gray-100 p-3 rounded mt-2">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}