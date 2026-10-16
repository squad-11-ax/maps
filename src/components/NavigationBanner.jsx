import { 
  ArrowUp, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  X, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import './NavigationBanner.css';

export default function NavigationBanner({
  currentStep,
  nextStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onExit
}) {
  if (!currentStep) return null;

  const getStepIcon = (direction) => {
    switch (direction) {
      case 'left':
        return <ArrowLeft size={24} aria-hidden="true" />;
      case 'right':
        return <ArrowRight size={24} aria-hidden="true" />;
      case 'arrive':
        return <MapPin size={24} className="banner-arrive-pin" aria-hidden="true" />;
      default:
        return <ArrowUp size={24} aria-hidden="true" />;
    }
  };

  return (
    <div 
      className="navigation-sticky-banner" 
      role="status" 
      aria-live="polite"
      aria-label="Current turn-by-turn instruction"
    >
      <div className="banner-icon-badge">
        {getStepIcon(currentStep.direction)}
      </div>

      <div className="banner-instruction-content">
        <div className="banner-meta-row">
          <span className="banner-step-counter">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          {currentStep.distanceMeters > 0 && (
            <span className="banner-distance">
              in {currentStep.distanceMeters} m
            </span>
          )}
        </div>
        <p className="banner-instruction-text">
          {currentStep.instruction}
        </p>
        {nextStep && (
          <span className="banner-then-text">
            Then: {nextStep.instruction}
          </span>
        )}
      </div>

      <div className="banner-controls">
        <button
          type="button"
          className="banner-nav-btn"
          onClick={onPrev}
          disabled={currentStepIndex === 0}
          aria-label="Previous step"
          title="Previous step"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="banner-nav-btn next-action"
          onClick={onNext}
          disabled={currentStepIndex >= totalSteps - 1}
          aria-label="Next step"
          title="Next step"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="banner-exit-btn"
          onClick={onExit}
          aria-label="Exit live navigation"
          title="Exit navigation"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
