import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import type { MentoriaPackage } from '@shared/schema';
import { MentoriaPaymentModal } from '@/components/MentoriaPaymentModal';

const categories = [
  '8-9 Students',
  '10-12 Students',
  'College Graduates',
  'Working Professionals'
];

export function MentoriaPackages() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedPackage, setSelectedPackage] = useState<MentoriaPackage | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  const { data: packages, isLoading } = useQuery<MentoriaPackage[]>({
    queryKey: ["/api/mentoria-packages/active"],
  });

  const handleBookNow = (pkg: MentoriaPackage) => {
    setSelectedPackage(pkg);
    setIsPaymentModalOpen(true);
  };

  if (isLoading) {
    return null;
  }

  if (!packages || packages.length === 0) {
    return null;
  }

  const filteredPackages = packages
    .filter(pkg => pkg.category === selectedCategory)
    .sort((a, b) => {
      const aIsPlus = a.name.toLowerCase().includes('plus');
      const bIsPlus = b.name.toLowerCase().includes('plus');
      if (aIsPlus && !bIsPlus) return 1;
      if (!aIsPlus && bIsPlus) return -1;
      return 0;
    });

  return (
    <section id="mentoria-packages" className="py-24 md:py-32 bg-gradient-to-br from-primary-purple/5 via-background to-secondary-blue/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-mentoria-packages-title">
            Mentoria Packages
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the right Mentoria plan for your career growth
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary-purple text-white shadow-lg scale-105'
                  : 'bg-card hover-elevate text-foreground'
              }`}
              data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6">
          {filteredPackages.map((pkg, index) => {
            const isPlus = pkg.name.toLowerCase().includes('plus');
            return (<motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-full md:max-w-[calc(50%_-_0.75rem)] lg:max-w-[calc(33.333%_-_1rem)]"
            >
              <Card 
                className={`h-full glass-effect shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl flex flex-col relative ${
                  isPlus 
                    ? 'border-2 border-transparent bg-gradient-to-br from-primary-purple/10 via-accent-orange/5 to-secondary-blue/10 hover:bg-gradient-to-br hover:from-primary-purple/15 hover:via-accent-orange/10 hover:to-secondary-blue/15' 
                    : 'border border-card-border hover:bg-emerald-500/10'
                }`}
                style={isPlus ? {
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, hsl(270, 73%, 35%), hsl(32, 100%, 50%))',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                } : undefined}
                data-testid={`card-mentoria-package-${pkg.id}`}
              >
                {isPlus && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-primary-purple to-accent-orange text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Premium Plus
                    </div>
                  </div>
                )}
                
                <CardHeader className="space-y-2">
                  <CardTitle className={`font-serif text-2xl ${isPlus ? 'bg-gradient-to-r from-primary-purple to-accent-orange bg-clip-text text-transparent' : ''}`}>
                    {pkg.name}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">{pkg.category}</div>
                  <div className="pt-2">
                    <div className="text-3xl font-bold text-primary-purple">
                      ₹{pkg.price.toLocaleString()}
                    </div>
                  </div>
                  <CardDescription className="text-sm">{pkg.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground">Features:</h4>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    size="lg"
                    className={`w-full rounded-full ${
                      isPlus 
                        ? 'bg-gradient-to-r from-primary-purple to-accent-orange text-white hover:opacity-90' 
                        : 'bg-primary-purple text-white'
                    }`}
                    onClick={() => handleBookNow(pkg)}
                    data-testid={`button-book-${pkg.id}`}
                  >
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            );
          })}
        </div>
      </div>

      {selectedPackage && (
        <MentoriaPaymentModal
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          package={selectedPackage}
        />
      )}
    </section>
  );
}
