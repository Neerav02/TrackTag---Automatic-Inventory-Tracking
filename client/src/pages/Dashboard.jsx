// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../socket';

export default function Dashboard({ items, setItems, scans, setScans, onSimulateAnomaly, onResolveAnomaly }) {
  const [recentlyScannedId, setRecentlyScannedId] = useState(null);
  const [activeZone, setActiveZone] = useState(null);
  const [simulatingId, setSimulatingId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Setup local scan pulse highlight
  useEffect(() => {
    function handleScanUpdate(data) {
      const { item, zone } = data;
      setRecentlyScannedId(item.id);
      setActiveZone(zone);

      const timerId1 = setTimeout(() => {
        setRecentlyScannedId((cur) => (cur === item.id ? null : cur));
      }, 1400);

      const timerId2 = setTimeout(() => {
        setActiveZone((cur) => (cur === zone ? null : cur));
      }, 1500);

      return () => {
        clearTimeout(timerId1);
        clearTimeout(timerId2);
      };
    }

    socket.on('scan-update', handleScanUpdate);
    return () => {
      socket.off('scan-update', handleScanUpdate);
    };
  }, []);

  const handleSimulate = async (itemId) => {
    setSimulatingId(itemId);
    await onSimulateAnomaly(itemId);
    setTimeout(() => setSimulatingId(null), 1000);
  };

  const handleResolve = async (itemId) => {
    setResolvingId(itemId);
    await onResolveAnomaly(itemId);
    setTimeout(() => setResolvingId(null), 1000);
  };

  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = items.filter(
    (item) => item.quantity <= item.low_stock_threshold && item.status !== 'anomaly'
  ).length;
  const anomalyCount = items.filter((item) => item.status === 'anomaly').length;

  // Calculate potential shrinkage loss (price * quantity) of all anomalies
  const totalShrinkageVal = items
    .filter((item) => item.status === 'anomaly')
    .reduce((sum, item) => sum + ((item.price || 499) * item.quantity), 0);

  // Match search query to identify which zone contains the matching item
  const locatedZone = searchQuery.trim()
    ? items.find(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))?.zone
    : null;

  // Group items by zone dynamically for map tooltips and counters
  const zonesList = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Showroom', 'Loading Dock'];
  const itemsByZone = {
    'Warehouse A': [],
    'Warehouse B': [],
    'Warehouse C': [],
    'Showroom': [],
    'Loading Dock': [],
  };

  items.forEach((item) => {
    if (itemsByZone[item.zone]) {
      itemsByZone[item.zone].push(item);
    }
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
      style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
    >
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div className="dashboard-header__title-group">
          <h2>Live Inventory Monitor</h2>
          <span className="dashboard-header__subtitle">
            Real-time status updates from connected RFID antenna arrays.
          </span>
        </div>
        <div className="dashboard-header__pitch">
          <strong>💡 Demo Mode:</strong> Click "Simulate Anomaly" to test our signature silent tag detection.
        </div>
      </div>

      {/* Stats Counter Rows (5 Cards including Shrinkage Loss) */}
      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="metric-counter" style={{ padding: '1.25rem' }}>
          <div className="metric-counter__number">{totalItems}</div>
          <div className="metric-counter__label">Tracked Items</div>
        </div>
        <div className="metric-counter" style={{ padding: '1.25rem' }}>
          <div className="metric-counter__number">{totalStock}</div>
          <div className="metric-counter__label">Total Stock</div>
        </div>
        <div className="metric-counter" style={{ padding: '1.25rem', borderColor: lowStockCount > 0 ? 'var(--color-alert)' : 'var(--color-border)' }}>
          <div className="metric-counter__number" style={{ color: lowStockCount > 0 ? 'var(--color-alert)' : 'var(--color-primary)' }}>
            {lowStockCount}
          </div>
          <div className="metric-counter__label">Low Stock</div>
        </div>
        <div className="metric-counter" style={{ padding: '1.25rem', borderColor: anomalyCount > 0 ? 'var(--color-anomaly)' : 'var(--color-border)' }}>
          <div className="metric-counter__number" style={{ color: anomalyCount > 0 ? 'var(--color-anomaly)' : 'var(--color-primary)' }}>
            {anomalyCount}
          </div>
          <div className="metric-counter__label">Silent Anomalies</div>
        </div>
        <div className="metric-counter" style={{ padding: '1.25rem', borderColor: totalShrinkageVal > 0 ? 'var(--color-alert)' : 'var(--color-border)' }}>
          <div className="metric-counter__number" style={{ color: totalShrinkageVal > 0 ? 'var(--color-alert)' : 'var(--color-primary)' }}>
            ₹{totalShrinkageVal.toLocaleString('en-IN')}
          </div>
          <div className="metric-counter__label">Potential Shrinkage</div>
        </div>
      </div>

      {/* Interactive Warehouse Zone Map Heatmap */}
      <div className="floorplan-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Interactive Floorplan Heatmap</h3>
          
          {/* Find My Item Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>🔍 Find Item:</span>
            <input 
              type="text" 
              placeholder="e.g. Mouse, Keyboard..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                border: '1px solid var(--color-border)',
                borderRadius: '99px',
                outline: 'none',
                width: '180px',
                transition: 'border-color 0.2s',
                backgroundColor: '#ffffff'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.8rem',
                  color: 'var(--color-alert)',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="floorplan-grid">
          {/* Warehouse A */}
          <div className={`zone-box zone-box--a ${activeZone === 'Warehouse A' ? 'zone-box--active' : ''} ${locatedZone === 'Warehouse A' ? 'zone-box--located' : ''}`}>
            <div className="zone-box__header">
              <span className="zone-box__title">Warehouse A {locatedZone === 'Warehouse A' && '📍'}</span>
              <span className="zone-box__dot" />
            </div>
            <div className="zone-box__count">{itemsByZone['Warehouse A'].length}</div>
            <span className="zone-box__desc">Active items in storage</span>

            <div className="zone-box__tooltip">
              <strong>Items here:</strong>
              {itemsByZone['Warehouse A'].map(item => (
                <div key={item.id} className="zone-box-tooltip__item">
                  <span>{item.name}</span>
                  <strong>{item.quantity}</strong>
                </div>
              ))}
              {itemsByZone['Warehouse A'].length === 0 && <span style={{ fontStyle: 'italic' }}>Zone empty</span>}
            </div>
          </div>

          {/* Warehouse B */}
          <div className={`zone-box zone-box--b ${activeZone === 'Warehouse B' ? 'zone-box--active' : ''} ${locatedZone === 'Warehouse B' ? 'zone-box--located' : ''}`}>
            <div className="zone-box__header">
              <span className="zone-box__title">Warehouse B {locatedZone === 'Warehouse B' && '📍'}</span>
              <span className="zone-box__dot" />
            </div>
            <div className="zone-box__count">{itemsByZone['Warehouse B'].length}</div>
            <span className="zone-box__desc">Heavy machinery zone</span>

            <div className="zone-box__tooltip">
              <strong>Items here:</strong>
              {itemsByZone['Warehouse B'].map(item => (
                <div key={item.id} className="zone-box-tooltip__item">
                  <span>{item.name}</span>
                  <strong>{item.quantity}</strong>
                </div>
              ))}
              {itemsByZone['Warehouse B'].length === 0 && <span style={{ fontStyle: 'italic' }}>Zone empty</span>}
            </div>
          </div>

          {/* Warehouse C */}
          <div className={`zone-box zone-box--c ${activeZone === 'Warehouse C' ? 'zone-box--active' : ''} ${locatedZone === 'Warehouse C' ? 'zone-box--located' : ''}`}>
            <div className="zone-box__header">
              <span className="zone-box__title">Warehouse C {locatedZone === 'Warehouse C' && '📍'}</span>
              <span className="zone-box__dot" />
            </div>
            <div className="zone-box__count">{itemsByZone['Warehouse C'].length}</div>
            <span className="zone-box__desc">Rapid transit items</span>

            <div className="zone-box__tooltip">
              <strong>Items here:</strong>
              {itemsByZone['Warehouse C'].map(item => (
                <div key={item.id} className="zone-box-tooltip__item">
                  <span>{item.name}</span>
                  <strong>{item.quantity}</strong>
                </div>
              ))}
              {itemsByZone['Warehouse C'].length === 0 && <span style={{ fontStyle: 'italic' }}>Zone empty</span>}
            </div>
          </div>

          {/* Showroom */}
          <div className={`zone-box zone-box--showroom ${activeZone === 'Showroom' ? 'zone-box--active' : ''} ${locatedZone === 'Showroom' ? 'zone-box--located' : ''}`}>
            <div className="zone-box__header">
              <span className="zone-box__title">Showroom Floor {locatedZone === 'Showroom' && '📍'}</span>
              <span className="zone-box__dot" />
            </div>
            <div className="zone-box__count">{itemsByZone['Showroom'].length}</div>
            <span className="zone-box__desc">Front retail exhibition area</span>

            <div className="zone-box__tooltip">
              <strong>Items here:</strong>
              {itemsByZone['Showroom'].map(item => (
                <div key={item.id} className="zone-box-tooltip__item">
                  <span>{item.name}</span>
                  <strong>{item.quantity}</strong>
                </div>
              ))}
              {itemsByZone['Showroom'].length === 0 && <span style={{ fontStyle: 'italic' }}>Zone empty</span>}
            </div>
          </div>

          {/* Loading Dock */}
          <div className={`zone-box zone-box--dock ${activeZone === 'Loading Dock' ? 'zone-box--active' : ''} ${locatedZone === 'Loading Dock' ? 'zone-box--located' : ''}`}>
            <div className="zone-box__header">
              <span className="zone-box__title">Loading Dock {locatedZone === 'Loading Dock' && '📍'}</span>
              <span className="zone-box__dot" />
            </div>
            <div className="zone-box__count">{itemsByZone['Loading Dock'].length}</div>
            <span className="zone-box__desc">Fulfillment and shipping bays</span>

            <div className="zone-box__tooltip">
              <strong>Items here:</strong>
              {itemsByZone['Loading Dock'].map(item => (
                <div key={item.id} className="zone-box-tooltip__item">
                  <span>{item.name}</span>
                  <strong>{item.quantity}</strong>
                </div>
              ))}
              {itemsByZone['Loading Dock'].length === 0 && <span style={{ fontStyle: 'italic' }}>Zone empty</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Stock Table and Live Scan Activity Feed */}
      <div className="dashboard-grid">
        {/* Left Side: Stock Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>RFID Inventory Stock</h3>
            <span className="badge badge--success">{totalItems} active devices</span>
          </div>

          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>RFID Tag</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th>Location</th>
                  <th>Last Seen</th>
                  <th>Est. Runout</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLow = item.quantity <= item.low_stock_threshold && item.status !== 'anomaly';
                  const isAnomaly = item.status === 'anomaly';
                  const isPulse = recentlyScannedId === item.id;

                  let trClass = '';
                  if (isLow) trClass = 'table tr--low-stock';
                  else if (isAnomaly) trClass = 'table tr--anomaly';
                  else if (isPulse) trClass = 'table tr--pulse';

                  // Calculate predictive reorder depletion days remaining
                  const dailyUsage = item.daily_usage_rate || 2.5;
                  const daysRemaining = Math.max(0, Math.round(item.quantity / dailyUsage));
                  const runoutLabel = isAnomaly ? (
                    <span style={{ color: 'var(--color-text-muted)' }}>n/a</span>
                  ) : daysRemaining <= 3 ? (
                    <span style={{ color: 'var(--color-alert)', fontWeight: 'bold' }}>⚠️ {daysRemaining} days</span>
                  ) : daysRemaining <= 7 ? (
                    <span style={{ color: 'var(--color-anomaly)', fontWeight: '600' }}>{daysRemaining} days</span>
                  ) : (
                    <span style={{ color: 'var(--color-success)' }}>{daysRemaining} days</span>
                  );

                  return (
                    <tr key={item.id} className={trClass}>
                      <td>
                        <Link to={`/items/${item.id}`} className="table__link">
                          {item.name}
                        </Link>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.75rem', background: '#F0EBE1', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                          {item.rfid_tag}
                        </code>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {item.quantity}
                      </td>
                      <td>{item.zone}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {item.last_scanned_at ? new Date(item.last_scanned_at).toLocaleTimeString() : '—'}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {runoutLabel}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isAnomaly ? (
                          <span className="badge badge--anomaly">⚠️ Unusual</span>
                        ) : isLow ? (
                          <span className="badge badge--alert">Low Stock</span>
                        ) : (
                          <span className="badge badge--success">OK</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isAnomaly ? (
                          <button
                            onClick={() => handleResolve(item.id)}
                            disabled={resolvingId === item.id}
                            className="btn btn--warning"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            {resolvingId === item.id ? 'Resolving…' : 'Resolve'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSimulate(item.id)}
                            disabled={simulatingId === item.id}
                            className="btn btn--outline"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            {simulatingId === item.id ? 'Simulating…' : 'Simulate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Scan Activity Feed */}
        <div className="card live-feed-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                animation: 'badge-pulse 1.8s infinite'
              }}
            />
            <h3 style={{ fontSize: '1.1rem' }}>Activity Feed</h3>
          </div>

          <div className="feed-list">
            <AnimatePresence initial={false}>
              {scans.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
                  Awaiting RFID scans…
                </div>
              ) : (
                scans.map((scan, index) => (
                  <motion.div
                    key={scan.id || index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="feed-item"
                  >
                    <div className="feed-item__left">
                      <span className="feed-item__title">{scan.item_name}</span>
                      <span className="feed-item__sub">
                        {scan.zone} · Qty: <strong>{scan.quantity}</strong>
                      </span>
                    </div>
                    <div className="feed-item__right">
                      <span className="feed-item__time">
                        {new Date(scan.scanned_at).toLocaleTimeString()}
                      </span>
                      <code style={{ fontSize: '0.65rem', background: '#F0EBE1', padding: '0.1rem 0.25rem', borderRadius: '3px' }}>
                        {scan.rfid_tag}
                      </code>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
