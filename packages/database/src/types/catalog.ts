export const featuredSpices = [
  { slug: "safran", name: "Safran", origin: "Iran · Espagne", image: "/images/spices/safran.jpg",
    description: "Les stigmates séchés du crocus, la plus précieuse des épices." },
  { slug: "cannelle-de-ceylan", name: "Cannelle de Ceylan", origin: "Sri Lanka", image: "/images/spices/cannelle.jpg",
    description: "Une écorce fine et douce, aux notes chaudes et sucrées." },
  { slug: "poivre-noir", name: "Poivre noir", origin: "Inde · Kerala", image: "/images/spices/poivre.jpg",
    description: "Piquant et boisé, à moudre à la dernière minute." },
  { slug: "vanille", name: "Vanille", origin: "Madagascar", image: "/images/spices/vanille.jpg",
    description: "Des gousses souples et parfumées pour desserts et sauces." },
  { slug: "curcuma", name: "Curcuma", origin: "Inde", image: "/images/spices/curcuma.jpg",
    description: "Une racine dorée, terreuse et légèrement poivrée." },
  { slug: "piment-d-espelette", name: "Piment d'Espelette", origin: "France · Pays basque", image: "/images/spices/espelette.jpg",
    description: "Fruité et doux, avec une chaleur tout en rondeur." },
] as const;

export const categoryGroups = [
  {
    title: "Régions",
    items: [
      { slug: "asie", label: "Asie", href: "/products?region=asie" },
      { slug: "afrique", label: "Afrique", href: "/products?region=afrique" },
      { slug: "amerique-latine", label: "Amérique latine", href: "/products?region=amerique-latine" },
      { slug: "mediterranee", label: "Méditerranée & Moyen-Orient", href: "/products?region=mediterranee" },
    ],
  },
  {
    title: "Familles",
    items: [
      { slug: "poivres", label: "Poivres & baies", href: "/products?type=poivres" },
      { slug: "piments", label: "Piments", href: "/products?type=piments" },
      { slug: "graines", label: "Graines", href: "/products?type=graines" },
      { slug: "racines", label: "Racines & rhizomes", href: "/products?type=racines" },
      { slug: "melanges", label: "Mélanges signature", href: "/products?type=melanges" },
    ],
  },
] as const;

export const origins = [
  { slug: "asie", region: "Asie",
    text: "Berceau des grandes épices de la route maritime, des côtes du Kerala aux îles de l'Indonésie.",
    spices: ["Poivre", "Cannelle", "Girofle", "Gingembre", "Curcuma"] },
  { slug: "afrique", region: "Afrique",
    text: "Du Maghreb à Madagascar, des mélanges complexes et des saveurs puissantes.",
    spices: ["Ras el hanout", "Berbéré", "Grains de paradis", "Vanille de Madagascar"] },
  { slug: "amerique-latine", region: "Amérique latine",
    text: "Les Amériques ont offert au monde le piment et la vanille.",
    spices: ["Piments", "Vanille", "Rocou", "Poivre de la Jamaïque"] },
  { slug: "mediterranee", region: "Méditerranée & Moyen-Orient",
    text: "Des épices de cuisine du quotidien, fruitées, acidulées et parfumées.",
    spices: ["Safran", "Sumac", "Cumin", "Coriandre", "Za'atar"] },
] as const;

export const history = [
  { period: "Antiquité", title: "Les premières routes",
    text: "Cannelle, cumin ou coriandre circulent déjà entre l'Asie, l'Égypte et le Proche-Orient, pour la cuisine, les parfums et l'embaumement." },
  { period: "Moyen Âge", title: "Un luxe venu d'Orient",
    text: "Les épices arrivent en Europe par des routes terrestres et maritimes, via des cités marchandes comme Venise. Leur rareté en fait des produits de grand prix." },
  { period: "1498", title: "La route maritime",
    text: "Vasco de Gama atteint Calicut, en Inde, en contournant l'Afrique par le cap de Bonne-Espérance, et ouvre un accès direct aux sources du poivre." },
  { period: "XVIIᵉ siècle", title: "Les compagnies des Indes",
    text: "Les compagnies commerciales, dont la VOC néerlandaise fondée en 1602, se disputent le contrôle de la muscade et du girofle." },
  { period: "1770", title: "Le monopole brisé",
    text: "Le Français Pierre Poivre fait introduire girofliers et muscadiers à l'île Maurice, ce qui contribue à ouvrir la production hors des Moluques." },
  { period: "Aujourd'hui", title: "Retour au producteur",
    text: "Traçabilité, récoltes artisanales et circuits courts : on redécouvre l'origine précise de chaque épice." },
] as const;