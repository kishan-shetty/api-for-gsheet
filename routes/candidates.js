import express from 'express';
import axios from 'axios';

const router = express.Router();

// Google Apps Script Web App URL (Replace with actual URL)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwEKwRW6bY7GUuvXrXgU6AhhCFztUIqRmTN3-y2afyZhPWvW1ozIsOUBqrLsrCDhyXvSA/exec';

// Get all candidates
router.get('/candidates', async (req, res) => {
  try {
    const { data } = await axios.get(GOOGLE_SCRIPT_URL, {
      params: { action: 'getCandidates' },
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching candidates:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
  }
});

// Update candidate status
router.post('/update-candidate', async (req, res) => {
  try {
    const { id, field, value } = req.body;
    if (!id || !field) return res.status(400).json({ error: 'Missing required fields' });

    const { data } = await axios.post(GOOGLE_SCRIPT_URL, {
      action: 'updateCandidate',
      id,
      field,
      value,
    });

    res.json(data);
  } catch (error) {
    console.error('Error updating candidate:', error.message);
    res.status(500).json({ error: 'Failed to update data in Google Sheets' });
  }
});

// Send reminder emails
router.post('/send-reminders', async (req, res) => {
  try {
    const { days, batch } = req.body;
    if (!days || !batch) return res.status(400).json({ error: 'Missing required fields' });

    const { data } = await axios.post(GOOGLE_SCRIPT_URL, {
      action: 'sendReminders',
      days,
      batch,
    });

    res.json(data);
  } catch (error) {
    console.error('Error sending reminders:', error.message);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

export default router;
