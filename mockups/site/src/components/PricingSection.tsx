import React from 'react';
import { Check, X } from 'lucide-react';
type Feature = {
  text: string;
  included: boolean;
};
function FeatureItem({ text, included }: Feature) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {included ?
      <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0">
          <Check className="w-2.5 h-2.5 text-[#10B981]" />
        </div> :

      <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          <X className="w-2.5 h-2.5 text-white/20" />
        </div>
      }
      <span
        className={included ? 'text-white/70' : 'text-white/25 line-through'}>
        
        {text}
      </span>
    </li>);

}
export function PricingSection() {
  const freeFeatures: Feature[] = [
  {
    text: 'Full CLI access',
    included: true
  },
  {
    text: 'Voice input — local processing',
    included: true
  },
  {
    text: 'MIT Licensed',
    included: true
  },
  {
    text: 'Self-hostable',
    included: true
  },
  {
    text: 'Cloud sync',
    included: false
  },
  {
    text: 'Agent personas',
    included: false
  },
  {
    text: 'Team vault',
    included: false
  }];

  const proFeatures: Feature[] = [
  {
    text: 'Everything in Free',
    included: true
  },
  {
    text: 'Voice + cloud sync',
    included: true
  },
  {
    text: 'Clara vault (encrypted)',
    included: true
  },
  {
    text: '1 custom agent persona',
    included: true
  },
  {
    text: 'Voice clone (1 included)',
    included: true
  },
  {
    text: 'Priority support',
    included: true
  },
  {
    text: 'Team vault',
    included: false
  }];

  const teamFeatures: Feature[] = [
  {
    text: 'Everything in Pro',
    included: true
  },
  {
    text: 'Shared team vault',
    included: true
  },
  {
    text: 'Up to 6 agent personas',
    included: true
  },
  {
    text: 'Admin dashboard',
    included: true
  },
  {
    text: 'SSO (Clerk teams)',
    included: true
  },
  {
    text: 'SLA + dedicated support',
    included: true
  }];

  return (
    <section className="py-28 bg-[#0D1117]">
      {/* Section intro */}
      <div className="text-center mb-16 px-6">
        <div className="text-[11px] text-white/30 tracking-[0.2em] uppercase font-medium">
          PRICING
        </div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-white mt-3 leading-tight">
          Start free. Scale when ready.
        </h2>
        <p className="text-[17px] text-white/45 mt-3">
          No credit card required. Open source forever.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Card 1 — Free */}
        <div className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-7">
          <div className="text-white/50 text-sm font-medium tracking-wide uppercase mb-4">
            Free
          </div>
          <div className="flex items-baseline">
            <span className="text-[44px] font-bold text-white leading-none">
              $0
            </span>
            <span className="text-white/35 text-sm ml-1">forever</span>
          </div>
          <div className="border-t border-white/[0.08] my-6" />
          <ul className="space-y-3">
            {freeFeatures.map((feature, i) =>
            <FeatureItem key={i} {...feature} />
            )}
          </ul>
          <button className="mt-8 w-full border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl py-3 text-sm font-medium text-center transition-colors">
            Download CLI
          </button>
        </div>

        {/* Card 2 — Pro (Featured) */}
        <div className="relative ring-1 ring-[#7C3AED]/40 border border-[#7C3AED]/30 bg-gradient-to-b from-[#7C3AED]/[0.08] to-[#0A0E14] rounded-2xl p-7 shadow-[0_0_60px_rgba(124,58,237,0.15)]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[11px] font-semibold tracking-wider uppercase rounded-full px-4 py-1 whitespace-nowrap">
            Most Popular
          </div>
          <div className="text-[#7C3AED] text-sm font-medium tracking-wide uppercase mb-4">
            Pro
          </div>
          <div className="flex items-baseline">
            <span className="text-[44px] font-bold text-white leading-none">
              $20
            </span>
            <span className="text-white/45 text-base ml-1">/month</span>
          </div>
          <div className="border-t border-[#7C3AED]/15 my-6" />
          <ul className="space-y-3">
            {proFeatures.map((feature, i) =>
            <FeatureItem key={i} {...feature} />
            )}
          </ul>
          <button className="mt-8 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-semibold shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all">
            Start Free Trial
          </button>
        </div>

        {/* Card 3 — Team */}
        <div className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-7">
          <div className="text-white/50 text-sm font-medium tracking-wide uppercase mb-4">
            Team
          </div>
          <div className="flex items-baseline">
            <span className="text-[44px] font-bold text-white leading-none">
              $99
            </span>
            <span className="text-white/35 text-sm ml-1">/month</span>
          </div>
          <div className="text-white/30 text-xs mt-1">
            per team · up to 8 members
          </div>
          <div className="border-t border-white/[0.08] my-6" />
          <ul className="space-y-3">
            {teamFeatures.map((feature, i) =>
            <FeatureItem key={i} {...feature} />
            )}
          </ul>
          <button className="mt-8 w-full border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl py-3 text-sm font-medium text-center transition-colors">
            Contact Sales
          </button>
        </div>
      </div>

      {/* Fine print */}
      <p className="text-center mt-12 text-[12px] text-white/25 px-6">
        All plans include CLI access · Prices in USD · Cancel anytime
      </p>
    </section>);

}