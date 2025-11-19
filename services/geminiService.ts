import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

// Initialize the Gemini client
// Note: In a real production app, you'd handle this safely. 
// Since the prompt guarantees process.env.API_KEY is available, we use it.
const ai = new GoogleGenAI({ apiKey: API_KEY || 'demo-key' }); 

export const getVeterinaryAdvice = async (query: string, context?: string): Promise<string> => {
  if (!API_KEY) {
      console.warn("API Key missing for Gemini");
      return "Simulação: A chave de API não foi configurada. Por favor, configure a API Key para receber conselhos reais.";
  }

  try {
    const systemInstruction = `
      Você é um assistente veterinário e zootecnista especialista em gado de corte e leite.
      Seu objetivo é auxiliar no manejo, sanidade, nutrição e análise de dados da fazenda.
      Responda de forma técnica, mas acessível ao produtor rural.
      Use formatação Markdown para deixar a resposta clara (listas, negrito).
      Se a pergunta envolver diagnóstico grave, recomende sempre a consulta presencial de um veterinário.
    `;

    const prompt = context 
      ? `Contexto da Fazenda/Animal: ${context}\n\nPergunta do Produtor: ${query}` 
      : query;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Lower temperature for more factual advice
      }
    });

    return response.text || "Não foi possível gerar uma resposta no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar o assistente inteligente. Tente novamente mais tarde.";
  }
};

export const analyzeHerdPerformance = async (dataSummary: string): Promise<string> => {
   if (!API_KEY) return "Sem chave de API.";
   
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: `Analise os seguintes dados de desempenho do rebanho e sugira 3 ações de melhoria:\n${dataSummary}`,
       config: {
         systemInstruction: "Você é um consultor de agronegócio focado em eficiência produtiva.",
       }
     });
     return response.text || "Sem análise disponível.";
   } catch (e) {
     return "Erro na análise.";
   }
};

export interface ImageAnalysisResult {
  breed?: string;
  estimatedWeight?: number;
  bodyConditionScore?: string; // 1-5
  healthNotes?: string;
}

export const analyzeAnimalImage = async (base64Image: string): Promise<ImageAnalysisResult> => {
  if (!API_KEY) {
    // Mock response for demo if no key
    return {
      breed: 'Nelore (Estimado)',
      estimatedWeight: 420,
      bodyConditionScore: '3.5 (Bom)',
      healthNotes: 'Animal aparenta estar saudável. Pelagem brilhante. Sem sinais visíveis de ectoparasitas.'
    };
  }

  try {
    const prompt = "Analise esta imagem de um bovino. Identifique a provável raça, estime o Escore de Condição Corporal (ECC de 1 a 5) e observe sinais visíveis de saúde. Retorne APENAS um JSON com as chaves: breed, estimatedWeight (numero aproximado em kg), bodyConditionScore (texto), healthNotes (texto breve).";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    return JSON.parse(text) as ImageAnalysisResult;
  } catch (error) {
    console.error("Vision API Error:", error);
    throw new Error("Não foi possível analisar a imagem.");
  }
};