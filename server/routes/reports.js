const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const calculateBudget = (severity) => {
  if (severity === 'high') return 15000;
  if (severity === 'medium') return 8000;
  return 3000;
};

router.get('/', async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { user: { select: { name: true, email: true } }, upvotes: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    console.log('GET ERROR:', error.message);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, latitude, longitude, severity } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const budgetEstimate = calculateBudget(severity);
    const report = await prisma.report.create({
      data: {
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        severity: severity || 'medium',
        photoUrl,
        budgetEstimate,
        userId: req.user.userId
      }
    });
    res.json(report);
  } catch (error) {
    console.log('CREATE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const userId = req.user.userId;
    const existing = await prisma.upvote.findUnique({
      where: { userId_reportId: { userId, reportId } }
    });
    if (existing) return res.status(400).json({ error: 'Already upvoted' });
    await prisma.upvote.create({ data: { userId, reportId } });
    res.json({ message: 'Upvoted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

router.post('/:id/after-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const afterPhotoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const report = await prisma.report.update({
      where: { id: parseInt(req.params.id) },
      data: { afterPhotoUrl, status: 'fixed' }
    });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload after photo' });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await prisma.report.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;