const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Replace with your actual Apps Script Web App URL after deployment
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwEKwRW6bY7GUuvXrXgU6AhhCFztUIqRmTN3-y2afyZhPWvW1ozIsOUBqrLsrCDhyXvSA/exec';

// Endpoint to get all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const response = await axios.get(GOOGLE_SCRIPT_URL, {
      params: { action: 'getCandidates' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
  }
});

// Endpoint to update candidate status
app.post('/api/update-candidate', async (req, res) => {
  try {
    const { id, field, value } = req.body;
    
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: 'updateCandidate',
      id,
      field,
      value
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update data in Google Sheets' });
  }
});

// Endpoint to send reminder emails
app.post('/api/send-reminders', async (req, res) => {
  try {
    const { days, batch } = req.body;
    
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      action: 'sendReminders',
      days,
      batch
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
