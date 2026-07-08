// server/simulator.js — fires fake RFID scan events on an interval

const { getItemByTag, updateItemScan, logScan, getAllItems, logAlert } = require('./db');

const ZONES = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Showroom', 'Loading Dock'];

// Items that are temporarily excluded from simulation (for anomaly demo)
const excludedTags = new Set();

let io = null;
let intervalId = null;

function getRandomZone() {
  return ZONES[Math.floor(Math.random() * ZONES.length)];
}

function getRandomDelta() {
  // Most scans add stock (+1 to +3), occasionally remove (-1 to -2)
  const roll = Math.random();
  if (roll < 0.3) return -Math.ceil(Math.random() * 2);  // 30% chance decrease
  return Math.ceil(Math.random() * 3);                     // 70% chance increase
}

function performScan() {
  const items = getAllItems();
  if (!items || items.length === 0) return;

  // Filter out excluded items
  const eligible = items.filter(item => !excludedTags.has(item.rfid_tag));
  if (eligible.length === 0) return;

  const randomItem = eligible[Math.floor(Math.random() * eligible.length)];
  const zone = getRandomZone();
  const delta = getRandomDelta();

  // Ensure quantity doesn't go below 0
  const effectiveDelta = Math.max(delta, -randomItem.quantity);

  const updatedItem = updateItemScan(randomItem.rfid_tag, zone, effectiveDelta);
  logScan(updatedItem.rfid_tag, updatedItem.name, zone, updatedItem.quantity);

  // Broadcast the update over Socket.IO
  if (io) {
    io.emit('scan-update', {
      item: updatedItem,
      scanDelta: effectiveDelta,
      zone: zone,
      timestamp: new Date().toISOString(),
    });

    // High-value theft detection check (unauthorized movement)
    // If a Monitor (RFID-005) or Desk (RFID-008) is scanned in Loading Dock without clearances
    if ((updatedItem.rfid_tag === 'RFID-005' || updatedItem.rfid_tag === 'RFID-008') && zone === 'Loading Dock') {
      logAlert(
        updatedItem.id,
        updatedItem.name,
        updatedItem.rfid_tag,
        'theft',
        `Unauthorized relocation: High-value asset transferred to restricted Loading Dock bay!`
      );

      io.emit('theft-alert', {
        item: updatedItem,
        zone: zone,
        timestamp: new Date().toISOString(),
      });
    }

    // If the item is now below its low-stock threshold, emit an alert
    if (updatedItem.quantity <= updatedItem.low_stock_threshold && updatedItem.quantity >= 0) {
      logAlert(
        updatedItem.id,
        updatedItem.name,
        updatedItem.rfid_tag,
        'low-stock',
        `Low Stock Warning: quantity down to ${updatedItem.quantity} (threshold: ${updatedItem.low_stock_threshold})`
      );

      io.emit('low-stock-alert', {
        item: updatedItem,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

function startSimulator(socketIO, intervalMs = 3000) {
  io = socketIO;
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(performScan, intervalMs);
  console.log(`[simulator] Started — emitting a scan every ${intervalMs}ms`);
}

function stopSimulator() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  console.log('[simulator] Stopped');
}

function excludeTag(rfidTag) {
  excludedTags.add(rfidTag);
  console.log(`[simulator] Excluded tag: ${rfidTag}`);
}

function includeTag(rfidTag) {
  excludedTags.delete(rfidTag);
  console.log(`[simulator] Included tag: ${rfidTag}`);
}

module.exports = {
  startSimulator,
  stopSimulator,
  excludeTag,
  includeTag,
};
