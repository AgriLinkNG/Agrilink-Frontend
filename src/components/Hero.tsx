import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          <TooltipProvider>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-12 w-full sm:w-auto">

              {/* Farmers Sign Up - DISABLED */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="inline-flex items-center justify-center w-full sm:w-[200px]"
                    style={{
                      height: '60px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      borderRadius: '30px',
                      background: 'hsl(var(--brand-colors-SproutGreen))',
                      color: 'white',
                      fontFamily: 'MadaniArabic-Bold',
                      fontSize: '14px',
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  >
                    Farmers Sign Up
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm max-w-xs"
                  style={{ fontFamily: 'MadaniArabic-Medium' }}
                >
                  <p>Public registration is currently closed.</p>
                  <p className="text-xs mt-1">Contact admin for access or login if you have an account.</p>
                </TooltipContent>
              </Tooltip>

              {/* Buyers Sign Up - DISABLED */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="inline-flex items-center justify-center w-full sm:w-[200px]"
                    style={{
                      height: '60px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      borderRadius: '30px',
                      background: 'hsl(var(--brand-colors-HarvestMist))',
                      color: 'black',
                      fontFamily: 'MadaniArabic-Bold',
                      fontSize: '14px',
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  >
                    Buyers Sign Up
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm max-w-xs"
                  style={{ fontFamily: 'MadaniArabic-Medium' }}
                >
                  <p>Public registration is currently closed.</p>
                  <p className="text-xs mt-1">Contact admin for access or login if you have an account.</p>
                </TooltipContent>
              </Tooltip>

            </div>
          </TooltipProvider>

        </div>
      </div>
    </section>
  );
};

export default Hero;