import { Check, Smartphone, Users, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const SolutionSection = () => {
  const features = [
    {
      number: "1",
      text: "List your produce easily"
    },
    {
      number: "2",
      text: "Get paid fairly, no middleman wahala"
    },
    {
      number: "3",
      text: "Browse fresh produce across Nigeria"
    },
    {
      number: "4",
      text: "Negotiate and buy,  just how you ike it."
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-accent/5">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Content Column */}
          <div>
            <div className="max-w-xl">
              <div className="flex items-center mb-2">
                <span className="w-16 sm:w-20 h-2 bg-primary rounded-full mr-3"></span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                <span className="text-primary">Agrilink</span> - The Direct<br />
                Connection You Have Been<br />
                Waiting For
              </h2>
              

              <div className="space-y-4 sm:space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                      {feature.number}
                    </div>
                    <p className="text-foreground font-medium pt-2 sm:pt-3 text-sm sm:text-base">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>

              <p 
                className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl"
                style={{
                  fontFamily: 'Montserrat',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  lineHeight: '1.4'
                }}
              >
                "No middlemen. No stories. Just direct connection and better deals" sign up now
              </p>

              <div className="flex flex-row gap-2 sm:gap-4 mt-4 sm:mt-6">
                <Button
                  size="lg"
                  className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-[hsl(var(--brand-colors-SoilBlush))] transition-colors duration-200"
                  style={{
                    height: '50px',
                    gap: '10px',
                    opacity: 1,
                    borderRadius: '30px',
                    paddingTop: '12px',
                    paddingRight: '16px',
                    paddingBottom: '12px',
                    paddingLeft: '16px',
                    fontSize: '12px',
                    fontFamily: 'MadaniArabic-Bold',
                    fontWeight: '400'
                  }}
                >
                  Farmers Sign Up
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 sm:flex-none text-black border-none transition-colors duration-200"
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = 'hsl(var(--brand-colors-SoilBlush))';
                    (e.target as HTMLElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = 'hsl(var(--brand-colors-HarvestMist, 114 88% 94%))';
                    (e.target as HTMLElement).style.color = 'black';
                  }}
                  style={{
                    height: '50px',
                    gap: '10px',
                    opacity: 1,
                    borderRadius: '30px',
                    paddingTop: '12px',
                    paddingRight: '16px',
                    paddingBottom: '12px',
                    paddingLeft: '16px',
                    background: 'hsl(var(--brand-colors-HarvestMist, 114 88% 94%))',
                    fontSize: '12px',
                    fontFamily: 'MadaniArabic-Bold',
                    fontWeight: '400'
                  }}
                >
                  Buyers Sign Up
                </Button>
              </div>
            </div>
          </div>

          {/* Image Column */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/solution-image.webp"
                alt="Person using agrilink mobile app"
                className="w-full max-w-md sm:max-w-lg lg:max-w-xl shadow-lg object-cover rounded-3xl"
                style={{
                  aspectRatio: '587/730',
                }}
                onError={(e) => {
                  console.error('Solution image failed to load:', e);
                  const target = e.target as HTMLImageElement;
                  target.style.backgroundColor = '#f3f4f6';
                  target.alt = 'Solution image not available';
                }}
                onLoad={() => {
                  console.log('Solution image loaded successfully');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;