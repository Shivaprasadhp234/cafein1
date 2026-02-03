'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Coffee, LogOut, Plus, Trash2, Edit, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Section, MenuItem } from '@/src/types/database';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [sections, setSections] = useState<Section[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form States
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    section_id: '',
  });
  const [newItemImage, setNewItemImage] = useState<File | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load Data & Check Auth
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      fetchData();
    };
    checkUser();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('created_at', { ascending: true });

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;
      setMenuItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Section Management
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      setIsAddingSection(true);
      const { error } = await supabase
        .from('sections')
        .insert([{ name: newSectionName }]);

      if (error) throw error;
      
      setNewSectionName('');
      fetchData(); // Refresh
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Failed to add section');
    } finally {
      setIsAddingSection(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure? This will delete all items in this section.')) return;

    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  // Menu Item Management
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.section_id) {
      alert('Please select a section');
      return;
    }

    try {
      setIsAddingItem(true);
      setUploading(true);

      let image_url = '';

      if (newItemImage) {
        const fileExt = newItemImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('menu-images')
          .upload(fileName, newItemImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('menu-images')
          .getPublicUrl(fileName);
        
        image_url = publicUrl;
      }

      const { error } = await supabase
        .from('menu_items')
        .insert([{
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          section_id: newItem.section_id,
          image_url,
        }]);

      if (error) throw error;

      setNewItem({ name: '', description: '', price: '', section_id: '' });
      setNewItemImage(null);
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } finally {
      setIsAddingItem(false);
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cafe-50">
        <div className="animate-spin text-cafe-600">
          <Coffee size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cafe-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-cafe-100 flex-shrink-0">
        <div className="p-6 border-b border-cafe-100 flex items-center gap-3">
          <div className="p-2 bg-cafe-100 rounded-full text-cafe-600">
            <Coffee size={24} />
          </div>
          <span className="font-serif font-bold text-lg text-cafe-charcoal">Cafein Admin</span>
        </div>
        
        <nav className="p-4 space-y-2">
          <div className="px-4 py-2 bg-cafe-50 text-cafe-600 font-medium rounded-xl">
            Dashboard
          </div>
          {/* Add more links here later */}
        </nav>

        <div className="p-4 mt-auto border-t border-cafe-100">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-lg border-2 border-cafe-slate text-cafe-slate hover:bg-cafe-100 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-cafe-charcoal">Menu Management</h1>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-600 text-amber-600 hover:bg-amber-50 transition-colors font-medium text-sm"
          >
            <ExternalLink size={16} />
            <span>View Live Menu</span>
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Section Manager (Left Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-cafe-100 p-6">
              <h2 className="text-xl font-serif font-semibold text-cafe-charcoal mb-4 flex items-center gap-2">
                <Coffee size={20} className="text-cafe-600" />
                Sections
              </h2>
              
              <form onSubmit={handleAddSection} className="flex gap-2 mb-6">
                <Input 
                  placeholder="New Section (e.g. Coffee)" 
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  className="h-10"
                />
                <Button type="submit" size="sm" disabled={isAddingSection} className="shrink-0">
                  <Plus size={18} />
                </Button>
              </form>

              <div className="space-y-2">
                {sections.length === 0 && (
                  <p className="text-cafe-charcoal/40 text-sm text-center py-4">No sections yet.</p>
                )}
                {sections.map(section => (
                  <div key={section.id} className="flex items-center justify-between p-3 bg-cafe-50 rounded-xl group">
                    <span className="font-medium text-cafe-charcoal">{section.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Edit button placeholder */}
                      <button className="p-1.5 text-cafe-charcoal/40 hover:text-cafe-600 hover:bg-white rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 text-cafe-charcoal/40 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Items Manager (Right Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add New Item Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-cafe-100 p-6">
              <h2 className="text-xl font-serif font-semibold text-cafe-charcoal mb-4">Add Menu Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    placeholder="Item Name" 
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                    required
                  />
                  <Input 
                    placeholder="Price (e.g. 150)" 
                    type="number"
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <select 
                    className="w-full rounded-xl border-2 border-cafe-100 bg-white/50 px-4 py-3 text-cafe-charcoal focus:border-cafe-600 focus:outline-none focus:ring-4 focus:ring-cafe-600/10 transition-all"
                    value={newItem.section_id}
                    onChange={e => setNewItem({...newItem, section_id: e.target.value})}
                    required
                  >
                    <option value="">Select Section...</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>

                  <div className="relative">
                    <input 
                      type="file" 
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={e => setNewItemImage(e.target.files?.[0] || null)}
                    />
                    <label 
                      htmlFor="image-upload"
                      className={`flex items-center justify-center gap-2 w-full h-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${newItemImage ? 'border-cafe-600 bg-cafe-50 text-cafe-600' : 'border-cafe-200 hover:border-cafe-400 text-cafe-charcoal/60'}`}
                    >
                      {newItemImage ? (
                        <>
                          <ImageIcon size={18} />
                          <span className="truncate">{newItemImage.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          <span>Upload Image</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <Input 
                  placeholder="Description" 
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={isAddingItem || uploading}>
                    Add Item
                  </Button>
                </div>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="space-y-6">
              {sections.map(section => {
                const sectionItems = menuItems.filter(item => item.section_id === section.id);
                if (sectionItems.length === 0) return null;

                return (
                  <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-cafe-100 overflow-hidden">
                    <div className="bg-cafe-50/50 px-6 py-3 border-b border-cafe-100 flex justify-between items-center">
                      <h3 className="font-serif font-bold text-cafe-charcoal">{section.name}</h3>
                      <span className="text-xs font-medium text-cafe-charcoal/40 bg-white px-2 py-1 rounded-full border border-cafe-100">
                        {sectionItems.length} items
                      </span>
                    </div>
                    <div className="divide-y divide-cafe-100">
                      {sectionItems.map(item => (
                        <div key={item.id} className="p-4 flex gap-4 hover:bg-cafe-50/30 transition-colors group">
                          {item.image_url && (
                            <div className="w-16 h-16 rounded-lg bg-cafe-100 overflow-hidden shrink-0">
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {!item.image_url && (
                            <div className="w-16 h-16 rounded-lg bg-cafe-100 flex items-center justify-center shrink-0 text-cafe-300">
                              <Coffee size={24} />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-cafe-charcoal">{item.name}</h4>
                              <span className="font-serif font-bold text-cafe-600">₹{item.price}</span>
                            </div>
                            <p className="text-sm text-cafe-charcoal/60 line-clamp-2 mt-1">{item.description}</p>
                          </div>

                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-cafe-charcoal/40 hover:text-cafe-600 hover:bg-cafe-100 rounded-lg transition-colors">
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-cafe-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
