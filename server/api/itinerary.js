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
Rispondi in formato JSON valido.
    `;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.8,
    });

    const text =
      response.output_text ||
      response.output
        ?.map((o) => (o.content || []).map((c) => c.text || "").join(""))
        .join("\n") ||
      "";

    const parsed = JSON.parse(text);
    res.json({ itinerary: parsed });
  } catch (err) {
    console.error("Errore /api/itinerary:", err);
    res.status(500).json({ error: err.message || "Errore interno" });
  }
});

export default app;
