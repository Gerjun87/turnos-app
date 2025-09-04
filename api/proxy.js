export default async function handler(req, res) {
  // ===== CORS preflight =====
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  const API_URL = "https://script.google.com/macros/s/AKfycbzRIIZ4QcNIWONWs9E2Urtb75SWQskGgzXnNCl7DaXc-0Xaxlwh0tv9s6ZW0oj1iBvD/exec";

  try {
    let url = API_URL;
    let fetchOptions = {
      method: req.method,
      headers: { "Content-Type": "application/json" }
    };

    if (req.method === "GET") {
      // Pasar query params a Apps Script
      const queryParams = new URLSearchParams(req.query);
      url += "?" + queryParams.toString();
    } else if (req.method === "POST") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    // Headers CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
