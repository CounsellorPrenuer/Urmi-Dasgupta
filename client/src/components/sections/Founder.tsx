import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Briefcase, GraduationCap, Heart } from 'lucide-react';
import founderImg from '@assets/IMG20240827160716 (2) - Urmi Dasgupta_1759562746478.jpg';

export function Founder() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const credentials = [
    { icon: Heart, text: 'Certified Relationship Healer & Career Coach' },
    { icon: Briefcase, text: '20+ Years in Talent Development & Leadership' },
    { icon: GraduationCap, text: 'Expert in Subconscious Mind Reprogramming' },
    { icon: Award, text: 'Mentoria Partner — India\'s Highest Rated Platform' },
  ];

  return (
    <section id="founder" className="py-24 md:py-32 bg-gradient-to-br from-primary-purple/5 via-background to-secondary-blue/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-founder-title">
            Meet the Founder
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Urmi Dasgupta — Blending executive wisdom with intuitive healing
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <Card className="glass-effect border border-card-border shadow-2xl rounded-3xl p-8 md:p-12">
              <div className="mb-6">
                <h3 className="font-serif text-3xl font-bold mb-4">Urmi Dasgupta</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  With 20+ years of corporate experience in Customer Success, Talent Management, and Leadership Transformation, 
                  Urmi blends executive wisdom with intuitive healing.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  She has guided over 3,800+ individuals in rediscovering their purpose and rebuilding meaningful relationships. 
                  As a Certified Relationship Healer, Graphotherapist, and Career Coach, her mission is to bring clarity, 
                  balance, and confidence to every client she meets.
                </p>
                <blockquote className="border-l-4 border-primary-purple pl-6 italic text-foreground text-lg mb-8">
                  "When your inner world finds peace, your outer world begins to flourish."
                </blockquote>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif text-xl font-semibold mb-4">Credentials & Expertise</h4>
                {credentials.map((credential, index) => (
                  <motion.div
                    key={credential.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <credential.icon className="w-5 h-5 text-primary-purple" />
                    </div>
                    <p className="text-sm text-foreground pt-2">{credential.text}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <div className="relative max-w-md w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-purple to-secondary-blue rounded-3xl blur-3xl opacity-20 animate-pulse" />
              <img
                src={founderImg}
                alt="Urmi Dasgupta - Founder"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover max-h-[500px]"
                data-testid="img-founder"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
