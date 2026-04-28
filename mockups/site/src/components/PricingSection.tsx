import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
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
type PlanCard = {
  tier: string;
  price: string;
  period: string;
  note?: string;
  featured?: boolean;
  badge?: string;
  tierColor?: string;
  features: Feature[];
  cta: string;
  ctaLink: string;
  ctaStyle: 'primary' | 'secondary' | 'outline';
};
const plans: PlanCard[] = [
{
  tier: 'Starter',
  price: '$39',
  period: '/month',
  features: [
  {
    text: 'Full CLI access',
    included: true
  },
  {
    text: 'Voice input — local processing',
    included: true
  },
  {
    text: '1 AI agent',
    included: true
  },
  {
    text: '500 API calls / month',
    included: true
  },
  {
    text: 'Community support',
    included: true
  },
  {
    text: 'Cloud sync',
    included: false
  },
  {
    text: 'Voice cloning',
    included: false
  }],

  cta: 'Get Started',
  ctaLink: '/checkout/starter',
  ctaStyle: 'outline'
},
{
  tier: 'Pro',
  price: '$69',
  period: '/month',
  featured: true,
  badge: 'Most Popular',
  tierColor: '#5CE0D8',
  features: [
  {
    text: 'Everything in Starter',
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
    text: '3 AI agents with memory',
    included: true
  },
  {
    text: '1 voice clone included',
    included: true
  },
  {
    text: 'Priority support',
    included: true
  },
  {
    text: 'Team vault',
    included: false
  }],

  cta: 'Get Started',
  ctaLink: '/checkout/pro',
  ctaStyle: 'primary'
},
{
  tier: 'Team',
  price: '$99',
  period: '/month',
  note: 'per seat · min 3 seats',
  features: [
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
    text: 'Priority chat support',
    included: true
  }],

  cta: 'Get Started',
  ctaLink: '/checkout/team',
  ctaStyle: 'outline'
},
{
  tier: 'Business',
  price: '$299',
  period: '/month',
  note: 'per seat · min 5 seats',
  features: [
  {
    text: 'Everything in Team',
    included: true
  },
  {
    text: 'Unlimited agents & clones',
    included: true
  },
  {
    text: 'Custom model fine-tuning',
    included: true
  },
  {
    text: 'Advanced analytics',
    included: true
  },
  {
    text: 'Dedicated account manager',
    included: true
  },
  {
    text: 'SLA + 99.9% uptime',
    included: true
  }],

  cta: 'Get Started',
  ctaLink: '/checkout/business',
  ctaStyle: 'outline'
},
{
  tier: 'Enterprise',
  price: 'Custom',
  period: '',
  features: [
  {
    text: 'Everything in Business',
    included: true
  },
  {
    text: 'On-premise deployment',
    included: true
  },
  {
    text: 'Custom integrations',
    included: true
  },
  {
    text: 'Unlimited seats',
    included: true
  },
  {
    text: 'Dedicated infrastructure',
    included: true
  },
  {
    text: 'White-glove onboarding',
    included: true
  }],

  cta: 'Contact Sales',
  ctaLink: '#',
  ctaStyle: 'outline'
}];

export function PricingSection() {
  return (
    <section id="pricing" className="py-28 bg-[#0D1117]">
      <div className="text-center mb-16 px-6">
        <div className="text-[11px] text-white/30 tracking-[0.2em] uppercase font-medium">
          PRICING
        </div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-white mt-3 leading-tight">
          Start building. Scale when ready.
        </h2>
        <p className="text-[17px] text-white/45 mt-3">
          14-day free trial on all paid plans. No credit card required.
        </p>
      </div>

      {/* Top row: Starter, Pro, Team */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5 items-start mb-5">
        {plans.slice(0, 3).map((plan) =>
        <PlanCardComponent key={plan.tier} plan={plan} />
        )}
      </div>

      {/* Bottom row: Business, Enterprise */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {plans.slice(3).map((plan) =>
        <PlanCardComponent key={plan.tier} plan={plan} />
        )}
      </div>

      <p className="text-center mt-12 text-[12px] text-white/25 px-6">
        All plans include CLI access · Prices in USD · Cancel anytime
      </p>
    </section>);

}
function PlanCardComponent({ plan }: {plan: PlanCard;}) {
  const isFeatured = plan.featured;
  return (
    <div
      className={`rounded-2xl p-7 relative ${isFeatured ? 'ring-1 ring-[#5CE0D8]/40 border border-[#5CE0D8]/30 bg-gradient-to-b from-[#5CE0D8]/[0.08] to-[#0A0E14] shadow-[0_0_60px_rgba(92,224,216,0.15)]' : 'bg-[#0A0E14] border border-white/[0.08]'}`}>
      
      {plan.badge &&
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5CE0D8] text-[#0D1117] text-[11px] font-semibold tracking-wider uppercase rounded-full px-4 py-1 whitespace-nowrap">
          {plan.badge}
        </div>
      }

      <div
        className={`text-sm font-medium tracking-wide uppercase mb-4 ${isFeatured ? 'text-[#5CE0D8]' : 'text-white/50'}`}>
        
        {plan.tier}
      </div>

      <div className="flex items-baseline">
        <span className="text-[44px] font-bold text-white leading-none">
          {plan.price}
        </span>
        {plan.period &&
        <span className="text-white/45 text-base ml-1">{plan.period}</span>
        }
      </div>

      {plan.note &&
      <div className="text-white/30 text-xs mt-1">{plan.note}</div>
      }

      <div
        className={`my-6 border-t ${isFeatured ? 'border-[#5CE0D8]/15' : 'border-white/[0.08]'}`} />
      

      <ul className="space-y-3">
        {plan.features.map((feature, i) =>
        <FeatureItem key={i} {...feature} />
        )}
      </ul>

      <Link
        to={plan.ctaLink}
        className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold text-center block transition-all ${plan.ctaStyle === 'primary' ? 'bg-[#5CE0D8] hover:bg-[#4BCBC3] text-[#0D1117] shadow-[0_4px_20px_rgba(92,224,216,0.4)]' : 'border border-white/15 hover:border-white/30 text-white/60 hover:text-white'}`}>
        
        {plan.cta}
      </Link>
    </div>);

}