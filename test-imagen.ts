import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    process.exit(1);
  }

  console.log("Using Gemini API key:", GEMINI_API_KEY.substring(0, 10) + "...");

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
  });

  const prompt = "Create a beautiful greeting card background image for a birthday card. The image should be colorful, festive, with balloons and cake theme. Make it suitable for a greeting card (800x600 pixels, horizontal orientation).";

  console.log("Testing Imagen 4.0 (imagen-4.0-generate-001)");
  console.log("Prompt:", prompt);

  try {
    const response = await ai.models.generateContent({
      model: "imagen-4.0-generate-001",
      contents: prompt,
    });

    console.log("\n✅ Response received!");
    console.log("Response type:", typeof response);
    console.log("Response keys:", Object.keys(response || {}));

    // Check response structure
    if (response && 'candidates' in response) {
      const candidates = (response as any).candidates;
      console.log("Candidates:", Array.isArray(candidates) ? candidates.length : "not array");

      if (Array.isArray(candidates) && candidates.length > 0) {
        const firstCandidate = candidates[0];
        console.log("First candidate keys:", Object.keys(firstCandidate || {}));

        if (firstCandidate.content && firstCandidate.content.parts) {
          const parts = firstCandidate.content.parts;
          console.log("Parts found:", parts.length);

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            console.log(`\nPart ${i}:`, Object.keys(part || {}));

            if (part.text) {
              console.log("Text:", part.text.substring(0, 100));
            } else if (part.inlineData) {
              console.log("✅ Image data found!");
              const imageData = part.inlineData.data;
              if (imageData) {
                const buffer = Buffer.from(imageData, "base64");
                const outputPath = path.join(process.cwd(), "test-imagen.png");
                fs.writeFileSync(outputPath, buffer);
                console.log(`✅ Image saved: ${outputPath}`);
                console.log(`Size: ${(buffer.length / 1024).toFixed(2)} KB`);
              }
            } else if (part.url) {
              console.log("✅ Image URL found:", part.url);
            }
          }
        }
      }
    } else {
      console.log("Full response:", JSON.stringify(response, null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message.substring(0, 200));
    }
  }
}

main();

