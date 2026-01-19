import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth/authService';
import { getCurrentUserType } from '@/services/auth/tokenStorage';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EyeIcon: React.FC<{ isVisible: boolean }> = ({ isVisible }) => (
  <img 
    src={isVisible ? "/eye.svg" : "/eye-closed.svg"} 
    alt={isVisible ? "Hide password" : "Show password"}
    className="w-5 h-5"
  />
);

const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.47 22.49 10.79 22.38 10.11H12.25V14.26H18.24C17.93 15.72 17.07 16.94 15.83 17.78V20.54H19.41C21.36 18.8 22.56 16.25 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12.25 23C15.49 23 18.2 21.92 19.41 20.54L15.83 17.78C14.82 18.48 13.55 18.9 12.25 18.9C9.12 18.9 6.46 16.94 5.57 14.27H1.86V17.14C3.11 19.62 7.42 23 12.25 23Z" fill="#34A853"/>
    <path d="M5.57 14.27C5.33 13.57 5.2 12.8 5.2 12C5.2 11.2 5.33 10.43 5.57 9.73V6.86H1.86C1.07 8.44 0.625 10.17 0.625 12C0.625 13.83 1.07 15.56 1.86 17.14L5.57 14.27Z" fill="#FBBC05"/>
    <path d="M12.25 5.1C13.71 5.1 15.06 5.67 16.1 6.67L19.24 3.53C18.19 2.56 15.49 1 12.25 1C7.42 1 3.11 4.38 1.86 6.86L5.57 9.73C6.46 7.06 9.12 5.1 12.25 5.1Z" fill="#EA4335"/>
  </svg>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe,
      });

      if (!response) {
        throw new Error('No response received from server');
      }

      let userRole = response.user?.role;

      if (!userRole) {
        userRole = getCurrentUserType();
      }

      if (!userRole) {
        throw new Error('Unable to determine user type. Please try logging in again.');
      }

      if (userRole === 'farmer') {
        navigate('/farmer-dashboard');
      } else if (userRole === 'buyer') {
        navigate('/marketplace');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google login functionality to be implemented
  };

  return (
    <>
      <style>
        {`
          .custom-placeholder::placeholder {
            opacity: 0.50 !important;
            color: var(--brand-colors-RootBlack, #182605) !important;
            font-size: 14px !important;
            font-family: 'MadaniArabic-Medium' !important;
            font-weight: 400 !important;
            line-height: 37px !important;
            word-wrap: break-word !important;
          }
        `}
      </style>
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center" style={{
        backgroundImage: 'url("/Login.webp")',
        backgroundColor: 'hsl(var(--brand-colors-HarvestMist))'
      }}>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'hsla(0, 0%, 0%, 0.6)',
            zIndex: 1
          }}
        />
        
        <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row items-stretch justify-center lg:justify-between p-4 md:p-6 lg:p-8 xl:px-12 gap-4 lg:gap-8">
          {/* Left Side - Brand */}
          <div className="hidden lg:flex max-w-sm xl:max-w-md">
            <div className="flex flex-col justify-between p-8 w-full">
              {/* Logo at top */}
              <div>
                <Link to="/" className="cursor-pointer">
                  <img 
                    src="/Agrilink-logo-light.svg" 
                    alt="Agrilink" 
                    className="h-10 w-auto"
                  />
                </Link>
              </div>

              {/* Content at bottom */}
              <div className="space-y-4">
                <h1 className="text-brand-colors-SteamWhite text-2xl xl:text-3xl font-madani-bold leading-tight">
                  Sign In and Get Straight to Business
                </h1>
                <p className="text-brand-colors-SteamWhite text-sm xl:text-base font-madani-medium leading-relaxed">
                  Log in to connect, trade, and grow — whether you're here to sell your harvest or find the freshest produce across Nigeria.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-4">
            <Link to="/" className="cursor-pointer flex justify-center">
              <img 
                src="/Agrilink-logo-light.svg" 
                alt="Agrilink" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md md:max-w-lg backdrop-blur-xl backdrop-saturate-200 backdrop-brightness-125 border-2 border-white/60 rounded-[30px] p-6 md:p-8 shadow-2xl drop-shadow-2xl before:absolute before:inset-0 before:rounded-[30px] before:bg-gradient-to-br before:from-white/25 before:via-white/8 before:to-transparent before:pointer-events-none relative after:absolute after:inset-0 after:rounded-[30px] after:bg-gradient-to-tl after:from-transparent after:via-transparent after:to-white/15 after:pointer-events-none flex flex-col justify-between" style={{ backgroundColor: 'hsla(114, 88%, 94%, 0.5)' }}>
            {/* Header */}
            <div>
              <div className="w-16 h-2 bg-brand-colors-SproutGreen rounded-full mb-3" />
              <h2 style={{ 
                color: 'var(--brand-colors-RootBlack, #182605)', 
                fontSize: 28, 
                fontFamily: 'MadaniArabic-Bold', 
                fontWeight: '400', 
                wordWrap: 'break-word' 
              }} className="leading-tight">
                Welcome back to AgriLink
              </h2>
            </div>

            {/* Form */}
            <div className="flex-1 flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-[20px] text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-brand-colors-RootBlack text-sm font-madani-medium">
                  user name
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address or phone number"
                  className="w-full h-11 px-4 bg-brand-colors-HarvestMist border-2 border-brand-colors-HarvestMist rounded-[30px] text-brand-colors-RootBlack text-sm font-madani-medium focus:outline-none focus:border-brand-colors-SproutGreen transition-colors custom-placeholder"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-brand-colors-RootBlack text-sm font-madani-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full h-11 px-4 pr-12 bg-brand-colors-HarvestMist border-2 border-brand-colors-HarvestMist rounded-[30px] text-brand-colors-RootBlack text-sm font-madani-medium focus:outline-none focus:border-brand-colors-SproutGreen transition-colors custom-placeholder"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-colors-RootBlack/60 hover:text-brand-colors-RootBlack transition-colors"
                  >
                    <EyeIcon isVisible={showPassword} />
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-brand-colors-SproutGreen"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-brand-colors-RootBlack font-madani-medium">
                    Remember me
                  </label>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-brand-colors-SteamWhite text-sm sm:text-base font-normal font-['MadaniArabic-Medium']">
                    Forgot your password?
                  </span>
                  <Link
                    to="/forgot-password"
                    className="text-brand-colors-RootBlack text-sm sm:text-base font-normal font-['MadaniArabic-Medium'] hover:underline"
                  >
                    Click Here
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brand-colors-SproutGreen hover:bg-brand-colors-SproutGreen/90 rounded-[30px] flex items-center justify-center text-brand-colors-SteamWhite text-sm font-madani-bold transition-colors mt-6"
              >
                {isLoading ? "Signing in..." : "Log In"}
              </button>
            </form>
            
            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-brand-colors-RootBlack/20"></div>
              <span className="text-brand-colors-RootBlack/60 text-sm font-madani-medium">Or</span>
              <div className="flex-1 h-px bg-brand-colors-RootBlack/20"></div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 bg-brand-colors-SteamWhite hover:bg-gray-50 border border-gray-200 rounded-[30px] flex items-center justify-center gap-2 text-brand-colors-RootBlack text-sm font-madani-bold transition-colors"
            >
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>
            </div>

            {/* Signup Section */}
            <div>
              <p className="text-center text-sm mb-10">
                <span style={{
                  color: 'white',
                  fontSize: 16,
                  fontFamily: 'MadaniArabic-Medium',
                  fontWeight: '400',
                  wordWrap: 'break-word'
                }}>Don't have an account?</span>
              </p>

              <TooltipProvider>
                <div className="flex flex-col sm:flex-row gap-3">

                  {/* Sign up as Farmer - DISABLED */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex-1 inline-flex items-center justify-center"
                        style={{
                          height: '44px',
                          borderRadius: '30px',
                          background: 'hsl(var(--brand-colors-HarvestMist))',
                          color: 'black',
                          fontFamily: 'MadaniArabic-Bold',
                          fontSize: '14px',
                          opacity: 0.6,
                          cursor: 'not-allowed',
                        }}
                      >
                        Sign up as Farmer
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Public signups closed. Contact admin for access.</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Sign up as Buyer - DISABLED */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex-1 inline-flex items-center justify-center"
                        style={{
                          height: '44px',
                          borderRadius: '30px',
                          background: 'hsl(var(--brand-colors-HarvestMist))',
                          color: 'black',
                          fontFamily: 'MadaniArabic-Bold',
                          fontSize: '14px',
                          opacity: 0.6,
                          cursor: 'not-allowed',
                        }}
                      >
                        Sign up as Buyer
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Public signups closed. Contact admin for access.</p>
                    </TooltipContent>
                  </Tooltip>

                </div>
              </TooltipProvider>

              {/* Add Waitlist Link */}
              <Link
                to="/waitlist"
                className="inline-block mt-4 text-green-600 hover:text-green-700 text-sm w-full text-center"
                style={{ fontFamily: 'MadaniArabic-Medium' }}
              >
                Join our waitlist to be notified when registration reopens →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;