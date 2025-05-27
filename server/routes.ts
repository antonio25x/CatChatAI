import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

const chatRequestSchema = z.object({
  question: z.string().min(1, "Question is required").max(1000, "Question too long"),
  model: z.enum(["openai", "gemini"]).default("openai"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint for cat expertise
  app.post("/api/chat", async (req, res) => {
    try {
      const { question, model } = chatRequestSchema.parse(req.body);

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Store user message
      await storage.createChatMessage({
        content: question,
        type: "user"
      });

      let fullResponse = "";

      if (model === "gemini") {
        // Use Google Gemini
        // Initialize Google Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "invalid key");

        const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
        
        const prompt = `You are a world-renowned cat expert with decades of experience in feline behavior, health, nutrition, and care. You provide warm, friendly, and scientifically accurate advice about cats. 

Please answer the following question about cats with expertise, empathy, and a touch of warmth. Keep your response informative but conversational, and feel free to include relevant cat emojis when appropriate.

Question: ${question}`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Send chunks of the response
        const chunks = text.match(/.{1,2}|.+$/g) || [];
        for (const chunk of chunks) {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ chunk, model })}\n\n`);
        }
      } else {
        // Use OpenAI (default)
        const prompt = `You are a world-renowned cat expert with decades of experience in feline behavior, health, nutrition, and care. You provide warm, friendly, and scientifically accurate advice about cats. 

Please answer the following question about cats with expertise, empathy, and a touch of warmth. Keep your response informative but conversational, and feel free to include relevant cat emojis when appropriate.

Question: ${question}`;

        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a friendly, knowledgeable cat expert. Provide helpful, accurate advice about cats in a warm, conversational tone. Use cat emojis sparingly but appropriately."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ chunk: content, model })}\n\n`);
          }
        }

      }

      // Store the complete AI response
      await storage.createChatMessage({
        content: fullResponse,
        type: "ai"
      });

      // End the stream
      res.write(`data: [DONE]\n\n`);
      res.end();

    } catch (error) {
      console.error("Error in chat endpoint:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: error.errors 
        });
      }

      if (error instanceof Error && error.message.includes("API key")) {
        const selectedModel = req.body.model || "openai";
        return res.status(500).json({ 
          message: `${selectedModel === "gemini" ? "Gemini" : "OpenAI"} API configuration error. Please check your API key.` 
        });
      }

      res.status(500).json({ 
        message: "I'm having trouble connecting right meow. Please try again!" 
      });
    }
  });

  // Get chat history endpoint (optional)
  app.get("/api/chat/history", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(50);
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
