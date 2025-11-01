import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.options("*", cors());

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/", (req, res) => {
  res.send("Server AI Travel Planner attivo! Usa /ping o POST /api/itinerary");
});

app.post("/api/itinerary", async (req, res) => {
  const { destination, days, interests } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: "Missing destination or days." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `
Crea un piano di viaggio di ${days} giorni a ${destination},
concentra il piano su: ${
      Array.isArray(interests) ? interests.join(", ") : interests
    }.
Includi per ogni giorno: colazione, pranzo, cena e 2-3 attività principali.
Rispondi in formato JSON valido: un array di oggetti con campi "giorno", "attivita", "descrizione".
`;
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    let itinerary;

    try {
      itinerary = JSON.parse(text);
    } catch {
      itinerary = [{ giorno: 1, attivita: "Parsing error", descrizione: text }];
    }

    res.json({ itinerary });
  } catch (error) {
    console.error("Errore API:", error);
    res
      .status(500)
      .json({ error: "Errore durante la generazione dell'itinerario." });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));
