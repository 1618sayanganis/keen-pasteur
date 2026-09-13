const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data', 'wishes.json');

// Ensure data folder and file exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helpers for atomic file read/write
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON:', err);
    return [];
  }
}

function writeData(data) {
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, DATA_FILE);
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // --- API ROUTES: /api/wishes ---
  if (pathname.startsWith('/api/wishes')) {
    const parts = pathname.split('/').filter(Boolean); // ['api', 'wishes', id?]
    const wishId = parts[2];

    // 1. READ: GET /api/wishes
    if (req.method === 'GET' && !wishId) {
      const items = readData();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(items));
      return;
    }

    // 2. CREATE: POST /api/wishes
    if (req.method === 'POST' && !wishId) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          if (!payload.name || !payload.message) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nama dan ucapan doa wajib diisi.' }));
            return;
          }

          const newItem = {
            id: Date.now().toString(),
            name: payload.name.trim(),
            status: payload.status || 'Hadir',
            message: payload.message.trim(),
            time: 'Baru saja',
            createdAt: new Date().toISOString()
          };

          const items = readData();
          items.unshift(newItem);
          writeData(items);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newItem));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Payload tidak valid.' }));
        }
      });
      return;
    }

    // 3. UPDATE: PUT /api/wishes/:id
    if (req.method === 'PUT' && wishId) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const items = readData();
          const index = items.findIndex(i => i.id === wishId);

          if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Data ucapan tidak ditemukan.' }));
            return;
          }

          if (payload.name) items[index].name = payload.name.trim();
          if (payload.status) items[index].status = payload.status;
          if (payload.message) items[index].message = payload.message.trim();
          items[index].updatedAt = new Date().toISOString();

          writeData(items);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(items[index]));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Payload tidak valid.' }));
        }
      });
      return;
    }

    // 4. DELETE: DELETE /api/wishes/:id
    if (req.method === 'DELETE' && wishId) {
      const items = readData();
      const filtered = items.filter(i => i.id !== wishId);

      if (filtered.length === items.length) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Data ucapan tidak ditemukan.' }));
        return;
      }

      writeData(filtered);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Ucapan berhasil dihapus.' }));
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Wedding App Server running at http://localhost:${PORT}`);
});
