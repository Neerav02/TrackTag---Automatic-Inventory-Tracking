// client/src/pages/ItemDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ItemDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Item not found');
        return res.json();
      })
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
        Loading asset details…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h2 style={{ color: 'var(--color-alert)' }}>Error Loading Item</h2>
        <p style={{ margin: '1rem 0' }}>{error || 'The item could not be retrieved.'}</p>
        <Link to="/dashboard" className="btn btn--primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { item, history } = data;

  // Let's generate a list of mock stock counts for a simple visual chart
  // We'll base it on the historical scans or make a nice simulated graph.
  const chartPoints = history.slice(0, 10).reverse();
  const maxQty = Math.max(...chartPoints.map((p) => p.quantity), 10);

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="item-detail"
    >
      {/* Back button */}
      <div>
        <Link to="/dashboard" className="back-link">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Item title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem' }}>{item.name}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            RFID Asset Tracking Profile
          </p>
        </div>
        <div>
          {item.status === 'anomaly' ? (
            <span className="badge badge--anomaly" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
              ⚠️ Unusual Anomaly
            </span>
          ) : item.quantity <= item.low_stock_threshold ? (
            <span className="badge badge--alert" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
              ⚠️ Low Stock Warning
            </span>
          ) : (
            <span className="badge badge--success" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
              ✓ Stock Level Healthy
            </span>
          )}
        </div>
      </div>

      {/* Main Profile Specs Grid */}
      <div className="item-profile">
        {/* Specifications List */}
        <div className="card item-profile__meta">
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            Asset Metadata
          </h3>
          
          <div className="meta-row">
            <span className="meta-row__label">RFID EPC Tag</span>
            <span className="meta-row__val" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {item.rfid_tag}
            </span>
          </div>

          <div className="meta-row">
            <span className="meta-row__label">Unit Price</span>
            <span className="meta-row__val">
              ₹{(item.price || 499).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="meta-row">
            <span className="meta-row__label">Current Zone</span>
            <span className="meta-row__val">{item.zone}</span>
          </div>

          <div className="meta-row">
            <span className="meta-row__label">Available Quantity</span>
            <span className="meta-row__val">{item.quantity} units</span>
          </div>

          <div className="meta-row">
            <span className="meta-row__label">Daily Depletion Rate</span>
            <span className="meta-row__val">
              {item.daily_usage_rate || 2.5} units/day
            </span>
          </div>

          <div className="meta-row">
            <span className="meta-row__label">Est. Runout Forecast</span>
            <span className="meta-row__val" style={{ 
              fontWeight: 'bold', 
              color: (item.quantity / (item.daily_usage_rate || 2.5)) <= 3 ? 'var(--color-alert)' : 'var(--color-success)' 
            }}>
              {item.status === 'anomaly' 
                ? 'n/a (missing)' 
                : `${(item.quantity / (item.daily_usage_rate || 2.5)).toFixed(1)} Days (${(item.quantity / (item.daily_usage_rate || 2.5)) <= 3 ? '⚠️ Critical' : 'Stable'})`
              }
            </span>
          </div>

          <div className="meta-row">
            <span className="meta-row__label">Low Threshold</span>
            <span className="meta-row__val">{item.low_stock_threshold} units</span>
          </div>

          <div className="meta-row">
            <span className="meta-row__label">Typical Scan Interval</span>
            <span className="meta-row__val">{item.typical_interval_seconds} seconds</span>
          </div>

          <div className="meta-row">
            <span className="meta-row__label">Last Scan Registered</span>
            <span className="meta-row__val" style={{ fontSize: '0.85rem' }}>
              {item.last_scanned_at ? new Date(item.last_scanned_at).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Visual Trend Graph */}
        <div className="item-profile__trend">
          <div className="trend-chart-sim">
            <h3 className="chart-sim__heading">Quantity Trend (Last 10 Scans)</h3>
            
            {chartPoints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
                No telemetry recorded for this item yet.
              </div>
            ) : (
              <div>
                <div className="trend-bars">
                  {chartPoints.map((point, index) => {
                    const pct = Math.max((point.quantity / maxQty) * 100, 8); // at least 8% height so it renders
                    return (
                      <div key={point.id || index} className="trend-bar-col">
                        <div className="trend-bar" style={{ height: `${pct}%` }}>
                          <span className="trend-bar__reveal trend-bar__tooltip">
                            {point.quantity}
                          </span>
                        </div>
                        <span className="trend-bar-label">
                          {new Date(point.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                  X-Axis: Time of RFID Scan | Y-Axis: Stock Quantity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical logs table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1.15rem' }}>RFID Scan Log (Item History)</h3>
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
            No scan logs recorded.
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Location Zone</th>
                  <th>Quantity Recorded</th>
                  <th>Tag Scanned</th>
                </tr>
              </thead>
              <tbody>
                {history.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '600' }}>
                      {new Date(log.scanned_at).toLocaleString()}
                    </td>
                    <td>{log.zone}</td>
                    <td style={{ fontWeight: 'bold' }}>{log.quantity}</td>
                    <td>
                      <code style={{ fontSize: '0.75rem', background: '#F0EBE1', padding: '0.15rem 0.3rem', borderRadius: '3px' }}>
                        {log.rfid_tag}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
