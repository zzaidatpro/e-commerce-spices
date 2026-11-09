export interface FaqQuestion {
  q: string;
  a: string;
}

export interface FaqCategory {
  category: string;
  questions: FaqQuestion[];
}

export const faqCategories: FaqCategory[] = [
  {
    category: 'Commandes & Produits',
    questions: [
      {
        q: "Comment sont conditionnées vos épices ?",
        a: "Toutes nos épices et condiments sont emballés dans des sachets hermétiques éco-conçus ou des flacons en verre soigneusement scellés afin de préserver durablement la puissance de leurs arômes et leurs huiles essentielles de nos ateliers jusqu'à votre cuisine."
      },
      {
        q: "Quelle est la durée de conservation des épices Tej Patta ?",
        a: "Nos épices gardent l'essentiel de leur fraîcheur entre 12 et 24 mois si elles sont conservées à l'abri de la lumière, de l'humidité et de la chaleur dans leur emballage d'origine."
      },
      {
        q: "Puis-je modifier ou annuler ma commande ?",
        a: "Vous pouvez modifier ou annuler votre commande tant qu'elle n'a pas basculé au statut de préparation dans notre atelier. Contactez rapidement notre service client par téléphone ou via le formulaire de contact."
      }
    ]
  },
  {
    category: 'Livraison & Expédition',
    questions: [
      {
        q: "Quels sont les délais de livraison en Algérie ?",
        a: "Pour les commandes préparées et validées, les délais moyens constatés sont de 2 à 5 jours ouvrés selon votre wilaya de résidence. Un numéro de suivi vous est transmis dès l'expédition."
      },
      {
        q: "Proposez-vous la livraison pour les professionnels (B2B) ?",
        a: "Oui, nous accompagnons de nombreux restaurants, traiteurs et professionnels (notamment dans la région d'Alger et ses environs). Vous pouvez nous contacter directement pour établir un partenariat commercial adapté."
      }
    ]
  },
  {
    category: 'Retours & Remboursements',
    questions: [
      {
        q: "Puis-je retourner un produit si je ne suis pas satisfait ?",
        a: "Conformément à nos conditions, vous disposez de 14 jours après réception pour exercer votre droit de rétractation, sous réserve que les sachets ou flacons soient strictement scellés et non ouverts pour des raisons d'hygiène alimentaire."
      },
      {
        q: "Que faire si mon colis arrive endommagé ?",
        a: "Si votre colis présente des avaries notables à la réception, prenez des photos immédiates des produits endommagés et contactez notre service client sous 48h pour un remplacement ou un remboursement."
      }
    ]
  }
];