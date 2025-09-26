// server.js (Your main Express API file)

// 1. Dependencies and Imports
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');

// Import your existing email logic
// NOTE: Ensure node.js exports the function and emailTemplates.js is in the same directory
const { sendSimphiweFormEmail } = require('./emailService'); 

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middleware Setup
// Use cors to allow your client (e.g., localhost:8080) to talk to the server (e.g., localhost:3000)
// For development, use: 
app.use(cors()); 

// Middleware to parse incoming JSON data (which the frontend will send)
app.use(express.json());

// 3. API Route Definition
app.post('/api/send-email', async (req, res) => {
    // req.body contains the JSON data sent from the client-side fetch()
    const formData = req.body;
    
    // Simple validation to ensure the form type is included
    if (!formData || !formData.type) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid request: Form type is missing.' 
        });
    }

    try {
        // Call your existing server-side logic from node.js
        await sendSimphiweFormEmail(formData.type, formData);
        
        // Success response
        res.status(200).json({ 
            status: 'success', 
            message: `${formData.type} email sent successfully.` 
        });

    } catch (error) {
        console.error(`API Error sending ${formData.type} email:`, error);
        
        // Error response
        res.status(500).json({ 
            status: 'error', 
            message: `Failed to send ${formData.type} request. Please check server logs.` 
        });
    }
});

// Basic check route (optional)
app.get('/', (req, res) => {
    res.send('Simphiwe Guesthouse Email API is running.');
});

// 4. Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});