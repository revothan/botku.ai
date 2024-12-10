export interface Product {
  id: string;
  profile_id: string;
  name: string;
  details?: string;
  price: number;
  stock?: number;
  sku?: string;
  delivery_fee?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  cta?: string;
  purchase_link?: string;
}