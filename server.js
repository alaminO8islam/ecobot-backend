const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `
You are EcoBot, an ethical assistant for a sustainability dashboard. Help users track carbon emissions, vitamin D from sunlight, UV index, and give daily eco tips. Always be polite and helpful.
`;

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

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ reply: "❌ Invalid response from OpenRouter." });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ reply: "⚠️ Server error. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ EcoBot backend is running on http://localhost:${PORT}`);
});
