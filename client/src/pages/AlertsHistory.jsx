// client/src/pages/AlertsHistory.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertsHistory({ items, onSimulateAnomaly, onResolveAnomaly }) {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'low-stock', 'anomaly'
  const [loading, setLoading] = useState(true);
  const [simulatingId, setSimulatingId] = useState('');

  const fetchAlerts = () => {
    fetch('/api/alerts-history')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAlerts(data.alerts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching alerts history:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
    // Poll alerts every 4 seconds to show new alerts dynamically
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    if (!simulatingId) return;
    await onSimulateAnomaly(parseInt(simulatingId, 10));
    // Refetch history immediately
    setTimeout(fetchAlerts, 1000);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="alerts-page"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem' }}>Alerts & Anomaly Log</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Historical audit log of all system warnings, low stock levels, and silent RFID tag events.
          </p>
        </div>
        
        {/* Simulate anomaly card */}
        <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1.25rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-title)' }}>
            Simulate Alert:
          </span>
          <select
            value={simulatingId}
            onChange={(e) => setSimulatingId(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem'
            }}
          >
            <option value="">-- Select Item --</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSimulate}
            disabled={!simulatingId}
            className="btn btn--danger"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            Trigger Anomaly
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
          >
            All Events ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('anomaly')}
            className={`filter-btn ${filter === 'anomaly' ? 'filter-btn--active' : ''}`}
          >
            Anomalies ({alerts.filter((a) => a.type === 'anomaly').length})
          </button>
          <button
            onClick={() => setFilter('low-stock')}
            className={`filter-btn ${filter === 'low-stock' ? 'filter-btn--active' : ''}`}
          >
            Low Stock ({alerts.filter((a) => a.type === 'low-stock').length})
          </button>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
          Showing {filteredAlerts.length} entries
        </span>
      </div>

      {/* Alert Log list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
            Loading historical logs…
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            No alerts logged for this filter query.
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Item Name</th>
                  <th>RFID Tag</th>
                  <th>Event Type</th>
                  <th>Log Message</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className={alert.type === 'anomaly' ? 'table tr--anomaly' : 'table tr--low-stock'}
                      style={{ borderLeftWidth: '4px' }}
                    >
                      <td style={{ fontWeight: '600', width: '22%' }}>
                        {new Date(alert.logged_at).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: '700' }}>{alert.item_name}</td>
                      <td>
                        <code style={{ fontSize: '0.75rem', background: '#F0EBE1', padding: '0.15rem 0.3rem', borderRadius: '3px' }}>
                          {alert.rfid_tag}
                        </code>
                      </td>
                      <td>
                        {alert.type === 'anomaly' ? (
                          <span className="badge badge--anomaly">ANOMALY</span>
                        ) : (
                          <span className="badge badge--alert">LOW STOCK</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--color-text-title)', fontSize: '0.88rem' }}>
                        {alert.message}
                      </td>
                    </tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
