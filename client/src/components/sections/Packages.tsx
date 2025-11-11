import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Package } from '@shared/schema';

export function Packages() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const { toast } = useToast();

  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

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

  const handleGetStarted = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsFormDialogOpen(true);
  };

  const generateUPIUrl = (packageName: string, amount: number) => {
    const upiId = 'joint.arum@okaxis';
    const payeeName = 'Claryntia - Urmi Dasgupta';
    const transactionNote = `Payment for ${packageName}`;

    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: amount.toString(),
      cu: 'INR',
      tn: transactionNote
    });

    return `upi://pay?${params.toString()}`;
  };

  const handleProceedToPayment = async () => {
    if (!selectedPackage) return;

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          status: 'pending',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment record');
      }

      setIsFormDialogOpen(false);
      setIsQRDialogOpen(true);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('joint.arum@okaxis');
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard",
    });
  };

  const handleCloseQRDialog = () => {
    setIsQRDialogOpen(false);
    setCustomerInfo({ name: '', email: '', phone: '' });
    setSelectedPackage(null);

    toast({
      title: "Thank you!",
      description: "We've recorded your details. Please complete the payment and we'll contact you shortly.",
    });
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

                      <CardFooter>
                        <Button
                          onClick={() => handleGetStarted(pkg)}
                          className="w-full rounded-full py-6 bg-primary-purple text-white"
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
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UPI QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[95vh] overflow-y-auto" data-testid="dialog-qr-code">
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl">Scan to Pay</DialogTitle>
            {selectedPackage && (
              <div className="space-y-1 sm:space-y-2 text-center">
                <p className="font-semibold text-base sm:text-lg line-clamp-2">{selectedPackage.name}</p>
                <p className="text-xl sm:text-2xl font-bold text-primary-purple">₹{selectedPackage.price.toLocaleString('en-IN')}</p>
              </div>
            )}
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 sm:space-y-6 py-2 sm:py-4">
            {/* QR Code */}
            <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-lg w-fit">
              <QRCodeSVG
                id="upi-qr-code"
                value={selectedPackage ? generateUPIUrl(selectedPackage.name, selectedPackage.price) : ''}
                size={window.innerWidth < 640 ? 200 : 240}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* UPI ID */}
            <div className="w-full space-y-2">
              <Label className="text-xs sm:text-sm text-muted-foreground">UPI ID</Label>
              <div className="flex items-center gap-2">
                <Input
                  value="joint.arum@okaxis"
                  readOnly
                  className="flex-1 font-mono text-xs sm:text-sm"
                  data-testid="input-upi-id"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyUPI}
                  data-testid="button-copy-upi"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="w-full space-y-2 sm:space-y-3 bg-muted/50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-xs sm:text-sm">Payment Instructions:</h4>
              <ol className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                <li>Scan the QR code or enter the UPI ID</li>
                <li>Verify the amount: ₹{selectedPackage?.price.toLocaleString('en-IN')}</li>
                <li>Complete the payment</li>
                <li className="break-words">We'll contact you shortly at {customerInfo.email}</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full">
              <Button
                onClick={handleCloseQRDialog}
                className="w-full bg-primary-purple text-white text-sm"
                data-testid="button-close-qr"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}