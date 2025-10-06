import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ArrowRight } from 'lucide-react';
import Masonry from 'react-masonry-css';
import type { Blog as BlogType } from '@shared/schema';

const gradients = [
  'from-primary-purple/20 to-secondary-blue/20',
  'from-accent-orange/20 to-primary-purple/20',
  'from-secondary-blue/20 to-accent-orange/20',
  'from-primary-purple/20 to-accent-orange/20',
];

export function Blog() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [showAll, setShowAll] = useState(false);
  
  const { data: blogPosts = [], isLoading } = useQuery<BlogType[]>({
    queryKey: ['/api/blogs'],
  });

  const displayedBlogs = showAll ? blogPosts : blogPosts.slice(0, 3);

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

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts available at the moment.</p>
          </div>
        ) : (
          <>
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-6 w-auto"
              columnClassName="pl-6 bg-clip-padding"
            >
              {displayedBlogs.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="mb-6"
                >
                  <Card 
                    className="glass-effect border border-card-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-visible group cursor-pointer"
                    data-testid={`card-blog-${index}`}
                  >
                    {post.imageUrl ? (
                      <div className="h-32 relative overflow-hidden rounded-t-2xl">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className={`h-32 bg-gradient-to-br ${gradients[index % gradients.length]} relative overflow-hidden rounded-t-2xl`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <CardHeader className="space-y-0 pb-3">
                      {post.author && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <User className="w-3 h-3" />
                          <span>{post.author}</span>
                        </div>
                      )}
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
            
            {blogPosts.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center mt-12"
              >
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="outline"
                  size="lg"
                  className="glass-effect"
                  data-testid="button-see-more-blogs"
                >
                  {showAll ? 'Show Less' : 'See More'}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
