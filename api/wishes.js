const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(process.cwd(), 'data', 'wishes.json');
const TMP_FILE = '/tmp/wishes.json';

// Ensure data exists in writable /tmp (Vercel serverless has writable /tmp)
function getFilePath() {
  if (process.env.VERCEL) {
    if (!fs.existsSync(TMP_FILE)) {
      try {
        if (fs.existsSync(DATA_FILE)) {
          fs.copyFileSync(DATA_FILE, TMP_FILE);
        } else {
          fs.writeFileSync(TMP_FILE, JSON.stringify([], null, 2), 'utf8');
        }
      } catch (e) {
        return DATA_FILE;
      }
    }
    return TMP_FILE;
  }
  return DATA_FILE;
}

function readData() {
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return [];
  } catch (err) {
    console.error('Error reading wishes:', err);
    return [];
  }
}

function writeData(data) {
  const filePath = getFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing wishes:', err);
  }
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { id } = req.query;

  // 1. GET (Read all)
  if (req.method === 'GET') {
    const items = readData();
    return res.status(200).json(items);
  }

  // 2. POST (Create)
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    if (!body || !body.name || !body.message) {
      return res.status(400).json({ error: 'Nama dan ucapan doa wajib diisi.' });
    }

    const newItem = {
      id: Date.now().toString(),
      name: body.name.trim(),
      status: body.status || 'Hadir',
      message: body.message.trim(),
      time: 'Baru saja',
      createdAt: new Date().toISOString()
    };

    const items = readData();
    items.unshift(newItem);
    writeData(items);

    return res.status(201).json(newItem);
  }

  // 3. PUT (Update)
  if (req.method === 'PUT') {
    if (!id) {
      return res.status(400).json({ error: 'ID ucapan wajib disertakan.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const items = readData();
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Data ucapan tidak ditemukan.' });
    }

    if (body.name) items[index].name = body.name.trim();
    if (body.status) items[index].status = body.status;
    if (body.message) items[index].message = body.message.trim();
    items[index].updatedAt = new Date().toISOString();

    writeData(items);
    return res.status(200).json(items[index]);
  }

  // 4. DELETE (Delete)
  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'ID ucapan wajib disertakan.' });
    }

    const items = readData();
    const filtered = items.filter(i => i.id !== id);

    if (filtered.length === items.length) {
      return res.status(404).json({ error: 'Data ucapan tidak ditemukan.' });
    }

    writeData(filtered);
    return res.status(200).json({ success: true, message: 'Ucapan berhasil dihapus.' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
