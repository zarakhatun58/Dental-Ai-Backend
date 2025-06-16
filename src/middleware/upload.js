import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ✅ Define __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create uploads/doctors folder if it doesn't exist
const dir = path.join(__dirname, '../uploads/doctors');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir); // Safe path
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

export default upload;
