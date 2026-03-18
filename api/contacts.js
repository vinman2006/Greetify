// api/contacts.js — Vercel Serverless Function
// Replaces the Java Spring Boot proxy layer.
// Vercel automatically serves this at GET /api/contacts.

const mongoose = require('mongoose');

// ── Schema (mirrors backend-node/models/contactModel.js) ──
const contactSchema = new mongoose.Schema({
    name:           { type: String, required: true },
    phone:          { type: String, required: true },
    dob:            { type: String, required: true },
    type:           { type: String, default: 'student' },
    wished:         { type: Boolean, default: false },
    lastWishedYear: { type: Number, default: null }
}, { collection: 'contacts' });

// Prevent model recompilation on hot-reload (Vercel keeps process warm)
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// ── Connection cache — reuse across warm invocations ──
let cachedConnection = null;

async function connectDB() {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI environment variable is not set');
    cachedConnection = await mongoose.connect(uri);
    return cachedConnection;
}

// ── Handler ──
module.exports = async function handler(req, res) {
    // CORS — allow the Vercel frontend origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await connectDB();

        const contacts = await Contact.find({});

        if (contacts.length === 0) {
            return res.status(404).json({
                error: 'REGISTRY EMPTY',
                message: 'No records found in contacts collection. Check Atlas.'
            });
        }

        return res.status(200).json(contacts);

    } catch (error) {
        console.error('[Greetify API] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
