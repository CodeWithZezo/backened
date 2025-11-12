const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact.model');
const { sendEmail, contactFormTemplate } = require('../config/email');

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  console.log('📝 Contact form submission received');
  console.log('Request body:', req.body);
  
  try {
    const { name, email, phone, company, service, budget, message } = req.body;

    // Validate required fields
    if (!name || !email || !service || !message) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: name, email, service, and message'
      });
    }

    console.log('✅ Validation passed');
    
    // Check MongoDB connection
    const mongoose = require('mongoose');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB is not connected!');
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }

    console.log('✅ MongoDB is connected');

    // Create contact in database
    console.log('💾 Attempting to save to database...');
    
    const contactData = {
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      service,
      budget: budget || undefined,
      message
    };
    
    console.log('Contact data to save:', contactData);
    
    const contact = await Contact.create(contactData);
    
    console.log('✅ Contact saved to database successfully!');
    console.log('Saved contact ID:', contact._id);
    console.log('Full saved contact:', contact);

    // Send email notification
    console.log('📧 Attempting to send email notification...');
    try {
      await sendEmail({
        to: 'codewithzezo@gmail.com',
        subject: `New Contact Form Submission - ${service}`,
        html: contactFormTemplate({
          name,
          email,
          phone,
          company,
          service,
          budget,
          message
        }),
        replyTo: email
      });
      console.log('✅ Email notification sent');
    } catch (emailError) {
      console.error('⚠️ Email send error (continuing anyway):', emailError.message);
      // Don't fail the request if email fails, contact is already saved
    }

    console.log('🎉 Contact form submission completed successfully');
    
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you within 24 hours.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        service: contact.service,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error('❌ MongoDB error detected');
      return res.status(500).json({
        success: false,
        message: 'Database error. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/contact - Get all contacts (admin only - add auth middleware later)
router.get('/', async (req, res) => {
  console.log('📋 Fetching all contacts...');
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`✅ Found ${contacts.length} contacts`);

    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts'
    });
  }
});

// GET /api/contact/:id - Get single contact
router.get('/:id', async (req, res) => {
  console.log('📄 Fetching contact:', req.params.id);
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      console.log('❌ Contact not found');
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    console.log('✅ Contact found:', contact);

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('❌ Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact'
    });
  }
});

// PATCH /api/contact/:id/status - Update contact status
router.patch('/:id/status', async (req, res) => {
  console.log('🔄 Updating contact status:', req.params.id);
  try {
    const { status } = req.body;

    if (!['new', 'contacted', 'in-progress', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    console.log('✅ Status updated successfully');

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('❌ Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    });
  }
});

module.exports = router;