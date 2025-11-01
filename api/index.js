import OpenAI from "openai";

const client = new OpenAI({});

export default async function handler(req, res) {
  // 1. Validazione Metodo e Dati
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const { destination, days, interests } = req.body || {};

  if (!destination || !days) {
    return res
      .status(400)
      .json({ error: "destination e days sono obbligatori" });
  }

  // 2. Istruzione di Sistema e Prompt Utente
  const interestList = Array.isArray(interests)
    ? interests.join(", ")
    : interests;

  const systemInstruction = `
    Sei un Travel Planner esperto. Il tuo compito è creare un itinerario di viaggio dettagliato.
    Rispondi ESCLUSIVAMENTE con un array di oggetti JSON validi.
    Il JSON DEVE aderire alla seguente struttura: [{"giorno": 1, "attivita": "Nome Attività", "descrizione": "Descrizione Dettagliata"}, ...]
    Assicurati che l'output sia solo JSON, senza preamboli, spiegazioni o markdown.
  `;

  const userPrompt = `
    Crea un itinerario di viaggio di ${days} giorni a ${destination}.
    Concentra il piano sugli interessi: ${interestList}.
    Includi per ogni giorno: colazione, pranzo, cena e 2-3 attività principali,
    ma formatta TUTTO il contenuto come un unico array di oggetti JSON come richiesto dalla istruzione di sistema.
  `;

  try {
    // 3. Chiamata all'API OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const jsonString = response.choices[0].message.content.trim();

    const itineraryData = JSON.parse(jsonString);

    // 5. Risposta al Client Frontend
    res.status(200).json({ itinerary: itineraryData });
  } catch (err) {
    console.error("Errore /api/itinerary:", err);
    res.status(500).json({
      error: "Errore nella generazione del piano di viaggio",
      detail:
        err.message || "Verifica la tua OPENAI_API_KEY su Vercel e i log.",
    });
  }
}
