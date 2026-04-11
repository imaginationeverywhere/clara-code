import React, { useEffect, useState, Fragment, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClaraLogo } from '../components/ClaraLogo';
import {
  Users,
  Check,
  Lock,
  Shield,
  CreditCard,
  Loader2,
  Calendar,
  ChevronDown,
  AlertTriangle,
  XCircle,
  Key,
  Mic } from
'lucide-react';
type PlanConfig = {
  name: string;
  price: string;
  priceNum: string;
  period: string;
  trial: string;
  trialDate: string;
  badge?: string;
  features: string[];
};
const plans: Record<string, PlanConfig> = {
  pro: {
    name: 'Pro',
    price: '$49',
    priceNum: '$49.00',
    period: '/month',
    trial: '14-day free trial included',
    trialDate: 'May 10, 2026',
    badge: 'Most Popular',
    features: [
    'Unlimited API calls',
    '5 AI agents with memory',
    '3 voice clones',
    'Priority model access',
    'Advanced analytics',
    'Team collaboration (up to 5)',
    'Email + chat support']

  },
  team: {
    name: 'Team',
    price: '$99',
    priceNum: '$99.00',
    period: '/month',
    trial: '14-day free trial included',
    trialDate: 'May 10, 2026',
    features: [
    'Everything in Pro',
    'Shared team vault',
    'Up to 6 agent personas',
    'Admin dashboard',
    'SSO (Clerk teams)',
    'SLA + dedicated support']

  }
};
export function Checkout() {
  const { plan: planId } = useParams<{
    plan: string;
  }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan = plans[planId || 'pro'] || plans.pro;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/checkout/success?plan=${planId}`);
    }, 2000);
  };
  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans selection:bg-[#7C3AED]/30 selection:text-white">
      {/* HEADER */}
      <header className="h-14 bg-[#070A0F] border-b border-white/[0.06] px-6 flex items-center justify-between">
        {/* Left — Wordmark */}
        <div className="flex items-center gap-2.5">
          <ClaraLogo size={24} />
          <span className="text-base font-semibold text-white">Clara Code</span>
        </div>

        {/* Center — Step Indicator */}
        <div className="hidden sm:flex items-center gap-0">
          {/* Step 1 — Plan (done) */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] text-white/40 mt-1">Plan</span>
          </div>
          <div className="w-12 h-px bg-[#7C3AED]/40 -mt-3" />
          {/* Step 2 — Payment (current) */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-[#7C3AED] border-2 border-[#7C3AED] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">2</span>
            </div>
            <span className="text-[10px] text-white/40 mt-1">Payment</span>
          </div>
          <div className="w-12 h-px bg-white/[0.12] -mt-3" />
          {/* Step 3 — Confirm (upcoming) */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center">
              <span className="text-[10px] text-white/30">3</span>
            </div>
            <span className="text-[10px] text-white/40 mt-1">Confirm</span>
          </div>
        </div>

        {/* Right — Secure */}
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Lock className="w-3 h-3" />
          <span className="hidden sm:inline">Secure checkout</span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12 flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN — Plan Summary */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-12 lg:self-start">
          {/* Plan Card */}
          <div className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-6 mb-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Clara Code {plan.name}
                </h2>
                <p className="text-[13px] text-[#10B981] mt-1">{plan.trial}</p>
              </div>
              <div className="text-right">
                <span className="text-[28px] font-bold text-white leading-none">
                  {plan.price}
                </span>
                <span className="text-sm text-white/40">{plan.period}</span>
              </div>
            </div>

            <div className="h-px bg-white/[0.06] mb-5" />

            <div className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
              Everything in {plan.name}:
            </div>
            <div className="space-y-3 mb-5">
              {plan.features.map((feature, i) =>
              <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span className="text-sm text-white/70">{feature}</span>
                </div>
              )}
            </div>

            <div className="h-px bg-white/[0.06] mb-5" />

            {/* Trial Callout */}
            <div className="bg-[#10B981]/[0.08] rounded-xl border border-[#10B981]/20 p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#10B981]">
                    Free until {plan.trialDate}
                  </div>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Your card won't be charged until the trial ends. Cancel
                    anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-5 mb-4">
            <div className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">
              Order Summary
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-white/70">
                Clara Code {plan.name}
              </span>
              <span className="text-sm text-white/70">{plan.priceNum}/mo</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-sm text-[#10B981]">
                Trial discount (14 days)
              </span>
              <span className="text-sm text-[#10B981]">−{plan.priceNum}</span>
            </div>
            <div className="h-px bg-white/[0.06] my-3" />
            <div className="flex justify-between items-baseline">
              <span className="text-base font-semibold text-white">
                Due today
              </span>
              <span className="text-xl font-bold text-white">$0.00</span>
            </div>
            <p className="text-xs text-white/30 mt-3 text-center">
              After 14 days: {plan.priceNum}/month. Cancel anytime.
            </p>
          </div>

          {/* Security Badges */}
          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Lock className="w-3 h-3" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Shield className="w-3 h-3" />
              <span>PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <CreditCard className="w-3 h-3" />
              <span>Powered by Stripe</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Payment Form */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[22px] font-bold text-white mb-1">
            Payment Details
          </h3>
          <p className="text-sm text-white/50 mb-8">
            You won't be charged until your trial ends.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Billing Information */}
            <div className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">
              Billing Information
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="Alex"
                  className="w-full h-10 bg-[#070A0F] border border-white/[0.12] rounded-xl px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50" />
                
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Rivera"
                  className="w-full h-10 bg-[#070A0F] border border-white/[0.12] rounded-xl px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50" />
                
              </div>
            </div>

            {/* Email (locked) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Email
              </label>
              <div className="w-full h-10 bg-[#070A0F] border border-white/[0.08] rounded-xl px-3 flex items-center justify-between">
                <span className="text-sm text-white/50">ar@claracode.ai</span>
                <Lock className="w-3 h-3 text-white/25" />
              </div>
            </div>

            {/* Country / State */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Country
                </label>
                <div className="w-full h-10 bg-[#070A0F] border border-white/[0.12] rounded-xl px-3 flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-white/50">United States</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  State / Province
                </label>
                <input
                  type="text"
                  placeholder="California"
                  className="w-full h-10 bg-[#070A0F] border border-white/[0.12] rounded-xl px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50" />
                
              </div>
            </div>

            {/* Card Details */}
            <div className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">
              Card Details
            </div>

            <div
              id="stripe-payment-element"
              className="bg-[#0A0E14] rounded-2xl border border-white/10 p-5 mb-6">
              
              {/* Stripe <PaymentElement /> mounts here with dark appearance override */}
              {/* stripeAppearance: { theme: 'night', variables: { colorPrimary: '#7C3AED', colorBackground: '#070A0F', colorText: '#ffffff', colorTextSecondary: 'rgba(255,255,255,0.5)', colorDanger: '#EF4444', borderRadius: '12px', fontFamily: 'Inter, sans-serif' } } */}

              {/* Placeholder UI */}
              <div className="space-y-4">
                {/* Card Number */}
                <div>
                  <span className="block text-xs text-white/40 mb-1.5">
                    Card number
                  </span>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-white/20 shrink-0" />
                    <div className="flex-1 h-5 rounded-full bg-white/[0.08] animate-pulse" />
                    <div className="flex gap-1.5">
                      <div className="w-8 h-5 rounded-md bg-white/[0.08] animate-pulse" />
                      <div className="w-8 h-5 rounded-md bg-white/[0.08] animate-pulse" />
                      <div className="w-8 h-5 rounded-md bg-white/[0.08] animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Expiry + CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-white/40 mb-1.5">
                      Expiration
                    </span>
                    <div className="h-10 rounded-xl bg-white/[0.08] animate-pulse" />
                  </div>
                  <div>
                    <span className="block text-xs text-white/40 mb-1.5">
                      CVC
                    </span>
                    <div className="h-10 rounded-xl bg-white/[0.08] animate-pulse" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/30 text-center mt-4">
                Loading secure payment form...
              </p>
            </div>

            {/* Promo Code Row */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[13px] text-white/40 shrink-0">
                Have a promo code?
              </span>
              <input
                type="text"
                placeholder="Enter code"
                className="flex-1 h-9 bg-[#070A0F] border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50" />
              
              <button
                type="button"
                className="h-9 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors shrink-0">
                
                Apply
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full h-12 rounded-2xl text-white font-semibold text-base transition-all flex items-center justify-center gap-2 ${isProcessing ? 'bg-[#6D28D9]/70 cursor-not-allowed' : 'bg-[#7C3AED] hover:bg-[#6D28D9] shadow-[0_0_40px_rgba(124,58,237,0.4)]'}`}>
              
              {isProcessing ?
              <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Processing...
                </> :

              <>
                  <Lock className="w-4 h-4" />
                  Start Free Trial — No charge today
                </>
              }
            </button>

            {/* Trust badges below button */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Cancel anytime
              </span>
              <span>|</span>
              <span>14-day free trial</span>
              <span>|</span>
              <span>Instant access</span>
            </div>

            {/* Error */}
            {error &&
            <div className="mt-4 bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
                <span className="text-[13px] text-[#EF4444]/80">{error}</span>
              </div>
            }

            <p className="text-[11px] text-white/25 text-center mt-4 leading-relaxed">
              By subscribing, you agree to our Terms of Service. Your
              subscription will auto-renew at {plan.priceNum}
              {plan.period} after the trial period. Cancel anytime in Settings →
              Billing.
            </p>
          </form>

          {/* Stripe Badge */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-white/[0.06]">
            <Lock className="w-3 h-3 text-white/20" />
            <span className="text-[11px] text-white/20">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>);

}
const miniWaveHeights = [
4, 8, 12, 16, 20, 24, 20, 16, 24, 16, 12, 20, 8, 12, 16, 24, 20, 12, 16, 20,
16, 12, 8, 4];

export function CheckoutSuccess() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const planId = params.get('plan') || 'pro';
  const plan = plans[planId] || plans.pro;
  useEffect(() => {
    document.title = `Welcome to ${plan.name} — Clara Code`;
  }, [plan.name]);
  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans selection:bg-[#7C3AED]/30 selection:text-white">
      {/* Header */}
      <header className="h-14 bg-[#070A0F] border-b border-white/[0.06] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ClaraLogo size={24} />
          <span className="text-base font-semibold text-white">Clara Code</span>
        </div>

        {/* Step Indicator — Desktop */}
        <div className="hidden md:flex items-center gap-0">
          {['Plan', 'Payment', 'Confirm'].map((label, i) =>
          <Fragment key={label}>
              {i > 0 && <div className="w-12 h-px bg-[#10B981]/60" />}
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] text-white/40 mt-1">{label}</span>
              </div>
            </Fragment>
          )}
        </div>

        {/* Step Indicator — Mobile */}
        <div className="md:hidden text-xs text-[#10B981] font-medium">
          Step 3 of 3 — Complete
        </div>

        <span className="text-xs text-white/30 hidden sm:block">
          © 2026 Quik Nation, Inc.
        </span>
      </header>

      {/* Confetti Mount */}
      <div
        id="confetti-mount"
        className="fixed inset-0 pointer-events-none z-10">
        
        {/* Canvas-confetti fires here on mount — purple #7C3AED and Clara Blue #7BCDD8 colors, 3-second burst */}
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Success Badge */}
        <div
          className="inline-flex items-center gap-2 bg-[#10B981]/[0.12] border border-[#10B981]/25 rounded-full px-5 py-2 mb-8 relative"
          aria-live="polite">
          
          <div className="absolute inset-0 rounded-full border border-[#10B981]/30 animate-ping motion-reduce:animate-none" />
          <Check className="w-4 h-4 text-[#10B981] relative z-10" />
          <span className="text-sm font-semibold text-[#10B981] relative z-10">
            Pro plan activated
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-[52px] font-extrabold text-white tracking-tight leading-[1.05] mb-4">
          You're in.
        </h1>
        <p className="text-lg text-white/55 max-w-md mx-auto leading-relaxed">
          Clara Code Pro is ready. 14 days free — then {plan.price}/month.
          Cancel anytime.
        </p>

        {/* Primary CTA */}
        <div className="mt-10">
          <button className="w-full max-w-xs sm:max-w-xs mx-auto h-14 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-base shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-colors flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117]">
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 17L17 7M17 7H7M17 7V17" />
              
            </svg>
            Open Clara Code
          </button>
          <p className="text-xs text-white/30 text-center mt-3">
            Opens the desktop IDE — download required if not installed
          </p>
          <p className="text-[13px] text-white/40 text-center mt-2">
            Don't have it yet?{' '}
            <a
              href="#"
              className="text-[#7BCDD8] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117] rounded-sm">
              
              Download Clara Code
            </a>
          </p>
        </div>

        {/* Divider */}
        <div className="mt-12 mb-10 flex items-center gap-4">
          <hr className="flex-1 border-t border-white/[0.08]" />
          <span className="text-sm font-semibold text-white/30 uppercase tracking-wider px-4 whitespace-nowrap">
            Your first 3 moves
          </span>
          <hr className="flex-1 border-t border-white/[0.08]" />
        </div>

        {/* Next Steps Cards */}
        <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
          {/* Card 1 — Download */}
          <a
            href="#"
            aria-label="Download Clara Code — opens downloads page"
            className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-5 text-left flex items-start gap-4 hover:border-white/[0.16] hover:bg-[#0A0E14]/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117]">
            
            <div className="w-8 h-8 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#7C3AED]">1</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[15px] font-semibold text-white">
                  Download Clara Code
                </span>
                <svg
                  className="w-3.5 h-3.5 text-white/30 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}>
                  
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17" />
                  
                </svg>
              </div>
              <p className="text-[13px] text-white/50 leading-relaxed mb-3">
                Get the IDE on your machine. macOS, Windows, and Linux
                available.
              </p>
              <div className="flex items-center gap-2">
                {['macOS', 'Windows', 'Linux'].map((p) =>
                <span
                  key={p}
                  className="bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-0.5 text-xs text-white/50">
                  
                    {p}
                  </span>
                )}
              </div>
            </div>
          </a>

          {/* Card 2 — API Key */}
          <a
            href="/settings"
            aria-label="Create your first API key — opens Settings API Keys"
            className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-5 text-left flex items-start gap-4 hover:border-white/[0.16] hover:bg-[#0A0E14]/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117]">
            
            <div className="w-8 h-8 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#7C3AED]">2</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[15px] font-semibold text-white">
                  Create your first API key
                </span>
                <svg
                  className="w-3.5 h-3.5 text-white/30 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}>
                  
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17" />
                  
                </svg>
              </div>
              <p className="text-[13px] text-white/50 leading-relaxed mb-3">
                Generate a key to connect your tools. Keys take 10 seconds to
                create.
              </p>
              <div className="flex items-center gap-1.5">
                <Key className="w-3 h-3 text-white/30" />
                <span className="text-xs text-white/30 font-mono">
                  Settings → API Keys
                </span>
              </div>
            </div>
          </a>

          {/* Card 3 — Voice Clone */}
          <a
            href="/settings"
            aria-label="Clone your voice — opens Settings Voice"
            className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-5 text-left flex items-start gap-4 hover:border-[#7BCDD8]/20 hover:bg-[#0A0E14]/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117]">
            
            <div className="w-8 h-8 rounded-full bg-[#7BCDD8]/15 border border-[#7BCDD8]/25 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#7BCDD8]">3</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[15px] font-semibold text-white">
                  Clone your voice
                </span>
                <svg
                  className="w-3.5 h-3.5 text-white/30 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}>
                  
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17" />
                  
                </svg>
              </div>
              <p className="text-[13px] text-white/50 leading-relaxed mb-3">
                Record 10 seconds and Clara will speak as you. Included free
                with Pro.
              </p>
              {/* Mini Waveform */}
              <div className="flex items-end gap-[2px] h-6 mb-1.5">
                {miniWaveHeights.map((h, i) => {
                  const isCenter = i >= 8 && i < 16;
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full ${isCenter ? 'bg-[#7BCDD8]/65' : 'bg-[#7BCDD8]/35'}`}
                      style={{
                        height: `${h}px`
                      }} />);


                })}
              </div>
              <div className="flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-[#7BCDD8]/50" />
                <span className="text-xs text-[#7BCDD8]/50 font-mono">
                  Settings → Voice
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Account Summary Strip */}
        <div className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-5 max-w-lg mx-auto mt-10">
          <div className="flex flex-col md:flex-row items-center justify-around gap-4 md:gap-0">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {plan.name}
              </div>
              <div className="text-[11px] text-white/35 mt-0.5 uppercase tracking-wider">
                Current Plan
              </div>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {plan.trialDate}
              </div>
              <div className="text-[11px] text-white/35 mt-0.5 uppercase tracking-wider">
                Trial Ends
              </div>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-lg font-semibold text-white">$0.00</div>
              <div className="text-[11px] text-white/35 mt-0.5 uppercase tracking-wider">
                Charged Today
              </div>
            </div>
          </div>
        </div>

        {/* Footer Strip */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-white/30">
            A confirmation email was sent to ar@claracode.ai
          </span>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-[#7BCDD8] hover:underline">
              View receipt
            </a>
            <a
              href="#"
              className="text-xs text-white/40 hover:text-white/60 transition-colors">
              
              Manage subscription
            </a>
          </div>
        </div>
      </main>
    </div>);

}