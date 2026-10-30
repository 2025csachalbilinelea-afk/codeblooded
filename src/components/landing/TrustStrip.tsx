import React from 'react';
import { TrendingUp, Truck, CheckCircle2 } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Compare Market Earnings',
      description: 'See what you may keep after expenses.',
    },
    {
      icon: Truck,
      title: 'Understand Transport Costs',
      description: 'Estimate how much delivery may cost.',
    },
    {
      icon: CheckCircle2,
      title: 'Make Better Selling Decisions',
      description: 'Compare available markets before dispatch.',
    },
  ];

  return (
    <section className="bg-rural-sage/70 border-y border-rural-border/70 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-start space-x-4 bg-white/70 p-4 sm:p-5 rounded-2xl border border-rural-border/50 shadow-rural-soft"
              >
                <div className="w-12 h-12 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-rural-forest text-base leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-rural-muted text-sm mt-1 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

