import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Briefcase, Building2, Heart } from 'lucide-react';

const audiences = [
  {
    icon: GraduationCap,
    title: 'Students & Parents',
    description: 'Guiding academic and career choices with clarity and confidence.',
    color: 'text-secondary-blue',
    bgGradient: 'from-secondary-blue/10 to-secondary-blue/5',
  },
  {
    icon: Briefcase,
    title: 'Working Professionals',
    description: 'Career transitions, purpose discovery, and work–life harmony.',
    color: 'text-accent-orange',
    bgGradient: 'from-accent-orange/10 to-accent-orange/5',
  },
  {
    icon: Building2,
    title: 'Corporates & Institutions',
    description: 'Workshops on mental resilience, leadership growth & wellbeing.',
    color: 'text-primary-purple',
    bgGradient: 'from-primary-purple/10 to-primary-purple/5',
  },
  {
    icon: Heart,
    title: 'Individuals (21–75 Years)',
    description: 'Healing subconscious patterns, improving relationships & emotional alignment.',
    color: 'text-rose-500',
    bgGradient: 'from-rose-500/10 to-rose-500/5',
  },
];

export function WhoWeHelp() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="who-we-help" className="py-24 md:py-32 bg-gradient-to-br from-secondary-blue/5 via-background to-accent-orange/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-who-we-help-title">
            Who We Help
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We bridge the gap between career success and emotional wellness, offering personalized coaching and holistic guidance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="h-full glass-effect border border-card-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-visible group cursor-pointer" data-testid={`card-audience-${index}`}>
                <CardHeader className="space-y-0 pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.bgGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${audience.color}`}>
                    <audience.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="font-serif text-xl text-primary-purple">{audience.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{audience.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="glass-effect border border-card-border rounded-3xl p-12 max-w-4xl mx-auto shadow-xl">
            <h3 className="font-serif text-3xl font-bold mb-4">
              The Transformation Starts Within
            </h3>
            <p className="text-xl text-muted-foreground italic mb-6">
              "Healing isn't just recovery—it's rediscovery."
            </p>
            <p className="text-muted-foreground leading-relaxed">
              At Claryntia, we blend science-backed assessments with energy-based therapies to help you unlock your highest potential.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
