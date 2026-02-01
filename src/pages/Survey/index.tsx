import { SurveyForm } from './SurveyForm';

export function Survey() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            {/* Header */}
            <header className="py-6 px-4">
                <div className="max-w-4xl mx-auto flex items-center justify-center">
                    <img
                        src="/Agrilink-logo-dark.svg"
                        alt="AgriLink"
                        className="h-10"
                    />
                </div>
            </header>

            {/* Hero section */}
            <section className="pt-4 pb-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h1
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                        style={{ fontFamily: 'MadaniArabic-Bold' }}
                    >
                        Help Us Build Something Amazing 🌾
                    </h1>

                    <p
                        className="text-lg text-gray-600 mb-4 leading-relaxed"
                        style={{ fontFamily: 'MadaniArabic-Regular' }}
                    >
                        We're creating AgriLink - a platform to connect Nigerian buyers directly
                        with farmers, cutting out middlemen and ensuring fresh produce at fair prices.
                    </p>

                    <p
                        className="text-base text-gray-500 mb-6"
                        style={{ fontFamily: 'MadaniArabic-Regular' }}
                    >
                        Your feedback will directly shape how we build this.{' '}
                        <span className="font-semibold text-primary">Takes 3-5 minutes.</span>
                    </p>

                    {/* Incentive badge */}
                    <div
                        className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-3 shadow-md border border-green-100"
                    >
                        <span className="text-xl">🎁</span>
                        <span
                            className="text-sm text-gray-700"
                            style={{ fontFamily: 'MadaniArabic-Medium' }}
                        >
                            Get <span className="text-primary font-bold">early access</span> when we launch!
                        </span>
                    </div>
                </div>
            </section>

            {/* Survey form */}
            <main className="pb-16 px-4">
                <SurveyForm />
            </main>

            {/* Footer */}
            <footer className="py-6 px-4 border-t border-green-100">
                <div className="max-w-2xl mx-auto text-center">
                    <p
                        className="text-sm text-gray-500"
                        style={{ fontFamily: 'MadaniArabic-Regular' }}
                    >
                        Your responses are confidential and will only be used to improve AgriLink.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Survey;
