import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  // Get API key from environment variable
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    console.error("Please set it in your .env file or export it:");
    console.error("export GEMINI_API_KEY=your_api_key_here");
    process.exit(1);
  }

  console.log("Using Gemini API key:", GEMINI_API_KEY.substring(0, 10) + "...");

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
  });

  const prompt = "Create a beautiful greeting card background image for a birthday card. The image should be colorful, festive, with balloons and cake theme. Make it suitable for a greeting card (800x600 pixels, horizontal orientation).";

  console.log("Generating image with prompt:", prompt);
  console.log("Using model: gemini-2.5-flash-image");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    console.log("\nResponse received!");
    console.log("Response type:", typeof response);
    console.log("Response keys:", Object.keys(response || {}));

    // Check if response has candidates
    if (response && 'candidates' in response) {
      const candidates = (response as any).candidates;
      console.log("Candidates found:", Array.isArray(candidates) ? candidates.length : "not an array");

      if (Array.isArray(candidates) && candidates.length > 0) {
        const firstCandidate = candidates[0];
        console.log("First candidate keys:", Object.keys(firstCandidate || {}));

        if (firstCandidate.content && firstCandidate.content.parts) {
          console.log("Parts found:", firstCandidate.content.parts.length);

          for (let i = 0; i < firstCandidate.content.parts.length; i++) {
            const part = firstCandidate.content.parts[i];
            console.log(`\nPart ${i}:`);
            console.log("Part keys:", Object.keys(part || {}));

            if (part.text) {
              console.log("Text found:", part.text.substring(0, 100));
            } else if (part.inlineData) {
              console.log("Image data found!");
              console.log("MIME type:", part.inlineData.mimeType);
              console.log("Data length:", part.inlineData.data?.length || 0);

              const imageData = part.inlineData.data;
              if (imageData) {
                const buffer = Buffer.from(imageData, "base64");
                const outputPath = path.join(process.cwd(), "test-gemini-image.png");
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
        console.log("No candidates found or candidates is not an array");
      }
    } else {
      console.log("Response does not have 'candidates' property");
      console.log("Full response:", JSON.stringify(response, null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }
}

main();


