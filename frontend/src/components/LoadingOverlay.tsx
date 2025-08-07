import { CheckCircle, Database, Search, Shield } from "lucide-react";

interface LoadingStep {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

interface LoadingOverlayProps {
  currentStep?: string;
  isVisible?: boolean;
}

const loadingSteps: LoadingStep[] = [
  {
    id: "search",
    icon: Search,
    label: "Searching Database",
    description: "Querying records matching your criteria..."
  },
  {
    id: "process",
    icon: Shield,
    label: "Processing Records",
    description: "Applying masking or deletion operations..."
  },
  {
    id: "complete",
    icon: Database,
    label: "Finalizing Results",
    description: "Preparing final report..."
  }
];

export const LoadingOverlay = ({ currentStep = "search", isVisible = true }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  const currentStepIndex = loadingSteps.findIndex(step => step.id === currentStep);
  const CurrentIcon = loadingSteps[currentStepIndex]?.icon || Search;
  const currentStepData = loadingSteps[currentStepIndex];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border/50 rounded-lg p-8 shadow-elegant max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* Main Icon */}
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse opacity-30" />
            <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <CurrentIcon className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          {/* Current Step Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{currentStepData?.label}</h3>
            <p className="text-sm text-muted-foreground">
              {currentStepData?.description}
            </p>
          </div>

          {/* Step Progress */}
          <div className="space-y-3">
            {loadingSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div key={step.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <StepIcon className={`w-4 h-4 ${isActive ? 'text-primary' :
                        isPending ? 'text-muted-foreground/50' : 'text-green-500'
                        }`} />
                    )}
                    <span className={
                      isActive ? 'text-foreground font-medium' :
                        isCompleted ? 'text-green-600 line-through' :
                          'text-muted-foreground/50'
                    }>
                      {step.label}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary animate-pulse' :
                    isCompleted ? 'bg-green-500' :
                      'bg-muted-foreground/30'
                    }`} />
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${((currentStepIndex + 1) / loadingSteps.length) * 100}%`
              }}
            />
          </div>

          {/* Step Counter */}
          <div className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {loadingSteps.length}
          </div>
        </div>
      </div>
    </div>
  );
};