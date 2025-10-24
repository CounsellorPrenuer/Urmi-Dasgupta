import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Search, Lightbulb, Target, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Discover your inner clarity',
    description: 'Through psychometric and energy analysis',
    color: 'from-primary-purple to-secondary-blue',
  },
  {
    icon: Lightbulb,
    number: '02',
    title: 'Reprogram subconscious limitations',
    description: 'Using proven techniques like EFT, Ho\'oponopono, and Hypnotherapy',
    color: 'from-secondary-blue to-accent-orange',
  },
  {
    icon: Target,
    number: '03',
    title: 'Build emotional and professional harmony',
    description: 'Align goals, relationships, and energy fields',
    color: 'from-accent-orange to-primary-purple',
  },
  {
    icon: TrendingUp,
    number: '04',
    title: 'Create sustainable transformation',
    description: 'Personalized action plans + continuous mentorship',
    color: 'from-primary-purple to-secondary-blue',
  },
];

export function Methodology() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-methodology-title">
            How Claryntia Helps You Heal & Grow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our proven 4-step methodology for transformation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <Card className="glass-effect border border-card-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl p-8 h-full cursor-default" data-testid={`card-step-${index}`}>
                <div className={`text-6xl font-serif font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-6`}>
                  {step.number}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-purple/10 to-secondary-blue/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-primary-purple" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-purple/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
