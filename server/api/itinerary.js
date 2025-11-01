import OpenAI from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo non consentito" });
    return;
  }

  try {
    const { destination, days, interests } = req.body || {};

    if (!destination || !days) {
      return res
        .status(400)
        .json({ error: "destination e days sono obbligatori" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Crea un piano di viaggio di ${days} giorni a ${destination},
concentra il piano su: ${
      Array.isArray(interests) ? interests.join(", ") : interests
    }.
Includi per ogni giorno: colazione, pranzo, cena e 2-3 attività principali.
Rispondi in formato JSON valido.
    `;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text || "";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    return res.status(200).json({ itinerary: parsed });
  } catch (err) {
    console.error("Errore interno /api/itinerary:", err);
    return res.status(500).json({
      error: "Errore nella generazione del piano",
      detail: err.message || err,
    });
  }
}
