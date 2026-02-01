import { useEffect, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThankYou() {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect to main site
                    window.location.href = 'https://agrilink.com.ng';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleRedirectNow = () => {
        window.location.href = 'https://agrilink.com.ng';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
            <div
                className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-green-100"
            >
                {/* Success icon */}
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                    <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
                </div>

                {/* Heading */}
                <h1
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: 'MadaniArabic-Bold' }}
                >
                    Thank You! 🎉
                </h1>

                {/* Message */}
                <p
                    className="text-gray-600 text-lg mb-6"
                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                    Your insights are invaluable to building AgriLink.
                </p>

                <p
                    className="text-gray-500 text-base mb-8"
                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                    If you requested early access, you'll receive details at your email when we launch.
                </p>

                {/* Early access badge */}
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-2 mb-8">
                    <span className="text-lg">🌱</span>
                    <span style={{ fontFamily: 'MadaniArabic-Medium' }} className="text-sm">
                        Early access secured!
                    </span>
                </div>

                {/* Countdown */}
                <p
                    className="text-gray-500 text-sm mb-6"
                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                    Redirecting to AgriLink in{' '}
                    <span className="font-bold text-primary">{countdown}</span> seconds...
                </p>

                {/* Manual redirect button */}
                <Button
                    onClick={handleRedirectNow}
                    className="w-full h-12 rounded-full bg-primary hover:bg-[hsl(var(--brand-colors-SoilBlush))] text-white shadow-md"
                    style={{ fontFamily: 'MadaniArabic-Bold' }}
                >
                    Go to AgriLink Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Social sharing suggestion */}
                <p
                    className="text-gray-400 text-xs mt-8"
                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                    Know someone who might be interested? Share AgriLink with them!
                </p>
            </div>
        </div>
    );
}

export default ThankYou;
