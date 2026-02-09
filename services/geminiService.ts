
import { GoogleGenAI } from "@google/genai";

export async function getSmartInsights(data: any) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analise os seguintes dados do ERP da Wymdy Company e forneça 3 insights rápidos (máx 15 palavras cada) focados em estoque baixo ou fluxo de caixa. Responda em Português. Dados: ${JSON.stringify(data)}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Insights automáticos indisponíveis no momento.";
  }
}
