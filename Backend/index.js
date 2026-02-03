const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // REQUIRED for Twilio webhook

/* ------------------ TWILIO ------------------ */
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

/* ------------------ CLOUDINARY ------------------ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ------------------ MULTER + CLOUDINARY ------------------ */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'xyz-comp',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage });

/* ------------------ IN-MEMORY DB ------------------ */
const approvals = {};
const preApprovals = {};
const activeVisits = {};
const visitHistory = [];

/* ------------------ LOGGER ------------------ */
app.use((req, res, next) => {
  console.log('->', req.method, req.url);
  next();
});

/* ------------------ HELPERS ------------------ */
function extractPublicId(cloudinaryUrl) {
  return cloudinaryUrl
    .split('/upload/')[1]
    .replace(/^v\d+\//, '')
    .replace(/\.[^/.]+$/, '');
}

function normalizeCloudinaryUrl(input) {
  if (!input) return null;

  let cleaned = input;

  // REMOVE DOUBLE PREFIX (THIS IS THE MISSING FIX)
  cleaned = cleaned.replace(
    /^https:\/\/res\.cloudinary\.com\/https:\/\/res\.cloudinary\.com\//,
    'https://res.cloudinary.com/'
  );

  // already full valid URL
  if (cleaned.startsWith('https://res.cloudinary.com/')) {
    return cleaned;
  }

  // missing protocol
  if (cleaned.startsWith('res.cloudinary.com/')) {
    return 'https://' + cleaned;
  }

  // pure public_id
  return cloudinary.url(cleaned, { secure: true });
}

/* ------------------ UPLOAD PHOTO ------------------ */
app.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }


  const cloudinaryPath = req.file.path.replace(
    /^https?:\/\/res\.cloudinary\.com\//,
    ''
  );

  res.json({
    success: true,
    photoPublicId: cloudinaryPath, //  PATH ONLY
  });
});

/* ------------------ SEND APPROVAL (WHATSAPP TEMPLATE) ------------------ */
app.post('/send-approval', async (req, res) => {
  try {
    const {
      requestId,
      visitorName,
      visitorPhone,
      hostNumber,
      gateTime,
      photoPublicId, // already path-only
    } = req.body;

    approvals[requestId] = {
      status: 'PENDING',
      visitorName,
      visitorPhone,
      photoPublicId,
      expiresAt: Date.now() + 60 * 1000,
    };

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:+91${hostNumber}`,
      contentSid: process.env.TWILIO_TEMPLATE_SID,
      contentVariables: JSON.stringify({
        "1": photoPublicId, //  PATH ONLY
        "2": visitorName,
        "3": gateTime,
        "4": requestId,
      }),
    });

    res.json({ success: true });

  } catch (err) {
    console.error(' Twilio Error');
    console.error(err.message);
    console.error(err.code);
    console.error(err.moreInfo);

    res.status(500).json({ success: false, error: err.message });
  }
});

/* ------------------ TWILIO WEBHOOK ------------------ */
app.post('/twilio-webhook', async (req, res) => {
  const bodyText = req.body.Body?.trim();
  const payload = req.body.ButtonPayload;
  const from = req.body.From;

  /* ================= PREAPPROVE (TEXT ONLY) ================= */
  if (bodyText && bodyText.startsWith('PREAPPROVE')) {
    // Format: PREAPPROVE Name Phone HH:MM-HH:MM
    const [, name, phone, range] = bodyText.split(' ');
    const [startTime, endTime] = range.split('-');

    preApprovals[phone] = { name, startTime, endTime };

    console.log('Pre-approved:', phone);

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `Pre-approved\n\n${name} is allowed between ${startTime} and ${endTime}.`,
    });

    return res.send('<Response></Response>');
  }

  /* ================= APPROVE / REJECT ================= */
  let action, requestId;

  // CASE 1: Button click
  if (payload) {
    [action, requestId] = payload.split('_');
  }
  // CASE 2: Manual text reply
  else if (bodyText) {
    [action, requestId] = bodyText.split(' ');
  } else {
    return res.send('<Response></Response>');
  }

  const approval = approvals[requestId];
  if (!approval) return res.send('<Response></Response>');

  if (Date.now() > approval.expiresAt) {
    approval.status = 'EXPIRED';
    return res.send('<Response></Response>');
  }

  /* ================= APPROVE ================= */
  if (action === 'APPROVE') {
    approval.status = 'APPROVED';

    if (!activeVisits[approval.visitorPhone]) {
      activeVisits[approval.visitorPhone] = {
        name: approval.visitorName,
        phone: approval.visitorPhone,
        type: 'APPROVAL',
        photo: approval.photoPublicId,
        inTime: new Date().toISOString(),
      };
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `Approved\n\nGuest *${approval.visitorName}* is arriving shortly towards you.`,
    });
  }

  /* ================= REJECT ================= */
  if (action === 'REJECT') {
    approval.status = 'REJECTED';

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: ` Rejected\n\nGuest *${approval.visitorName}* was rejected.`,
    });
  }

  console.log(` ${action} processed for ${requestId}`);
  res.send('<Response></Response>');
});

/* ------------------ STATUS ------------------ */
app.get('/status/:id', (req, res) => {
  const approval = approvals[req.params.id];
  if (!approval) return res.json({ status: 'UNKNOWN' });

  if (approval.status === 'PENDING' && Date.now() > approval.expiresAt) {
    approval.status = 'EXPIRED';
  }

  res.json({ status: approval.status });
});

/* ------------------ PREAPPROVAL CHECK ------------------ */
app.get('/preapproval/:phone', (req, res) => {
  const record = preApprovals[req.params.phone];
  if (!record) return res.json({ valid: false });

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const [sH, sM] = record.startTime.split(':').map(Number);
  const [eH, eM] = record.endTime.split(':').map(Number);

  const start = sH * 60 + sM;
  const end = eH * 60 + eM;

  if (nowMin >= start && nowMin <= end) {
    if (!activeVisits[req.params.phone]) {
      activeVisits[req.params.phone] = {
        name: record.name,
        phone: req.params.phone,
        type: 'PRE-APPROVED',
        inTime: new Date().toISOString(),
        photo: null,
      };
    }
    return res.json({ valid: true, name: record.name });
  }

  res.json({ valid: false });
});

/* ------------------ CHECKOUT ------------------ */
app.post('/checkout', (req, res) => {
  const visit = activeVisits[req.body.phone];
  if (!visit) {
    return res.json({
      success: false,
      message: 'Visitor is not currently inside',
    });
  }

  visit.outTime = new Date().toISOString();
  visitHistory.push(visit);
  delete activeVisits[req.body.phone];

  res.json({ success: true });
});

/* ------------------ ACTIVE + HISTORY ------------------ */
app.get('/active-visits', (req, res) => {
  res.json(Object.values(activeVisits));
});

app.get('/history', (req, res) => {
  res.json(visitHistory.reverse());
});

/* ------------------ SERVER ------------------ */
app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
