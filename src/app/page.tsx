import { createClient } from '@/src/lib/supabase-server';
import Hero from '@/src/components/Hero';
import MenuDisplay from '@/src/components/MenuDisplay';

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  let sections: any[] = [];
  let menuItems: any[] = [];

  // Fetch sections - fallback to sorting by created_at or name since sort_order is missing
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    sections = data || [];
  } catch (err) {
    console.error('Error fetching sections:', err);
  }

  // Fetch menu items - remove is_available filter since column is missing
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    menuItems = data || [];
  } catch (err) {
    console.error('Error fetching menu items:', err);
  }

  return (
    <div className="bg-cafe-50 selection:bg-cafe-200 selection:text-cafe-charcoal">
      <Hero />
      
      <MenuDisplay 
        sections={sections} 
        items={menuItems} 
      />
    </div>
  );
}
