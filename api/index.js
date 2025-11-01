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

  const interestList = Array.isArray(interests)
    ? interests.join(", ")
    : interests;

  const systemInstruction = `
    Sei un Travel Planner esperto. Rispondi SOLO con un array di oggetti JSON validi:
    [{"giorno": 1, "attivita": "Nome Attività", "descrizione": "Descrizione Dettagliata"}, ...]
  `;

  const userPrompt = `
    Crea un itinerario di ${days} giorni a ${destination}.
    Concentra il piano su: ${interestList}.
    Includi colazione, pranzo, cena e 2-3 attività principali per giorno.
    Rispondi SOLO con un array JSON come richiesto.
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
    });

    const jsonString = response.choices[0].message.content.trim();
    const itineraryData = JSON.parse(jsonString);

    res.status(200).json({ itinerary: itineraryData });
  } catch (err) {
    console.error("Errore /api/index.js:", err);
    res.status(500).json({
      error: "Errore nella generazione del piano",
      detail: err.message || "Verifica la tua OPENAI_API_KEY su Vercel.",
    });
  }
}
