// client/src/components/ScanFeed.jsx
import { motion, AnimatePresence } from 'framer-motion';

function getZoneColor(zone) {
  if (zone.includes('Warehouse A')) return 'bg-blue-50 text-blue-600 border-blue-100';
  if (zone.includes('Warehouse B')) return 'bg-purple-50 text-purple-600 border-purple-100';
  if (zone.includes('Warehouse C')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
  if (zone.includes('Showroom')) return 'bg-amber-50 text-amber-600 border-amber-100';
  if (zone.includes('Loading Dock')) return 'bg-rose-50 text-rose-600 border-rose-100';
  return 'bg-gray-50 text-gray-600 border-gray-100';
}

export default function ScanFeed({ scans }) {
  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleTimeString();
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface-hover/30 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-primary rounded-full glowing-dot"></span>
          Live Activity Feed
        </h2>
        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary font-heading">
          RFID Scanning
        </span>
      </div>

      {/* Feed list */}
      <div className="max-h-[500px] overflow-y-auto divide-y divide-border/30">
        <AnimatePresence initial={false}>
          {scans.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-secondary text-sm font-body">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-border mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-1.28-.203-2.512-.578-3.668m-2.98 8.878a15.925 15.925 0 01-3.33-3.477m3.33 3.477l-.053.048C3.766 18.097 3.34 17.76 3 17.342m3.6-.33C6.445 15.455 6 13.5 6 11.5c0-3.38 1.488-6.41 3.864-8.5C10.512 2.508 11.24 2 12 2c.76 0 1.488.508 2.136 1.5C16.512 5.59 18 8.62 18 12c0 2.05-.487 3.99-1.364 5.75m-3.33 2.04c1.744-2.772 2.753-6.054 2.753-9.571m-3.44-2.04l-.054-.09A13.916 13.916 0 0015 11c0 1.28.203 2.512.578 3.668m-2.98 8.878a15.925 15.925 0 01-3.33-3.477m3.33 3.477l-.053.048C13.766 18.097 13.34 17.76 13 17.342" />
              </svg>
              Awaiting next RFID scan…
            </div>
          ) : (
            scans.map((scan, index) => (
              <motion.div
                key={scan.id || `${scan.rfid_tag}-${scan.scanned_at}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="px-6 py-3.5 hover:bg-surface-hover/30 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {scan.item_name}
                    </p>
                    <span className="text-[10px] font-mono text-text-secondary bg-background border border-border/40 px-1.5 py-0.5 rounded">
                      {scan.rfid_tag}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getZoneColor(scan.zone)}`}>
                      {scan.zone}
                    </span>
                    <span className="text-xs text-text-secondary font-medium font-body">
                      Stock: <span className="font-bold text-text-primary">{scan.quantity}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-semibold text-text-secondary font-mono bg-background border border-border/40 px-2 py-1 rounded-md">
                    {formatTime(scan.scanned_at)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
