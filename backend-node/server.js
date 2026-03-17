require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const contactController = require('./controllers/contactController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('-------------------------------------------');
        console.log('Connected to MongoDB Atlas');
        console.log(`Active Database: ${mongoose.connection.db.databaseName}`);
        console.log('-------------------------------------------');
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Greetify API Running');
});

app.get('/api/contacts', contactController.getAllContacts);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
