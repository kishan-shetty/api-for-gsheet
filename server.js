// EXPRESS.JS PROXY SERVER
// server.js - Deploy this to Render

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Replace with your actual Apps Script Web App URL after deployment
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec';

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

// GOOGLE APPS SCRIPT CODE
// Code.gs - Paste this into your Google Sheet's Script Editor

// Global variables
const SHEET_NAME = "Candidates";
const STATUS_FIELDS = ["whatsappMsg", "phoneEnquiry", "online", "program"];

// Web app doGet and doPost functions to handle requests
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getCandidates') {
    return ContentService.createTextOutput(JSON.stringify(getCandidates()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  if (action === 'updateCandidate') {
    return ContentService.createTextOutput(JSON.stringify(
      updateCandidate(data.id, data.field, data.value)
    )).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'sendReminders') {
    return ContentService.createTextOutput(JSON.stringify(
      sendReminders(data.days, data.batch)
    )).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Get all candidates with their data
function getCandidates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const candidates = [];
  
  // Find indices for status fields (they might be added later)
  const whatsappMsgIndex = headers.indexOf('whatsappMsg');
  const phoneEnquiryIndex = headers.indexOf('phoneEnquiry');
  const onlineIndex = headers.indexOf('online');
  const programIndex = headers.indexOf('program');
  
  // Add these fields if they don't exist
  let sheetUpdated = false;
  if (whatsappMsgIndex === -1) {
    headers.push('whatsappMsg');
    sheetUpdated = true;
  }
  if (phoneEnquiryIndex === -1) {
    headers.push('phoneEnquiry');
    sheetUpdated = true;
  }
  if (onlineIndex === -1) {
    headers.push('online');
    sheetUpdated = true;
  }
  if (programIndex === -1) {
    headers.push('program');
    sheetUpdated = true;
  }
  
  // Update sheet headers if needed
  if (sheetUpdated) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // Process each row (skipping header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const candidate = {};
    
    // Add id for reference (using row number)
    candidate.id = i;
    
    // Map all fields from headers
    for (let j = 0; j < headers.length; j++) {
      const field = headers[j];
      candidate[field] = j < row.length ? row[j] : '';
      
      // Set default values for status fields if empty
      if (STATUS_FIELDS.includes(field) && !candidate[field]) {
        if (field === 'whatsappMsg') candidate[field] = 'pending';
        else if (field === 'phoneEnquiry') candidate[field] = 'not done';
        else if (field === 'online') candidate[field] = 'absent';
        else if (field === 'program') candidate[field] = 'ghosted';
      }
    }
    
    candidates.push(candidate);
  }
  
  return candidates;
}

// Update candidate status
function updateCandidate(id, field, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Find column index for the field
  const fieldIndex = headers.indexOf(field);
  
  if (fieldIndex === -1) {
    // Field doesn't exist, add it
    const newFieldIndex = headers.length + 1;
    sheet.getRange(1, newFieldIndex).setValue(field);
    sheet.getRange(id + 1, newFieldIndex).setValue(value);
  } else {
    // Update existing field
    sheet.getRange(id + 1, fieldIndex + 1).setValue(value);
  }
  
  return { success: true, message: 'Updated successfully' };
}

// Send reminder emails to candidates
function sendReminders(days, batch) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices
  const emailIndex = headers.indexOf('emailId');
  const nameIndex = headers.indexOf('fullName');
  const batchIndex = headers.indexOf('batch');
  
  if (emailIndex === -1 || nameIndex === -1 || batchIndex === -1) {
    return { error: 'Required columns not found' };
  }
  
  let emailsSent = 0;
  
  // Process each row (skipping header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Check if candidate belongs to the specified batch
    if (row[batchIndex] === batch) {
      const email = row[emailIndex];
      const name = row[nameIndex];
      
      if (email) {
        sendReminderEmail(email, name, batch, days);
        emailsSent++;
      }
    }
  }
  
  return { 
    success: true, 
    message: `Sent ${emailsSent} reminder emails for ${batch} (${days} days reminder)` 
  };
}

// Function to send individual email
function sendReminderEmail(email, name, batch, days) {
  const subject = `Reminder: Your internship program starts in ${days} days`;
  
  const body = `
Dear ${name},

This is a friendly reminder that your internship program (${batch}) will start in ${days} days.

Please ensure you have completed all the pre-program requirements and are ready to join.

If you have any questions, please reply to this email.

Best regards,
Internship Team
  `;
  
  try {
    GmailApp.sendEmail(email, subject, body);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error}`);
    return false;
  }
}
