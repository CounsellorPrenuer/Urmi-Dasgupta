import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronLeft, ChevronRight, Copy, Loader2, QrCode } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Package } from '@shared/schema';
import { sanityClient } from '@/lib/sanity';
import imageUrlBuilder from '@sanity/image-url';
import { config } from '@/lib/config';

const builder = imageUrlBuilder(sanityClient);
function urlFor(source: any) {
  return builder.image(source);
}

declare const Razorpay: any;

export function Packages() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [sanityPackages, setSanityPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const pricingQuery = `*[_type == "pricing" && category == "healing"] | order(order asc) {
          planId,
          title,
          description,
          price,
          duration,
          features,
          paymentType,
          qrImage,
          "id": planId
        }`;
        const settingsQuery = `*[_type == "siteSettings"][0]{
          upiQrCode,
          upiId
        }`;

        const [pricingResult, settingsResult] = await Promise.all([
          sanityClient.fetch(pricingQuery),
          sanityClient.fetch(settingsQuery)
        ]);

        if (pricingResult && pricingResult.length > 0) {
          setSanityPackages(pricingResult.map((pkg: any) => ({
            ...pkg,
            name: pkg.title,
            features: pkg.features || []
          })));
        } else {
          setSanityPackages([]);
        }
        setSiteSettings(settingsResult);
      } catch (error) {
        console.error('Error fetching data from Sanity:', error);
        setSanityPackages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // Source of Truth: Sanity ONLY.
  const packages = sanityPackages;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
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

  const handleGetStarted = (pkg: any) => {
    setSelectedPackage(pkg);
    if (pkg.paymentType === 'qr') {
      setIsQRDialogOpen(true);
    } else {
      setCouponCode('');
      setIsFormDialogOpen(true);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedPackage) return;

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    // Basic validation...

    setIsProcessing(true);
    console.log("PAYMENT PLAN:", selectedPackage.planId);

    try {
      // 1. Submit Lead
      await fetch(`${config.api.baseUrl}/submit-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          message: `Initiated payment for ${selectedPackage.name}`
        }),
      });

      // 2. Create Order
      const orderResponse = await fetch(`${config.api.baseUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPackage.planId, // Uses planId from Sanity
          couponCode: couponCode || undefined
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Claryntia",
        description: `Payment for ${selectedPackage.name}`,
        order_id: orderData.order_id,
        handler: function (response: any) {
          toast({
            title: "Payment Successful!",
            description: "We have received your payment.",
          });
          setIsFormDialogOpen(false);
          setCustomerInfo({ name: '', email: '', phone: '' });
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: "#9b87f5",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp1 = new Razorpay(options);
      rzp1.open();

    } catch (error: any) {
      console.error('Payment Error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <section id="packages" className="py-12 md:py-24 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-packages-title">
            Packages
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect package for your transformation journey
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No packages available at the moment.</p>
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
                {packages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
                  >
                    <Card
                      className="h-full flex flex-col glass-effect border border-card-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-emerald-500/10 rounded-3xl"
                      data-testid={`card-package-${index}`}
                    >
                      <CardHeader className="space-y-0 pb-6 pt-8">
                        <CardTitle className="font-serif text-2xl mb-2 bg-gradient-to-r from-accent-orange to-orange-600 bg-clip-text text-transparent font-bold">{pkg.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                        {pkg.duration && (
                          <p className="text-xs text-muted-foreground mb-4">{pkg.duration}</p>
                        )}
                        <div className="font-serif text-4xl font-bold text-primary-purple" data-testid={`price-${index}`}>
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <ul className="space-y-3">
                          {pkg.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-600" />
                              </div>
                              <span className="text-sm text-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter className="pt-4 flex justify-center">
                        <Button
                          onClick={() => handleGetStarted(pkg)}
                          className="w-full rounded-full py-6 bg-primary-purple text-white hover:bg-primary-purple/90 transition-colors"
                          data-testid={`button-get-started-${index}`}
                        >
                          Book Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {packages.length > 3 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  onClick={scrollPrev}
                  disabled={!prevBtnEnabled}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 glass-effect"
                  data-testid="button-prev-package"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={scrollNext}
                  disabled={!nextBtnEnabled}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 glass-effect"
                  data-testid="button-next-package"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Customer Information Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent data-testid="dialog-customer-info">
          <DialogHeader>
            <DialogTitle>Enter Your Details</DialogTitle>
            <DialogDescription>
              {selectedPackage && (
                <>
                  <span className="font-semibold">{selectedPackage.name}</span> - ₹{selectedPackage.price.toLocaleString('en-IN')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                data-testid="input-customer-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                data-testid="input-customer-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                maxLength={10}
                data-testid="input-customer-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon">Coupon Code (Optional)</Label>
              <Input
                id="coupon"
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())} // Force uppercase
                data-testid="input-coupon"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormDialogOpen(false)}
              disabled={isProcessing}
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceedToPayment}
              disabled={isProcessing}
              className="bg-primary-purple text-white"
              data-testid="button-proceed-payment"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : 'Proceed to Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan to Pay</DialogTitle>
            <DialogDescription>
              Scan the QR code below to pay for <strong>{selectedPackage?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            {selectedPackage?.qrImage || siteSettings?.upiQrCode ? (
              <div className="relative w-64 h-64 border-4 border-white shadow-xl rounded-lg overflow-hidden">
                <img
                  src={urlFor(selectedPackage?.qrImage || siteSettings?.upiQrCode).width(500).url()}
                  alt="Payment QR Code"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="text-muted-foreground">QR Code not uploaded to Site Settings</div>
            )}
            {siteSettings?.upiId && (
              <div className="flex flex-col gap-1 mt-2 text-center">
                <span className="text-xs text-muted-foreground">Or pay to UPI ID:</span>
                <div className="p-2 bg-muted rounded-md text-sm font-mono select-all cursor-pointer flex justify-center items-center hover:bg-muted/80 transition-colors mx-auto" onClick={() => {
                  navigator.clipboard.writeText(siteSettings.upiId);
                  toast({ title: "Copied!", description: "UPI ID copied to clipboard" });
                }}>
                  <span>{siteSettings.upiId}</span>
                  <Copy className="w-3 h-3 ml-2" />
                </div>
              </div>
            )}
            <div className="text-center text-sm text-muted-foreground">
              Amount to pay: <span className="font-bold text-foreground">₹{selectedPackage?.price.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsQRDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}