import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2, Phone } from 'lucide-react';
import logoImg from '@assets/Screenshot_2025-10-04_122812-removebg-preview_1759562746476.png';

const discoveryCallFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  background: z.string().min(1, 'Please select your background'),
  briefMessage: z.string().min(1, 'Please provide a brief message').refine((val) => {
    const wordCount = val.trim().split(/\s+/).filter(word => word.length > 0).length;
    return wordCount <= 500;
  }, { message: 'Brief message cannot exceed 500 words' }),
});

type DiscoveryCallFormValues = z.infer<typeof discoveryCallFormSchema>;

interface FreeDiscoveryCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const whatYouGet = [
  '10-min focused discussion about your career situation',
  'Actionable roadmap with 2-3 immediate next steps',
  'Expert assessment of your primary career challenge',
  'Personalized guidance based on your background',
];

const notIncluded = [
  'Full psychometric assessment & detailed report',
  '60-90-minute deep-dive counselling session',
  'Career compatibility analysis',
  'Ongoing mentorship support',
];

const backgroundOptions = [
  'Student (High School)',
  'Student (College/University)',
  'Fresh Graduate',
  'Working Professional (0-3 years)',
  'Working Professional (3-7 years)',
  'Working Professional (7+ years)',
  'Career Break/Transition',
  'Entrepreneur/Business Owner',
  'Seeking Career Change',
  'Other',
];

export function FreeDiscoveryCallModal({ open, onOpenChange }: FreeDiscoveryCallModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DiscoveryCallFormValues>({
    resolver: zodResolver(discoveryCallFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      background: '',
      briefMessage: '',
    },
  });

  const onSubmit = async (data: DiscoveryCallFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          purpose: 'Free Discovery Call',
          message: `Background: ${data.background}`,
          briefMessage: data.briefMessage || null,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast({
          title: 'Discovery Call Request Submitted!',
          description: 'We\'ll contact you within 24 hours to schedule your free call.',
        });
        
        form.reset();
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="modal-free-discovery-call">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary-purple flex items-center justify-center">
              <img src={logoImg} alt="Claryntia" className="w-8 h-8" />
            </div>
            <div>
              <DialogTitle className="font-serif text-2xl md:text-3xl text-foreground">
                Free Discovery Call
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                ✓ Trusted by 3,725+ professionals
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            {/* What You'll Get */}
            <div>
              <h3 className="font-serif text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                What You'll Receive
              </h3>
              <ul className="space-y-2">
                {whatYouGet.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Included */}
            <div>
              <h3 className="font-serif text-lg font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                <X className="w-5 h-5 text-muted-foreground" />
                Not Included (Paid Only)
              </h3>
              <ul className="space-y-2">
                {notIncluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick & Valuable Banner */}
            <div className="bg-primary-purple rounded-xl p-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Quick & Valuable</h4>
                  <p className="text-sm text-white/90">Get clarity in just 30 minutes - no strings attached</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        data-testid="input-discovery-name"
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
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                        data-testid="input-discovery-email"
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
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        {...field}
                        data-testid="input-discovery-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you a: *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-discovery-background">
                          <SelectValue placeholder="Select your current background" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {backgroundOptions.map((option) => (
                          <SelectItem key={option} value={option}>
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
                name="briefMessage"
                render={({ field }) => {
                  const wordCount = field.value ? field.value.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
                  return (
                    <FormItem>
                      <FormLabel>Tell me why you would like to connect* (Max 500 words)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share a brief summary of your situation..."
                          className="min-h-[100px] resize-y"
                          {...field}
                          data-testid="textarea-brief-message"
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground text-right">
                        {wordCount}/500 words
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary-purple text-white rounded-full"
                disabled={isSubmitting}
                data-testid="button-submit-discovery-call"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Book Now
                  </>
                )}
              </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
