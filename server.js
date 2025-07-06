const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `
You are EcoBot, an ethical assistant for a sustainability dashboard. You help users reduce carbon emissions, track vitamin D from sunlight, and suggest eco-friendly lifestyle tips. Be concise, positive, and helpful.
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
        model: "openchat/openchat-3.5-0106",  // ✅ stable model
        stream: false,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      data?.choices?.[0]?.delta?.content?.trim() ||
      data?.choices?.[0]?.text?.trim() ||
      "⚠️ AI did not return a usable message.";

    res.json({ reply });
  } catch (error) {
    console.error("❌ Backend Error:", error.message);
    res.status(500).json({ reply: "⚠️ Server error. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ EcoBot backend running at http://localhost:${PORT}`);
});
