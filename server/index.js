import app from "./api/itinerary.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
