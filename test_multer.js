const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'does_not_exist_2/uploads')
  })
});

app.post('/upload2', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file');
  res.send('File uploaded');
});

app.use((err, req, res, next) => {
  res.status(500).send('Error: ' + err.code);
});

app.listen(3002, () => {
  console.log('Listening on 3002');
});
