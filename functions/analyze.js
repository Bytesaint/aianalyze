export default async (req, context) => {
    // Only allow POST
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { image, mimeType } = await req.json();

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

        // Call Gemini API (v1beta)
        // User requested "gemini 3 pro", defaulting to the latest stable Pro model: gemini-1.5-pro
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                contents: [{
                    parts: [
                        {
                            inline_data: {
                                mime_type: mimeType || "image/png",
                                data: image
                            }
                        },
                        { text: "Analyze this chart image." }
                    ]
                }]
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
        // Extract the text from the response structure
        // Gemini response: data.candidates[0].content.parts[0].text
        // The text is expected to be JSON.

        let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("No content generated");
        }

        // Clean up markdown code blocks if present
        responseText = responseText.replace(/```json\n?|```/g, "").trim();

        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.log("Raw Text:", responseText);
            // Return raw text if parse fails, or handled error
            return new Response(JSON.stringify({ error: "Failed to parse AI response as JSON", raw: responseText }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify(parsedData), {
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
