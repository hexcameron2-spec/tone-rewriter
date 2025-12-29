import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, tones = [], options = {} } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing text" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Rewrite the following text into multiple tones.
Return ONLY valid JSON.

Text:
"${text}"

Tones:
${tones.join(", ")}

Options:
${JSON.stringify(options)}

JSON format:
{
  "rewrites": [
    { "tone": "tone name", "text": "rewritten text" }
  ]
}
`;

    const r = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.6
    });

    const out = r.output_text.trim();
    const json = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));

    res.status(200).json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Rewrite failed" });
  }
}
