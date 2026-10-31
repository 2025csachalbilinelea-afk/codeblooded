import React from 'react';
import { Sprout, Truck, Trophy, Check } from 'lucide-react';

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
    icon: Sprout,
  },
  {
    id: 2 as DashboardStep,
    stepNumber: '02',
    label: 'Loss, Logistics & Market Discovery',
    subtext: 'Transit, Fuel & Live Mandis',
    icon: Truck,
  },
  {
    id: 3 as DashboardStep,
    stepNumber: '03',
    label: 'Profit Decision',
    subtext: 'Net Take-Home & Recommendation',
    icon: Trophy,
  },
];

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onStepChange,
  completedSteps = [],
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-rural-border rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-rural-soft mb-8 no-print font-sans">
      {/* Desktop Stepper with Connecting Progress Lines */}
      <div className="hidden md:grid grid-cols-3 gap-3 relative">
        {DASHBOARD_STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id) && !isActive;
          const StepIcon = step.icon;

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
                className={`w-full group flex items-center space-x-3.5 p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer relative overflow-hidden border ${
                  isActive
                    ? 'bg-rural-forest text-white shadow-rural-soft border-rural-deep ring-2 ring-rural-fresh/40'
                    : isCompleted
                    ? 'bg-rural-sage/60 hover:bg-rural-sage text-rural-forest border-rural-border/80'
                    : 'hover:bg-rural-cream/80 text-rural-charcoal border-rural-border/50 bg-white/50'
                }`}
              >
                {/* Numbered & Icon Step Indicator Bubble */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-all shadow-sm ${
                    isActive
                      ? 'bg-rural-fresh text-white ring-2 ring-white/20'
                      : isCompleted
                      ? 'bg-rural-mint text-rural-forest font-bold'
                      : 'bg-rural-cream border border-rural-border text-rural-muted group-hover:text-rural-forest'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <StepIcon className="w-5 h-5 stroke-[2]" />
                  )}
                </div>

                {/* Step Labels */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider block ${
                        isActive ? 'text-rural-mint' : isCompleted ? 'text-rural-primary' : 'text-rural-muted'
                      }`}
                    >
                      STEP {step.id} OF 3
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Done
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-sm font-serif font-bold truncate mt-0.5 ${
                      isActive ? 'text-white' : 'text-rural-forest'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive ? 'text-white/80' : 'text-rural-muted'
                    }`}
                  >
                    {step.subtext}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper (Clean 3-step flex layout) */}
      <div className="md:hidden grid grid-cols-3 gap-1.5">
        {DASHBOARD_STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id) && !isActive;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-rural-forest text-white shadow-sm'
                  : isCompleted
                  ? 'bg-rural-sage text-rural-forest border border-rural-border'
                  : 'bg-rural-cream text-rural-muted'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold mb-1 ${
                  isActive
                    ? 'bg-rural-fresh text-white'
                    : isCompleted
                    ? 'bg-rural-mint text-rural-forest'
                    : 'bg-white border border-rural-border text-rural-muted'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.id}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider block truncate w-full">
                Step {step.id}
              </span>
              <span className="text-[11px] font-serif font-semibold truncate w-full mt-0.5">
                {step.id === 1 ? 'Harvest' : step.id === 2 ? 'Logistics' : 'Profit'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
