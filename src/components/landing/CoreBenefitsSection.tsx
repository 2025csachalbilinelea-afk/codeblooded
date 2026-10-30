import React from 'react';
import {
  Trophy,
  Truck,
  Building2,
  Split,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

export const CoreBenefitsSection: React.FC = () => {
  const features = [
    {
      icon: Trophy,
      title: 'Find the Better Market',
      description:
        'Compare the estimated money you keep from different markets, not just their advertised prices.',
      tag: 'True In-Pocket Return',
      bgClass: 'bg-white',
    },
    {
      icon: Truck,
      title: 'Understand Delivery Costs',
      description:
        'See the estimated cost of transporting your harvest using your own vehicle or a rented vehicle.',
      tag: 'Vehicle Economics',
      bgClass: 'bg-rural-sage/60',
    },
    {
      icon: Building2,
      title: 'Check Market Limits',
      description:
        'Understand whether a market can accept your harvest quantity before making the journey.',
      tag: 'Capacity Feasibility',
      bgClass: 'bg-white',
    },
    {
      icon: Split,
      title: 'Compare One Market or Several',
      description:
        'See whether selling everything at one market or dividing your harvest between markets may give you a better result.',
      tag: 'Split Optimization',
      bgClass: 'bg-rural-mint/40',
    },
    {
      icon: Receipt,
      title: 'See the Full Cost Breakdown',
      description:
        'Understand expected sales, transport expenses, market fees, and estimated final earnings in plain numbers.',
      tag: 'Transparent Deductions',
      bgClass: 'bg-white',
    },
  ];

  return (
    <section id="benefits" className="py-20 sm:py-28 bg-rural-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-rural-primary px-3 py-1 rounded-full bg-rural-sage border border-rural-border inline-block mb-3">
            Practical Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-rural-forest">
            Know More Before Your Harvest <span className="italic font-normal text-rural-primary">Leaves the Farm.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-rural-muted max-w-2xl mx-auto font-sans">
            Every feature in HarvestRoute is designed to help farmers keep more of their hard-earned money by making smart selling choices.
          </p>
        </div>

        {/* Responsive Grid with asymmetric hero card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isFeatured = idx === 0;
            return (
              <div
                key={idx}
                className={`rounded-3xl p-7 border border-rural-border shadow-rural-soft hover:shadow-rural-card transition-all duration-300 flex flex-col justify-between ${
                  feat.bgClass
                } ${isFeatured ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-rural-mint/80 text-rural-primary flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6 stroke-[1.9]" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rural-sage text-rural-forest border border-rural-border">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-rural-forest mb-2.5">
                    {feat.title}
                  </h3>

                  <p className="text-rural-charcoal/80 text-sm sm:text-base leading-relaxed font-sans">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-rural-border/60 flex items-center space-x-1.5 text-xs font-medium text-rural-primary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rural-fresh" />
                  <span>Calculated automatically</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

