import React from "react";
import { Button } from "../src/components/atoms/ui/button";

export default function Home() {
  return (
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
  );
}