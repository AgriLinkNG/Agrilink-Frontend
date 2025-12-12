const FeatureCard = ({ title, description, number }) => {
  return (
    <div
      className="relative p-4 sm:p-6 shadow-md overflow-hidden flex flex-col w-full max-w-sm mx-auto"
      style={{
        minHeight: '280px',
        height: '320px',
        borderRadius: '30px',
        opacity: 1,
        transform: 'rotate(0deg)',
        background: 'hsl(var(--brand-colors-HarvestMist, 114 88% 94%))'
      }}
    >
      {/* Background logo image */}
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          width: '120px',
          height: '120px',
          bottom: '20px',
          right: '-20px',
          opacity: 0.7
        }}
      >
        <img
          src="/agrilink-logo-features-card.webp"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      
      <span 
        className="absolute bottom-4 left-4 z-0"
        style={{
          fontFamily: 'Montserrat',
          fontWeight: 700,
          fontStyle: 'normal',
          fontSize: '80px',
          lineHeight: '60px',
          letterSpacing: '0%',
          color: 'hsla(86, 78%, 8%, 0.36)'
        }}
      >
        {number}
      </span>
      
      <div className="relative z-10">
        <h3 className="text-gray-800" style={{ fontFamily: 'MadaniArabic-Bold', fontSize: '24px' }}>
          {title}
        </h3>
        <p className="mt-2 text-gray-600" style={{ fontFamily: 'MadaniArabic-Medium' }}>
          {description}
        </p>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      title: "Market Place Listing",
      description: "Explore verified produce with images, prices, and availability.",
      number: 1,
    },
    {
      title: "In-App Chat",
      description: "Connect and chat with farmers or buyers instantly.",
      number: 2,
    },
    {
      title: "Search & Filters",
      description: "Find exactly what you want, by type, price or location.",
      number: 3,
    },
    {
      title: "Notifications",
      description: "Stay updated when a buyer messages or when fresh produce is listed.",
      number: 4,
    },
    {
      title: "Post-Harvest Tips",
      description: "Farmers get access to tips to improve their produce quality and reduce spoilage.",
      number: 5,
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20" id="benefits" style={{ background: 'hsla(0, 0%, 100%, 1)' }}>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-2 sm:gap-0">
            <span className="w-16 sm:w-20 md:w-24 h-2 mb-2 bg-[hsl(var(--brand-colors-SproutGreen))] rounded-full sm:mr-3"></span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center">
              Everything You Need to Buy and Sell Smarter
            </h2>
            <span className="w-16 sm:w-20 md:w-24 h-2 mb-2 bg-[hsl(var(--brand-colors-SproutGreen))] rounded-full sm:ml-3"></span>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need for successful 
            agricultural trading, from listing to delivery.
          </p>
        </div>

        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr max-w-6xl">
            {features.slice(0, 3).map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 auto-rows-fr max-w-4xl">
            {features.slice(3).map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;