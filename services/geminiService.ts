
import { GoogleGenAI } from "@google/genai";
import { EVENT_DATA } from "../constants";

export const askGemini = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const systemInstruction = `
    Você é uma assistente acolhedora e empática para um evento chamado "Fé e Terapia".
    O público-alvo são exclusivamente mulheres.
    Informações do evento:
    - Tema: ${EVENT_DATA.theme}
    - Regras: ${EVENT_DATA.audienceRules}
    - Horário: ${EVENT_DATA.time}
    - Valor: ${EVENT_DATA.price}
    - Endereço: ${EVENT_DATA.address}
    - Telefone para contato: ${EVENT_DATA.phone}

    Seu objetivo é tirar dúvidas sobre o evento, ser gentil, oferecer palavras de encorajamento baseadas em fé e psicologia (terapia), e incentivar a inscrição.
    Responda em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || "Desculpe, tive um problema ao processar sua resposta. Tente novamente em instantes.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao conectar com a inteligência artificial. Por favor, verifique sua conexão.";
  }
};
