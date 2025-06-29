import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Medical Diagnosis Description Generation
  app.post("/api/generate-diagnosis-description", async (req, res) => {
    try {
      const { name, category } = req.body;

      if (!name || !category) {
        return res.status(400).json({ error: "Name and category are required" });
      }

      const prompt = `Generate a professional clinical description for the medical diagnosis "${name}" in the ${category} category. 
      This description will be used by care managers and healthcare professionals to understand the condition for patient care planning.
      
      Please provide:
      - A concise medical definition
      - Key clinical characteristics
      - Typical presentation or symptoms
      - Relevance to elder care management
      
      Keep the description informative, accurate, and focused on helping care teams understand the diagnosis for effective patient care. Use professional medical terminology appropriate for healthcare staff.
      
      Maximum 150 words.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a medical professional providing clinical descriptions for healthcare staff.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const description = response.choices[0].message.content?.trim();

      if (!description) {
        throw new Error("No description generated");
      }

      res.json({ description });
    } catch (error: any) {
      console.error("Error generating diagnosis description:", error);
      
      let errorMessage = "Failed to generate description";
      if (error.code === "insufficient_quota") {
        errorMessage = "OpenAI API quota exceeded. Please check your billing at platform.openai.com";
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({ error: errorMessage });
    }
  });

  // Medication Description Generation
  app.post("/api/generate-medication-description", async (req, res) => {
    try {
      const { name, usedFor, doses, frequencies } = req.body;

      if (!name || !usedFor) {
        return res.status(400).json({ error: "Medication name and usage are required" });
      }

      const dosesText = doses && doses.length > 0 ? ` Available doses: ${doses.join(', ')}.` : '';
      const frequenciesText = frequencies && frequencies.length > 0 ? ` Frequency options: ${frequencies.join(', ')}.` : '';

      const prompt = `Generate a professional clinical description for the medication "${name}" used for ${usedFor}.${dosesText}${frequenciesText}
      
      This description will be used by care managers and healthcare professionals for medication reference and patient care planning.
      
      Please provide:
      - Medication class or mechanism of action
      - Primary therapeutic uses
      - Key considerations for elder care
      - Important monitoring requirements
      
      Keep the description informative, accurate, and focused on helping care teams understand the medication for safe and effective patient care. Use professional medical terminology appropriate for healthcare staff.
      
      Maximum 150 words.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a clinical pharmacist providing medication descriptions for healthcare staff.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const description = response.choices[0].message.content?.trim();

      if (!description) {
        throw new Error("No description generated");
      }

      res.json({ description });
    } catch (error: any) {
      console.error("Error generating medication description:", error);
      
      let errorMessage = "Failed to generate description";
      if (error.code === "insufficient_quota") {
        errorMessage = "OpenAI API quota exceeded. Please check your billing at platform.openai.com";
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({ error: errorMessage });
    }
  });

  // Bulk Medication Data Generation
  app.post("/api/generate-bulk-medication-data", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Medication name is required" });
      }

      const prompt = `For the medication "${name}", generate comprehensive clinical information in JSON format with the following structure:

      {
        "doses": [array of common dosage strengths as strings, e.g., "5mg", "10mg", "25mg"],
        "frequencies": [array of common dosing frequencies as strings, e.g., "Once daily", "Twice daily", "As needed"],
        "usedFor": "Primary therapeutic use or indication",
        "potentialSideEffects": "Most common side effects separated by commas"
      }

      Provide accurate, clinically relevant information for healthcare professionals. Include only the most commonly prescribed doses and frequencies. Keep the usage description concise but informative.

      Return only valid JSON with no additional text.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a clinical pharmacist providing accurate medication information. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content?.trim();

      if (!content) {
        throw new Error("No data generated");
      }

      let data;
      try {
        data = JSON.parse(content);
      } catch (parseError) {
        throw new Error("Invalid JSON response from AI");
      }

      // Validate the response structure
      if (!data.doses || !data.frequencies || !data.usedFor || !data.potentialSideEffects) {
        throw new Error("Incomplete medication data generated");
      }

      res.json({ data });
    } catch (error: any) {
      console.error("Error generating bulk medication data:", error);
      
      let errorMessage = "Failed to generate medication data";
      if (error.code === "insufficient_quota") {
        errorMessage = "OpenAI API quota exceeded. Please check your billing at platform.openai.com";
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
