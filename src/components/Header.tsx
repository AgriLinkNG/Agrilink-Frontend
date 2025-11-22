import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Benefits", href: "#benefits" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-md border-b border-white/10 shadow-lg' 
          : 'border-b border-transparent shadow-none'
      }`}
      style={{ 
        background: scrolled 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'var(--brand-colors-HarvestMist, rgba(228, 253, 225, 1))'
      }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="cursor-pointer">
              <img
                src="/Agrilink-logo-dark.svg"
                alt="Agrilink Logo"
                className="h-10 w-auto object-contain ml-4"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex flex-1 justify-center items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-[hsl(var(--brand-colors-SoilBlush))] transition-colors"
                style={{
                  color: 'var(--brand-colors-RootBlack, hsla(86, 78%, 8%, 1))',
                  fontFamily: 'MadaniArabic-Bold',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  leadingTrim: 'cap-height',
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center">
            <Link to="/login">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-[hsl(var(--brand-colors-SoilBlush))] transition-colors duration-200"
                style={{ 
                  fontFamily: 'MadaniArabic-Bold',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  leadingTrim: 'cap-height',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  width: '160px',
                  height: '40px',
                  minWidth: '160px',
                  minHeight: '40px',
                  borderRadius: '30px',
                  paddingTop: '12px',
                  paddingRight: '24px',
                  paddingBottom: '12px',
                  paddingLeft: '24px',
                  gap: '10px',
                  transform: 'rotate(0deg)',
                  opacity: 1
                } as React.CSSProperties}
              >
                Log In
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Mobile Menu Popup */}
          {isOpen && (
            <div style={{
              width: '100%',
              height: 'auto',
              maxHeight: '50vh',
              position: 'fixed',
              top: 0,
              left: 0,
              backgroundColor: '#E4FDE1',
              overflow: 'hidden',
              borderBottomRightRadius: 50,
              borderBottomLeftRadius: 50,
              zIndex: 9999,
              paddingBottom: 40
            }}>
              {/* Header with Logo and Close Button */}
              <div style={{
                width: '100%',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {/* Logo */}
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    <img
                      src="/Agrilink-logo-dark.svg"
                      alt="Agrilink Logo"
                      style={{ height: 32, width: 'auto', objectFit: 'contain' }}
                    />
                  </Link>

                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 10,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <X className="h-6 w-6" style={{ color: 'var(--brand-colors-RootBlack, #182605)' }} />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div style={{
                width: '100%',
                maxWidth: 358,
                margin: '0 auto',
                marginTop: 24,
                padding: '0 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 28
              }}>
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 10,
                      color: 'var(--brand-colors-RootBlack, #182605)',
                      fontSize: 16,
                      fontFamily: 'MadaniArabic-Bold',
                      fontWeight: '400',
                      wordWrap: 'break-word',
                      textDecoration: 'none'
                    }}
                  >
                    {link.name}
                  </a>
                ))}

                {/* Log In Button */}
                <Link to="/login" onClick={() => setIsOpen(false)} style={{ width: '100%' }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingTop: 12,
                    paddingBottom: 12,
                    background: '#84C62C',
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    display: 'inline-flex',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      color: 'white',
                      fontSize: 16,
                      fontFamily: 'MadaniArabic-Bold',
                      fontWeight: '400',
                      wordWrap: 'break-word'
                    }}>Log In</div>
                  </div>
                </Link>
              </div>

              {/* Bottom Indicator */}
              <div style={{
                width: 60,
                height: 5,
                margin: '24px auto 0',
                background: '#182605',
                borderRadius: 5
              }} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;