'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-stone-900 text-stone-50">
      {/* Background Image/Overlay */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-stone-900/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-amber-50 mb-4">
            Cafein
          </h1>
          <p className="text-xl md:text-2xl font-light text-stone-300 tracking-wide font-serif italic">
            Premium Coffee & Eats
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="pt-8"
        >
          <button
            onClick={scrollToMenu}
            className="group relative inline-flex items-center gap-2 px-8 py-3 text-sm uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors duration-300"
          >
            <span>Scroll to Menu</span>
            <ChevronDown className="animate-bounce" size={16} />
            <span className="absolute bottom-0 left-0 w-full h-px bg-amber-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
