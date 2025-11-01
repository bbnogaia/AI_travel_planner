export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    message: "Ciao! Questa è la funzione test per Vercel.",
    method: req.method,
    time: new Date().toISOString(),
  });
}
