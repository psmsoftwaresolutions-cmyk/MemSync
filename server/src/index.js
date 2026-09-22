require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, name: 'MemSync Core Engine', version: '1.0.0' });
});

// Serve frontend static assets from client/dist
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[MemSync] Edge Core Engine running on http://0.0.0.0:${PORT}`);
  console.log(`[MemSync] Local SQLite & Edge Heuristic Parser active (Zero Cloud Leakage)`);
});
