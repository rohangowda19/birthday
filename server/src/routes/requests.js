const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/requestController');

const router = express.Router();

const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests submitted. Slow down.' },
});

// Member endpoints
router.post('/', requireAuth, createLimiter, ctrl.createRequest);
router.get('/mine', requireAuth, ctrl.myRequests);

// Admin endpoints (declared before /:id so they aren't shadowed)
router.get('/stats/summary', requireAuth, requireRole('admin'), ctrl.stats);
router.get('/export/csv', requireAuth, requireRole('admin'), ctrl.exportCsv);
router.get('/', requireAuth, requireRole('admin'), ctrl.listRequests);

router.get('/:id', requireAuth, ctrl.getRequest);
router.post('/:id/approve', requireAuth, requireRole('admin'), ctrl.approve);
router.post('/:id/reject', requireAuth, requireRole('admin'), ctrl.reject);
router.post('/:id/paid', requireAuth, requireRole('admin'), ctrl.markPaid);
router.get('/:id/pay-link', requireAuth, requireRole('admin'), ctrl.payLink);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.deleteRequest);

module.exports = router;