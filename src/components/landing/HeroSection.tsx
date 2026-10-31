import React from 'react';
import { ArrowRight, Compass, Sprout, ShieldCheck, Store } from 'lucide-react';

interface HeroSectionProps {
  onOpenDashboard: () => void;
  onOpenMarketplace?: () => void;
  onLearnMore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDashboard,
  onOpenMarketplace,
  onLearnMore,
}) => {
  return (
    <section id="hero" className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-rural-deep">
      {/* Background Photography with fallback gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=2000&q=80"
          alt="Lush green agricultural fields at morning sunrise"
          className="w-full h-full object-cover object-center"
          loading="eager"
          onError={(e) => {
            // Graceful fallback to rich botanical gradient if network blocks image
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Editorial Multi-layered Dark Botanical Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-rural-deep/95 via-rural-forest/85 to-rural-deep/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-rural-deep via-transparent to-black/30" />
      </div>

      {/* Decorative botanical ambient accent */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-rural-fresh/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center text-white">
        {/* Eyebrow Label */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rural-mint/15 border border-rural-mint/30 text-rural-mint text-xs sm:text-sm font-medium tracking-wide uppercase mb-6 backdrop-blur-sm animate-fade-in">
          <Sprout className="w-4 h-4 text-rural-fresh" />
          <span>Smarter Farming. Better Earnings.</span>
        </div>

        {/* Main Headline in Editorial Serif Typography */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Your Harvest Deserves the <span className="italic font-normal text-rural-mint">Best Market.</span>
        </h1>

        {/* Supporting Paragraph in Clean Sans-Serif */}
        <p className="mt-6 text-base sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed font-sans font-light">
          Find the right market for your fruits and vegetables. Understand transport costs, compare earnings, and make better selling decisions.
        </p>

        {/* Primary & Secondary Call To Actions */}
        <div className="mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          {/* Button 1: Find My Best Market */}
          <button
            type="button"
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-7 py-4 rounded-full bg-rural-fresh text-white font-medium text-base hover:bg-rural-fresh/90 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 group cursor-pointer"
          >
            <span>Find My Best Market</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 2: Explore Bulk Marketplace */}
          {onOpenMarketplace && (
            <button
              type="button"
              onClick={onOpenMarketplace}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-rural-forest text-white border border-rural-mint/40 font-medium text-base hover:bg-rural-deep hover:border-rural-mint shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 group cursor-pointer"
            >
              <Store className="w-5 h-5 text-rural-fresh" />
              <span>Explore Bulk Marketplace</span>
            </button>
          )}

          {/* Button 3: How HarvestRoute Works */}
          <button
            type="button"
            onClick={onLearnMore}
            className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 font-medium text-base backdrop-blur-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-rural-mint" />
            <span>How HarvestRoute Works</span>
          </button>
        </div>

        {/* Subtle Supporting Subtext */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-xs sm:text-sm text-rural-mint/80 font-medium">
          <ShieldCheck className="w-4 h-4 text-rural-fresh shrink-0" />
          <span>Make informed selling decisions before your produce leaves the farm.</span>
        </div>
      </div>
    </section>
  );
};
