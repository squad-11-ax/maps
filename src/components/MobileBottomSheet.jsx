import React, { useState, useRef, useEffect } from 'react';
import './MobileBottomSheet.css';

export default function MobileBottomSheet({
  children,
  isOpen = true,
  initialSnap = 'peek', // 'peek' | 'half' | 'full'
  onSnapChange
}) {
  const [snapPoint, setSnapPoint] = useState(initialSnap);
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const currentTranslateY = useRef(0);

  // Sync initial snap
  useEffect(() => {
    setSnapPoint(initialSnap);
  }, [initialSnap]);

  const snapClasses = {
    peek: 'snap-peek',
    half: 'snap-half',
    full: 'snap-full',
  };

  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (dragStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY.current;
    currentTranslateY.current = deltaY;
  };

  const handleTouchEnd = () => {
    if (dragStartY.current === null) return;
    const deltaY = currentTranslateY.current;

    // Swipe up (negative delta) moves to higher snap
    // Swipe down (positive delta) moves to lower snap
    if (deltaY < -40) {
      if (snapPoint === 'peek') updateSnap('half');
      else if (snapPoint === 'half') updateSnap('full');
    } else if (deltaY > 40) {
      if (snapPoint === 'full') updateSnap('half');
      else if (snapPoint === 'half') updateSnap('peek');
    }

    dragStartY.current = null;
    currentTranslateY.current = 0;
  };

  const updateSnap = (newSnap) => {
    setSnapPoint(newSnap);
    if (onSnapChange) onSnapChange(newSnap);
  };

  const cycleSnap = () => {
    if (snapPoint === 'peek') updateSnap('half');
    else if (snapPoint === 'half') updateSnap('full');
    else updateSnap('peek');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={sheetRef}
      className={`mobile-bottom-sheet ${snapClasses[snapPoint] || 'snap-peek'}`}
      role="region"
      aria-label="Mobile Navigation Sheet"
    >
      {/* Drag Handle Bar */}
      <div
        className="sheet-drag-handle-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={cycleSnap}
        role="button"
        tabIndex={0}
        aria-label={`Navigation drawer currently ${snapPoint}. Tap to expand or collapse.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cycleSnap();
          }
        }}
      >
        <div className="sheet-drag-pill" aria-hidden="true" />
      </div>

      {/* Sheet Content Container */}
      <div className="sheet-scrollable-content">
        {children}
      </div>
    </div>
  );
}
