export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  quantity: number;
  weight?: string; // ex: "100g", "250g"
}