import logoImg from '@assets/Screenshot_2025-10-04_122812-removebg-preview_1759562746476.png';
import { Heart, Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary-purple via-purple-800 to-primary-purple/90 text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-accent-orange/5"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={logoImg} alt="Claryntia" className="w-14 h-14" />
              <span className="font-serif text-2xl font-bold text-emerald-50">Claryntia</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-6">
              Aligning Ambition with Inner Clarity. Empowering minds, healing hearts, and redefining possibilities.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/urmidasgupta" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/40 hover:to-emerald-600/40 flex items-center justify-center transition-all border border-emerald-400/30" data-testid="link-footer-instagram">
                <Instagram className="w-5 h-5 text-emerald-100" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/40 hover:to-emerald-600/40 flex items-center justify-center transition-all border border-emerald-400/30" data-testid="link-footer-linkedin">
                <Linkedin className="w-5 h-5 text-emerald-100" />
              </a>
              <a href="https://www.facebook.com/urmi.dasgupta" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/40 hover:to-emerald-600/40 flex items-center justify-center transition-all border border-emerald-400/30" data-testid="link-footer-facebook">
                <Facebook className="w-5 h-5 text-emerald-100" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-emerald-100">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/90">
              <li><a href="#services" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer" data-testid="link-footer-services">Services</a></li>
              <li><a href="#packages" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer" data-testid="link-footer-packages">Packages</a></li>
              <li><a href="#methodology" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer" data-testid="link-footer-methodology">Methodology</a></li>
              <li><a href="#founder" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer" data-testid="link-footer-about">About</a></li>
              <li><a href="#blog" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer" data-testid="link-footer-blog">Blog</a></li>
              <li><a href="#contact" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer" data-testid="link-footer-contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-emerald-100">Our Services</h4>
            <ul className="space-y-3 text-sm text-white/90">
              <li><a href="#services" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer">Career Clarity & Guidance</a></li>
              <li><a href="#services" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer">Relationship Healing</a></li>
              <li><a href="#services" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer">Energy Reading</a></li>
              <li><a href="#services" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer">Workshops & Seminars</a></li>
              <li><a href="#mentoria-packages" className="hover:text-emerald-300 hover:translate-x-1 inline-block transition-all cursor-pointer">Mentoria Packages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-emerald-100">Contact Us</h4>
            <ul className="space-y-4 text-sm text-white/90">
              <li className="flex items-start gap-3 group">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <a href="mailto:claryntia@gmail.com" className="hover:text-emerald-300 transition-colors">
                  claryntia@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <a href="tel:+919886635186" className="hover:text-emerald-300 transition-colors">
                  +91 9886635186
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <span>Bangalore, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/80">
            © 2025 Claryntia. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-accent-orange fill-current" />
            <span>by Mentoria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
