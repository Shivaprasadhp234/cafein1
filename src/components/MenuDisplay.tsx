'use client';

import { useState, useEffect } from 'react';
import { Section, MenuItem } from '@/src/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MenuDisplayProps {
  sections: Section[];
  items: MenuItem[];
}

const CATEGORY_IMAGES: Record<string, string> = {
  'CafeIn Special': 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80',
  'Coffee': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80',
  'Tea': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80',
  'Momos': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=1200&q=80',
  'Fries': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=1200&q=80',
  'Nuggets': 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80',
  'Nachos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=1200&q=80',
  'Pasta': 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
  'Maggie': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=1200&q=80',
  'Vada Pav': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=80',
  'Pav Bhaji': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=1200&q=80',
  'Desert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
  'Ice Cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1200&q=80',
  'Shakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80',
  'Soda': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80',
  'Mojito': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
  'Cool Drinks': 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=80',
};

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80';

export default function MenuDisplay({ sections, items }: MenuDisplayProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || '');

  // Intersection Observer to update active sticky nav item on scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    sections.forEach((section) => {
      const el = document.getElementById(`section-${section.id}`);
      if (el) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
                setActiveSectionId(section.id);
              }
            });
          },
          { rootMargin: '-20% 0px -80% 0px', threshold: 0.2 }
        );
        observer.observe(el);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      // Offset for sticky header
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

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
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Sticky Horizontal Navigation */}
      <nav className="sticky top-0 z-40 bg-cafe-50/90 backdrop-blur-xl border-b border-cafe-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-3 md:py-4">
            {sections.map((section) => {
              const isActive = activeSectionId === section.id;
              
              return (
                <button
                  key={`nav-${section.id}`}
                  onClick={() => scrollToSection(section.id)}
                  className={`
                    whitespace-nowrap text-sm md:text-base font-serif tracking-wide transition-all duration-300 px-5 py-2 rounded-full
                    ${isActive 
                      ? 'bg-cafe-charcoal text-cafe-50 shadow-md ring-2 ring-cafe-charcoal/20' 
                      : 'text-cafe-slate bg-white hover:text-cafe-charcoal hover:bg-cafe-100 border border-cafe-200 shadow-sm'}
                  `}
                >
                  {section.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Vertical Menu Content */}
      <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-12 space-y-16 md:space-y-24">
        {sections.map((section) => {
          const sectionItems = items.filter(item => item.section_id === section.id);
          if (sectionItems.length === 0) return null;
          
          const bannerImage = CATEGORY_IMAGES[section.name] || DEFAULT_BANNER;

          return (
            <motion.section
              key={`section-${section.id}`}
              id={`section-${section.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="scroll-m-32"
            >
              {/* Category Banner */}
              <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-6 shadow-md group">
                <Image
                  src={bannerImage}
                  alt={section.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide">
                    {section.name}
                  </h2>
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-3">
                {sectionItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 md:p-5 bg-white rounded-2xl border border-cafe-100 shadow-sm hover:shadow-md hover:border-cafe-200 transition-all duration-300 group"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-sans font-semibold text-lg md:text-xl text-cafe-charcoal group-hover:text-cafe-700 transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      {item.description && (
                        <p className="text-sm text-cafe-slate mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-serif font-bold text-lg md:text-xl text-cafe-charcoal">
                        ₹{item.price}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
