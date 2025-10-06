import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import type { Testimonial } from '@shared/schema';

export function Testimonials() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  const items = testimonials.map((testimonial) => ({
    quote: testimonial.content,
    name: testimonial.name,
    title: testimonial.rating > 0 && testimonial.rating <= 5 
      ? Array.from({ length: testimonial.rating }).map(() => '⭐').join('') 
      : '',
  }));

  return (
    <section className="py-24 md:py-32 bg-background" ref={ref} data-testid="section-testimonials">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-testimonials-title">
            Real Transformations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories of clarity, healing, and growth from our clients
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No testimonials available at the moment.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center"
          >
            <InfiniteMovingCards
              items={items}
              direction="left"
              speed="slow"
              pauseOnHover={true}
              className="py-4"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
