import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, Mail, MapPin, Instagram, Linkedin, Twitter } from 'lucide-react';

export function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '+91 9886635186', href: 'tel:+919886635186' },
    { icon: Mail, label: 'Email', value: 'claryntia@gmail.com', href: 'mailto:claryntia@gmail.com' },
    { icon: MapPin, label: 'Location', value: 'Mumbai, India', href: null },
  ];

  const socials = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Twitter, label: 'X (Twitter)', href: '#' },
  ];

  return (
    <section id="contact" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-contact-title">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Book a Free 15-Minute Clarity Call
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary-purple to-secondary-blue text-white px-10 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
            data-testid="button-book-call"
          >
            Book Your Free Call
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Card className="glass-effect border border-card-border shadow-lg p-6 text-center rounded-2xl hover:shadow-xl transition-shadow" data-testid={`contact-${info.label.toLowerCase()}`}>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-purple/20 to-secondary-blue/20 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-7 h-7 text-primary-purple" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">{info.label}</div>
                {info.href ? (
                  <a 
                    href={info.href} 
                    className="text-foreground font-medium hover:text-primary-purple transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <div className="text-foreground font-medium">{info.value}</div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4">Follow Claryntia Online</p>
          <div className="flex justify-center gap-4">
            {socials.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-purple/10 to-secondary-blue/10 flex items-center justify-center hover:from-primary-purple hover:to-secondary-blue hover:text-white transition-all group"
                data-testid={`social-${social.label.toLowerCase()}`}
              >
                <social.icon className="w-5 h-5 text-primary-purple group-hover:text-white transition-colors" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
