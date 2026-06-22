const express = require('express');
const multer = require('multer');
const { z } = require('zod');

const app = express();
app.use(express.json());

const documentUpload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => cb(null, true)
});

const schema = z.object({
  params: z.object({ id: z.string().optional() })
});

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err) { next(err); }
};

app.post('/test2/:id', 
  validate(schema), 
  documentUpload.single('file'), 
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    res.json({ success: true, file: req.file.originalname });
  }
);

app.listen(3004, () => console.log('Listening on 3004'));
