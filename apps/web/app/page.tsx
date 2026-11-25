import { HeroBanner } from "@/components/molecules/heroBanner";
import { PromisesBand } from "@/components/molecules/bandeauAccueil";
import { BestSellers } from "@/components/molecules/Bestsellers";
import { TejPattaStory } from "@/components/molecules/story";
import { ExploreMosaic } from "@/components/molecules/mosaic";
import { RecipesBlock } from "@/components/molecules/recipesblock";
import { getRoleSite } from "@/lib-web/session-role";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { role } = await getRoleSite();
  if (role === "livreur") redirect("/livraisons");

  return (
    <>
      <HeroBanner />
      <PromisesBand />
      <BestSellers />
      <TejPattaStory />
      <ExploreMosaic />
      <RecipesBlock />
    </>
  );
}
