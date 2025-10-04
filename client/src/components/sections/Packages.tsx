import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const packages = [
  {
    name: 'Career Clarity Sessions',
    price: '₹4,999',
    subtitle: 'For Students & Early Professionals',
    features: [
      'Psychometric Assessment',
      '1:1 Career Clarity Coaching',
      'Personalized Roadmap',
      'Lifetime Access to Mentoria Platform',
    ],
    popular: false,
  },
  {
    name: 'Healing & Relationship Coaching',
    price: '₹6,999',
    subtitle: 'For Working Professionals & Individuals',
    features: [
      '2 Deep-Dive Healing Sessions',
      'Energy Reading + EFT + Ho\'oponopono',
      'Progress Plan & Guided Meditation',
    ],
    popular: true,
  },
  {
    name: 'Comprehensive Clarity Program',
    price: '₹10,499',
    subtitle: 'For Professionals & Couples',
    features: [
      'Career + Relationship Healing Combo',
      '3 Personalized Sessions',
      'Emotional Detox Workbook',
      'Ongoing Mentorship Support',
    ],
    popular: false,
  },
];

export function Packages() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="packages" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-packages-title">
            Packages
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect package for your transformation journey
          </p>
          <p className="text-sm text-muted-foreground mt-2">*Price finalized post free discovery call</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="h-full"
            >
              <Card 
                className={`h-full flex flex-col glass-effect border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-visible relative ${
                  pkg.popular ? 'border-primary-purple border-2' : 'border-card-border'
                }`}
                data-testid={`card-package-${index}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary-purple to-secondary-blue text-white px-6 py-1 text-sm rounded-full">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="space-y-0 pb-6 pt-8">
                  <CardTitle className="font-serif text-2xl mb-2">{pkg.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">{pkg.subtitle}</p>
                  <div className="font-serif text-4xl font-bold text-primary-purple" data-testid={`price-${index}`}>
                    {pkg.price}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary-purple" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full rounded-full py-6 ${
                      pkg.popular 
                        ? 'bg-gradient-to-r from-primary-purple to-secondary-blue text-white' 
                        : 'bg-primary-purple text-white'
                    }`}
                    data-testid={`button-get-started-${index}`}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
