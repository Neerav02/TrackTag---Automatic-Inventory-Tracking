// server/anomalyCheck.js — compares last_scanned_at vs typical_interval

const { getInStockItems, setItemStatus, logAlert } = require('./db');

let io = null;
let intervalId = null;

function runAnomalyCheck() {
  const items = getInStockItems();
  const now = Date.now();

  for (const item of items) {
    if (!item.last_scanned_at) continue;

    const lastScanned = new Date(item.last_scanned_at).getTime();
    const gap = (now - lastScanned) / 1000; // in seconds
    const threshold = item.typical_interval_seconds * 3;

    if (gap > threshold && item.status !== 'anomaly') {
      // Flag the item
      const updatedItem = setItemStatus(item.id, 'anomaly');

      // Log alert
      logAlert(
        updatedItem.id,
        updatedItem.name,
        updatedItem.rfid_tag,
        'anomaly',
        `Anomaly Detected: Item not seen for ${Math.round(gap)}s (expected every ${item.typical_interval_seconds}s)`
      );

      if (io) {
        io.emit('anomaly-alert', {
          item: updatedItem,
          gap: Math.round(gap),
          threshold: threshold,
          message: `Unusual — not seen recently`,
          timestamp: new Date().toISOString(),
        });

        // Also emit a general update so the table refreshes
        io.emit('scan-update', {
          item: updatedItem,
          scanDelta: 0,
          zone: updatedItem.zone,
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`[anomaly] Flagged "${item.name}" — gap ${Math.round(gap)}s exceeds threshold ${threshold}s`);
    }
  }
}

function startAnomalyCheck(socketIO, intervalMs = 5000) {
  io = socketIO;
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(runAnomalyCheck, intervalMs);
  console.log(`[anomaly] Background check started — runs every ${intervalMs}ms`);
}

function stopAnomalyCheck() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Force an immediate anomaly check for a specific item (for demo purposes)
function forceAnomalyCheckForItem(itemId) {
  const { getItemById, clearLastScannedAt } = require('./db');
  const { excludeTag } = require('./simulator');

  // 1. Pull the item out of the simulator's rotation
  const item = getItemById(itemId);
  if (!item) return null;

  excludeTag(item.rfid_tag);

  // 2. Set last_scanned_at far in the past
  const updatedItem = clearLastScannedAt(itemId);

  // 3. Run the check immediately
  runAnomalyCheck();

  return updatedItem;
}

// Re-integrate an item into simulator rotation and resolve its anomaly status
function resolveAnomalyForItem(itemId) {
  const { getItemById, resolveItemAnomaly } = require('./db');
  const { includeTag } = require('./simulator');

  const item = getItemById(itemId);
  if (!item) return null;

  // 1. Re-include the tag in simulation
  includeTag(item.rfid_tag);

  // 2. Reset database fields
  const updatedItem = resolveItemAnomaly(itemId);

  // 3. Broadcast update
  if (io) {
    io.emit('scan-update', {
      item: updatedItem,
      scanDelta: 0,
      zone: updatedItem.zone,
      timestamp: new Date().toISOString(),
    });
  }

  return updatedItem;
}

module.exports = {
  startAnomalyCheck,
  stopAnomalyCheck,
  forceAnomalyCheckForItem,
  resolveAnomalyForItem,
};
