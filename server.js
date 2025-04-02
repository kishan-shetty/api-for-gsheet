import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 10000;

// Google Apps Script Web App URL (Replace with actual URL)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHGHFACC4NjC6ivTnhLZq4DxusMPqXpyELIZ-KiCjIwebpe_nudqCSR2nOoXmfOnLq/exec';
const GOOGLE_SCRIPT_2URL = 'https://script.google.com/macros/s/AKfycbw36bWg50iyj5wSm9f80cPJx2M691wI1w_9Sh3SeCuKLYEpq9tscjpnOHSroUhpVdJG/exec';

// Middleware
app.use(cors());
app.use(express.json());

// Get all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const { data } = await axios.get(GOOGLE_SCRIPT_URL, {
      params: { action: 'getCandidates' },
    });
    res.json(data);
    console.log('API Response:', data);
  } catch (error) {
    console.error('Error fetching candidates:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
  }
});

// Update candidate status
app.post('/api/update-candidate', async (req, res) => {
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
app.post('/api/send-reminders', async (req, res) => {
  try {
    const { days, batch } = req.body;
    if (!days || !batch) return res.status(400).json({ error: 'Missing required fields' });

    const { data } = await axios.post(GOOGLE_SCRIPT_2URL, {
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
