// server/db.js — SQLite setup + queries (better-sqlite3)

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'tracktag.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// ─── Schema ────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    name                    TEXT    NOT NULL,
    rfid_tag                TEXT    NOT NULL UNIQUE,
    quantity                INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold     INTEGER NOT NULL DEFAULT 5,
    typical_interval_seconds INTEGER NOT NULL DEFAULT 30,
    zone                    TEXT    NOT NULL DEFAULT 'Unknown',
    last_scanned_at         TEXT,
    status                  TEXT    NOT NULL DEFAULT 'normal',
    price                   REAL    NOT NULL DEFAULT 499.00,
    daily_usage_rate        REAL    NOT NULL DEFAULT 2.5,
    created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scan_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    rfid_tag    TEXT    NOT NULL,
    item_name   TEXT    NOT NULL,
    zone        TEXT    NOT NULL,
    quantity    INTEGER NOT NULL,
    scanned_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alert_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id     INTEGER NOT NULL,
    item_name   TEXT    NOT NULL,
    rfid_tag    TEXT    NOT NULL,
    type        TEXT    NOT NULL, -- 'low-stock' or 'anomaly'
    message     TEXT    NOT NULL,
    logged_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// Execute column migrations if columns are missing in older DB tables
try {
  db.exec("ALTER TABLE items ADD COLUMN price REAL DEFAULT 499.00");
} catch(e) { /* ignore if already exists */ }

try {
  db.exec("ALTER TABLE items ADD COLUMN daily_usage_rate REAL DEFAULT 2.5");
} catch(e) { /* ignore if already exists */ }

// ─── Queries ───────────────────────────────────────────────────────────

function getAllItems() {
  return db.prepare('SELECT * FROM items ORDER BY id').all();
}

function getItemByTag(rfidTag) {
  return db.prepare('SELECT * FROM items WHERE rfid_tag = ?').get(rfidTag);
}

function getItemById(id) {
  return db.prepare('SELECT * FROM items WHERE id = ?').get(id);
}

function updateItemScan(rfidTag, zone, quantityDelta) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE items
    SET quantity        = quantity + ?,
        zone            = ?,
        last_scanned_at = ?,
        status          = 'normal'
    WHERE rfid_tag = ?
  `);
  stmt.run(quantityDelta, zone, now, rfidTag);
  return getItemByTag(rfidTag);
}

function logScan(rfidTag, itemName, zone, quantity) {
  const stmt = db.prepare(`
    INSERT INTO scan_log (rfid_tag, item_name, zone, scanned_at, quantity)
    VALUES (?, ?, ?, datetime('now'), ?)
  `);
  stmt.run(rfidTag, itemName, zone, quantity);
}

function getRecentScans(limit = 20) {
  return db.prepare('SELECT * FROM scan_log ORDER BY id DESC LIMIT ?').all(limit);
}

function getItemScanHistory(rfidTag, limit = 50) {
  return db.prepare('SELECT * FROM scan_log WHERE rfid_tag = ? ORDER BY id DESC LIMIT ?').all(rfidTag, limit);
}

function logAlert(itemId, itemName, rfidTag, type, message) {
  const stmt = db.prepare(`
    INSERT INTO alert_log (item_id, item_name, rfid_tag, type, message, logged_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  stmt.run(itemId, itemName, rfidTag, type, message);
}

function getAlertHistory(limit = 100) {
  return db.prepare('SELECT * FROM alert_log ORDER BY id DESC LIMIT ?').all(limit);
}

function setItemStatus(id, status) {
  db.prepare('UPDATE items SET status = ? WHERE id = ?').run(status, id);
  return getItemById(id);
}

function getInStockItems() {
  return db.prepare('SELECT * FROM items WHERE quantity > 0').all();
}

function clearLastScannedAt(id) {
  // For anomaly simulation — set last_scanned_at far in the past
  const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(); // 24 hours ago
  db.prepare('UPDATE items SET last_scanned_at = ? WHERE id = ?').run(past, id);
  return getItemById(id);
}

function resolveItemAnomaly(id) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE items
    SET status = 'normal',
        last_scanned_at = ?
    WHERE id = ?
  `).run(now, id);
  return getItemById(id);
}

function getItemCount() {
  return db.prepare('SELECT COUNT(*) as count FROM items').get().count;
}

module.exports = {
  db,
  getAllItems,
  getItemByTag,
  getItemById,
  updateItemScan,
  logScan,
  getRecentScans,
  getItemScanHistory,
  logAlert,
  getAlertHistory,
  setItemStatus,
  getInStockItems,
  clearLastScannedAt,
  resolveItemAnomaly,
  getItemCount,
};
