import express from "express";
import cors from "cors";
import OpenAI from "openai";
import "dotenv/config";

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.sendStatus(204);
  }
  next();
});

// Route di test
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Home (facoltativa)
app.get("/", (req, res) => {
  res.send("Server AI Travel Planner attivo! Usa /ping o POST /api/itinerary");
});

// Rotta principale
app.post("/api/itinerary", async (req, res) => {
  const { destination, days, interests } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: "Missing destination or days." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Crea un itinerario dettagliato di ${days} giorni a ${destination}, 
      con attività legate a: ${interests?.join(", ") || "generiche"}.
      Restituisci un array JSON di oggetti con chiavi: "giorno", "attivita", "descrizione".`;

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
