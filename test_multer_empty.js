const express = require('express');
const multer = require('multer');

const app = express();

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

const server = app.listen(3006, async () => {
  try {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    
    // Simulate Postman sending a TEXT field named 'file' with empty value
    const body1 = `--${boundary}\r\nContent-Disposition: form-data; name="file"\r\n\r\n\r\n--${boundary}--\r\n`;

    console.log('--- Test 1: Empty text field ---');
    await fetch('http://localhost:3006/test', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: body1
    });

    // Simulate Postman sending a File but without a filename!
    const body2 = `--${boundary}\r\nContent-Disposition: form-data; name="file"\r\nContent-Type: application/pdf\r\n\r\nfake-pdf\r\n--${boundary}--\r\n`;

    console.log('--- Test 2: File part without filename ---');
    await fetch('http://localhost:3006/test', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: body2
    });

  } finally {
    server.close();
  }
});
