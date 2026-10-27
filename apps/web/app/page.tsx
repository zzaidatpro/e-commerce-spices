import { HeroBanner } from "@/components/molecules/heroBanner";
import { PromisesBand } from "@/components/molecules/bandeauAccueil";
import { BestSellers } from "@/components/molecules/Bestsellers";
import { TejPattaStory } from "@/components/molecules/story";
import { ExploreMosaic } from "@/components/molecules/mosaic";
import { RecipesBlock } from "@/components/molecules/recipesblock";

export default function HomePage() {
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