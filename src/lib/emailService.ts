import { GoogleGenAI } from "@google/genai";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function sendOrderNotificationEmail(order: any, contactEmail: string) {
  if (!contactEmail || !process.env.GEMINI_API_KEY) return;

  try {
    const prompt = `
      As a professional notification system, generate a concise and professional email alert for a new order.
      Target Audience: Store Administrator (${contactEmail})
      
      Order Details:
      - Order ID: ${order.id || 'N/A'}
      - Product: ${order.productName}
      - Amount: ${order.amount}
      - Customer: ${order.customerName} (${order.customerEmail})
      - Payment Method: bKash (${order.bkashNumber})
      - TrxID: ${order.transactionId}

      Generate the email in the following JSON format:
      {
        "subject": "String",
        "body": "HTML String"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const emailContent = JSON.parse(response.text || '{}');

    // In a real-world scenario, you would call an email API here (e.g., Resend, SendGrid, Mailgun)
    // For this implementation, we will log the email to a 'notifications' collection in Firestore
    // which effectively "sends" it to the system's dashboard or a worker process.
    await addDoc(collection(db, "notifications"), {
      to: contactEmail,
      subject: emailContent.subject,
      body: emailContent.body,
      orderId: order.id || '',
      type: "order_alert",
      status: "sent_simulated",
      createdAt: serverTimestamp()
    });

    console.log("Order notification simulated for admin:", contactEmail);
  } catch (error) {
    console.error("Failed to generate/send order notification:", error);
  }
}
