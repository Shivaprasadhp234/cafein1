'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Coffee, LogOut, Plus, Trash2, Edit, Upload, Image as ImageIcon, ExternalLink, ArrowUp, ArrowDown, X, Save } from 'lucide-react';
import { Section, MenuItem } from '@/src/types/database';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [sections, setSections] = useState<Section[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Forms State
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

  // Edit Forms State
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editSectionName, setEditSectionName] = useState('');

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editItemData, setEditItemData] = useState({
    name: '',
    description: '',
    price: '',
    section_id: '',
  });
  const [editItemImage, setEditItemImage] = useState<File | null>(null);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

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
        .order('display_order', { ascending: true }); // Ordering by display_order

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true }); // Ordering by display_order

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

  // --- SECTION MANAGEMENT ---
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    // Determine the next display order
    const nextOrder = sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) + 1 : 1;

    try {
      setIsAddingSection(true);
      const { error } = await supabase
        .from('sections')
        .insert([{ name: newSectionName, display_order: nextOrder }]);

      if (error) throw error;
      
      setNewSectionName('');
      fetchData();
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Failed to add section');
    } finally {
      setIsAddingSection(false);
    }
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editSectionName.trim()) return;

    try {
      const { error } = await supabase
        .from('sections')
        .update({ name: editSectionName })
        .eq('id', editingSection.id);

      if (error) throw error;
      setEditingSection(null);
      fetchData();
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Failed to update section');
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

  const handleReorderSection = async (section: Section, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapSection = sections[swapIndex];

    const currentOrder = section.display_order;
    const swapOrder = swapSection.display_order;

    try {
      // Optimistic update
      const newSections = [...sections];
      newSections[currentIndex] = { ...section, display_order: swapOrder };
      newSections[swapIndex] = { ...swapSection, display_order: currentOrder };
      newSections.sort((a, b) => a.display_order - b.display_order);
      setSections(newSections);

      // DB update
      await Promise.all([
        supabase.from('sections').update({ display_order: swapOrder }).eq('id', section.id),
        supabase.from('sections').update({ display_order: currentOrder }).eq('id', swapSection.id)
      ]);
    } catch (err) {
      console.error('Error reordering section:', err);
      fetchData(); // Revert on error
    }
  };


  // --- MENU ITEM MANAGEMENT ---
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
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, newItemImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('menu-images')
          .getPublicUrl(fileName);
        
        image_url = publicUrl;
      }

      // Determine next display order for this section
      const sectionItems = menuItems.filter(m => m.section_id === newItem.section_id);
      const nextOrder = sectionItems.length > 0 ? Math.max(...sectionItems.map(s => s.display_order)) + 1 : 1;

      const { error } = await supabase
        .from('menu_items')
        .insert([{
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          section_id: newItem.section_id,
          image_url,
          display_order: nextOrder
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

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsUpdatingItem(true);
      let image_url = editingItem.image_url;

      if (editItemImage) {
        const fileExt = editItemImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, editItemImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('menu-images')
          .getPublicUrl(fileName);
        
        image_url = publicUrl;
      }

      const { error } = await supabase
        .from('menu_items')
        .update({
          name: editItemData.name,
          description: editItemData.description,
          price: parseFloat(editItemData.price),
          section_id: editItemData.section_id,
          image_url,
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      setEditingItem(null);
      setEditItemImage(null);
      fetchData();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    } finally {
      setIsUpdatingItem(false);
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

  const handleReorderItem = async (item: MenuItem, direction: 'up' | 'down') => {
    const sectionItems = menuItems.filter(m => m.section_id === item.section_id).sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sectionItems.findIndex(m => m.id === item.id);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sectionItems.length - 1)
    ) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapItem = sectionItems[swapIndex];

    const currentOrder = item.display_order;
    const swapOrder = swapItem.display_order;

    try {
      // Optimistic update
      const newItems = [...menuItems];
      const itemIndex = newItems.findIndex(m => m.id === item.id);
      const swapItemIndex = newItems.findIndex(m => m.id === swapItem.id);
      newItems[itemIndex] = { ...item, display_order: swapOrder };
      newItems[swapItemIndex] = { ...swapItem, display_order: currentOrder };
      setMenuItems(newItems);

      // DB update
      await Promise.all([
        supabase.from('menu_items').update({ display_order: swapOrder }).eq('id', item.id),
        supabase.from('menu_items').update({ display_order: currentOrder }).eq('id', swapItem.id)
      ]);
    } catch (err) {
      console.error('Error reordering item:', err);
      fetchData();
    }
  };

  // Setup Modals
  const openEditSectionModal = (section: Section) => {
    setEditingSection(section);
    setEditSectionName(section.name);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditItemData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      section_id: item.section_id,
    });
    setEditItemImage(null);
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
    <div className="min-h-screen bg-cafe-50 flex flex-col md:flex-row relative">
      
      {/* --- EDIT SECTION MODAL --- */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-cafe-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold text-cafe-charcoal">Edit Section</h2>
              <button onClick={() => setEditingSection(null)} className="text-cafe-slate hover:text-cafe-charcoal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cafe-slate mb-1">Section Name</label>
                <Input 
                  value={editSectionName}
                  onChange={e => setEditSectionName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT ITEM MODAL --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-cafe-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold text-cafe-charcoal">Edit Menu Item</h2>
              <button onClick={() => setEditingItem(null)} className="text-cafe-slate hover:text-cafe-charcoal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cafe-slate mb-1">Item Name</label>
                  <Input 
                    value={editItemData.name}
                    onChange={e => setEditItemData({...editItemData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cafe-slate mb-1">Price (₹)</label>
                  <Input 
                    type="number"
                    value={editItemData.price}
                    onChange={e => setEditItemData({...editItemData, price: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cafe-slate mb-1">Section</label>
                <select 
                  className="w-full rounded-xl border-2 border-cafe-100 bg-white px-4 py-3 text-cafe-charcoal focus:border-cafe-600 focus:outline-none focus:ring-4 focus:ring-cafe-600/10 transition-all"
                  value={editItemData.section_id}
                  onChange={e => setEditItemData({...editItemData, section_id: e.target.value})}
                  required
                >
                  <option value="">Select Section...</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cafe-slate mb-1">Description (Optional)</label>
                <Input 
                  value={editItemData.description}
                  onChange={e => setEditItemData({...editItemData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cafe-slate mb-1">Update Image (Optional)</label>
                <div className="relative h-12">
                  <input 
                    type="file" 
                    id="edit-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setEditItemImage(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="edit-image-upload"
                    className={`flex items-center justify-center gap-2 w-full h-full px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${editItemImage ? 'border-cafe-600 bg-cafe-50 text-cafe-600' : 'border-cafe-200 hover:border-cafe-400 text-cafe-charcoal/60'}`}
                  >
                    {editItemImage ? (
                      <>
                        <ImageIcon size={18} />
                        <span className="truncate">{editItemImage.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        <span>Upload New Image</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-cafe-100">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button type="submit" className="flex items-center gap-2" isLoading={isUpdatingItem}>
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-cafe-100 flex-shrink-0 flex flex-col min-h-screen sticky top-0">
        <div className="p-6 border-b border-cafe-100 flex items-center gap-3 shrink-0">
          <div className="p-2 bg-cafe-100 rounded-full text-cafe-600">
            <Coffee size={24} />
          </div>
          <span className="font-serif font-bold text-lg text-cafe-charcoal">Cafein Admin</span>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          <div className="px-4 py-2 bg-cafe-50 text-cafe-600 font-medium rounded-xl">
            Dashboard
          </div>
          {/* Add more links here later */}
        </nav>

        <div className="p-4 border-t border-cafe-100 shrink-0">
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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-cafe-100">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-cafe-charcoal">Menu Management</h1>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-600 text-amber-600 hover:bg-amber-50 transition-colors font-medium text-sm"
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">View Live Menu</span>
          </Link>
        </header>

        <div className="grid gap-8 xl:grid-cols-3">
          
          {/* Section Manager (Left Column) */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-cafe-100 p-6">
              <h2 className="text-xl font-serif font-semibold text-cafe-charcoal mb-4 flex items-center gap-2">
                <Coffee size={20} className="text-cafe-600" />
                Manage Sections
              </h2>
              
              <form onSubmit={handleAddSection} className="flex gap-2 mb-6">
                <Input 
                  placeholder="New Section Name" 
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  className="h-10"
                />
                <Button type="submit" size="sm" disabled={isAddingSection} className="shrink-0">
                  <Plus size={18} /> Add
                </Button>
              </form>

              <div className="space-y-3">
                {sections.length === 0 && (
                  <p className="text-cafe-charcoal/40 text-sm text-center py-4 bg-cafe-50 rounded-xl">No sections yet.</p>
                )}
                {sections.map((section, index) => (
                  <div key={section.id} className="flex items-center justify-between p-3 bg-white border border-cafe-200 shadow-sm rounded-xl group hover:border-cafe-400 transition-colors">
                    
                    {/* Reorder Controls */}
                    <div className="flex flex-col items-center mr-2 opacity-50 hover:opacity-100">
                      <button 
                        onClick={() => handleReorderSection(section, 'up')}
                        disabled={index === 0}
                        className="p-0.5 text-cafe-slate hover:text-cafe-600 disabled:opacity-20"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button 
                        onClick={() => handleReorderSection(section, 'down')}
                        disabled={index === sections.length - 1}
                        className="p-0.5 text-cafe-slate hover:text-cafe-600 disabled:opacity-20"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <span className="font-medium text-cafe-charcoal flex-1 truncate pr-2">{section.name}</span>
                    
                    <div className="flex gap-1 shrink-0">
                      <button 
                        onClick={() => openEditSectionModal(section)}
                        className="p-1.5 text-cafe-slate hover:text-cafe-600 hover:bg-cafe-100 rounded-lg transition-colors"
                        title="Edit Section"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 text-cafe-slate hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Section"
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
          <div className="xl:col-span-2 space-y-6">
            
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
                          <span>Upload Image (Optional)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <Input 
                  placeholder="Description (Optional)" 
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
                    <div className="bg-cafe-50/80 px-6 py-4 border-b border-cafe-100 flex justify-between items-center">
                      <h3 className="font-serif font-bold text-cafe-charcoal text-lg">{section.name}</h3>
                      <span className="text-xs font-medium text-cafe-charcoal bg-white px-3 py-1 rounded-full border border-cafe-200 shadow-sm">
                        {sectionItems.length} items
                      </span>
                    </div>
                    <div className="divide-y divide-cafe-100">
                      {sectionItems.map((item, index) => (
                        <div key={item.id} className="p-4 flex gap-4 hover:bg-cafe-50/50 transition-colors group items-center">
                          
                          {/* Item Reorder Controls */}
                          <div className="flex flex-col items-center opacity-50 hover:opacity-100 shrink-0 mr-1">
                            <button 
                              onClick={() => handleReorderItem(item, 'up')}
                              disabled={index === 0}
                              className="p-1 text-cafe-slate hover:text-cafe-600 disabled:opacity-20"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button 
                              onClick={() => handleReorderItem(item, 'down')}
                              disabled={index === sectionItems.length - 1}
                              className="p-1 text-cafe-slate hover:text-cafe-600 disabled:opacity-20"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>

                          {item.image_url && (
                            <div className="w-16 h-16 rounded-xl bg-cafe-100 overflow-hidden shrink-0 shadow-sm border border-cafe-200">
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {!item.image_url && (
                            <div className="w-16 h-16 rounded-xl bg-cafe-50 border border-cafe-100 flex items-center justify-center shrink-0 text-cafe-300">
                              <Coffee size={24} />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="font-semibold text-cafe-charcoal text-lg">{item.name}</h4>
                              <span className="font-serif font-bold text-cafe-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 shrink-0">₹{item.price}</span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-cafe-charcoal/60 line-clamp-2 mt-1">{item.description}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                            <button 
                              onClick={() => openEditItemModal(item)}
                              className="p-2 text-cafe-slate hover:text-cafe-600 hover:bg-cafe-100 rounded-xl transition-colors border border-transparent hover:border-cafe-200"
                              title="Edit Item"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-cafe-slate hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                              title="Delete Item"
                            >
                              <Trash2 size={18} />
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
