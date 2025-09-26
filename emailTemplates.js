// emailTemplates.js

/**
 * Calculates the number of nights between a check-in and check-out date string (YYYY-MM-DD).
 * @param {string} checkinDate - The check-in date string.
 * @param {string} checkoutDate - The check-out date string.
 * @returns {number} - The number of nights.
 */
const calculateNights = (checkinDate, checkoutDate) => {
    // 1. Create Date objects (using UTC to prevent timezone issues)
    const checkin = new Date(checkinDate + 'T00:00:00Z');
    const checkout = new Date(checkoutDate + 'T00:00:00Z');

    // 2. Calculate the difference in milliseconds
    const timeDiff = checkout.getTime() - checkin.getTime();

    // 3. Convert milliseconds to days (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

    // Ensure it's an integer representing whole nights
    return Math.round(dayDiff);
};


const generateBookingHtml = (data) => {
    // CALCULATE NIGHTS HERE:
    const nightsRequested = calculateNights(data.checkin, data.checkout);

    // Helper function to render a single row of data
    const row = (label, value, isPrimary = false) => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 40%; font-weight: 500;">${label}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 60%; color: ${isPrimary ? '#004d40' : '#333'}; font-weight: ${isPrimary ? 'bold' : 'normal'};">${value}</td>
        </tr>
    `;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #00796b; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🛏️ NEW GUEST BOOKING REQUEST 🛎️</h1>
            </div>
            <div style="padding: 20px;">
                <p style="font-size: 16px; color: #555;">
                    A new booking request has been submitted through the Simphiwe Guesthouse website. Please review the details below and follow up with the guest immediately.
                </p>

                <h2 style="color: #00796b; border-bottom: 2px solid #00796b; padding-bottom: 5px;">Guest & Stay Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    ${row('Full Name', data.name)}
                    ${row('Email Address', `<a href="mailto:${data.email}" style="color: #004d40;">${data.email}</a>`)}
                    ${data.phone ? row('Phone Number', `<a href="tel:${data.phone}" style="color: #004d40;">${data.phone}</a>`) : ''}
                    ${row('Check-in Date', data.checkin, true)}
                    ${row('Check-out Date', data.checkout, true)}
                    ${row('Nights Requested', nightsRequested, true)} 
                    ${row('Number of Guests', data.guests)}
                    ${row('Room Preference', data.room || 'No Preference')}
                </table>
                
                ${data.message ? `
                    <h2 style="color: #00796b; border-bottom: 2px solid #00796b; padding-bottom: 5px; margin-top: 20px;">Special Requests</h2>
                    <p style="padding: 15px; border: 1px dashed #ccc; background-color: #f9f9f9; white-space: pre-wrap;">${data.message}</p>
                ` : ''}

                <div style="text-align: center; margin-top: 30px;">
                    <a href="mailto:${data.email}" style="display: inline-block; padding: 12px 25px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                        CLICK HERE TO RESPOND
                    </a>
                </div>
            </div>
            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                <p style="margin: 0;">Simphiwe Guesthouse | Manzini, Eswatini | +268 7665 5974</p>
            </div>
        </div>
    `;
};

// emailTemplates.js

const generateReviewHtml = (data) => {
    // Helper function to render a star rating
    const starRating = (rating) => '⭐'.repeat(parseInt(rating)) + '☆'.repeat(5 - parseInt(rating));

    // Helper function to render a row for the review
    const reviewRow = (label, value) => `
        <div style="margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dotted #e0e0e0;">
            <strong style="color: #004d40;">${label}:</strong> ${value}
        </div>
    `;
    
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🎉 NEW GUEST REVIEW SUBMITTED 🎉</h1>
            </div>
            <div style="padding: 20px;">
                <p style="font-size: 16px; color: #555;">
                    A guest has provided feedback on their stay. Thank you for collecting this valuable data!
                </p>

                <h2 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Overall Feedback</h2>
                <div style="text-align: center; background-color: #f3fff3; border: 1px solid #4CAF50; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="font-size: 18px; margin: 5px 0;"><strong>Overall Satisfaction:</strong></p>
                    <p style="font-size: 30px; margin: 5px 0; color: #ff9800;">
                        ${starRating(data.satisfaction)}
                    </p>
                    <p style="font-size: 14px; margin: 5px 0; color: #004d40;">
                        Recommended: <strong>${data.recommend === 'yes' ? 'YES' : data.recommend.toUpperCase()}</strong>
                    </p>
                </div>

                <h2 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; margin-top: 20px;">Detailed Ratings</h2>
                ${reviewRow('Room Cleanliness', data.cleanliness)}
                ${reviewRow('Staff Service', data.service)}
                ${reviewRow('Reviewer Name', data.name)}
                ${reviewRow('Reviewer Email', `<a href="mailto:${data.email}" style="color: #004d40;">${data.email}</a>`)}

                ${data.comments ? `
                    <h2 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; margin-top: 20px;">Guest Comments</h2>
                    <p style="padding: 15px; border: 1px dashed #d4edda; background-color: #f7fcf7; white-space: pre-wrap;">${data.comments}</p>
                ` : ''}

                ${data.problems || data.improvements ? `
                    <h2 style="color: #ff5722; border-bottom: 2px solid #ff5722; padding-bottom: 5px; margin-top: 20px;">🚨 Areas for Attention</h2>
                    ${data.problems ? `<p><strong>Problems Reported:</strong><br>${data.problems}</p>` : ''}
                    ${data.improvements ? `<p><strong>Suggested Improvements:</strong><br>${data.improvements}</p>` : ''}
                ` : ''}

                <div style="text-align: center; margin-top: 30px;">
                    <a href="mailto:${data.email}?subject=Re:%20Thank%20You%20for%20Your%20Review%20of%20Simphiwe%20Guesthouse" style="display: inline-block; padding: 12px 25px; background-color: #00796b; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                        CLICK HERE TO REPLY TO THE GUEST
                    </a>
                </div>
            </div>
            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                <p style="margin: 0;">Simphiwe Guesthouse | Manzini, Eswatini</p>
            </div>
        </div>
    `;
};

module.exports = {
    generateBookingHtml,
    generateReviewHtml,
};