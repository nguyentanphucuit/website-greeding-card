import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

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

  console.log("Testing Imagen 4.0 with generateImages API");
  console.log("Prompt:", prompt);

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
      },
    });

    console.log("\n✅ Response received!");
    console.log("Response keys:", Object.keys(response || {}));

    if (response.generatedImages && Array.isArray(response.generatedImages)) {
      console.log("Generated images count:", response.generatedImages.length);

      for (let i = 0; i < response.generatedImages.length; i++) {
        const generatedImage = response.generatedImages[i];
        console.log(`\nImage ${i + 1}:`, Object.keys(generatedImage || {}));

        if (generatedImage.image) {
          console.log("Image object keys:", Object.keys(generatedImage.image));
          
          if (generatedImage.image.imageBytes) {
            const imageBytes = generatedImage.image.imageBytes;
            const mimeType = generatedImage.image.mimeType || "image/png";
            
            console.log("✅ Image bytes found!");
            console.log("MIME type:", mimeType);
            console.log("Data length:", imageBytes.length);

            const buffer = Buffer.from(imageBytes, "base64");
            const outputPath = path.join(process.cwd(), `test-imagen-${i + 1}.png`);
            fs.writeFileSync(outputPath, buffer);
            console.log(`✅ Image saved: ${outputPath}`);
            console.log(`Size: ${(buffer.length / 1024).toFixed(2)} KB`);
          } else {
            console.log("No imageBytes found");
          }
        } else {
          console.log("No image object found");
        }
      }
    } else {
      console.log("No generatedImages found in response");
      console.log("Full response:", JSON.stringify(response, null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message.substring(0, 300));
    }
  }
}

main();


