// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// System behavior prompt
const SYSTEM_PROMPT = `
You are EcoBot, an ethical assistant for a sustainability dashboard. You help users track carbon emissions, vitamin D from sunlight, UV index, and give daily eco tips. Always be friendly and polite.
`;

// Main chat route
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "mistralai/mixtral-8x7b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ]
  })
});

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "⚠️ Server error. Please try again later." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ EcoBot backend running at http://localhost:${PORT}`);
});
