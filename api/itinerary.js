import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

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
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.8,
    });

    let text = "";
    if (response.output && response.output.length > 0) {
      text = response.output
        .map((o) => (o.content || []).map((c) => c.text || "").join(""))
        .join("\n");
    } else if (response.output_text) {
      text = response.output_text;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    res.status(200).json({ itinerary: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Errore nella generazione del piano",
      detail: err.message,
    });
  }
}
