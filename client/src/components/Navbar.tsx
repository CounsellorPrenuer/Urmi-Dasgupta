import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImg from '@assets/Screenshot_2025-10-04_122812-removebg-preview_1759562746476.png';
import { FreeDiscoveryCallModal } from '@/components/FreeDiscoveryCallModal';

const navLinks = [
  { name: 'Services', href: '#services' },
  { name: 'Packages', href: '#packages' },
  { name: 'About', href: '#founder' },
  { name: 'Blog', href: '#blog' },
  { name: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('#hero');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setIsPastHero(heroBottom <= 80);
      }
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      // Close menu first for better UX
      setIsMobileMenuOpen(false);
      
      // Small delay to let menu animation complete, then scroll
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent"
      data-testid="nav-main"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            data-testid="link-nav-logo"
          >
            <img
              src={logoImg}
              alt="Claryntia"
              className="w-12 h-12 object-contain transition-transform group-hover:rotate-6"
              data-testid="img-nav-logo"
            />
            <span className={`font-serif text-2xl font-bold transition-colors duration-300 ${isPastHero ? 'text-primary-purple' : 'text-white'}`}>
              Claryntia
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-white/90 hover:text-white font-medium transition-colors relative group cursor-pointer"
                data-testid={`link-nav-${link.name.toLowerCase()}`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-purple to-secondary-blue transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
          </div>

          {/* CTA Button - Desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="hidden md:block"
          >
            <Button
              size="default"
              className="bg-gradient-to-r from-accent-orange via-orange-500 to-orange-600 hover:from-orange-600 hover:via-orange-500 hover:to-accent-orange text-white rounded-full px-6"
              onClick={() => setIsModalOpen(true)}
              data-testid="button-nav-cta"
            >
              Book Free Call
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            data-testid="button-mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900/98 backdrop-blur-xl border-t border-gray-800"
            role="navigation"
            aria-label="Mobile navigation"
            data-testid="nav-mobile-menu"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="block text-lg font-medium text-white/90 hover:text-white transition-colors py-2 cursor-pointer"
                  data-testid={`link-mobile-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="pt-4"
              >
                <Button
                  size="default"
                  className="w-full bg-gradient-to-r from-accent-orange via-orange-500 to-orange-600 hover:from-orange-600 hover:via-orange-500 hover:to-accent-orange text-white rounded-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsModalOpen(true);
                  }}
                  data-testid="button-mobile-cta"
                >
                  Book Free Call
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <FreeDiscoveryCallModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </motion.nav>
  );
}
