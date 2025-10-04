import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';
import Masonry from 'react-masonry-css';

const blogPosts = [
  {
    title: 'The Art of Letting Go: Healing Emotional Patterns',
    excerpt: 'Discover how releasing subconscious blocks can reshape your career and relationships.',
    category: 'Healing',
    readTime: '5 min read',
    gradient: 'from-primary-purple/20 to-secondary-blue/20',
  },
  {
    title: 'Career Clarity in the Age of AI',
    excerpt: 'How to future-proof your career by aligning your ambition with inner awareness.',
    category: 'Career',
    readTime: '7 min read',
    gradient: 'from-accent-orange/20 to-primary-purple/20',
  },
  {
    title: 'Relationships and Energy Flow',
    excerpt: 'Why your energy determines your connection — and how to harmonize it.',
    category: 'Relationships',
    readTime: '6 min read',
    gradient: 'from-secondary-blue/20 to-accent-orange/20',
  },
  {
    title: 'Balancing Success and Stillness',
    excerpt: 'Practical techniques to achieve inner peace in a hyperactive world.',
    category: 'Mindfulness',
    readTime: '4 min read',
    gradient: 'from-primary-purple/20 to-accent-orange/20',
  },
  {
    title: 'Graphotherapy: Rewrite Your Subconscious',
    excerpt: 'Learn how handwriting analysis can uncover hidden beliefs and transform your mindset.',
    category: 'Healing',
    readTime: '8 min read',
    gradient: 'from-secondary-blue/20 to-primary-purple/20',
  },
];

export function Blog() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const breakpointColumns = {
    default: 3,
    1024: 2,
    640: 1,
  };

  return (
    <section id="blog" className="py-24 md:py-32 bg-gradient-to-br from-background via-primary-purple/5 to-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-blog-title">
            Blog & Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay inspired with transformative reads on clarity, purpose, and personal evolution
          </p>
        </motion.div>

        <Masonry
          breakpointCols={breakpointColumns}
          className="flex -ml-6 w-auto"
          columnClassName="pl-6 bg-clip-padding"
        >
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="mb-6"
            >
              <Card 
                className="glass-effect border border-card-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-visible group cursor-pointer"
                data-testid={`card-blog-${index}`}
              >
                <div className={`h-32 bg-gradient-to-br ${post.gradient} relative overflow-hidden rounded-t-2xl`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardHeader className="space-y-0 pb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <CardTitle className="font-serif text-xl group-hover:text-primary-purple transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-primary-purple font-medium text-sm group-hover:gap-3 transition-all" data-testid={`link-blog-read-more-${index}`}>
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Masonry>
      </div>
    </section>
  );
}
