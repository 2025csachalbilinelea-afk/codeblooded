import React from 'react';
import { Check, Leaf, MapPin, Calculator, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      title: 'Clear Market Comparisons',
      desc: 'Compare true in-pocket earnings across regional markets side by side.',
    },
    {
      title: 'Simple Cost Estimates',
      desc: 'See realistic fuel, vehicle rental, and road expense totals upfront.',
    },
    {
      title: 'Transparent Calculations',
      desc: 'Every fee, commission, and crop transit loss is clearly itemized.',
    },
    {
      title: 'Practical Selling Decisions',
      desc: 'Avoid high-sticker-price traps and find markets that accept your volume.',
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-rural-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Authentic Farmer & Harvest Photography */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative warm frame & background card */}
              <div className="absolute -inset-4 bg-rural-mint/60 rounded-3xl transform -rotate-1 -z-10" />
              <div className="relative rounded-2xl overflow-hidden shadow-rural-card border border-rural-border bg-rural-sage aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80"
                  alt="Farmer inspecting fresh vegetable harvest in agricultural field"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to secondary authentic agricultural photo
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                {/* Floating organic badge */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-white/95 backdrop-blur-sm border border-rural-border shadow-rural-card">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-rural-forest text-rural-mint flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-rural-forest">
                        Farm Gate Decision Support
                      </h4>
                      <p className="text-xs text-rural-muted">
                        Built for small & medium crop producers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Narrative & Principles */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rural-sage border border-rural-border text-rural-primary text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-rural-fresh" />
              <span>Built Around a Farmer's Needs</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-rural-forest leading-tight">
              Helping Farmers Make <span className="italic font-normal text-rural-primary">Better Selling Decisions.</span>
            </h2>

            <div className="space-y-4 text-rural-charcoal/90 text-base sm:text-lg leading-relaxed font-sans font-normal">
              <p>
                Choosing where to sell your harvest can make a big difference to your earnings. A market offering a higher advertised price may also involve higher transport expenses or may not accept your complete quantity.
              </p>
              <p>
                <strong className="font-semibold text-rural-forest">HarvestRoute</strong> helps you compare these factors in one clean, straightforward view—so you can understand your true take-home earnings before dispatching your produce from the farm.
              </p>
            </div>

            {/* 4 Focus Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-rural-border">
              {pillars.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-rural-mint/80 text-rural-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-rural-forest">
                      {item.title}
                    </h4>
                    <p className="text-xs text-rural-muted mt-0.5 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

