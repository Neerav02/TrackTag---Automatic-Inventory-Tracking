// client/src/components/AlertToast.jsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ToastItem({ alert, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(alert.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`toast ${alert.type === 'low-stock' ? 'toast--low-stock' : alert.type === 'theft' ? 'toast--theft' : 'toast--anomaly'}`}
      onClick={() => onDismiss(alert.id)}
    >
      <div className="toast__icon-box">
        {alert.type === 'low-stock' ? '⚠️' : alert.type === 'theft' ? '🚨' : '❓'}
      </div>

      <div className="toast__content">
        <span className="toast__title">
          {alert.type === 'low-stock' ? 'Low Stock Warning' : alert.type === 'theft' ? 'Restricted Movement' : 'Inactivity Anomaly'}
        </span>
        <span className="toast__desc">
          <strong>{alert.itemName}</strong>
          {alert.type === 'low-stock'
            ? ` quantity below limit (${alert.quantity})`
            : alert.type === 'theft'
              ? ` entered Loading Dock restricted zone!`
              : ` hasn't been scanned recently`
          }
        </span>
      </div>

      <button
        className="toast__close"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(alert.id);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 6, ease: 'linear' }}
        className="toast__progress"
      />
    </motion.div>
  );
}

export default function AlertToast({ alerts, onDismiss }) {
  // Show at most the 3 latest alerts to keep screen clean and prevent stacking clutter
  const visibleAlerts = alerts.slice(0, 3);

  return (
    <div className="toast-container">
      <AnimatePresence mode="popLayout">
        {visibleAlerts.map((alert) => (
          <ToastItem key={alert.id} alert={alert} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
