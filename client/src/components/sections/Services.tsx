import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Briefcase, Building2, Heart, Lightbulb, Users, Sparkles, BookOpen } from 'lucide-react';

const services = [
  {
    icon: GraduationCap,
    title: 'Career Clarity & Guidance',
    description: 'For Students & Professionals. Structured counselling via Mentoria\'s certified platform.',
    color: 'text-primary-purple',
  },
  {
    icon: Heart,
    title: 'Relationship Healing & Coaching',
    description: '1:1 personalized sessions to break repeating emotional cycles.',
    color: 'text-accent-orange',
  },
  {
    icon: Sparkles,
    title: 'Energy Reading & Graphotherapy',
    description: 'Decode subconscious through handwriting & vibrational patterns.',
    color: 'text-secondary-blue',
  },
  {
    icon: BookOpen,
    title: 'Workshops & Seminars',
    description: 'For schools, colleges, and corporates — topics on wellbeing, communication & clarity.',
    color: 'text-primary-purple',
  },
];

const pillars = [
  {
    icon: Lightbulb,
    title: 'Science Meets Soul',
    description: 'Blend of modern psychology and ancient healing wisdom',
  },
  {
    icon: Users,
    title: 'Data-Driven Self-Awareness',
    description: 'Psychometric tools that map strengths, patterns, and blind spots',
  },
  {
    icon: Sparkles,
    title: 'Energy Integration',
    description: 'Balancing mind, body & emotion for peak alignment',
  },
  {
    icon: Heart,
    title: 'Transformational Coaching',
    description: 'Career + Relationship + Emotional Healing = Wholeness',
  },
];

export function Services() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="services" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-services-title">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solutions for career clarity, emotional healing, and personal transformation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="h-full glass-effect border border-card-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-visible" data-testid={`card-service-${index}`}>
                <CardHeader className="space-y-0 pb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-purple/10 to-secondary-blue/10 flex items-center justify-center mb-4 ${service.color}`}>
                    <service.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="font-serif text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Our Pillars of Excellence
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="text-center p-6"
              data-testid={`pillar-${index}`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-purple/20 to-accent-orange/20 flex items-center justify-center mx-auto mb-4 animate-float">
                <pillar.icon className="w-8 h-8 text-primary-purple" />
              </div>
              <h4 className="font-serif text-lg font-semibold mb-2">{pillar.title}</h4>
              <p className="text-sm text-muted-foreground">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
