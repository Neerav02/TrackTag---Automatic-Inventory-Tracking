// client/src/components/AnomalyBadge.jsx
// Amber badge with "?" icon — distinct from the red low-stock badge

import { motion } from 'framer-motion';

export default function AnomalyBadge() {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                 bg-anomaly/15 text-anomaly border border-anomaly/40"
      title="Unusual — not seen recently"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      Unusual
    </motion.span>
  );
}
