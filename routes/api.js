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
    const { name, company, jobTitle, email, phone, notes, eventSource, preferredDate, preferredTimeSlot, interest } = req.body;

    // Validation
    if (!name || !company || !jobTitle || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Company, Job Title, Work Email, and Phone Number.'
      });
    }

    // Strict email format check
    const emailStrictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailStrictRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid work email address (e.g. name@company.com).'
      });
    }

    // Strict phone number format check: must have country code (+) and strictly 10 digits
    const cleanPhone = phone.trim();
    const phoneStrictRegex = /^\+[1-9]\d{0,3}\s?[0-9]{10}$/;
    if (!phoneStrictRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number with country code and strictly 10 digits (e.g. +1 7135550199).'
      });
    }

    const slotPart = (preferredDate && preferredTimeSlot ? `${preferredDate} • ${preferredTimeSlot}` : (preferredDate || preferredTimeSlot || ''));
    const interestPart = interest ? `Focus: ${interest.trim()}` : '';
    const formattedNotes = notes
      ? notes.trim()
      : [interestPart, slotPart].filter(Boolean).join(' | ');

    const payload = {
      name: name.trim(),
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      preferredDate: preferredDate ? preferredDate.trim() : '',
      preferredTimeSlot: preferredTimeSlot ? preferredTimeSlot.trim() : '',
      notes: formattedNotes,
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
