import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, GraduationCap, Video, ExternalLink } from 'lucide-react';

const stats = [
  { icon: Users, value: '3,50,000+', label: 'Students and Professionals Mentored', iconColor: 'text-secondary-blue' },
  { icon: Building2, value: '240+', label: 'Corporate Partners', iconColor: 'text-accent-orange' },
  { icon: GraduationCap, value: '350+', label: 'Schools and College Partners', iconColor: 'text-green-600' },
  { icon: Video, value: '1000+', label: 'Hours of Career Webinars', iconColor: 'text-rose-500' },
];

export function Mentoria() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-primary-purple/10 via-background to-secondary-blue/10" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-mentoria-title">
            Powered by Mentoria's Career Discovery Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Every Claryntia plan includes lifetime access to Mentoria: India's most trusted platform for career discovery, 
            mentorship, and lifelong upskilling.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass-effect border border-card-border shadow-lg p-6 text-center rounded-2xl hover:shadow-xl hover:bg-emerald-50/30 transition-all" data-testid={`stat-mentoria-${index}`}>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <div className="font-serif text-3xl font-bold text-primary-purple mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
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
          <Button 
            size="lg" 
            variant="outline"
            className="rounded-full px-8 py-6 border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white transition-colors group"
            data-testid="button-mentoria-explore"
            onClick={() => window.open("https://www.mentoria.com", "_blank")} // Opens in new tab
          >
            Explore Mentoria Platform
            <ExternalLink className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
