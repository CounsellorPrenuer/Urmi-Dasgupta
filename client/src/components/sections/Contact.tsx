import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin, Instagram, Twitter, Loader2 } from 'lucide-react';
import { SiWhatsapp, SiYoutube, SiSpotify, SiFacebook, SiPinterest } from 'react-icons/si';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  purpose: z.string().min(1, 'Please select a purpose'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      purpose: '',
      message: '',
    },
  });

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '+91 9886635186', href: 'tel:+919886635186' },
    { icon: Mail, label: 'Email', value: 'claryntia@gmail.com', href: 'mailto:claryntia@gmail.com' },
    { icon: MapPin, label: 'Location', value: 'Bangalore, India', href: null },
  ];

  const socials = [
    { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/urmidasgupta' },
    { icon: Twitter, label: 'X (Twitter)', href: 'https://x.com/@UrMzD' },
    { icon: SiWhatsapp, label: 'WhatsApp', href: 'https://api.whatsapp.com/send/?phone=919886635186&text&type=phone_number&app_absent=0' },
    { icon: SiYoutube, label: 'YouTube', href: 'https://www.youtube.com/@claryntia' },
    { icon: SiSpotify, label: 'Spotify', href: 'https://spotify.app.link/uEgPZ9ljLXb?_p=c11434dc9a0164eee01f8fe3eebd' },
    { icon: SiFacebook, label: 'Facebook', href: 'https://www.facebook.com/urmi.dasgupta' },
    { icon: SiPinterest, label: 'Pinterest', href: 'https://in.pinterest.com/urmidasgupta/' },
  ];

  const purposeOptions = [
    'Career Clarity',
    'Relationship Healing',
    'Energy Reading',
    'Corporate Workshop',
    'General Inquiry',
  ];

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast({
          title: 'Message Sent Successfully!',
          description: 'We\'ll get back to you within 24 hours.',
        });
        
        form.reset();
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-contact-title">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill out the form below and we'll reach out to schedule your free 15-minute clarity call
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-effect border border-card-border shadow-2xl p-8 rounded-3xl" data-testid="card-contact-form">
              <h3 className="font-serif text-2xl font-bold mb-6">Send Us a Message</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+91 9876543210"
                            {...field}
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose of Inquiry</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-purpose">
                              <SelectValue placeholder="Select a purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {purposeOptions.map((option) => (
                              <SelectItem key={option} value={option} data-testid={`option-${option.toLowerCase().replace(/\s+/g, '-')}`}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about what you're looking for..."
                            className="min-h-[120px] resize-none"
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary-purple to-secondary-blue text-white rounded-full"
                    disabled={isSubmitting}
                    data-testid="button-submit-form"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="glass-effect border border-card-border shadow-lg p-6 rounded-2xl hover:shadow-xl transition-shadow" data-testid={`contact-${info.label.toLowerCase()}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-purple/20 to-secondary-blue/20 flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-7 h-7 text-primary-purple" />
                      </div>
                      <div className="flex-1">
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
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="pt-6"
            >
              <p className="text-muted-foreground mb-4 text-center">Follow Claryntia Online</p>
              <div className="flex justify-center flex-wrap gap-3">
                {socials.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-purple/10 to-secondary-blue/10 flex items-center justify-center hover:from-primary-purple hover:to-secondary-blue hover:text-white transition-all group"
                    data-testid={`social-${social.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <social.icon className="w-5 h-5 text-primary-purple group-hover:text-white transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
