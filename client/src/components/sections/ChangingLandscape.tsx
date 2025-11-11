import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Brain, Sparkles, Heart } from 'lucide-react';

const insights = [
  {
    icon: Brain,
    stat: '70%',
    description: 'of professionals feel stuck despite career success',
    iconColor: 'text-secondary-blue',
  },
  {
    icon: Sparkles,
    stat: '60%',
    description: 'of youth report confusion about purpose or direction',
    iconColor: 'text-accent-orange',
  },
  {
    icon: Heart,
    stat: '85%',
    description: 'of emotional patterns repeat until consciously healed',
    iconColor: 'text-rose-500',
  },
];

export function ChangingLandscape() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-background via-accent-orange/5 to-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6" data-testid="text-landscape-title">
            The Changing Landscape
          </h2>
          <p className="text-2xl md:text-3xl font-serif text-primary-purple mb-8">
            The Modern Mindset Shift is Here.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
            As automation and AI reshape careers and lifestyles, emotional intelligence, clarity, 
            and adaptability are the new superpowers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.description}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className="glass-effect border border-card-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-emerald-500/10 rounded-2xl p-8 text-center cursor-default" data-testid={`card-insight-${index}`}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <insight.icon className={`w-8 h-8 ${insight.iconColor}`} />
                </div>
                <div className="font-serif text-5xl font-bold text-accent-orange mb-4">{insight.stat}</div>
                <p className="text-muted-foreground leading-relaxed">{insight.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-xl text-primary-purple font-semibold max-w-4xl mx-auto">
            At Claryntia, we help you rise above these patterns to design a fulfilled, future-ready life.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
