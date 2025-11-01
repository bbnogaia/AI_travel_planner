import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const { destination, days, interests } = req.body || {};

  if (!destination || !days) {
    return res
      .status(400)
      .json({ error: "destination e days sono obbligatori" });
  }

  const prompt = `
Crea un piano di viaggio di ${days} giorni a ${destination},
concentra il piano su: ${
    Array.isArray(interests) ? interests.join(", ") : interests
  }.
Includi per ogni giorno: colazione, pranzo, cena e 2-3 attività principali.
Rispondi in formato JSON valido: un array di oggetti con campi "giorno", "attivita", "descrizione".
Esempio:
[
  {"giorno": 1, "attivita": "Visita al museo", "descrizione": "..." },
  ...
]
  `;

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.8,
    });

    let text = "";
    if (response.output && response.output.length > 0) {
      text = response.output
        .map((o) => {
          if (!o.content) return "";
          return o.content.map((c) => c.text || "").join("");
        })
        .join("\n");
    }

    if (!text && response.output_text) text = response.output_text;

    if (!text) {
      return res.status(500).json({
        error: "OpenAI returned an unexpected response format",
        raw: response,
      });
    }

    try {
      const parsed = JSON.parse(text);
      res.status(200).json({ itinerary: parsed });
    } catch {
      res.status(200).json({ itinerary: text });
    }
  } catch (err) {
    console.error("Errore /api/itinerary:", err);
    res.status(500).json({
      error: "Errore nella generazione del piano",
      detail: err.message || err,
    });
  }
}
