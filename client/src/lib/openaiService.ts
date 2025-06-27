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
    const prompt = `Create a short, brief description for the medical diagnosis "${request.name}" in the category "${request.category}" that explains to patients and families what this condition means.

The description should be:
- Simple and clear (30-60 words)
- Written in everyday language that patients can understand
- Explains what this diagnosis means for the patient
- Avoids medical jargon and technical terms
- Focuses on what the patient needs to know about their condition

Provide only the description text, no additional formatting or explanations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using GPT-3.5-turbo for cost efficiency as requested by user
      messages: [
        {
          role: "system",
          content: "You are a medical expert assistant that creates patient-friendly explanations of medical diagnoses. Write clear, simple descriptions that help patients and families understand their health conditions without using complicated medical terms."
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