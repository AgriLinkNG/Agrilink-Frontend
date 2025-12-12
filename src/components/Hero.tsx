import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {

  return (
    <section
      className="text-white py-12 sm:py-16 md:py-20 lg:py-32 relative min-h-screen sm:min-h-[70vh]"
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(86, 64%, 20%, 0.3), hsl(86, 64%, 25%, 0.3)), url('/hero-bg.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-8 relative z-10">
        <div className="max-w-4xl text-left">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            No Middleman Wahala<br />
            Chat Farmers Directly!
          </h1>
          
          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90 max-w-3xl">
            Connect straight to farmers, price am your way, and get your produce fresh-fresh. Easy talk, easy deal.
          </p>

          {/* Stats Text */}
          <p 
            className="text-white mb-6 sm:mb-8 text-base sm:text-lg md:text-xl"
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 700,
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}
          >
            "100+ Farmers & Market Sellers already on agrilink"
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-12 w-full sm:w-auto">
            <Link to="/farmers-signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-[200px] bg-primary text-primary-foreground hover:bg-[hsl(var(--brand-colors-SoilBlush))] transition-colors duration-200"
                style={{
                  height: '60px',
                  gap: '10px',
                  opacity: 1,
                  borderRadius: '30px',
                  paddingTop: '12px',
                  paddingRight: '24px',
                  paddingBottom: '12px',
                  paddingLeft: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'inline-flex',
                  fontSize: '14px',
                  fontFamily: 'MadaniArabic-Bold',
                  fontWeight: '400'
                }}
              >
                Farmers Sign Up
              </Button>
            </Link>
            <Link to="/buyer-signup" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-[200px] text-black border-white transition-colors duration-200"
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'hsl(var(--brand-colors-SoilBlush))';
                  (e.target as HTMLElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'hsl(var(--brand-colors-HarvestMist, 114 88% 94%))';
                  (e.target as HTMLElement).style.color = 'black';
                }}
                style={{
                  height: '60px',
                  gap: '10px',
                  opacity: 1,
                  borderRadius: '30px',
                  paddingTop: '12px',
                  paddingRight: '24px',
                  paddingBottom: '12px',
                  paddingLeft: '24px',
                  background: 'hsl(var(--brand-colors-HarvestMist, 114 88% 94%))',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'inline-flex',
                  fontSize: '14px',
                  fontFamily: 'MadaniArabic-Bold',
                  fontWeight: '400'
                }}
              >
                Buyers Sign Up
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;