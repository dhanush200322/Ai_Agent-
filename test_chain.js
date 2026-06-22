const express = require('express');
const multer = require('multer');
const { z } = require('zod');

const app = express();
app.use(express.json());

const documentUpload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    console.log('[fileFilter] called for', file.fieldname);
    cb(null, true);
  }
});

const schema = z.object({
  params: z.object({
    id: z.string().optional()
  })
});

const validate = (schema) => async (req, res, next) => {
  console.log('[validate] req.file BEFORE schema.parse:', req.file ? req.file.originalname : 'undefined');
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    console.log('[validate] req.file AFTER schema.parse:', req.file ? req.file.originalname : 'undefined');
    next();
  } catch (err) {
    next(err);
  }
};

app.post('/test/:id', 
  // Simulate an async middleware before multer
  async (req, res, next) => {
    await new Promise(r => setTimeout(r, 50));
    next();
  },
  documentUpload.single('file'), 
  validate(schema), 
  (req, res) => {
    console.log('[controller] req.file:', req.file ? req.file.originalname : 'undefined');
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    res.json({ success: true, file: req.file.originalname });
  }
);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3003, () => console.log('Listening on 3003'));
