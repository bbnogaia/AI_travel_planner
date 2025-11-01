import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.post("/api/itinerary", async (req, res) => {
  try {
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
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.8,
    });

    let text =
      response.output_text ||
      response.output
        ?.map((o) => o.content?.map((c) => c.text || "").join(""))
        .join("") ||
      "";

    if (!text) {
      console.warn("Nessun testo trovato nella risposta OpenAI");
      return res.status(500).json({ error: "Risposta non valida da OpenAI" });
    }

    try {
      const parsed = JSON.parse(text);
      return res.json({ itinerary: parsed });
    } catch {
      return res.json({ itinerary: text });
    }
  } catch (err) {
    console.error("Errore interno /api/itinerary:", err);
    return res.status(500).json({
      error: "Errore nella generazione del piano",
      detail: err.message || err,
    });
  }
});

export default app;
