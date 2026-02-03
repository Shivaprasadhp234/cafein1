import Link from 'next/link';
import { Lock, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-cafe-charcoal text-cafe-50 mt-auto border-t border-cafe-50/10">
      <div className="max-w-7xl mx-auto px-4 py-12 relative grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-3">
          <h3 className="font-serif text-3xl md:text-4xl">Cafein</h3>
          <p className="text-sm text-cafe-slate">
            Boutique coffee, crafted with care. Minimal, modern, and high-end.
          </p>
          <p className="text-xs text-cafe-slate/80">
            &copy; {currentYear} Cafein. All rights reserved.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs tracking-[0.25em] text-cafe-50/80">CONTACT</h4>
          <div className="space-y-3">
            <a
              href="https://wa.me/919380006393"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-cafe-50 hover:text-amber-500 transition-colors"
            >
              <Phone size={16} className="text-amber-500" />
              <span>9380006393</span>
            </a>
            <a
              href="https://wa.me/918197140519"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-cafe-50 hover:text-amber-500 transition-colors"
            >
              <Phone size={16} className="text-amber-500" />
              <span>8197140519</span>
            </a>
            <a
              href="mailto:cafeindvg@gmail.com"
              className="flex items-center gap-3 text-cafe-50 hover:text-amber-500 transition-colors"
            >
              <Mail size={16} className="text-amber-500" />
              <span>cafeindvg@gmail.com</span>
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs tracking-[0.25em] text-cafe-50/80">LOCATION</h4>
          <Link
            href="https://maps.app.goo.gl/ajTtc5h95tc88HNm7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-cafe-50 hover:text-amber-500 transition-colors"
          >
            <MapPin size={16} className="text-amber-500" />
            <span>Open in Google Maps</span>
          </Link>
        </div>

        <Link
          href="/admin/login"
          className="absolute bottom-6 right-6 text-cafe-slate hover:text-amber-600 transition-colors p-2 rounded-full hover:bg-white/5"
          aria-label="Admin Access"
        >
          <Lock size={14} />
        </Link>
      </div>
    </footer>
  );
}
