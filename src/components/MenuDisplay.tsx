'use client';

import { useState } from 'react';
import { Section, MenuItem } from '@/src/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Plus } from 'lucide-react';

interface MenuDisplayProps {
  sections: Section[];
  items: MenuItem[];
}

export default function MenuDisplay({ sections, items }: MenuDisplayProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

  const activeItems = items.filter(item => item.section_id === activeSection);
  const activeSectionObj = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-cafe-50 pb-24" id="menu-container">
      {/* Hide Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* Sticky Horizontal Navigation */}
      <nav className="sticky top-0 z-40 bg-cafe-50/80 backdrop-blur-xl border-b border-cafe-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide py-4 md:justify-center">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    whitespace-nowrap text-sm md:text-base font-serif tracking-wide transition-all duration-300 px-4 py-2 rounded-full
                    ${isActive 
                      ? 'bg-cafe-charcoal text-cafe-50 shadow-md' 
                      : 'text-cafe-slate hover:text-cafe-charcoal hover:bg-cafe-100'}
                  `}
                >
                  {section.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 pt-12">
        {activeSectionObj && (
          <motion.div
            key={`title-${activeSection}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 pl-2 border-l-4 border-cafe-600"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-cafe-charcoal">
              {activeSectionObj.name}
            </h2>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeItems.length > 0 ? (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-cafe-100"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-cafe-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-cafe-slate/30">
                          <span className="font-serif italic">Cafein</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="font-serif font-bold text-cafe-charcoal">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 relative">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="font-sans font-semibold text-lg text-cafe-charcoal leading-tight group-hover:text-cafe-600 transition-colors">
                          {item.name}
                        </h3>
                        <button className="shrink-0 p-2 rounded-full bg-cafe-50 text-cafe-600 hover:bg-cafe-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                          <Plus size={18} />
                        </button>
                      </div>
                      <p className="text-sm text-cafe-slate font-light leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${activeSection}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-24 flex items-center justify-center"
            >
              <p className="font-serif text-cafe-charcoal/40 italic">Coming Soon</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
