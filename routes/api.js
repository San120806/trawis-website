const express = require('express');
const router = express.Router();
const { saveMeetingRequest } = require('../services/leads');
const { sendMeetingNotification } = require('../services/mailer');

/**
 * POST /api/book-meeting
 * Handles "Book a Meet" / "Schedule a Meeting" submissions
 */
router.post('/book-meeting', async (req, res) => {
  try {
    const { name, company, jobTitle, email, phone, notes, eventSource } = req.body;

    // Validation
    if (!name || !company || !jobTitle || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Company, Job Title, Work Email, and Phone Number.'
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid work email address.'
      });
    }

    const payload = {
      name: name.trim(),
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      notes: notes ? notes.trim() : '',
      eventSource: eventSource ? eventSource.trim() : 'Energy Trading Week Americas 2026'
    };

    // 1. Save locally in DB & JSON store
    const savedRecord = await saveMeetingRequest(payload);

    // 2. Dispatch email to sales@bluwis.com via Nodemailer
    const mailResult = await sendMeetingNotification(payload);

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your meeting request has been submitted successfully. The BluWis and TraWis team will be in touch shortly to coordinate your schedule.',
      recordId: savedRecord ? savedRecord.id : null,
      emailDispatched: mailResult.success
    });
  } catch (error) {
    console.error('[API /book-meeting] Error handling submission:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your request. Please try again or reach out directly to sales@bluwis.com.'
    });
  }
});

module.exports = router;
