import { create } from 'zustand';
import OpenAI from 'openai';

interface NutritionInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

interface AIStore {
  isAnalyzing: boolean;
  error: string | null;
  analyzeFoodImage: (imageBase64: string) => Promise<NutritionInfo>;
}

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `You are a nutrition expert AI that analyzes food images and provides detailed nutritional information. 
For each image, provide:
1. Food name
2. Calories
3. Protein (g)
4. Carbohydrates (g)
5. Fat (g)
6. Confidence level (0-100)

Format your response as a JSON object with these exact keys:
{
  "name": string,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "confidence": number
}`;

export const useAIStore = create<AIStore>((set) => ({
  isAnalyzing: false,
  error: null,

  analyzeFoodImage: async (imageBase64: string): Promise<NutritionInfo> => {
    try {
      set({ isAnalyzing: true, error: null });

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              },
              {
                type: "text",
                text: "Analyze this food image and provide nutritional information in the specified JSON format."
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.5
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      set({ isAnalyzing: false });
      
      return {
        name: result.name || 'Unknown Food',
        calories: result.calories || 0,
        protein: result.protein || 0,
        carbs: result.carbs || 0,
        fat: result.fat || 0,
        confidence: result.confidence || 0
      };
    } catch (error) {
      set({ error: (error as Error).message, isAnalyzing: false });
      throw error;
    }
  }
}));