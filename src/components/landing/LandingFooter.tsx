import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { AlertCircle, Route, ArrowUpRight } from 'lucide-react';

interface LandingFooterProps {
  onOpenDashboard: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenDashboard }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-rural-deep text-white/80 border-t border-rural-deep/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Description */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo variant="light" size="lg" showTagline={true} />
            <p className="text-sm text-white/70 max-w-sm leading-relaxed font-sans pt-1">
              HarvestRoute helps farmers compare markets, understand transport costs, and make informed decisions about where to sell their harvest.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-rural-mint text-xs font-medium">
                <span>Free Farmer Decision Support Tool</span>
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-sans">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('hero')}
                  className="hover:text-rural-mint transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-rural-mint transition-colors text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('benefits')}
                  className="hover:text-rural-mint transition-colors text-left"
                >
                  Benefits
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('about')}
                  className="hover:text-rural-mint transition-colors text-left"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Access Application */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-sans">
              Start Comparing
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Launch the decision-support engine directly to evaluate markets for tomatoes, onions, grains, and other crops.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rural-fresh hover:bg-rural-fresh/90 text-white font-medium text-sm transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Disclaimers & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {new Date().getFullYear()} HarvestRoute. Built with care for agricultural producers.</p>

          <div className="flex items-center space-x-1.5 text-amber-300/80 max-w-lg text-center md:text-right">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Verified Mandi Intelligence: Market prices and arrivals are retrieved dynamically from official AGMARKNET and data.gov.in sources.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

