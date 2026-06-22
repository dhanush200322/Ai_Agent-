const express = require('express');
const multer = require('multer');

const app = express();
app.use(express.json());

const upload = multer({
  fileFilter: (req, file, cb) => {
    console.log('[fileFilter] executed');
    cb(null, true);
  }
});

app.post('/test', upload.single('file'), (req, res) => {
  console.log('req.file:', req.file ? 'exists' : 'undefined');
  console.log('req.body:', req.body);
  res.json({ ok: true });
});

const server = app.listen(3007, async () => {
  try {
    console.log('--- Test 3: application/json ---');
    await fetch('http://localhost:3007/test', {
      method: 'POST',
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify({ file: '' })
    });
  } finally {
    server.close();
  }
});
