// client/src/pages/Analytics.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function CountUp({ target, duration = 1.5, suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const currentCount = progress * target;
      setCount(currentCount);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{count.toFixed(decimals)}{suffix}</span>;
}

export default function Analytics() {
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
      className="analytics"
    >
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem' }}>Quantified Impact Metrics</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Demonstrated business value of TrackTag RFID telemetry vs. legacy manual inventory methods.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="metrics-row">
        {/* Metric 1 */}
        <div className="metric-counter">
          <div className="metric-counter__number">
            <CountUp target={40} suffix="%" />
          </div>
          <div className="metric-counter__label">Faster Stock Detection</div>
          <div className="metric-counter__desc">
            Average speedup in locating inventory across warehouse zones compared to manual tracking.
          </div>
        </div>

        {/* Metric 2 */}
        <div className="metric-counter">
          <div className="metric-counter__number">
            <CountUp target={99.2} suffix="%" decimals={1} />
          </div>
          <div className="metric-counter__label">Stock Accuracy</div>
          <div className="metric-counter__desc">
            Eliminates human entry errors and stock shrinkage with automated scanning.
          </div>
        </div>

        {/* Metric 3 */}
        <div className="metric-counter">
          <div className="metric-counter__number">
            <CountUp target={3} suffix="x" />
          </div>
          <div className="metric-counter__label">Alert Response Speed</div>
          <div className="metric-counter__desc">
            Items falling below threshold alert operations instantly, averting production delays.
          </div>
        </div>

        {/* Metric 4 */}
        <div className="metric-counter">
          <div className="metric-counter__number">
            <CountUp target={60} suffix="%" />
          </div>
          <div className="metric-counter__label">Labor Time Reduced</div>
          <div className="metric-counter__desc">
            Frees staff from manual scanning worksheets to focus on fulfillment and shipping.
          </div>
        </div>
      </div>

      {/* Comparison Chart Section */}
      <div className="analytics-chart">
        <div className="chart-sim">
          <h3 className="chart-sim__heading">Stock Auditing Time (Hours per Week)</h3>
          
          <div className="chart-bars-compare">
            {/* Manual Counting */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%' }}>
              <div className="compare-bar compare-bar--before">
                <span className="compare-bar__val" style={{ color: 'var(--color-text-muted)' }}>40 hrs</span>
              </div>
              <span className="compare-bar-label">Manual Inventory</span>
            </div>

            {/* TrackTag */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%' }}>
              <div className="compare-bar compare-bar--after">
                <span className="compare-bar__val" style={{ color: 'var(--color-primary)' }}>1.5 hrs</span>
              </div>
              <span className="compare-bar-label">TrackTag RFID</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3>Why RFID Automation Wins</h3>
          <p style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            In traditional warehouse environments, audits require staff members to walk aisles with clipboards or handheld barcode guns, scanning every individual box. This is time-consuming, prone to double-counts, and immediately out of date.
          </p>
          <p style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            TrackTag continuously records scans without manual labor. If an item is misplaced or goes missing, the system flags it as an <strong>anomaly</strong> automatically, allowing managers to audit by exception rather than auditing everything.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
