import express from "express";
import cors from "cors";
import OpenAI from "openai";
import serverless from "serverless-http";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Travel Planner API attiva su Vercel!");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/itinerary", async (req, res) => {
  try {
    const { destination, days, interests } = req.body;

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

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.8,
    });

    let text = response.output_text || "";

    res.json({ itinerary: text });
  } catch (err) {
    console.error("Errore interno /itinerary:", err);
    res.status(500).json({
      error: "Errore nella generazione del piano",
      detail: err.message,
    });
  }
});

export default serverless(app);
