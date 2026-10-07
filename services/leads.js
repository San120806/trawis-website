const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const dataDir = path.join(__dirname, '../data');
const fallbackFile = path.join(dataDir, 'meeting_requests.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure fallback JSON exists
if (!fs.existsSync(fallbackFile)) {
  fs.writeFileSync(fallbackFile, JSON.stringify([], null, 2));
}

/**
 * Saves a meeting request both in PostgreSQL and locally in JSON fallback
 */
async function saveMeetingRequest({ name, company, jobTitle, email, phone, notes, eventSource }) {
  const timestamp = new Date().toISOString();
  const record = {
    name,
    company,
    jobTitle,
    email,
    phone,
    notes: notes || '',
    eventSource: eventSource || 'Energy Trading Week Americas 2026',
    created_at: timestamp
  };

  // 1. Always append to local JSON store (Guaranteed local DB persistence)
  try {
    let list = [];
    if (fs.existsSync(fallbackFile)) {
      const content = fs.readFileSync(fallbackFile, 'utf8');
      list = content ? JSON.parse(content) : [];
    }
    record.id = list.length + 1;
    list.unshift(record);
    fs.writeFileSync(fallbackFile, JSON.stringify(list, null, 2));
    console.log(`[Leads Store] Saved meeting request locally for ${name} (${company})`);
  } catch (fileErr) {
    console.error('[Leads Store] Error saving to fallback JSON:', fileErr.message);
  }

  // 2. Try inserting into PostgreSQL if table exists and DB connected
  try {
    // Attempt auto-migration of table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS meeting_requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        notes TEXT,
        event_source VARCHAR(100) DEFAULT 'Energy Trading Week Americas 2026',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    const query = `
      INSERT INTO meeting_requests (name, company, job_title, email, phone, notes, event_source)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await db.query(query, [
      name,
      company,
      jobTitle,
      email,
      phone,
      notes || null,
      eventSource || 'Energy Trading Week Americas 2026'
    ]);
    console.log(`[Leads Store] Inserted into PostgreSQL meeting_requests ID: ${result.rows[0].id}`);
    return result.rows[0];
  } catch (dbErr) {
    console.warn('[Leads Store] PostgreSQL unavailable or query failed, safely recorded in local storage:', dbErr.message);
    return record;
  }
}

/**
 * Retrieves all meeting requests (from DB with fallback to JSON)
 */
async function getAllMeetingRequests() {
  try {
    const result = await db.query('SELECT * FROM meeting_requests ORDER BY created_at DESC');
    return result.rows;
  } catch (err) {
    if (fs.existsSync(fallbackFile)) {
      return JSON.parse(fs.readFileSync(fallbackFile, 'utf8') || '[]');
    }
    return [];
  }
}

module.exports = {
  saveMeetingRequest,
  getAllMeetingRequests
};
