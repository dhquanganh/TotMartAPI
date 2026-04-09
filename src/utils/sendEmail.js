
require('dotenv').config();

// services/emailService.js
const { BrevoClient } = require('@getbrevo/brevo')

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
    timeoutInSeconds: 60
})
const sendEmailWithBrevo = async (toEmail, subject, htmlContent) => {
    try {
        const data = await brevo.transactionalEmails.sendTransacEmail({
            subject: subject,
            htmlContent: htmlContent,
            sender: { name: "TotMart", email: process.env.FROM_EMAIL },
            to: [{ email: toEmail }]
        });
        console.log('Email sent successfully. MessageId: ' + data.messageId);
        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmailWithBrevo;
