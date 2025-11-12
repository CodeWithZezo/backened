const nodemailer = require('nodemailer');
require('dotenv').config();

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

console.log('Email Config:', {
  user: user ? '✓ Set' : '✗ Not set',
  pass: pass ? '✓ Set' : '✗ Not set'
});

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.log('Check your EMAIL_USER and EMAIL_PASS in .env file');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"GetMeLinks Contact" <${process.env.EMAIL_USER}>`,
      to: options.to || 'stellarlinksbulding@gmail.com',
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo
    };

    console.log('📧 Attempting to send email to:', mailOptions.to);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('Response:', info.response);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

// Email template for contact form
const contactFormTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .label { font-weight: bold; color: #1e293b; margin-bottom: 5px; }
        .value { color: #475569; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #64748b; font-size: 14px; }
        .badge { display: inline-block; padding: 5px 12px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎯 New Contact Form Submission</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">GetMeLinks Contact Page</p>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">👤 Name</div>
            <div class="value">${data.name}</div>
          </div>
          
          <div class="field">
            <div class="label">📧 Email</div>
            <div class="value">${data.email}</div>
          </div>
          
          ${data.phone ? `
          <div class="field">
            <div class="label">📱 Phone</div>
            <div class="value">${data.phone}</div>
          </div>
          ` : ''}
          
          ${data.company ? `
          <div class="field">
            <div class="label">🏢 Company</div>
            <div class="value">${data.company}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <div class="label">🎯 Service Interested In</div>
            <div class="value"><span class="badge">${data.service}</span></div>
          </div>
          
          ${data.budget ? `
          <div class="field">
            <div class="label">💰 Budget</div>
            <div class="value">${data.budget}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <div class="label">💬 Message</div>
            <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
          </div>
          
          <div class="field" style="border-left-color: #10b981;">
            <div class="label">🕐 Submitted At</div>
            <div class="value">${new Date().toLocaleString('en-US', { 
              dateStyle: 'full', 
              timeStyle: 'long' 
            })}</div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Quick Actions:</strong></p>
          <p>Reply directly to this email to contact: <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p>Or call: ${data.phone}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  transporter,
  sendEmail,
  contactFormTemplate
};