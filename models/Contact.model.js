const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  }, 
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String, 
    trim: true
  },
  service: {
    type: String,
    required: [true, 'Service is required'],
    enum: [
      'Link Building',
      'Content Marketing',
      'Technical SEO',
      'Local SEO',
      'E-commerce SEO',
      'Enterprise SEO',
      'SEO Audit',
      'Digital PR'
    ]
  },
  budget: {
    type: String,
    enum: [
      '$5,000 - $10,000',
      '$10,000 - $25,000',
      '$25,000 - $50,000',
      '$50,000 - $100,000',
      '$100,000+',
      ''
    ]
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'closed'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for faster queries
contactSchema.index({ email: 1, createdAt: -1 });

// Pre-save hook for debugging
contactSchema.pre('save', function(next) {
  console.log('🔍 Contact model pre-save hook triggered');
  console.log('   Saving contact:', this.name, this.email);
  next();
});

// Post-save hook for debugging
contactSchema.post('save', function(doc) {
  console.log('✅ Contact model post-save hook triggered');
  console.log('   Saved document ID:', doc._id);
});

const Contact = mongoose.model('Contact', contactSchema);

console.log('📦 Contact model loaded');

module.exports = Contact;