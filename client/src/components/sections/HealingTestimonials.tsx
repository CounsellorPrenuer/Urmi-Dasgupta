import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { sanityClient } from '@/lib/sanity';

export function HealingTestimonials() {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const [sanityTestimonials, setSanityTestimonials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                // Fetch testimonials that are specifically 'healing' OR existing ones without a category (backward compatibility)
                const query = `*[_type == "testimonial" && (category == "healing" || !defined(category))] { name, role, content, rating }`;
                const result = await sanityClient.fetch(query);
                console.log('Healing Testimonials:', result);
                setSanityTestimonials(result);
            } catch (error) {
                console.error('Error fetching testimonials from Sanity:', error);
                setSanityTestimonials([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    if (isLoading) {
        return (
            <section className="py-24 md:py-32 bg-background min-h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading healing testimonials...</div>
            </section>
        );
    }

    const testimonials = sanityTestimonials;

    const items = testimonials.map((testimonial: any) => ({
        quote: testimonial.content,
        name: testimonial.name,
        title: testimonial.role || (testimonial.rating > 0 && testimonial.rating <= 5
            ? Array.from({ length: testimonial.rating }).map(() => '⭐').join('')
            : ''),
        imageUrl: testimonial.imageUrl || undefined,
    }));

    return (
        <section className="py-24 md:py-32 bg-background" ref={ref} data-testid="section-healing-testimonials">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-testimonials-title">
                        Healing Packages – Testimonials
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Stories of healing and transformation
                    </p>
                </motion.div>

                {testimonials.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No healing testimonials available at the moment.</p>
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
