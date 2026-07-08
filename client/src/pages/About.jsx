// client/src/pages/About.jsx
import { motion } from 'framer-motion';

export default function About() {
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="about"
    >
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem' }}>System Architecture</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Physical telemetry flow, database synchronization, and real-time frontend broadcasts.
        </p>
      </div>

      {/* Visual Flow diagram container */}
      <div className="diagram-container">
        <h3>TrackTag Telemetry Flow</h3>
        
        <div className="arch-flow">
          {/* Node 1: RFID Simulator */}
          <motion.div className="arch-node" variants={nodeVariants} initial="hidden" animate="visible">
            <div className="arch-node__box">📡</div>
            <span className="arch-node__label">RFID Simulator</span>
            <span className="arch-node__desc">
              Generates random tag scans (+/- count) across warehouse zones.
            </span>
          </motion.div>

          {/* Connector 1 */}
          <div className="arch-connector">&rarr;</div>

          {/* Node 2: Node.js / Express */}
          <motion.div className="arch-node" variants={nodeVariants} initial="hidden" animate="visible" style={{ transitionDelay: '0.2s' }}>
            <div className="arch-node__box">⚙️</div>
            <span className="arch-node__label">Node Server</span>
            <span className="arch-node__desc">
              Pipes telemetry, logs scans, and evaluates timestamp delays.
            </span>
          </motion.div>

          {/* Connector 2 */}
          <div className="arch-connector">&rarr;</div>

          {/* Node 3: SQLite WAL */}
          <motion.div className="arch-node" variants={nodeVariants} initial="hidden" animate="visible" style={{ transitionDelay: '0.4s' }}>
            <div className="arch-node__box">💾</div>
            <span className="arch-node__label">SQLite DB</span>
            <span className="arch-node__desc">
              WAL database logs scanning logs and maintains stock quantities.
            </span>
          </motion.div>

          {/* Connector 3 */}
          <div className="arch-connector">&rarr;</div>

          {/* Node 4: Web Browser */}
          <motion.div className="arch-node" variants={nodeVariants} initial="hidden" animate="visible" style={{ transitionDelay: '0.6s' }}>
            <div className="arch-node__box">🖥️</div>
            <span className="arch-node__label">Live Dashboard</span>
            <span className="arch-node__desc">
              React interface renders animations and toast alerts.
            </span>
          </motion.div>
        </div>
      </div>

      {/* Detail Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        <div className="card">
          <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            ⚡ Low-latency Socket.IO Broadcasts
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
            Unlike polling architectures which request data on a set loop, TrackTag uses a push architecture. Scans written to the server trigger immediate broadcasts down open WebSocket channels, letting the browser re-render quantity counters within milliseconds.
          </p>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            🛡️ Safe Concurrent SQLite WAL Mode
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
            SQLite's WAL (Write-Ahead Logging) enables simultaneous read and write processes. While the background simulator writes a scan to the database, client REST loaders fetch detail tables concurrently without thread locks or wait latency.
          </p>
        </div>
      </div>

      {/* Product Extension Roadmap */}
      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🌐 Product Extension Roadmap</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {/* Column 1: Tier 2 - Enterprise Abstractions */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              🏢 Enterprise Core Abstractions (Tier 2)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                <span className="badge badge--success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginBottom: '0.25rem', display: 'inline-block' }}>ERP / POS Connectors</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: '1.4' }}>
                  Direct connectors into systems like Tally Prime, SAP S/4HANA, and Shopify API to automatically reconcile physically read RFID stock counts against digital purchase records.
                </p>
              </div>
              <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                <span className="badge badge--success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginBottom: '0.25rem', display: 'inline-block' }}>Multi-Tenant SaaS Infrastructure</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: '1.4' }}>
                  Database isolations and corporate portals to let different corporations log into their separate warehouses on a single distributed SaaS database structure.
                </p>
              </div>
              <div>
                <span className="badge badge--success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginBottom: '0.25rem', display: 'inline-block' }}>Offline-First Edge AI Gateway</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: '1.4' }}>
                  Deploying the anomaly checking filters right onto physically connected Raspberry Pi/Impinj gateway reader devices, preserving bandwidth and maintaining integrity when offline.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Tier 3 - UI/UX & Voice Wow Factors */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              ✨ Future Interface & Voice extensions (Tier 3)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                <span className="badge badge--anomaly" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginBottom: '0.25rem', display: 'inline-block' }}>Augmented Reality Spatial Overlay</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: '1.4' }}>
                  A mobile WebXR overlay displaying a virtual navigation line and inventory info directly onto camera feeds when scanning shelves.
                </p>
              </div>
              <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                <span className="badge badge--anomaly" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginBottom: '0.25rem', display: 'inline-block' }}>Natural Language Voice Queries</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: '1.4' }}>
                  Integrated Web Speech API voice listeners to let operators query inventory hands-free, e.g. "Alexa, what is the stock level of Wireless Mice in Warehouse A?".
                </p>
              </div>
              <div>
                <span className="badge badge--anomaly" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginBottom: '0.25rem', display: 'inline-block' }}>Gamified Staff Leaderboards</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: '1.4' }}>
                  Leaderboard systems tracking staff scan verification counts and shelf order compliance rates to incentivize audit speed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
