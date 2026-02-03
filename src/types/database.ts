export interface Section {
  id: string;
  name: string;
  sort_order?: number;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  section_id: string;
  image_url: string;
  created_at?: string;
  is_available?: boolean;
}
