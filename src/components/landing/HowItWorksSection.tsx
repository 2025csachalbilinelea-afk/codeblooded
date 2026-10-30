import React from 'react';
import { Sprout, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onOpenDashboard: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onOpenDashboard }) => {
  const steps = [
    {
      number: '01',
      icon: Sprout,
      title: 'Enter Your Harvest',
      description: 'Choose your crop, enter the quantity, and tell us where your farm is located.',
      highlight: 'Simple inputs, zero jargon',
    },
    {
      number: '02',
      icon: BarChart3,
      title: 'Compare Available Markets',
      description: 'See market prices, transport costs, market fees, and estimated earnings.',
      highlight: 'Calculated instantly',
    },
    {
      number: '03',
      icon: CheckCircle,
      title: 'Choose With Confidence',
      description: 'Understand which available market may leave you with more money after expenses.',
      highlight: 'Highest in-pocket return',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-rural-sage relative overflow-hidden">
      {/* Decorative route path background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-rural-primary px-3 py-1 rounded-full bg-rural-mint/80 border border-rural-border inline-block mb-3">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-rural-forest">
            From Farm to Market, <span className="italic font-normal text-rural-primary">With More Clarity.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-rural-muted max-w-2xl mx-auto">
            You don't need complex spreadsheets to know your best selling option. Just enter your details and let HarvestRoute estimate the rest.
          </p>
        </div>

        {/* 3 Step Cards with connecting line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Subtle connecting dotted route line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-rural-primary/30 -z-0 transform -translate-y-12" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-rural-border shadow-rural-soft hover:shadow-rural-card transition-all duration-300 relative z-10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-rural-mint text-rural-forest flex items-center justify-center font-bold text-lg shadow-sm">
                      <Icon className="w-7 h-7 stroke-[1.8] text-rural-primary" />
                    </div>
                    <span className="text-3xl font-serif font-bold text-rural-border">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-rural-forest mb-3">
                    {step.title}
                  </h3>

                  <p className="text-rural-muted text-sm sm:text-base leading-relaxed mb-6 font-sans">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-rural-border/60 flex items-center justify-between text-xs font-semibold text-rural-primary">
                  <span>{step.highlight}</span>
                  <span className="w-2 h-2 rounded-full bg-rural-fresh" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-full bg-rural-forest text-white font-medium text-sm sm:text-base hover:bg-rural-deep shadow-rural-soft hover:shadow-rural-card transition-all"
          >
            <span>Try HarvestRoute Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

