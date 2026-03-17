const Contact = require('../models/contactModel');
const mongoose = require('mongoose');

const getAllContacts = async (req, res) => {
    try {
        const dbName = mongoose.connection.db.databaseName;
        const collName = 'contacts';
        
        console.log(`[Database] Querying: ${dbName}.${collName}`);
        
        // Strict Fetch
        const contacts = await Contact.find({});
        
        console.log(`[Database] Result: Found ${contacts.length} records in ${dbName}.${collName}`);

        if (contacts.length === 0) {
            console.error('[Database] CRITICAL: 0 records returned. Check Atlas collection.');
            return res.status(404).json({ 
                error: 'REGISTRY EMPTY', 
                message: `No records found in ${dbName}.${collName}. Check Atlas.` 
            });
        }

        res.json(contacts);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllContacts
};
