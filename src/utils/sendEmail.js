const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    try {
        // Create a transporter using your email service details
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Standard configuration for Gmail
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Define email options
        const mailOptions = {
            from: `TotMart <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            // You can also provide an html property if you want HTML emails
            html: options.html
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${options.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent.');
    }
};

module.exports = sendEmail;
