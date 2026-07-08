// server/seed.js — inserts sample items with typical_interval_seconds on first run

const { db, getItemCount } = require('./db');

const SAMPLE_ITEMS = [
  { name: 'Wireless Mouse',       rfid_tag: 'RFID-001', quantity: 25, low_stock_threshold: 5,  typical_interval_seconds: 15, zone: 'Warehouse A', price: 699.00, daily_usage_rate: 2.5 },
  { name: 'Mechanical Keyboard',  rfid_tag: 'RFID-002', quantity: 18, low_stock_threshold: 4,  typical_interval_seconds: 20, zone: 'Warehouse A', price: 2499.00, daily_usage_rate: 1.8 },
  { name: 'USB-C Hub',            rfid_tag: 'RFID-003', quantity: 40, low_stock_threshold: 8,  typical_interval_seconds: 25, zone: 'Warehouse B', price: 1499.00, daily_usage_rate: 3.0 },
  { name: 'Noise-Cancelling Headphones', rfid_tag: 'RFID-004', quantity: 12, low_stock_threshold: 3, typical_interval_seconds: 30, zone: 'Warehouse B', price: 4999.00, daily_usage_rate: 1.2 },
  { name: '27" 4K Monitor',       rfid_tag: 'RFID-005', quantity: 8,  low_stock_threshold: 2,  typical_interval_seconds: 60, zone: 'Showroom', price: 18999.00, daily_usage_rate: 0.8 },
  { name: 'Webcam HD Pro',        rfid_tag: 'RFID-006', quantity: 30, low_stock_threshold: 6,  typical_interval_seconds: 20, zone: 'Showroom', price: 2999.00, daily_usage_rate: 2.0 },
  { name: 'Ergonomic Chair',      rfid_tag: 'RFID-007', quantity: 6,  low_stock_threshold: 2,  typical_interval_seconds: 90, zone: 'Warehouse C', price: 8999.00, daily_usage_rate: 0.5 },
  { name: 'Standing Desk',        rfid_tag: 'RFID-008', quantity: 4,  low_stock_threshold: 2,  typical_interval_seconds: 90, zone: 'Warehouse C', price: 15999.00, daily_usage_rate: 0.4 },
];

function seed() {
  const count = getItemCount();
  if (count > 0) {
    // If database already exists, we will update prices and daily_usage_rates manually to make sure they match!
    console.log(`[seed] Database already has ${count} items — verifying price & rate schema updates.`);
    try {
      const updateStmt = db.prepare(`UPDATE items SET price = ?, daily_usage_rate = ? WHERE rfid_tag = ?`);
      db.transaction(() => {
        for (const item of SAMPLE_ITEMS) {
          updateStmt.run(item.price, item.daily_usage_rate, item.rfid_tag);
        }
      })();
      console.log(`[seed] Successfully verified and updated prices & reorder usage rates for existing items.`);
    } catch (e) {
      console.error('[seed] Error updating prices on older database rows:', e.message);
    }
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO items (name, rfid_tag, quantity, low_stock_threshold, typical_interval_seconds, zone, price, daily_usage_rate, last_scanned_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item.name, item.rfid_tag, item.quantity, item.low_stock_threshold, item.typical_interval_seconds, item.zone, item.price, item.daily_usage_rate);
    }
  });

  insertMany(SAMPLE_ITEMS);
  console.log(`[seed] Inserted ${SAMPLE_ITEMS.length} sample items.`);
}

module.exports = { seed };
