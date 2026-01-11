import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  // Get API key from environment variable
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    process.exit(1);
  }

  console.log("Using Gemini API key:", GEMINI_API_KEY.substring(0, 10) + "...");

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
  });

  const message = "Create a beautiful greeting card background image for a birthday card. The image should be colorful, festive, with balloons and cake theme. Make it suitable for a greeting card (800x600 pixels, horizontal orientation).";

  console.log("Creating chat with model: gemini-3-pro-image-preview");
  console.log("Message:", message);

  try {
    const chat = ai.chats.create({
      model: "gemini-3-pro-image-preview",
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // tools: [{googleSearch: {}}], // Optional, comment out if not needed
      },
    });

    console.log("Chat created, sending message...");
    const response = await chat.sendMessage({ message });

    console.log("\nResponse received!");
    console.log("Response type:", typeof response);
    console.log("Response keys:", Object.keys(response || {}));

    if (response && 'candidates' in response && Array.isArray((response as any).candidates)) {
      const candidates = (response as any).candidates;
      console.log("Candidates found:", candidates.length);

      if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
        const parts = candidates[0].content.parts;
        console.log("Parts found:", parts.length);

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          console.log(`\nPart ${i}:`);
          console.log("Part keys:", Object.keys(part || {}));

          if (part.text) {
            console.log("Text found:", part.text.substring(0, 100));
          } else if (part.inlineData) {
            console.log("✅ Image data found!");
            console.log("MIME type:", part.inlineData.mimeType);
            console.log("Data length:", part.inlineData.data?.length || 0);

            const imageData = part.inlineData.data;
            if (imageData) {
              const buffer = Buffer.from(imageData, "base64");
              const outputPath = path.join(process.cwd(), "test-chat-image.png");
              fs.writeFileSync(outputPath, buffer);
              console.log(`\n✅ Image saved as: ${outputPath}`);
              console.log(`Image size: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(2)} KB)`);
            } else {
              console.error("No image data in inlineData");
            }
          } else {
            console.log("Part has neither text nor inlineData");
          }
        }
      } else {
        console.log("No content.parts found in candidate");
      }
    } else {
      console.log("Response does not have 'candidates' property");
      console.log("Full response:", JSON.stringify(response, null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if (error.message.includes("quota") || error.message.includes("429")) {
        console.error("\n⚠️  Quota exceeded or model not available in free tier");
      }
    }
  }
}

main();


