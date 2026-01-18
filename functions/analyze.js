export default async (req, context) => {
    // Only allow POST
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { image } = await req.json();

        if (!image) {
            return new Response(JSON.stringify({ error: "No image provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Server configuration error: Missing API Key" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const SYSTEM_PROMPT = `
SYSTEM:
You are a multimodal AI model configured for image understanding and trading analysis. The user will provide a clear screenshot from a trading platform (Pocket Option or MetaTrader 5) showing a price chart with MACD and fractal indicators.

Your task:
1. Extract structured technical components:
   - Identify price candles, timeframe, and chart type.
   - Detect and classify fractal indicator patterns (fractal highs and lows).
   - Detect MACD lines (MACD line, signal line, histogram) and determine signal conditions (crossovers, divergence/convergence, histogram trend).
   - Optional: identify trend direction and support/resistance zones.

2. Output a **JSON object** exactly matching the schema below.

3. Only use information present in the image. If detection is not reliable, set \`prediction\` to “WAIT” with justification in \`explanation\`.

JSON OUTPUT SCHEMA:
{
  "platform": "",
  "timeframe": "",
  "trend": "",
  "fractal_signals": [
    {
      "type": "",
      "position": "",
      "confidence": 0
    }
  ],
  "macd": {
    "macd_value": 0,
    "signal_value": 0,
    "histogram": 0,
    "signal_state": ""
  },
  "prediction": "",
  "confidence_score": 0,
  "explanation": ""
}
END SYSTEM
`;

        // Call Gemini API
        // Note: The user requested 'gemini-3-flash'. This might be a future model or a specific endpoint. 
        // If 'gemini-3-flash' fails, we might need 'gemini-1.5-flash'.
        // We will use the URL provided by the user.
        const response = await fetch("https://api.ai.google/v1/models/gemini-3-flash:generateContent", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: "user_image",
                        content: image // Expecting base64 string
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            return new Response(JSON.stringify({ error: `Gemini API Error: ${response.statusText}`, details: errorText }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
