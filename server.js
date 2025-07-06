const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `
You are EcoBot, a helpful, ethical assistant for a sustainability dashboard. Help users understand carbon emissions, vitamin D from sunlight, UV index, and provide eco-friendly suggestions. Keep your answers simple, warm, and factual.
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
        model: "openai/gpt-3.5-turbo", // ✅ use stable model
        stream: false,                 // ✅ ensures full response in .message.content
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });

    const data = await response.json();

    // ✅ Safe fallback if message is empty
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("OpenRouter returned empty content:", JSON.stringify(data));
      return res.status(500).json({ reply: "⚠️ AI did not return a usable message." });
    }

    res.json({ reply });
  } catch (error) {
    console.error("SERVER ERROR:", error.message);
    res.status(500).json({ reply: "⚠️ Server error. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ EcoBot backend running at http://localhost:${PORT}`);
});
