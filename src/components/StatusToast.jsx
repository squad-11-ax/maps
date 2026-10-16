import { useState, useEffect } from 'react';
import { WifiOff, AlertCircle, CheckCircle2, X } from 'lucide-react';
import './StatusToast.css';

export default function StatusToast({ message, type = 'info', onDismiss }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="status-toast-bar toast-offline" role="alert" aria-live="assertive">
        <WifiOff size={16} aria-hidden="true" />
        <span>Offline Mode — Viewing cached campus map</span>
      </div>
    );
  }

  if (!message) return null;

  return (
    <div className={`status-toast-bar toast-${type}`} role="status" aria-live="polite">
      {type === 'error' && <AlertCircle size={16} aria-hidden="true" />}
      {type === 'success' && <CheckCircle2 size={16} aria-hidden="true" />}
      <span>{message}</span>
      {onDismiss && (
        <button 
          type="button" 
          className="toast-dismiss-btn" 
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
