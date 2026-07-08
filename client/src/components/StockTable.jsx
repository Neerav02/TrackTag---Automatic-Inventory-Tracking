// client/src/components/StockTable.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnomalyBadge from './AnomalyBadge';

function StatusBadge({ item }) {
  if (item.status === 'anomaly') {
    return <AnomalyBadge />;
  }

  if (item.quantity <= item.low_stock_threshold) {
    return (
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 15 }}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                   bg-alert/10 text-alert border border-alert/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Low Stock
      </motion.span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                     bg-success/10 text-success border border-success/20">
      In Stock
    </span>
  );
}

function formatTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString();
}

export default function StockTable({ items, onSimulateAnomaly, onResolveAnomaly, recentlyScannedId }) {
  const [simulatingId, setSimulatingId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const handleSimulate = async (itemId) => {
    setSimulatingId(itemId);
    await onSimulateAnomaly(itemId);
    setTimeout(() => setSimulatingId(null), 1500);
  };

  const handleResolve = async (itemId) => {
    setResolvingId(itemId);
    await onResolveAnomaly(itemId);
    setTimeout(() => setResolvingId(null), 1500);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-hover/30">
        <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          Inventory Stock
        </h2>
        <span className="text-xs bg-border/50 text-text-secondary px-2.5 py-1 rounded-full font-semibold font-body">
          {items.length} items monitored
        </span>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-hover/50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider font-heading">Item Name</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider font-heading">RFID Tag</th>
              <th className="text-center px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider font-heading">Qty</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider font-heading">Location Zone</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider font-heading">Last Seen</th>
              <th className="text-center px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider font-heading">Status</th>
              <th className="text-center px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider font-heading">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {items.map((item) => {
                const isLowStock = item.quantity <= item.low_stock_threshold && item.status !== 'anomaly';
                const isAnomaly = item.status === 'anomaly';
                const isPulsing = recentlyScannedId === item.id;

                return (
                  <motion.tr
                    key={item.id}
                    layout
                    className={`
                      border-b border-border/40 transition-all duration-300
                      ${isLowStock ? 'low-stock-row' : ''}
                      ${isAnomaly ? 'anomaly-row' : ''}
                      ${isPulsing ? 'scan-pulse' : ''}
                      ${!isLowStock && !isAnomaly && !isPulsing ? 'hover:bg-surface-hover/60' : ''}
                    `}
                  >
                    {/* Item Name */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-text-primary">{item.name}</span>
                    </td>

                    {/* RFID Tag */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-text-secondary bg-background border border-border/50 px-2 py-1 rounded-md">
                        {item.rfid_tag}
                      </span>
                    </td>

                    {/* Qty */}
                    <td className="px-6 py-4 text-center">
                      <motion.span
                        key={item.quantity}
                        initial={{ scale: 1.4, color: '#1F6F78' }}
                        animate={{ scale: 1, color: '#22252A' }}
                        transition={{ duration: 0.4 }}
                        className="text-sm font-bold tabular-nums"
                      >
                        {item.quantity}
                      </motion.span>
                    </td>

                    {/* Zone */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-secondary">{item.zone}</span>
                    </td>

                    {/* Last Scanned */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-text-secondary font-mono">
                        {formatTime(item.last_scanned_at)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge item={item} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      {isAnomaly ? (
                        <button
                          onClick={() => handleResolve(item.id)}
                          disabled={resolvingId === item.id}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-anomaly text-white hover:bg-opacity-95 hover:shadow-xs transition-all duration-200 cursor-pointer"
                        >
                          {resolvingId === item.id ? 'Reconnecting…' : 'Resolve Anomaly'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSimulate(item.id)}
                          disabled={simulatingId === item.id}
                          className={`
                            text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer
                            ${simulatingId === item.id
                              ? 'bg-primary/10 text-primary/40 cursor-wait'
                              : 'bg-primary/5 text-primary hover:bg-primary/15 border border-primary/10 hover:border-primary/20 shadow-xs'
                            }
                          `}
                        >
                          {simulatingId === item.id ? 'Starting…' : 'Simulate Anomaly'}
                        </button>
                      )}
                    </td>

                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
