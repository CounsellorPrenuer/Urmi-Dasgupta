import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronLeft, ChevronRight, Loader2, Star, Tag } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { sanityClient } from '@/lib/sanity';
import imageUrlBuilder from '@sanity/image-url';
import { config } from '@/lib/config';
import { Badge } from '@/components/ui/badge';

const builder = imageUrlBuilder(sanityClient);
function urlFor(source: any) {
    return builder.image(source);
}

declare const Razorpay: any;

export function HealingPackages() {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedQR, setGeneratedQR] = useState<{ url: string, amount: number } | null>(null);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [couponCode, setCouponCode] = useState('');
    const [sanityPackages, setSanityPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const query = `*[_type == "pricing" && category == "healing"] | order(order asc) {
          planId,
          title,
          description,
          price,
          duration,
          features,
          isPopular,
          "id": planId
        }`;
                const result = await sanityClient.fetch(query);
                setSanityPackages(result || []);
            } catch (error) {
                console.error('Error fetching pricing:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPricing();
    }, []);

    const packages = sanityPackages.map(p => ({ ...p, name: p.title }));

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center', containScroll: 'trimSnaps' });
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
        setCouponCode('');
        setIsFormDialogOpen(true);
        setGeneratedQR(null); // Reset previously generated QR if any
    };

    const submitLead = async () => {
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
    }

    const handleRazorpayPayment = async () => {
        if (!validateForm()) return;
        setIsProcessing(true);

        try {
            await submitLead();

            const orderResponse = await fetch(`${config.api.baseUrl}/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: selectedPackage.planId,
                    couponCode: couponCode || undefined
                }),
            });

            const orderData = await orderResponse.json();
            if (!orderData.success) throw new Error(orderData.message);

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Claryntia",
                description: `Payment for ${selectedPackage.name}`,
                order_id: orderData.order_id,
                handler: function (response: any) {
                    toast({ title: "Payment Successful!", description: "We have received your payment." });
                    setIsFormDialogOpen(false);
                    setCustomerInfo({ name: '', email: '', phone: '' });
                },
                prefill: {
                    name: customerInfo.name,
                    email: customerInfo.email,
                    contact: customerInfo.phone
                },
                theme: { color: "#9b87f5" }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUPIPayment = async () => {
        if (!validateForm()) return;
        setIsProcessing(true);

        try {
            await submitLead();

            const response = await fetch(`${config.api.baseUrl}/create-upi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: selectedPackage.planId,
                    couponCode: couponCode || undefined
                }),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            setGeneratedQR({ url: data.qr_url, amount: data.amount });
            setIsFormDialogOpen(false);
            setIsQRDialogOpen(true); // Open QR Modal

        } catch (error: any) {
            toast({ title: "Could not generate QR", description: error.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const validateForm = () => {
        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
            return false;
        }
        return true;
    }

    return (
        <section id="healing-packages" className="py-12 md:py-24 bg-background" ref={ref}>
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-6"
                >
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Healing Packages</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose the perfect package for your transformation journey
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="text-center py-12"><p className="text-muted-foreground">Loading packages...</p></div>
                ) : (
                    <div className="relative">
                        <div className="overflow-hidden" ref={emblaRef}>
                            <div className="flex gap-6">
                                {packages.map((pkg, index) => (
                                    <div key={pkg.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]">
                                        <Card className={`h-full flex flex-col glass-effect shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-emerald-500/10 rounded-3xl ${pkg.isPopular ? 'border-2 border-primary-purple/50' : 'border border-card-border'}`}>
                                            {pkg.isPopular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                    <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-2 border-background shadow-lg px-4 py-1 text-sm font-semibold flex items-center gap-1.5">
                                                        <Star className="w-3.5 h-3.5 fill-white" /> Popular
                                                    </Badge>
                                                </div>
                                            )}
                                            <CardHeader className="space-y-0 pb-6 pt-8">
                                                <CardTitle className="font-serif text-2xl mb-2 bg-gradient-to-r from-accent-orange to-orange-600 bg-clip-text text-transparent font-bold">{pkg.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                                                {pkg.duration && <p className="text-xs text-muted-foreground mb-4">{pkg.duration}</p>}
                                                <div className="font-serif text-4xl font-bold text-primary-purple">₹{pkg.price.toLocaleString('en-IN')}</div>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <ul className="space-y-3">
                                                    {pkg.features?.map((feature: string, idx: number) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <Check className="w-3 h-3 text-emerald-600" />
                                                            </div>
                                                            <span className="text-sm text-foreground">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                            <CardFooter className="pt-4 flex justify-center">
                                                <Button onClick={() => handleGetStarted(pkg)} className="w-full rounded-full py-6 bg-primary-purple text-white hover:bg-primary-purple/90 transition-colors">Book Now</Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {packages.length > 3 && (
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <Button onClick={scrollPrev} disabled={!prevBtnEnabled} variant="outline" size="icon" className="rounded-full w-12 h-12 glass-effect"><ChevronLeft className="w-6 h-6" /></Button>
                                <Button onClick={scrollNext} disabled={!nextBtnEnabled} variant="outline" size="icon" className="rounded-full w-12 h-12 glass-effect"><ChevronRight className="w-6 h-6" /></Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Details</DialogTitle>
                        <DialogDescription>{selectedPackage?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Full Name</Label><Input value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Email</Label><Input type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Phone</Label><Input type="tel" maxLength={10} value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} /></div>
                        <div className="space-y-2">
                            <Label>Coupon Code (Optional)</Label>
                            <div className="flex gap-2">
                                <Input placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                                <Tag className="w-5 h-5 text-muted-foreground self-center" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUPIPayment} disabled={isProcessing} variant="secondary">Pay via UPI QR</Button>
                        <Button onClick={handleRazorpayPayment} disabled={isProcessing} className="bg-primary-purple text-white">
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Scan to Pay</DialogTitle></DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        {generatedQR ? (
                            <>
                                <div className="relative w-64 h-64 border-4 border-white shadow-xl rounded-lg overflow-hidden">
                                    <img src={generatedQR.url} alt="UPI QR" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center text-sm text-muted-foreground">Amount: <span className="font-bold text-foreground">₹{generatedQR.amount.toLocaleString()}</span></div>
                            </>
                        ) : <Loader2 className="animate-spin" />}
                    </div>
                    <DialogFooter><Button onClick={() => setIsQRDialogOpen(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
