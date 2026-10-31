import React from 'react';
import { Sprout, Truck, Trophy, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export type DashboardStep = 1 | 2 | 3;

interface StepNavigationProps {
  currentStep: DashboardStep;
  onStepChange: (step: DashboardStep) => void;
  completedSteps?: DashboardStep[];
}

export const DASHBOARD_STEPS = [
  {
    id: 1 as DashboardStep,
    stepNumber: '01',
    label: 'Harvest & Farm Details',
    subtext: 'Crop, Volume & Location',
    titleKey: 'stepNav.step1Title',
    subtextKey: 'stepNav.step1Subtitle',
    icon: Sprout,
  },
  {
    id: 2 as DashboardStep,
    stepNumber: '02',
    label: 'Loss, Logistics & Market Discovery',
    subtext: 'Transit, Fuel & Live Mandis',
    titleKey: 'stepNav.step2Title',
    subtextKey: 'stepNav.step2Subtitle',
    icon: Truck,
  },
  {
    id: 3 as DashboardStep,
    stepNumber: '03',
    label: 'Profit Decision',
    subtext: 'Net Take-Home & Recommendation',
    titleKey: 'stepNav.step3Title',
    subtextKey: 'stepNav.step3Subtitle',
    icon: Trophy,
  },
];

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onStepChange,
  completedSteps = [],
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white/95 backdrop-blur-md border border-rural-border rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-rural-soft mb-8 no-print font-sans">
      {/* Desktop Stepper with Connecting Progress Lines */}
      <div className="hidden md:grid grid-cols-3 gap-3 relative">
        {DASHBOARD_STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id) && !isActive;
          const StepIcon = step.icon;
          const stepLabel = t(step.titleKey, step.label);
          const stepSubtext = t(step.subtextKey, step.subtext);

          return (
            <div key={step.id} className="relative flex items-center">
              {/* Connecting progress line to next step */}
              {idx < DASHBOARD_STEPS.length - 1 && (
                <div
                  className={`hidden lg:block absolute left-[calc(100%-8px)] top-1/2 -translate-y-1/2 w-4 h-0.5 z-10 transition-colors ${
                    completedSteps.includes(step.id)
                      ? 'bg-rural-fresh'
                      : 'bg-rural-border'
                  }`}
                />
              )}

              <button
                type="button"
                onClick={() => onStepChange(step.id)}
                className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center space-x-3 cursor-pointer group ${
                  isActive
                    ? 'border-rural-fresh bg-rural-sage/80 shadow-sm ring-2 ring-rural-fresh/40'
                    : isCompleted
                    ? 'border-rural-border/80 bg-white hover:bg-rural-cream/60'
                    : 'border-rural-border/50 bg-stone-50/70 hover:bg-white text-stone-500'
                }`}
              >
                {/* Step indicator circle */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    isActive
                      ? 'bg-rural-forest text-white shadow-sm ring-2 ring-rural-fresh'
                      : isCompleted
                      ? 'bg-rural-mint text-rural-primary'
                      : 'bg-stone-200/70 text-stone-600 group-hover:bg-stone-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-rural-primary stroke-[2.5]" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'text-rural-primary'
                          : isCompleted
                          ? 'text-rural-forest font-semibold'
                          : 'text-stone-400'
                      }`}
                    >
                      Step {step.id}
                    </span>
                  </div>
                  <div
                    className={`font-serif font-bold text-xs sm:text-sm truncate leading-snug ${
                      isActive
                        ? 'text-rural-forest'
                        : isCompleted
                        ? 'text-stone-800'
                        : 'text-stone-600'
                    }`}
                  >
                    {stepLabel}
                  </div>
                  <div className="text-[10px] text-rural-muted truncate mt-0.5">
                    {stepSubtext}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper: Sleek 3-button compact tab strip */}
      <div className="grid md:hidden grid-cols-3 gap-1.5">
        {DASHBOARD_STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id) && !isActive;
          const StepIcon = step.icon;
          const stepLabel = t(step.titleKey, step.label);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                isActive
                  ? 'border-rural-fresh bg-rural-sage ring-1 ring-rural-fresh text-rural-forest'
                  : isCompleted
                  ? 'border-rural-border bg-white text-rural-primary'
                  : 'border-transparent bg-stone-100 text-stone-500'
              }`}
            >
              <div className="flex items-center space-x-1 mb-0.5">
                <StepIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">{step.stepNumber}</span>
              </div>
              <span className="text-[10px] font-semibold truncate max-w-full">
                {stepLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
