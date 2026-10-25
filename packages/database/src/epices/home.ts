export const homeContent = {
  hero: {
    title: "L'excellence de l'indus dans votre cuisine",
    image: "../public/imges/best_image.jpg",
    imageAlt: "Bocaux signatures alignés",
    cta: "Découvrir la gamme",
    ctaHref: "/catalogue",
  },

  promises: [
    {
      title: "Origine 100 % traçable",
      text: "Récoltes artisanales en Inde, du tej patta aux baies rares.",
    },
    {
      title: "Bocaux signatures",
      text: "Verre borosilicate et fermoir hermétique noir pour une conservation parfaite.",
    },
    {
      title: "Sans additifs",
      text: "100 % pur, sans colorants ni conservateurs.",
    },
  ],

  bestSellerSlugs: ["safran", "poivre-noir", "vanille", "curcuma"],

  story: {
    image: "../public/imges/collection_spices.jpg",
    imageAlt: "Feuilles de tej patta entières dans leur bocal",
    title: "Le tej patta : plus qu'un laurier, une révélation.",
    text: "Au-delà du laurier européen, le tej patta se distingue par ses notes de cannelle et de girofle, qui donnent aux plats une profondeur unique.",
    cta: "Découvrir notre épice signature",
    ctaHref: "/catalogue",
  },

  mosaic: [
    {
      title: "Les poudres vibrantes",
      text: "Curcuma, paprika, la couleur avant le goût.",
      image: "/images/home/poudres.jpg",
      href: "/catalogue?family=poudres",
    },
    {
      title: "Graines & baies graphiques",
      text: "Poivres et cardamome, au relief si net.",
      image: "/images/home/graines.jpg",
      href: "/catalogue?family=graines",
    },
    {
      title: "Trésors rares & secrets",
      text: "Kalpasi, tonka : lichens et écorces.",
      image: "/images/home/tresors.jpg",
      href: "/catalogue?family=tresors",
    },
  ],

  recipes: {
    title: "Comment utiliser nos bocaux ce soir ?",
    items: [
      {
        title: "Le véritable riz biryani au tej patta",
        image: "/images/home/recette-biryani.jpg",
        href: "/catalogue",
      },
      {
        title: "Le velouté de potimarron au paprika fumé",
        image: "/images/home/recette-potimarron.jpg",
        href: "/catalogue",
      },
    ],
  },
} as const;