import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { MentoriaPackage } from '@shared/schema';

const paymentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface MentoriaPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: MentoriaPackage;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function MentoriaPaymentModal({ open, onOpenChange, package: pkg }: MentoriaPaymentModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmit = async (data: PaymentFormValues) => {
    setIsProcessing(true);

    try {
      const res = await loadRazorpay();
      if (!res) {
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway. Please try again.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      const orderResponse = await fetch('/api/mentoria-payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: pkg.id,
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'Claryntia',
        description: `${pkg.name} - ${pkg.category}`,
        order_id: orderData.orderId,
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: '#6A1B9A',
        },
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/mentoria-payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast({
                title: 'Payment Successful!',
                description: 'Thank you for your purchase. We will contact you shortly.',
              });
              form.reset();
              onOpenChange(false);
            } else {
              toast({
                title: 'Payment Verification Failed',
                description: 'Please contact support with your payment details.',
                variant: 'destructive',
              });
            }
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Payment verification failed. Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setIsProcessing(false);
          }
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

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      onOpenChange(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
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
                      data-testid="input-payment-name"
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
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                      data-testid="input-payment-email"
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
                  <FormLabel>Contact Number *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      {...field}
                      data-testid="input-payment-phone"
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
              disabled={isProcessing}
              data-testid="button-pay-now"
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
