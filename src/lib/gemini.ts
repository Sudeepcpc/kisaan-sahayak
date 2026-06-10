import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateResponse(prompt: string, image?: string) {
  try {
    const contents: any[] = [{ text: prompt }];
    
    if (image) {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: contents as any },
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function chatWithAI(messages: { role: 'user' | 'model', content: string }[], systemInstruction?: string) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
    }
  });

  const lastMessage = messages[messages.length - 1];
  const response = await chat.sendMessage({ message: lastMessage.content });
  return response.text;
}
