const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, default: 'student' },
    wished: { type: Boolean, default: false },
    lastWishedYear: { type: Number, default: null }
}, {
    collection: 'contacts'
});

module.exports = mongoose.model('Contact', contactSchema);
