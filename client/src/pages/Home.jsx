// client/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 18,
      },
    },
  };

  return (
    <motion.div
      className="landing"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <section className="hero">
        <motion.div className="hero__content" variants={itemVariants}>
          <span className="hero__badge">RFID Telemetry MVP</span>
          <h1 className="hero__title">
            Automatic Inventory Tracking <span className="hero__highlight">in Real-Time</span>
          </h1>
          <p className="hero__desc">
            TrackTag delivers instant inventory visibility, stock levels, and automatic detection of anomalies. No manual counts, no missing assets, complete control.
          </p>
          <div className="hero__actions">
            <Link to="/dashboard" className="btn btn--primary">
              Launch Dashboard
            </Link>
            <Link to="/about" className="btn btn--outline">
              System Architecture
            </Link>
          </div>
        </motion.div>

        {/* CSS Radar animation graphic */}
        <motion.div className="radar-wrapper" variants={itemVariants}>
          <div className="radar">
            <div className="radar__sweep" />
            <div className="radar__circle radar__circle--1" />
            <div className="radar__circle radar__circle--2" />
            <div className="radar__circle radar__circle--3" />
            <div className="radar__line-x" />
            <div className="radar__line-y" />
            <div className="radar__ping" />
            <div className="radar__ping radar__ping--2" />
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <motion.h2 className="how-it-works__title" variants={itemVariants}>
          How TrackTag Works
        </motion.h2>

        <div className="steps-grid">
          {/* Step 1 */}
          <motion.div className="card step-card" variants={itemVariants}>
            <div className="step-card__icon-box">📡</div>
            <h3 className="step-card__title">1. RFID Scans</h3>
            <p className="step-card__desc">
              Physical tags are scanned by RFID antennas as items move between warehouse zones, transmitting telemetry instantly.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div className="card step-card" variants={itemVariants}>
            <div className="step-card__icon-box">⚙️</div>
            <h3 className="step-card__title">2. Edge Processing</h3>
            <p className="step-card__desc">
              Our server updates database records in SQLite and runs background intervals to detect stock issues or silent tags.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div className="card step-card" variants={itemVariants}>
            <div className="step-card__icon-box">📊</div>
            <h3 className="step-card__title">3. Live Insights</h3>
            <p className="step-card__desc">
              Socket.IO pipes telemetry directly to the browser dashboard, triggering warnings and visual status updates immediately.
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
