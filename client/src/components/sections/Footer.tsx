import logoImg from '@assets/Screenshot_2025-10-04_122812-removebg-preview_1759562746476.png';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary-purple text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImg} alt="Claryntia" className="w-12 h-12" />
              <span className="font-serif text-2xl font-bold">Claryntia</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Aligning Ambition with Inner Clarity. Empowering minds, healing hearts, and redefining possibilities.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#services" className="hover:text-white transition-colors" data-testid="link-footer-services">Services</a></li>
              <li><a href="#packages" className="hover:text-white transition-colors" data-testid="link-footer-packages">Packages</a></li>
              <li><a href="#blog" className="hover:text-white transition-colors" data-testid="link-footer-blog">Blog</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors" data-testid="link-footer-contact">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/80">
            © 2025 Claryntia. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red fill-current" />
            <span>by Mentoria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
