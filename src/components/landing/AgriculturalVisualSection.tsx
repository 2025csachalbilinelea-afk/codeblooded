import React from 'react';

export const AgriculturalVisualSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-rural-cream border-t border-rural-border/70 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-rural-primary px-3 py-1 rounded-full bg-rural-sage border border-rural-border inline-block mb-3">
            Farm to Marketplace
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-rural-forest">
            Every Harvest Has a <span className="italic font-normal text-rural-primary">Journey.</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-rural-muted font-sans font-light">
            From the farm gate to the marketplace, every decision matters.
          </p>
        </div>

        {/* 3-Image Organic Grid with rounded corners and warm frames */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Main Large Visual: Fresh Tomatoes / Vegetables in woven basket */}
          <div className="md:col-span-7 rounded-3xl overflow-hidden shadow-rural-card border border-rural-border relative group aspect-[16/10] bg-rural-sage">
            <img
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80"
              alt="Fresh ripe tomatoes harvested in rustic wooden crates"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rural-deep/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white">
                <span className="text-xs uppercase tracking-wider text-rural-mint font-semibold">
                  Field Harvest
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold mt-1">
                  Peak Freshness at the Farm Gate
                </h3>
              </div>
            </div>
          </div>

          {/* Side Stacked Visuals: 2 photos */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Top: Farmer sorting fresh produce */}
            <div className="rounded-3xl overflow-hidden shadow-rural-card border border-rural-border relative group aspect-[16/9] flex-1 bg-rural-sage">
              <img
                src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=800&q=80"
                alt="Hands sorting organic agricultural produce"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rural-deep/80 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <span className="text-xs uppercase tracking-wider text-rural-mint font-semibold">
                    Produce Care
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold mt-0.5">
                    Handling & Transit Protection
                  </h3>
                </div>
              </div>
            </div>

            {/* Bottom: Regional wholesale market hub */}
            <div className="rounded-3xl overflow-hidden shadow-rural-card border border-rural-border relative group aspect-[16/9] flex-1 bg-rural-sage">
              <img
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80"
                alt="Wholesale agricultural market produce stalls"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rural-deep/80 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <span className="text-xs uppercase tracking-wider text-rural-mint font-semibold">
                    Market Destination
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold mt-0.5">
                    Realizing True In-Pocket Value
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

