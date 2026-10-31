import React from 'react';
import { Sparkles, Sprout, MapPin, Truck, Store, Trophy, Check } from 'lucide-react';

export type DashboardStep = 1 | 2 | 3 | 4 | 5 | 6;

interface StepNavigationProps {
  currentStep: DashboardStep;
  onStepChange: (step: DashboardStep) => void;
  completedSteps?: DashboardStep[];
}

export const DASHBOARD_STEPS = [
  { id: 1 as DashboardStep, label: 'Overview', subtext: 'Welcome & Start', icon: Sparkles },
  { id: 2 as DashboardStep, label: 'Crop & Harvest', subtext: 'Produce Details', icon: Sprout },
  { id: 3 as DashboardStep, label: 'Location & Map', subtext: 'Farm Origin & Radius', icon: MapPin },
  { id: 4 as DashboardStep, label: 'Loss & Logistics', subtext: 'Transit & Spoilage', icon: Truck },
  { id: 5 as DashboardStep, label: 'Mandi Discovery', subtext: 'Live Daily Rates', icon: Store },
  { id: 6 as DashboardStep, label: 'Profit Decision', subtext: 'Best Take-Home', icon: Trophy },
];

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onStepChange,
  completedSteps = [],
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-rural-border rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-rural-soft mb-8 no-print">
      {/* Desktop Stepper */}
      <div className="hidden lg:grid grid-cols-6 gap-2">
        {DASHBOARD_STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id) && !isActive;
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`group flex items-center space-x-3 p-3 rounded-2xl text-left transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-rural-forest text-white shadow-rural-soft'
                  : isCompleted
                  ? 'bg-rural-sage/60 hover:bg-rural-sage text-rural-forest border border-rural-border/70'
                  : 'hover:bg-rural-cream/80 text-rural-charcoal'
              }`}
            >
              {/* Step indicator bubble */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-rural-fresh text-white ring-2 ring-white/20'
                    : isCompleted
                    ? 'bg-rural-mint text-rural-forest font-bold'
                    : 'bg-rural-cream border border-rural-border text-rural-muted group-hover:text-rural-forest'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <StepIcon className="w-4 h-4" />}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                    isActive ? 'text-rural-mint' : 'text-rural-muted'
                  }`}>
                    Step {step.id}
                  </span>
                </div>
                <div className={`text-xs font-serif font-bold truncate ${
                  isActive ? 'text-white' : 'text-rural-forest'
                }`}>
                  {step.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tablet & Mobile Stepper (Horizontally scrollable with active indicator) */}
      <div className="lg:hidden flex items-center space-x-2 overflow-x-auto py-1 px-1 scrollbar-none">
        {DASHBOARD_STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id) && !isActive;
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl shrink-0 text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-rural-forest text-white shadow-sm font-bold'
                  : isCompleted
                  ? 'bg-rural-sage text-rural-forest border border-rural-border'
                  : 'bg-rural-cream text-rural-muted hover:text-rural-charcoal'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-rural-fresh text-white' : isCompleted ? 'bg-rural-mint text-rural-forest' : 'text-rural-muted'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : step.id}
              </div>
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

