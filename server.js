import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxTVzx8ijYlheZsMte3f_QYEcwHRixyt4YwqtJX43IR0-m386kqa5obaRMdc_kzdblg8g/exec"; // Replace this

app.post("/proxy", async (req, res) => {
  try {
    console.log("Received request:", req.body);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text(); // Get raw text response
    console.log("Raw Response from Google Script:", text); // Log raw response

    try {
      const data = JSON.parse(text); // Try to parse JSON
      res.status(200).json(data);
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      res.status(500).json({ error: "Invalid JSON response", raw: text });
    }

  } catch (error) {
    console.error("Error in /proxy route:", error);
    res.status(500).json({ error: error.message });
  }
});


// Add a status route
app.get("/", (req, res) => {
  res.send("Render Proxy API is running! Use POST /proxy");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
