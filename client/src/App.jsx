// client/src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import socket from './socket';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AlertToast from './components/AlertToast';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ItemDetail from './pages/ItemDetail';
import Analytics from './pages/Analytics';
import AlertsHistory from './pages/AlertsHistory';
import About from './pages/About';

export default function App() {
  const [items, setItems] = useState([]);
  const [scans, setScans] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Fetch initial data
  const fetchData = () => {
    fetch('/api/items')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItems(data.items);
        }
      })
      .catch((err) => console.error('Error fetching items:', err));

    fetch('/api/scans')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setScans(data.scans);
        }
      })
      .catch((err) => console.error('Error fetching scans:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen to Socket.IO events
  useEffect(() => {
    socket.on('scan-update', (data) => {
      const { item, scanDelta, zone, timestamp } = data;

      // Update item in local state
      setItems((prevItems) =>
        prevItems.map((prevItem) => (prevItem.id === item.id ? item : prevItem))
      );

      // Add to live scan feed if there's actually a delta
      if (scanDelta !== 0) {
        setScans((prevScans) => [
          {
            id: Date.now() + Math.random(),
            item_name: item.name,
            rfid_tag: item.rfid_tag,
            zone: zone,
            quantity: item.quantity,
            scanned_at: timestamp,
          },
          ...prevScans.slice(0, 19),
        ]);
      }
    });

    socket.on('low-stock-alert', (data) => {
      const { item, timestamp } = data;
      setAlerts((prevAlerts) => [
        {
          id: `low-${item.id}-${Date.now()}`,
          type: 'low-stock',
          itemId: item.id,
          itemName: item.name,
          quantity: item.quantity,
          threshold: item.low_stock_threshold,
          timestamp,
        },
        ...prevAlerts,
      ]);
    });

    socket.on('anomaly-alert', (data) => {
      const { item, message, timestamp } = data;
      setAlerts((prevAlerts) => [
        {
          id: `anomaly-${item.id}-${Date.now()}`,
          type: 'anomaly',
          itemId: item.id,
          itemName: item.name,
          message,
          timestamp,
        },
        ...prevAlerts,
      ]);
    });

    socket.on('theft-alert', (data) => {
      const { item, zone, timestamp } = data;
      setAlerts((prevAlerts) => [
        {
          id: `theft-${item.id}-${Date.now()}`,
          type: 'theft',
          itemId: item.id,
          itemName: item.name,
          message: `Unauthorized relocation to restricted ${zone}!`,
          timestamp,
        },
        ...prevAlerts,
      ]);
    });

    return () => {
      socket.off('scan-update');
      socket.off('low-stock-alert');
      socket.off('anomaly-alert');
      socket.off('theft-alert');
    };
  }, []);

  // Handle Simulate Anomaly call
  const handleSimulateAnomaly = async (itemId) => {
    try {
      const res = await fetch('/api/simulate-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prevItems) =>
          prevItems.map((prevItem) => (prevItem.id === itemId ? data.item : prevItem))
        );
      } else {
        console.error('Failed to simulate anomaly:', data.error);
      }
    } catch (err) {
      console.error('Error simulating anomaly:', err);
    }
  };

  // Handle Resolve Anomaly call
  const handleResolveAnomaly = async (itemId) => {
    try {
      const res = await fetch('/api/resolve-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prevItems) =>
          prevItems.map((prevItem) => (prevItem.id === itemId ? data.item : prevItem))
        );
      } else {
        console.error('Failed to resolve anomaly:', data.error);
      }
    } catch (err) {
      console.error('Error resolving anomaly:', err);
    }
  };

  // Dismiss alert
  const handleDismissAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navigation Navbar */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  items={items}
                  setItems={setItems}
                  scans={scans}
                  setScans={setScans}
                  onSimulateAnomaly={handleSimulateAnomaly}
                  onResolveAnomaly={handleResolveAnomaly}
                />
              }
            />

            <Route path="/items/:id" element={<ItemDetail />} />

            <Route path="/analytics" element={<Analytics />} />

            <Route
              path="/alerts"
              element={
                <AlertsHistory
                  items={items}
                  onSimulateAnomaly={handleSimulateAnomaly}
                  onResolveAnomaly={handleResolveAnomaly}
                />
              }
            />

            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Global Alert Toasts */}
        <AlertToast alerts={alerts} onDismiss={handleDismissAlert} />

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
