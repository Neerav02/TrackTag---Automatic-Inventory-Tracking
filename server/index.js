// server/index.js — Express + Socket.IO server

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { seed } = require('./seed');
const { getAllItems, getRecentScans, getItemById, getItemScanHistory, getAlertHistory } = require('./db');
const { startSimulator } = require('./simulator');
const { startAnomalyCheck, forceAnomalyCheckForItem, resolveAnomalyForItem } = require('./anomalyCheck');

const PORT = process.env.PORT || 4000;

// ─── Express App ───────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─── HTTP Server & Socket.IO ───────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ─── Seed the database ────────────────────────────────────────────────
seed();

// ─── REST endpoints ────────────────────────────────────────────────────

// Get all items (initial load)
app.get('/api/items', (req, res) => {
  try {
    const items = getAllItems();
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get detailed item and its scan history
app.get('/api/items/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = getItemById(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    const history = getItemScanHistory(item.rfid_tag, 50);
    res.json({ success: true, item, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get historical alerts
app.get('/api/alerts-history', (req, res) => {
  try {
    const alerts = getAlertHistory(100);
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get recent scans (initial load)
app.get('/api/scans', (req, res) => {
  try {
    const scans = getRecentScans(20);
    res.json({ success: true, scans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Simulate anomaly for a specific item (Section 6.3 — "Simulate Anomaly" button)
app.post('/api/simulate-anomaly', (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ success: false, error: 'itemId is required' });
    }

    const item = getItemById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const updatedItem = forceAnomalyCheckForItem(itemId);
    res.json({ success: true, item: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Resolve anomaly for a specific item
app.post('/api/resolve-anomaly', (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ success: false, error: 'itemId is required' });
    }

    const item = getItemById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const updatedItem = resolveAnomalyForItem(itemId);
    res.json({ success: true, item: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Socket.IO connections ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[socket] Client disconnected: ${socket.id}`);
  });
});

// ─── Start everything ──────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[server] TrackTag backend running on http://localhost:${PORT}`);

  // Start the scan simulator (a scan every 3 seconds)
  startSimulator(io, 3000);

  // Start the anomaly background check (every 5 seconds)
  startAnomalyCheck(io, 5000);
});
