import { useState } from "react";
import { Loader2, Plane, MapPin, Calendar, BookOpen } from "lucide-react";

function App() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Componente interno per visualizzare gli elementi di caricamento
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <span>Generando...</span>
    </div>
  );

  // Componente per visualizzare i risultati del piano
  const ItineraryDisplay = ({ itinerary }) => {
    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      return (
        <pre className="whitespace-pre-wrap text-sm text-gray-400 p-4 border border-red-500/50 rounded-xl bg-slate-800">
          Risultato inaspettato o mancante.
        </pre>
      );
    }

    // L'itinerario è sempre un array di oggetti con 'giorno', 'attivita', 'descrizione'
    const daysArray = [...new Set(itinerary.map((item) => item.giorno))].sort();

    return (
      <div className="space-y-6 md:space-y-8">
        {daysArray.map((day) => (
          <div
            key={day}
            className="bg-slate-800/70 border border-teal-500/50 rounded-2xl shadow-xl p-5 md:p-6 transition-all duration-300 hover:shadow-2xl hover:bg-slate-700/60"
          >
            <h2 className="text-2xl font-extrabold text-teal-400 mb-4 flex items-center border-b border-slate-700 pb-2">
              <Calendar className="h-5 w-5 mr-3" />
              Giorno {day}
            </h2>
            <div className="space-y-4">
              {itinerary
                .filter((item) => item.giorno === day)
                .map((item, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-teal-500 pl-4 transition-all duration-150 hover:border-teal-400"
                  >
                    <h3 className="font-semibold text-gray-200 text-lg">
                      {item.attivita || item.activity || "Attività"}
                    </h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {item.descrizione ||
                        item.description ||
                        "Nessuna descrizione."}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setItinerary(null);
    setLoading(true);

    const numericDays = parseInt(days, 10);

    if (isNaN(numericDays) || numericDays < 1) {
      setError("Il numero di giorni non è valido.");
      setLoading(false);
      return;
    }

    try {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL || window.location.origin;

      const res = await fetch(`${apiBase}/api/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days: numericDays,
          interests: interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      let parsed;
      try {
        parsed =
          typeof data.itinerary === "string"
            ? JSON.parse(data.itinerary)
            : data.itinerary;
      } catch {
        parsed = data.itinerary;
      }

      setItinerary(parsed);
    } catch (err) {
      console.error("Errore durante la generazione:", err);
      setError(
        "Errore durante la generazione del piano. Verifica che l'API sia in esecuzione o riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-slate-900 flex flex-col items-center p-4 sm:p-6 text-white">
      <div className="w-full max-w-xl my-8 md:my-16">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-teal-400 drop-shadow-xl mb-3">
            <Plane className="inline h-10 w-10 mr-2 text-white" /> AI Planner
          </h1>
          <p className="text-lg text-gray-300 opacity-80">
            Divertiti a creare il tuo itinerario di viaggio personalizzato in
            pochissimi click!!
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 shadow-2xl rounded-3xl p-6 sm:p-10 w-full transition-all duration-500">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Destinazione */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-400" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-700/70 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 placeholder-gray-400 text-white shadow-inner"
                placeholder="Destinazione (es. Tokyo)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            {/* Giorni */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-400" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-700/70 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 placeholder-gray-400 text-white shadow-inner"
                type="number"
                placeholder="Numero di giorni"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min={1}
                required
              />
            </div>

            {/* Interessi */}
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-400" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-700/70 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 placeholder-gray-400 text-white shadow-inner"
                placeholder="Interessi (es. cibo, cultura, trekking)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>

            <button
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01] disabled:bg-slate-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : "✈️ Genera Itinerario"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-3 bg-red-900/50 border border-red-500 rounded-xl text-red-300">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {itinerary && (
            <div className="mt-8 border-t border-slate-700 pt-6">
              <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Il piano consigliato da GPT è:
              </h2>
              <ItineraryDisplay itinerary={itinerary} />
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-gray-500 text-sm">
        Made with ❤️ by bbnogaia & GPT
      </footer>
    </div>
  );
}

export default App;
