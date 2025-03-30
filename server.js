import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxTVzx8ijYlheZsMte3f_QYEcwHRixyt4YwqtJX43IR0-m386kqa5obaRMdc_kzdblg8g/exec"; // Replace this

app.post("/proxy", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching from Google Script:", error);
    res.status(500).json({ error: "Failed to fetch from Google Apps Script" });
  }
});

// Add a status route
app.get("/", (req, res) => {
  res.send("Render Proxy API is running! Use POST /proxy");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
