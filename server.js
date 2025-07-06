const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `
You are EcoBot, a helpful, ethical assistant for a sustainability dashboard. You guide users on carbon footprint, UV index, vitamin D from sunlight, and eco-friendly habits. Respond warmly, clearly, and concisely.
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

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.delta?.content ||
      "⚠️ AI did not return a message.";

    res.json({ reply });
  } catch (error) {
    console.error("❌ Backend Error:", error.message);
    res.status(500).json({ reply: "⚠️ Server error. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ EcoBot backend running at http://localhost:${PORT}`);
});
