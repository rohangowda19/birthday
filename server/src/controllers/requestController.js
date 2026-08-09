const Request = require('../models/Request');
const PaymentLog = require('../models/PaymentLog');
const { parseUpiUri, buildUpiPayLink } = require('../utils/qrParser');

const EXPIRY_MINUTES = Number(process.env.REQUEST_EXPIRY_MINUTES || 10);

function getIO(req) {
  return req.app.get('io');
}

async function expireStaleRequests() {
  const now = new Date();
  await Request.updateMany(
    { status: 'pending', expiresAt: { $lte: now } },
    { $set: { status: 'expired' } }
  );
}

// POST /api/requests  (member) - scans a QR and creates a relay request
async function createRequest(req, res) {
  const { rawQR, amountOverride } = req.body;
  if (!rawQR) return res.status(400).json({ message: 'rawQR is required' });

  let parsed;
  try {
    parsed = parseUpiUri(rawQR);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const amount = amountOverride ? Number(amountOverride) : parsed.amount;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'A valid amount is required' });
  }

  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

  const request = await Request.create({
    requester: req.user._id,
    merchantName: parsed.merchantName,
    merchantUPI: parsed.merchantUPI,
    amount,
    currency: parsed.currency,
    transactionRef: parsed.transactionRef,
    transactionNote: parsed.transactionNote,
    merchantCode: parsed.merchantCode,
    rawQR: parsed.rawUri,
    expiresAt,
  });

  await PaymentLog.create({
    request: request._id,
    actor: req.user._id,
    fromStatus: 'none',
    toStatus: 'pending',
    note: 'Request created from scanned QR',
  });

  const populated = await request.populate('requester', 'name email');

  const io = getIO(req);
  io.to('admins').emit('request:new', populated);

  res.status(201).json({ request: populated });
}

// GET /api/requests/mine (member) - the requester's own requests
async function myRequests(req, res) {
  await expireStaleRequests();
  const requests = await Request.find({ requester: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ requests });
}

// GET /api/requests/:id (member owns it, or admin)
async function getRequest(req, res) {
  await expireStaleRequests();
  const request = await Request.findById(req.params.id).populate('requester', 'name email');
  if (!request) return res.status(404).json({ message: 'Request not found' });

  const isOwner = request.requester._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this request' });
  }

  res.json({ request });
}

// GET /api/requests (admin) - list with filters/search/pagination
async function listRequests(req, res) {
  await expireStaleRequests();

  const { status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { merchantName: { $regex: search, $options: 'i' } },
      { merchantUPI: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [requests, total] = await Promise.all([
    Request.find(query)
      .populate('requester', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Request.countDocuments(query),
  ]);

  res.json({ requests, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

// GET /api/requests/stats/summary (admin)
async function stats(req, res) {
  await expireStaleRequests();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayRequests, todayPaid, pending, rejected, completed] = await Promise.all([
    Request.countDocuments({ createdAt: { $gte: startOfDay } }),
    Request.countDocuments({ status: 'paid', paidAt: { $gte: startOfDay } }),
    Request.countDocuments({ status: 'pending' }),
    Request.countDocuments({ status: 'rejected' }),
    Request.countDocuments({ status: 'paid' }),
  ]);

  res.json({ todayRequests, todayPaid, pending, rejected, completed });
}

async function transition(req, res, { from, to }) {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  if (!from.includes(request.status)) {
    return res.status(409).json({ message: `Cannot move a "${request.status}" request to "${to}"` });
  }

  request.status = to;
  request.decidedBy = req.user._id;
  request.decidedAt = new Date();
  if (to === 'paid') request.paidAt = new Date();
  await request.save();

  await PaymentLog.create({
    request: request._id,
    actor: req.user._id,
    fromStatus: from.join('|'),
    toStatus: to,
  });

  const populated = await request.populate('requester', 'name email');

  const io = getIO(req);
  io.to('admins').emit('request:updated', populated);
  io.to(`requester:${request.requester._id}`).emit('request:updated', populated);

  return res.json({ request: populated });
}

// POST /api/requests/:id/approve (admin)
async function approve(req, res) {
  return transition(req, res, { from: ['pending'], to: 'approved' });
}

// POST /api/requests/:id/reject (admin)
async function reject(req, res) {
  return transition(req, res, { from: ['pending', 'approved'], to: 'rejected' });
}

// POST /api/requests/:id/paid (admin) - admin confirms they manually completed
// the payment inside their own UPI app. This endpoint never touches any
// payment rail itself; it only records what the human already did.
async function markPaid(req, res) {
  return transition(req, res, { from: ['approved'], to: 'paid' });
}

// GET /api/requests/:id/pay-link (admin) - builds the deep link to open the
// admin's own installed UPI app, pre-filled. Opening it is the admin's
// action; nothing here submits or authorizes a payment.
async function payLink(req, res) {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.status !== 'approved') {
    return res.status(409).json({ message: 'Only approved requests can be paid' });
  }

  const link = buildUpiPayLink({
    merchantUPI: request.merchantUPI,
    merchantName: request.merchantName,
    amount: request.amount,
    currency: request.currency,
    transactionRef: request.transactionRef,
    transactionNote: request.transactionNote,
  });

  res.json({ link });
}

// GET /api/requests/export/csv (admin)
async function exportCsv(req, res) {
  const requests = await Request.find().populate('requester', 'name email').sort({ createdAt: -1 }).limit(5000);

  const header = [
    'id',
    'requesterName',
    'requesterEmail',
    'merchantName',
    'merchantUPI',
    'amount',
    'currency',
    'status',
    'createdAt',
    'decidedAt',
    'paidAt',
  ];

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const rows = requests.map((r) =>
    [
      r._id,
      r.requester?.name,
      r.requester?.email,
      r.merchantName,
      r.merchantUPI,
      r.amount,
      r.currency,
      r.status,
      r.createdAt?.toISOString(),
      r.decidedAt?.toISOString() || '',
      r.paidAt?.toISOString() || '',
    ]
      .map(escape)
      .join(',')
  );

  const csv = [header.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="upi-relay-requests.csv"');
  res.send(csv);
}

module.exports = {
  createRequest,
  myRequests,
  getRequest,
  listRequests,
  stats,
  approve,
  reject,
  markPaid,
  payLink,
  exportCsv,
};
