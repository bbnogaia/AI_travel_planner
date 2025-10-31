# ✈️ AI Travel Planner

Un'**app web** che trasforma i tuoi sogni di viaggio in realtà creando **itinerari su misura** con la potenza dell'Intelligenza Artificiale di **OpenAI**.

Basta inserire la tua **destinazione**, il **numero di giorni** ed i tuoi **interessi** e l'app genererà istantaneamente un piano di viaggio dettagliato, completo di attività, orari e suggerimenti giornalieri.

---

## Caratteristiche Principali

* **Itinerari Personalizzati:** Generazione automatica e ottimizzata di piani di viaggio unici, alimentata da **OpenAI GPT-4.1-mini**.
* **Piano Dettagliato:** Suddivisione giornaliera con proposte per **colazioni, pranzi, cene** e le principali **attrazioni** e attività.
* **Interfaccia Intuitiva:** Un'esperienza utente **semplice e pulita**, costruita con la velocità di **React** e lo stile di **Tailwind CSS**.
* **Backend Robusto:** Gestione delle richieste, logging e gestione degli errori implementata con **Express.js**.
* **Comunicazione Semplice:** Supporto **CORS** preconfigurato per una comunicazione fluida tra frontend e server in ambiente di sviluppo locale.

---

## Come Avviare il Progetto (Localmente)

Segui questi passaggi per far girare l'AI Travel Planner sul tuo computer.

### 1. Clonazione e Spostamento

```bash
git clone https://github.com/bbnogaia/AI_travel_planner
cd ai-travel-planner
```

### 2. Installazione delle Dipendenze

Frontend (client)

```bash
cd client
npm install
```
Backend (server)

```bash
cd ../server
npm install
```

### 3. Configurazione Chiave API

Crea un file chiamato .env all'interno della cartella server/ e popolalo con le tue credenziali e la porta:

```bash
OPENAI_API_KEY=la_tua_chiave_api_di_openai
PORT=5000
```
NB: Puoi ottenere la tua API Key dal portale di OpenAI: https://platform.openai.com/api-keys

### 4. Avvio del Server (Backend)

Apri il primo terminale nella cartella server/ e avvia il backend con il live reload:

```bash
npm run dev
```

### 5. Avvio del Client (Frontend)

pri un secondo terminale nella cartella client/ e avvia l'interfaccia utente:

```bash
npm run dev
```

### 6. Fine! 

Apri il tuo browser e naviga su: http://localhost:5173



