import React, { useState, FormEvent, ChangeEvent } from 'react';
import { ArrowRight, Sprout, Users, TrendingUp, Shield, MessageCircle, Smartphone, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { submitWaitlistEntry, WaitlistFormData } from "@/services/waitlistService";

interface FormData {
  name: string;
  email: string;
  mobile: string;
  userType: 'buyer' | 'farmer' | 'both';
}

export default function WaitlistLanding() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    mobile: '',
    userType: 'buyer'
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.mobile) {
      setError('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Submit to Supabase
      const result = await submitWaitlistEntry(formData as WaitlistFormData);

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">

            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-green-100 mb-8">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'MadaniArabic-Medium' }}>
                2nd Place - INVENTORS COMMUNITY Hackathon
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              style={{ fontFamily: 'MadaniArabic-Bold' }}
            >
              Stop Losing <span className="text-green-600">40%</span> of Your Harvest to Waste
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg sm:text-xl text-gray-600 mb-8"
              style={{ fontFamily: 'MadaniArabic-Regular' }}
            >
              AgriLink connects Nigerian farmers directly with buyers, eliminating middlemen
              and post-harvest losses. Fair prices. Fast sales. Zero waste.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary text-primary-foreground hover:bg-[hsl(var(--brand-colors-SoilBlush))]"
                style={{
                  height: '60px',
                  borderRadius: '30px',
                  fontFamily: 'MadaniArabic-Bold',
                  fontSize: '16px'
                }}
              >
                Join the Waitlist
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                size="lg"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-brand-colors-HarvestMist text-black hover:bg-[hsl(var(--brand-colors-SoilBlush))] hover:text-white"
                style={{
                  height: '60px',
                  borderRadius: '30px',
                  fontFamily: 'MadaniArabic-Bold',
                  fontSize: '16px'
                }}
              >
                See How It Works
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
              <div
                className="bg-white p-4 sm:p-6 shadow-lg border border-green-100"
                style={{ borderRadius: '20px' }}
              >
                <div
                  className="text-3xl sm:text-4xl font-bold text-green-600 mb-1"
                  style={{ fontFamily: 'MadaniArabic-Bold' }}
                >
                  40%
                </div>
                <div
                  className="text-xs sm:text-sm text-gray-600"
                  style={{ fontFamily: 'MadaniArabic-Medium' }}
                >
                  Food Loss Prevented
                </div>
              </div>

              <div
                className="bg-white p-4 sm:p-6 shadow-lg border border-green-100"
                style={{ borderRadius: '20px' }}
              >
                <div
                  className="text-3xl sm:text-4xl font-bold text-green-600 mb-1"
                  style={{ fontFamily: 'MadaniArabic-Bold' }}
                >
                  0
                </div>
                <div
                  className="text-xs sm:text-sm text-gray-600"
                  style={{ fontFamily: 'MadaniArabic-Medium' }}
                >
                  Middlemen
                </div>
              </div>

              <div
                className="bg-white p-4 sm:p-6 shadow-lg border border-green-100"
                style={{ borderRadius: '20px' }}
              >
                <div
                  className="text-3xl sm:text-4xl font-bold text-green-600 mb-1"
                  style={{ fontFamily: 'MadaniArabic-Bold' }}
                >
                  100%
                </div>
                <div
                  className="text-xs sm:text-sm text-gray-600"
                  style={{ fontFamily: 'MadaniArabic-Medium' }}
                >
                  Direct Trade
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">

            <div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'MadaniArabic-Bold' }}
              >
                The Problem We're Solving
              </h2>

              <div className="space-y-4">
                <p
                  className="text-lg text-gray-600"
                  style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                  Nigeria loses over 40% of agricultural produce between harvest and market.
                  Farmers work hard, harvest good crops, but watch them rot before reaching buyers.
                </p>

                <p
                  className="text-lg text-gray-600"
                  style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                  Why? Middlemen control the chain. They delay purchases, drive down prices,
                  and create massive inefficiencies. Farmers lose money. Buyers pay more.
                  Food goes to waste.
                </p>

                <p
                  className="text-lg text-gray-600 font-medium"
                  style={{ fontFamily: 'MadaniArabic-Medium' }}
                >
                  AgriLink changes this. Direct connections. Fair prices. Zero waste.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <img
                src="/problem-image.webp"
                alt="Agricultural waste problem"
                className="w-full max-w-md rounded-3xl shadow-lg"
                style={{ aspectRatio: '586/730' }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-12 sm:py-16 md:py-20"
        style={{ background: 'hsl(var(--brand-colors-HarvestMist))' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'MadaniArabic-Bold' }}
            >
              How It Works
            </h2>
            <p
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
              style={{ fontFamily: 'MadaniArabic-Regular' }}
            >
              Three simple steps to connect farmers and buyers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <div
              className="relative p-6 shadow-md overflow-hidden flex flex-col bg-white"
              style={{ minHeight: '280px', borderRadius: '30px' }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Sprout className="w-8 h-8 text-green-600" />
              </div>
              <h3
                className="text-xl font-bold text-gray-900 mb-3"
                style={{ fontFamily: 'MadaniArabic-Bold' }}
              >
                Farmers List Produce
              </h3>
              <p
                className="text-gray-600 text-sm"
                style={{ fontFamily: 'MadaniArabic-Regular' }}
              >
                Post harvest details, set prices, and reach buyers directly without intermediaries
              </p>
            </div>

            <div
              className="relative p-6 shadow-md overflow-hidden flex flex-col bg-white"
              style={{ minHeight: '280px', borderRadius: '30px' }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3
                className="text-xl font-bold text-gray-900 mb-3"
                style={{ fontFamily: 'MadaniArabic-Bold' }}
              >
                Buyers Connect Directly
              </h3>
              <p
                className="text-gray-600 text-sm"
                style={{ fontFamily: 'MadaniArabic-Regular' }}
              >
                Browse fresh produce, chat with farmers, and negotiate fair prices instantly
              </p>
            </div>

            <div
              className="relative p-6 shadow-md overflow-hidden flex flex-col bg-white"
              style={{ minHeight: '280px', borderRadius: '30px' }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3
                className="text-xl font-bold text-gray-900 mb-3"
                style={{ fontFamily: 'MadaniArabic-Bold' }}
              >
                Trade & Grow
              </h3>
              <p
                className="text-gray-600 text-sm"
                style={{ fontFamily: 'MadaniArabic-Regular' }}
              >
                Complete transactions safely, build your reputation, and grow your business
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'MadaniArabic-Bold' }}
            >
              Built for Nigerian Agriculture
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {[
              { icon: MessageCircle, text: "Real-time chat between farmers and buyers" },
              { icon: Smartphone, text: "Mobile-first design for on-the-go trading" },
              { icon: TrendingUp, text: "Fair pricing based on real market rates" },
              { icon: Shield, text: "Secure transactions and user verification" },
              { icon: Check, text: "No middlemen fees or delays" },
              { icon: Users, text: "Build your reputation with ratings" }
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <p
                  className="text-gray-700 text-base pt-2"
                  style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                  {feature.text}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Waitlist Form Section */}
      <section
        id="waitlist-form"
        className="py-16 sm:py-24"
        style={{ background: 'linear-gradient(to bottom, hsl(var(--brand-colors-HarvestMist)), white)' }}
      >
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div
            className="bg-white shadow-xl border border-green-100 p-8"
            style={{ borderRadius: '30px' }}
          >

            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'MadaniArabic-Bold' }}
                  >
                    Join the Waitlist
                  </h2>
                  <p
                    className="text-gray-600 text-sm"
                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                  >
                    Be among the first to experience AgriLink when we launch
                  </p>
                </div>

                {error && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-5 text-sm"
                    style={{
                      borderRadius: '20px',
                      fontFamily: 'MadaniArabic-Medium'
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="space-y-1">
                    <Label
                      htmlFor="name"
                      className="block text-brand-colors-RootBlack text-sm"
                      style={{ fontFamily: 'MadaniArabic-Medium' }}
                    >
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full h-11 px-4 bg-brand-colors-HarvestMist border-2 border-brand-colors-HarvestMist text-brand-colors-RootBlack text-sm focus:outline-none focus:border-brand-colors-SproutGreen transition-colors"
                      style={{
                        borderRadius: '30px',
                        fontFamily: 'MadaniArabic-Medium'
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="email"
                      className="block text-brand-colors-RootBlack text-sm"
                      style={{ fontFamily: 'MadaniArabic-Medium' }}
                    >
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full h-11 px-4 bg-brand-colors-HarvestMist border-2 border-brand-colors-HarvestMist text-brand-colors-RootBlack text-sm focus:outline-none focus:border-brand-colors-SproutGreen transition-colors"
                      style={{
                        borderRadius: '30px',
                        fontFamily: 'MadaniArabic-Medium'
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="mobile"
                      className="block text-brand-colors-RootBlack text-sm"
                      style={{ fontFamily: 'MadaniArabic-Medium' }}
                    >
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="+234 801 234 5678"
                      className="w-full h-11 px-4 bg-brand-colors-HarvestMist border-2 border-brand-colors-HarvestMist text-brand-colors-RootBlack text-sm focus:outline-none focus:border-brand-colors-SproutGreen transition-colors"
                      style={{
                        borderRadius: '30px',
                        fontFamily: 'MadaniArabic-Medium'
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="userType"
                      className="block text-brand-colors-RootBlack text-sm"
                      style={{ fontFamily: 'MadaniArabic-Medium' }}
                    >
                      I am a <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 bg-brand-colors-HarvestMist border-2 border-brand-colors-HarvestMist text-brand-colors-RootBlack text-sm focus:outline-none focus:border-brand-colors-SproutGreen transition-colors"
                      style={{
                        borderRadius: '30px',
                        fontFamily: 'MadaniArabic-Medium'
                      }}
                      required
                    >
                      <option value="buyer">Buyer</option>
                      <option value="farmer">Farmer</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-brand-colors-SproutGreen hover:bg-[hsl(var(--brand-colors-SoilBlush))] text-white transition-colors"
                    style={{
                      borderRadius: '30px',
                      fontFamily: 'MadaniArabic-Bold',
                      fontSize: '14px'
                    }}
                  >
                    {loading ? "Submitting..." : "Join Waitlist"}
                  </Button>

                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: 'MadaniArabic-Bold' }}
                >
                  You're on the list!
                </h2>
                <p
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                  Thank you for joining! We'll notify you via email and SMS when AgriLink launches in Nigeria.
                </p>
                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: 'MadaniArabic-Medium' }}
                >
                  Check your email for confirmation.
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
