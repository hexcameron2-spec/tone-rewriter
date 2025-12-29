import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, tones = [], options = {} } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.6,
      input: [
        {
          role: "system",
          content: "You rewrite text into different tones. Respond ONLY with valid JSON."
        },
        {
          role: "user",
          content: JSON.stringify({
            text,
            tones,
            options,
            output_format: {
              rewrites: [{ tone: "string", text: "string" }]
            }
          })
        }
      ]
    });

    // ✅ SAFE extraction
    const outputText = response.output_text;

    if (!outputText) {
      return res.status(500).json({ error: "No output from model" });
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch (err) {
      return res.status(500).json({
        error: "Model did not return valid JSON",
        raw: outputText
      });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
