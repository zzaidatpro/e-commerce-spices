export const homeContent = {
  hero: {
    title: "L'excellence dans votre cuisine",
    image: "../public/imges/best_image.jpg",
    imageAlt: "Bocaux signatures ...",
    cta: "Découvrir la gamme",
    ctaHref: "/recette",
  },

  promises: [
    {
      title: "Des produits de qualité, des origines certifiées !",
      text: "Récoltes artisanales en Inde, du tej patta aux baies rares.",
    },
    {
      title: "Bocaux signatures",
      text: "Verre borosilicate et fermoir hermétique ... Une parfaite conservation.",
    },
    {
      title: "Sans additifs",
      text: "100 % naturel, sans colorants ni conservateurs.",
    },
  ],

  bestSellerSlugs: ["safran", "poivre-noir", "vanille", "curcuma"],

  story: {
    image: "../public/imges/collection_spices.jpg",
    imageAlt: "Feuilles de tej patta entières",
    title: "Le tej patta : plus qu'un laurier, une révélation.",
    text: "Au-delà du laurier européen, le tej patta se distingue par ses notes de cannelle et de girofle, qui donnent aux plats une profondeur unique.",
    cta: "Découvrir notre épice signature",
    ctaHref: "/signature",
  },

  mosaic: [
    {
      title: "Les poudres vibrantes",
      text: "Curcuma, paprika, la couleur avant le goût.",
      image: "/images/home/poudre.jpg",
      href: "/product?family=epices",
    },
    {
      title: "Graines & baies graphiques",
      text: "Poivres et cardamome, au relief si net.",
      image: "/images/home/graines.jpg",
      href: "/products?family=graines",
    },
    {
      title: "Trésors rares & secrets",
      text: "Kalpasi, tonka : lichens et écorces.",
      image: "/images/home/tresors.jpg",
      href: "/products?family=aromes",
    },
    {
      title: "Anis, fenouil, badiane étoilée, clou de girofle, poivre, cardamome.",
      text: "merveilleux mélange d’épices revigorant aux nombreuses vertus",
      image: "/images/home/infusion.jpg",
      href: "/products?family=Herbes",
    }


  ],

  recipes: {
    title: "Comment utiliser nos bocaux ce soir ?",
    items: [
      {
        title: "Le véritable riz biryani au tej patta",
        image: "/images/home/recette-biryani.jpg",
        href: "/recette",
      },
      {
        title: "Le velouté de potimarron au paprika fumé",
        image: "/images/home/recette-potimarron.jpg",
        href: "/recette",
      },
    ],
  },

  footer: {
    boutique: [
      { label: 'Tous les produits', href: '/products' },
      { label: 'Recettes Signatures', href: '/recette'},
      { label: `L'histoire des épices`, href: '/histoire'}
    ],
    informations: [
      { label: 'À propos de nous', href: '/about' },
      { label: 'Livraison & Retours', href: '/shipping' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
    Famille : [
  { slug: 'tous', label: 'Tous les produits' },
  { slug: 'epices', label: 'Epices' },
  { slug: 'huiles', label: 'Huiles' },
  { slug: 'graines', label: 'Graines' },
  { slug: 'sels', label: 'Sels' },
  { slug: 'aromes', label: 'Aromes' },
  { slug: 'fruits', label: 'Fruits' },
  { slug: 'herbes', label: 'Herbes' },
] 
  }
} as const;