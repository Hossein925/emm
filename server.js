// server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// تنظیمات __dirname در ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// اتصال به دیتابیس PostgreSQL ابر آروان
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // برای آروان کافیه، اگر خطا داد true کن و ca اضافه کن
  }
});

// تست اتصال به دیتابیس
pool.connect((err) => {
  if (err) {
    console.error('خطا در اتصال به دیتابیس:', err.message);
  } else {
    console.log('اتصال به دیتابیس PostgreSQL ابر آروان با موفقیت انجام شد');
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist'))); // فایل‌های بیلد شده React

// تنظیمات آپلود فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ایجاد پوشه uploads اگر وجود نداشته باشه
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ========================
// API Routes
// ========================

// 1. بخش‌ها (Sections)
app.get('/api/sections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sections ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. بنرها (Banners)
app.get('/api/banners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banners ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. موضوعات درباره بیمارستان
app.get('/api/about-hospital', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM about_hospital_topics ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. بیماری‌ها (با بخش مربوطه)
app.get('/api/diseases', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, s.name as section_name, s.icon, s.color_class 
      FROM diseases d 
      LEFT JOIN sections s ON d.section_id = s.id 
      ORDER BY d.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/diseases/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, s.name as section_name 
      FROM diseases d 
      LEFT JOIN sections s ON d.section_id = s.id 
      WHERE d.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'بیماری یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. فایل‌ها (مرتبط با بیماری)
app.get('/api/files/disease/:disease_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM files WHERE disease_id = $1 ORDER BY id', [req.params.disease_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// آپلود فایل برای بیماری
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    const { disease_id, name, description, file_type } = req.body;
    if (!req.file) return res.status(400).json({ error: 'فایل الزامی است' });

    const filePath = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO files (disease_id, name, description, file_path, file_type) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [disease_id, name, description, filePath, file_type || req.file.mimetype]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// سرو کردن فایل‌های آپلود شده
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// همه درخواست‌های دیگر → به React بده (برای react-router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// راه‌اندازی سرور
app.listen(PORT, () => {
  console.log(`سرور در حال اجراست روی پورت ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
