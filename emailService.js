// Install: npm install nodemailer
const nodemailer = require('nodemailer');

// --- EMAIL HTML TEMPLATES (Defined below in Section 2) ---
const { generateBookingHtml, generateReviewHtml } = require('./emailTemplates'); // Assume you save the templates in a separate file

/**
 * Sends a structured email based on form type and data.
 * This function should run on your secure backend server.
 *
 * @param {string} formType - Either 'booking' or 'review'.
 * @param {Object} formData - The structured data submitted from the form.
 * @returns {Promise<void>} - Resolves if the email is sent successfully.
 */
function sendSimphiweFormEmail(formType, formData) {
    return new Promise(async (resolve, reject) => {
        let subject = '';
        let htmlBody = '';

        // 1. Determine Subject and HTML Content based on Form Type
        if (formType === 'booking') {
            subject = `NEW BOOKING REQUEST: ${formData.name} (${formData.checkin} - ${formData.checkout})`;
            htmlBody = generateBookingHtml(formData);
        } else if (formType === 'review') {
            subject = `NEW GUEST REVIEW: ${formData.satisfaction} Stars by ${formData.name}`;
            htmlBody = generateReviewHtml(formData);
        } else {
            return reject(new Error('Invalid form type provided.'));
        }
        
        // IMPORTANT: Use environment variables for security!
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Or 'SendGrid', 'Mailgun', etc.
            auth: {
                user: process.env.EMAIL_USER, // e.g., 'your.sending.email@gmail.com'
                pass: process.env.EMAIL_PASS  // Your App Password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'mrcypher68@gmail.com', // The guesthouse's receiving email
            subject: subject,
            html: htmlBody,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email Sent: ${info.messageId} (Type: ${formType})`);
            resolve();
        } catch (error) {
            console.error(`Email Error (${formType}):`, error);
            reject(new Error(`Failed to send email: ${error.message}`));
        }
    });
}

module.exports = { sendSimphiweFormEmail };