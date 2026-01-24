import { useEffect, useRef } from 'react';

interface RazorpayButtonProps {
    paymentButtonId: string;
}

export function RazorpayButton({ paymentButtonId }: RazorpayButtonProps) {
    const containerRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Check if script is already added to avoid duplicates
        if (containerRef.current.querySelector('script')) return;

        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/payment-button.js";
        script.setAttribute('data-payment_button_id', paymentButtonId);
        script.async = true;

        containerRef.current.appendChild(script);

        return () => {
            // Cleanup if necessary, though typical with external scripts inside forms it's tricky
        };
    }, [paymentButtonId]);

    return <form ref={containerRef} className="flex justify-center" />;
}
