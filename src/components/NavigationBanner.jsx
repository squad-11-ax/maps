import { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import './NavigationBanner.css';

export default function NavigationBanner({
  currentStep,
  nextStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  isSimulating = false,
  onToggleSimulate,
  onExit
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play audio chime when step changes
  useEffect(() => {
    if (!soundEnabled || !currentStep) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (currentStep.direction === 'arrive') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch {
      // Audio autoplay restrictions fallback
    }
  }, [currentStepIndex, soundEnabled, currentStep]);

  if (!currentStep) return null;

  const progressPercent = totalSteps > 0 
    ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) 
    : 0;

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

        {onToggleSimulate && (
          <button
            type="button"
            className={`banner-nav-btn simulate-btn ${isSimulating ? 'active' : ''}`}
            onClick={onToggleSimulate}
            aria-label={isSimulating ? 'Pause walking simulation' : 'Play walking simulation'}
            title={isSimulating ? 'Pause auto-walk' : 'Auto-walk simulation'}
          >
            {isSimulating ? (
              <Pause size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
          </button>
        )}

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
          className="banner-nav-btn audio-btn"
          onClick={() => setSoundEnabled(prev => !prev)}
          aria-label={soundEnabled ? 'Mute navigation audio' : 'Unmute navigation audio'}
          title={soundEnabled ? 'Mute chimes' : 'Unmute chimes'}
        >
          {soundEnabled ? (
            <Volume2 size={18} aria-hidden="true" />
          ) : (
            <VolumeX size={18} aria-hidden="true" />
          )}
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

      {/* Progress Track */}
      <div className="banner-progress-bar" aria-hidden="true">
        <div 
          className="banner-progress-fill" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>
    </div>
  );
}
