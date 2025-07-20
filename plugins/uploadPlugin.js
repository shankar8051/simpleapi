const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurable options
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.pdf'];

exports.install = ({ app, db, config }) => {
  const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ALLOWED_TYPES.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('❌ Invalid file type.'));
      }
    }
  });

  app.post('/upload', upload.array('files', 5), async (req, res) => {
    const uploaded = req.files.map(file => ({
      name: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date()
    }));

    await db.get().insert('uploads', uploaded);
    const urls = uploaded.map(f => `/uploads/${path.basename(f.path)}`);

    res.json({ success: true, urls });
  });
};
