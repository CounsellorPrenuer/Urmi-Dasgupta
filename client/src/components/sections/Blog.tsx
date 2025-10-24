import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, ArrowRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Blog as BlogType } from '@shared/schema';

const gradients = [
  'from-primary-purple/20 to-secondary-blue/20',
  'from-accent-orange/20 to-primary-purple/20',
  'from-secondary-blue/20 to-accent-orange/20',
  'from-primary-purple/20 to-accent-orange/20',
];

export function Blog() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedBlog, setSelectedBlog] = useState<BlogType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: blogPosts = [], isLoading } = useQuery<BlogType[]>({
    queryKey: ['/api/blogs'],
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps'
  });
  
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const handleReadMore = (post: BlogType) => {
    setSelectedBlog(post);
    setIsModalOpen(true);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-blog-title">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {blogPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
                  >
                    <Card 
                      className="h-full flex flex-col glass-effect border border-card-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden group cursor-pointer"
                      data-testid={`card-blog-${index}`}
                      onClick={() => handleReadMore(post)}
                    >
                      {post.imageUrl ? (
                        <div className="h-48 relative overflow-hidden">
                          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ) : (
                        <div className={`h-48 bg-gradient-to-br ${gradients[index % gradients.length]} relative overflow-hidden`}>
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
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground mb-4 flex-1">{post.excerpt}</p>
                        <div className="flex items-center gap-2 text-primary-purple font-medium text-sm group-hover:gap-3 transition-all" data-testid={`link-blog-read-more-${index}`}>
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {blogPosts.length > 3 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  onClick={scrollPrev}
                  disabled={!prevBtnEnabled}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 glass-effect"
                  data-testid="button-prev-blog"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={scrollNext}
                  disabled={!nextBtnEnabled}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 glass-effect"
                  data-testid="button-next-blog"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="dialog-blog-detail">
          {selectedBlog && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-3xl mb-2">{selectedBlog.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {selectedBlog.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{selectedBlog.author}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedBlog.createdAt)}</span>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                {selectedBlog.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img 
                      src={selectedBlog.imageUrl} 
                      alt={selectedBlog.title} 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <p className="text-lg text-muted-foreground mb-6 font-medium">
                    {selectedBlog.excerpt}
                  </p>
                  <div 
                    className="text-foreground whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                  />
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
