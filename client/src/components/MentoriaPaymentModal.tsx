import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tag } from 'lucide-react';
import type { MentoriaPackage } from '@shared/schema';
import { config } from '@/lib/config';

const paymentFormSchema = z.object({
  firstName: z.string().min(2, 'First Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
  background: z.string().min(1, 'Please select your background'),
  coupon: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// Local interface matching Sanity data structure
interface PaymentPackage {
  id?: string;
  planId: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface MentoriaPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PaymentPackage;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export function MentoriaPaymentModal({ open, onOpenChange, package: pkg }: MentoriaPaymentModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      background: '',
      coupon: '',
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    setIsProcessing(true);

    try {
      // 1. Submit Lead
      await fetch(`${config.api.baseUrl}/submit-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          message: `Initiated payment for ${pkg.name} (Mentoria)\nBackground: ${data.background}`
        }),
      });

      // 2. Create Order
      const orderResponse = await fetch(`${config.api.baseUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: pkg.planId, // Ensure planId is passed correctly
          couponCode: data.coupon || undefined
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount, // already in paise from backend? Wait, backend sends amount in paise? 
        // Backend: amount: finalAmount * 100. So YES.
        currency: orderData.currency,
        name: 'Claryntia',
        description: `${pkg.name}`,
        order_id: orderData.order_id,
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: '#6A1B9A',
        },
        handler: function (response: any) {
          toast({
            title: 'Payment Successful!',
            description: 'We have received your payment.',
          });
          form.reset();
          onOpenChange(false);
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment.',
            });
          },
        },
      };

      console.log('Opening Razorpay with options:', options);
      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response: any) {
        console.error('Razorpay payment.failed:', response);
        toast({
          title: "Payment Failed",
          description: response.error.description,
          variant: "destructive"
        });
      });

      paymentObject.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="modal-mentoria-payment">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Book {pkg.name}</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {pkg.category} • ₹{pkg.price.toLocaleString()}
          </div>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">{pkg.description}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your.email@example.com" {...field} />
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
                  <FormLabel>Contact Number *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+91 98765 43210" {...field} />
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
                  <FormLabel>Background *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your background" />
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
              name="coupon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Enter coupon code"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <Tag className="w-5 h-5 text-muted-foreground self-center" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-primary-purple to-secondary-blue text-white rounded-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${pkg.price.toLocaleString()}`
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
