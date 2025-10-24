import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import logoImg from '@assets/Screenshot_2025-10-04_122812-removebg-preview_1759562746476.png';

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-primary-purple via-secondary-blue to-accent-orange opacity-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <img 
            src={logoImg} 
            alt="Claryntia Logo" 
            className="w-32 h-32 mx-auto mb-8"
            data-testid="img-logo"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-5xl md:text-7xl font-bold mb-6"
          data-testid="text-hero-title"
        >
          Aligning Ambition with Clarity
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto"
          data-testid="text-hero-subtitle"
        >
          Empowering Minds. Healing Hearts. Redefining Possibilities.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg text-muted-foreground mb-12 max-w-4xl mx-auto"
          data-testid="text-hero-description"
        >
          Helping students, professionals, and organizations achieve harmony between career success and emotional well-being in today's fast-evolving world.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary-purple to-secondary-blue text-white px-8 py-6 text-lg rounded-full group"
            data-testid="button-free-call"
          >
            Free Clarity Discovery Call
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-6 text-lg rounded-full border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white transition-colors"
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
