import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { TrustStrip } from './TrustStrip';
import { AboutSection } from './AboutSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CoreBenefitsSection } from './CoreBenefitsSection';
import { AgriculturalVisualSection } from './AgriculturalVisualSection';
import { CtaSection } from './CtaSection';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenMandiPrices?: () => void;
  onOpenMarketplace?: () => void;
  onOpenReports?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  onOpenMandiPrices,
  onOpenMarketplace,
  onOpenReports,
}) => {
  const handleLearnMore = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-rural-cream text-rural-charcoal font-sans selection:bg-rural-mint selection:text-rural-deep flex flex-col">
      {/* 1. Transparent-to-Solid Sticky Navigation */}
      <LandingNavbar
        onOpenDashboard={onOpenDashboard}
        onOpenMandiPrices={onOpenMandiPrices}
        onOpenMarketplace={onOpenMarketplace}
        onOpenReports={onOpenReports}
      />

      {/* 2. Full-Width Immersive Agricultural Hero */}
      <HeroSection
        onOpenDashboard={onOpenDashboard}
        onOpenMarketplace={onOpenMarketplace}
        onLearnMore={handleLearnMore}
      />

      {/* 3. 3-Benefit Botanical Trust Strip */}
      <TrustStrip />

      {/* 4. Editorial About Section with Indian Farmer Photography */}
      <AboutSection />

      {/* 5. 3-Step Journey from Farm to Market */}
      <HowItWorksSection onOpenDashboard={onOpenDashboard} />

      {/* 6. Core Functional Benefits */}
      <CoreBenefitsSection />

      {/* 7. Image-Led Agricultural Story */}
      <AgriculturalVisualSection />

      {/* 8. Deep Forest Green Final CTA */}
      <CtaSection onOpenDashboard={onOpenDashboard} />

      {/* 9. Premium Editorial Botanical Footer */}
      <LandingFooter onOpenDashboard={onOpenDashboard} />
    </div>
  );
};
