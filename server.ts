import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: "You are the Youth City Hub Assistant. You help youth in Uganda with information about stationery, government applications (URA, NIRA, Passport), academic forms, skills training (Computer, Design), and the services at the hub. Be encouraging, professional, and clear. Keep responses concise." }],
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm your Youth City Hub Assistant. How can I help you grow today?" }],
        },
        ...(history || []),
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

const PESAPAL_URL = process.env.PESAPAL_ENV === "production" 
  ? "https://pay.pesapal.com/v3/api" 
  : "https://cyb-api.pesapal.com/v3/api";

async function getPesapalToken() {
  if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
     console.error("CRITICAL: PESAPAL_CONSUMER_KEY or PESAPAL_CONSUMER_SECRET is missing from environment variables.");
     throw new Error("Payment system configuration is incomplete (Missing Keys).");
  }

  try {
    const response = await axios.post(`${PESAPAL_URL}/Auth/RequestToken`, {
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    });
    return response.data.token;
  } catch (error: any) {
    console.error("Pesapal Auth Error:", error.response?.data || error.message);
    throw new Error(`Pesapal Authentication Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function registerIPN(token: string) {
  if (!process.env.PESAPAL_IPN_URL) {
    console.error("CRITICAL: PESAPAL_IPN_URL is missing. This is required for transaction tracking.");
    throw new Error("Payment system configuration is incomplete (Missing IPN URL).");
  }

  try {
    const response = await axios.post(`${PESAPAL_URL}/URLSetup/RegisterIPN`, {
      url: process.env.PESAPAL_IPN_URL,
      ipn_notification_type: "GET"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.ipn_id;
  } catch (error: any) {
    console.error("Pesapal IPN Error:", error.response?.data || error.message);
    throw new Error(`Pesapal IPN Registration Failed: ${error.response?.data?.message || error.message}`);
  }
}

app.post("/api/pesapal/initiate", async (req, res) => {
  const { amount, phone, email, itemName, description } = req.body;

  try {
    const token = await getPesapalToken();
    const ipnId = await registerIPN(token);

    const orderData = {
      id: `ORDER-${Date.now()}`,
      currency: "UGX",
      amount: amount,
      description: description || `Payment for ${itemName}`,
      callback_url: `${process.env.PESAPAL_REDIRECT_URL || process.env.PESAPAL_IPN_URL}${ (process.env.PESAPAL_REDIRECT_URL || process.env.PESAPAL_IPN_URL)?.includes('?') ? '&' : '?' }item=${encodeURIComponent(itemName)}&amt=${amount}`,
      notification_id: ipnId,
      billing_address: {
        email_address: email,
        phone_number: phone,
        country_code: "UG",
        first_name: "Customer",
        last_name: "YouthCityHub"
      }
    };

    const response = await axios.post(`${PESAPAL_URL}/Transactions/SubmitOrderRequest`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({
      redirect_url: response.data.redirect_url,
      order_tracking_id: response.data.order_tracking_id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
