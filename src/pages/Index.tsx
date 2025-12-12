import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import ProcessSection from "@/components/ProcessSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="relative">
        <Hero />

        {/* Partners Box - part of hero section */}
        <div
          className="absolute z-20 shadow-lg left-4 right-4 sm:left-8 sm:right-8 md:left-16 md:right-16 lg:left-24 lg:right-24"
          style={{
            minHeight: '120px',
            bottom: '-60px',
            paddingTop: '24px',
            paddingBottom: '24px',
            paddingLeft: '16px',
            paddingRight: '16px',
            borderRadius: '20px',
            opacity: 1,
            background: 'hsl(var(--brand-colors-HarvestMist, 114 88% 94%))'
          }}
        >
          {/* Partners Section */}
          <div className="text-center h-full flex flex-col justify-center">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <span
                className="bg-primary block"
                style={{
                  width: '40px',
                  height: '6px',
                  borderRadius: '20px',
                  marginRight: '12px'
                }}
              ></span>
              <p className="text-gray-700 text-xs sm:text-sm uppercase tracking-wide">
                In Collaboration With
              </p>
              <span
                className="bg-primary block"
                style={{
                  width: '40px',
                  height: '6px',
                  borderRadius: '20px',
                  marginLeft: '12px'
                }}
              ></span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {[1, 2, 3].map((partnerId) => {
                const isPartner3 = partnerId === 3;

                return (
                  <div
                    key={partnerId}
                    className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/60 rounded-lg shadow-sm flex items-center justify-center ${isPartner3 ? 'p-0' : 'p-2 sm:p-3'}`}
                  >
                    <img
                      src={isPartner3 ? `/partner-${partnerId}.webp` : `/partner-${partnerId}.svg`}
                      alt={`Partner ${partnerId}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        console.error(`Failed to load partner image: partner-${partnerId}`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-28">
        <ProblemSection />
      </div>
      <SolutionSection />
      <FeaturesSection />
      <CTASection />
      <ProcessSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
