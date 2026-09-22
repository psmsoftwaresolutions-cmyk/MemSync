require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, name: 'MemSync Core Engine', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`[MemSync] Edge Core Engine running on http://localhost:${PORT}`);
  console.log(`[MemSync] Local SQLite & Edge Heuristic Parser active (Zero Cloud Leakage)`);
});
