import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import type { MentoriaPackage } from '@shared/schema';
import { MentoriaPaymentModal } from '@/components/MentoriaPaymentModal';

const categories = [
  '8-9 Students',
  '10-12 Students',
  'College Graduates',
  'Working Professionals'
];

const categoryMapping: Record<string, string> = {
  '8-9 Students': '8-9 students',
  '10-12 Students': '10-12 students',
  'College Graduates': 'graduates',
  'Working Professionals': 'working professionals'
};

import { sanityClient } from '@/lib/sanity';
// Removed static import

export function MentoriaPackages() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedPackage, setSelectedPackage] = useState<MentoriaPackage | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [sanityPackages, setSanityPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const query = `*[_type == "pricing" && category == "mentoria"] | order(order asc) {
          planId,
          title,
          description,
          price,
          category,
          subgroup,
          features,
          isPopular,
          "id": planId
        }`;
        const result = await sanityClient.fetch(query);
        if (result && result.length > 0) {
          setSanityPackages(result.map((pkg: any) => ({
            ...pkg,
            name: pkg.title,
            features: pkg.features || [],
            isActive: true,
            planId: pkg.planId, // Explicit mapping
            subgroup: pkg.subgroup
          })));
        } else {
          setSanityPackages([]);
        }
      } catch (error) {
        console.error('Error fetching Mentoria packages:', error);
        setSanityPackages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const packages = sanityPackages;

  const handleBookNow = (pkg: MentoriaPackage) => {
    setSelectedPackage(pkg);
    setIsPaymentModalOpen(true);
  };

  if (isLoading) {
    // Optional: Return a loader or null
    // return null;
  }

  const filteredPackages = (packages || [])
    .filter((pkg: any) => {
      // Sanity check: compare mapped subgroup OR fallback to old 'category' field for static data
      const targetSubgroup = categoryMapping[selectedCategory];
      if (pkg.subgroup) {
        return pkg.subgroup === targetSubgroup;
      }
      // Fallback for static (which uses 'category' property with UI label values)
      return pkg.category === selectedCategory;
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
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${selectedCategory === category
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
          {filteredPackages.map((pkg: any, index: number) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-full md:max-w-[calc(50%_-_0.75rem)] lg:max-w-[calc(33.333%_-_1rem)]"
            >
              <Card
                className={`h-full glass-effect shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-emerald-500/10 rounded-2xl flex flex-col relative ${pkg.isPopular
                  ? 'border-2 border-primary-purple/50 shadow-[0_0_30px_rgba(106,27,154,0.3)]'
                  : 'border border-card-border'
                  }`}
                data-testid={`card-mentoria-package-${pkg.id}`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-2 border-background shadow-lg px-4 py-1 text-sm font-semibold flex items-center gap-1.5" data-testid={`badge-popular-${pkg.id}`}>
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="space-y-2">
                  <CardTitle className="font-serif text-2xl text-accent-orange">{pkg.name}</CardTitle>
                  <div className="text-sm text-muted-foreground capitalize">{pkg.category}</div>
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
                    className="w-full bg-primary-purple text-white rounded-full"
                    onClick={() => handleBookNow(pkg)}
                    data-testid={`button-book-${pkg.id}`}
                  >
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
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
