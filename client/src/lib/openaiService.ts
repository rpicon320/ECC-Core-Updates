import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface DiagnosisDescriptionRequest {
  name: string;
  category: string;
}

export interface DiagnosisDescriptionResponse {
  description: string;
  success: boolean;
  error?: string;
}

export const generateDiagnosisDescription = async (
  request: DiagnosisDescriptionRequest
): Promise<DiagnosisDescriptionResponse> => {
  try {
    const prompt = `Generate a professional, clinical description for the medical diagnosis "${request.name}" in the category "${request.category}". 

The description should be:
- Concise but informative (2-3 sentences)
- Written in professional medical language
- Suitable for healthcare providers
- Include key clinical features or characteristics
- Avoid overly technical jargon that would confuse general users

Provide only the description text, no additional formatting or explanations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical expert assistant that generates accurate, professional clinical descriptions for medical diagnoses. Provide clear, concise descriptions suitable for healthcare documentation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3 // Lower temperature for more consistent, professional output
    });

    const description = response.choices[0].message.content?.trim();
    
    if (!description) {
      throw new Error("No description generated");
    }

    return {
      description,
      success: true
    };

  } catch (error: any) {
    console.error('Error generating diagnosis description:', error);
    
    let errorMessage = "Failed to generate description";
    
    // Handle specific OpenAI API errors
    if (error?.status === 401) {
      errorMessage = "OpenAI API key is invalid or missing";
    } else if (error?.status === 429) {
      if (error?.error?.code === 'insufficient_quota') {
        errorMessage = "OpenAI API quota exceeded. Please check your billing at platform.openai.com";
      } else {
        errorMessage = "Rate limit exceeded. Please try again in a moment";
      }
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      description: "",
      success: false,
      error: errorMessage
    };
  }
};