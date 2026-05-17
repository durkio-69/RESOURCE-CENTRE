import express from "express";
import serverless from "serverless-http";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// Chat API
app.post("/chat", async (req, res) => {
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

// PesaPal API
const PESAPAL_URL = process.env.PESAPAL_ENV === "production" 
  ? "https://pay.pesapal.com/v3/api" 
  : "https://cyb-api.pesapal.com/v3/api";

async function getPesapalToken() {
  if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
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

app.post("/pesapal/initiate", async (req, res) => {
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

// PesaPal IPN Listener
app.get("/pesapal/ipn", async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query;
  
  console.log("PesaPal IPN Received:", { OrderTrackingId, OrderMerchantReference, OrderNotificationType });

  // PesaPal expects a 200 OK with the tracking ID back
  res.status(200).json({
    order_tracking_id: OrderTrackingId,
    status: 200
  });
});

export const handler = serverless(app);
