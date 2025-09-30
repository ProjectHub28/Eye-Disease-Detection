import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    isHealthy: { 
        type: Type.BOOLEAN, 
        description: "Whether the eye appears healthy." 
    },
    primaryDiagnosis: { 
        type: Type.STRING, 
        description: "The name of the most likely suspected eye disease. 'None' if healthy." 
    },
    summary: { 
        type: Type.STRING, 
        description: "A detailed explanation of the findings and the reasoning for the primary diagnosis. Provide a short, easy-to-understand summary for a non-medical user." 
    },
    symptoms: {
      type: Type.ARRAY,
      description: "A list of detected symptoms or areas of concern visible in the image.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { 
              type: Type.STRING, 
              description: "The name of the symptom (e.g., 'Redness', 'Cloudiness', 'Yellowish Bump')." 
          },
          description: { 
              type: Type.STRING, 
              description: "A brief description of the symptom found in the image." 
          },
          anatomicalLayer: {
            type: Type.STRING,
            description: "The anatomical layer of the eye where the symptom is observed (e.g., 'Conjunctiva', 'Sclera', 'Cornea', 'Iris', 'Lens')."
          },
          boundingBox: {
            type: Type.OBJECT,
            description: "Bounding box coordinates as percentages.",
            properties: {
              x: { type: Type.NUMBER, description: "The top-left x-coordinate as a percentage (0-100)." },
              y: { type: Type.NUMBER, description: "The top-left y-coordinate as a percentage (0-100)." },
              width: { type: Type.NUMBER, description: "The width of the box as a percentage (0-100)." },
              height: { type: Type.NUMBER, description: "The height of the box as a percentage (0-100)." }
            },
            required: ['x', 'y', 'width', 'height']
          }
        },
        required: ['name', 'description', 'anatomicalLayer', 'boundingBox']
      }
    },
    differentialDiagnoses: {
        type: Type.ARRAY,
        description: "A list of other possible diagnoses, ranked by likelihood. Empty array if healthy or if confidence is very high.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the alternative disease." },
                reasoning: { type: Type.STRING, description: "A brief reasoning why this might be a possibility." }
            },
            required: ['name', 'reasoning']
        }
    },
    possibleSymptoms: {
        type: Type.ARRAY,
        description: "A list of common symptoms associated with the primary diagnosis, if any. Empty array if healthy.",
        items: { type: Type.STRING }
    },
    treatment: {
        type: Type.STRING,
        description: "General information about potential treatment options for the primary diagnosis. This is NOT a prescription. Must strongly advise consulting a doctor. 'N/A' if healthy."
    },
    confidenceScore: {
        type: Type.NUMBER,
        description: "A confidence score (0-100) for the primary diagnosis. If healthy, this should be 100."
    },
    nextSteps: {
        type: Type.STRING,
        description: "Recommended next steps for the user, e.g., 'Consult an ophthalmologist for a comprehensive diagnosis.' Always recommend professional consultation."
    }
  },
  required: ['isHealthy', 'primaryDiagnosis', 'summary', 'symptoms', 'differentialDiagnoses', 'possibleSymptoms', 'treatment', 'confidenceScore', 'nextSteps']
};


export const analyzeEyeImage = async (imageFile: File): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `You are a sophisticated AI model from Google DeepMind, specialized in ophthalmological image analysis. Your purpose is to assist in identifying potential eye diseases from images, acting as a preliminary screening tool.

**IMPORTANT:** You are not a doctor. Your analysis is not a medical diagnosis.

**Instructions:**
1.  **Analyze the Image:** Carefully examine the provided image of a human eye.
2.  **Identify Findings:** Look for any abnormalities, signs of disease, or areas of concern.
3.  **Formulate Output:** Respond ONLY with a JSON object that adheres to the provided schema.
4.  **Primary Diagnosis:** Provide the single most likely potential diagnosis based on the visual evidence. If the eye appears healthy, state 'None'.
5.  **Differential Diagnosis:** Provide a list of 2-3 other possible diagnoses, even if their likelihood is lower. For each, include a brief 'reasoning'. This is crucial for providing nuance. If the eye is clearly healthy or you are very certain, this array can be empty.
6.  **Summary:** Write a clear, concise summary explaining your reasoning for the primary diagnosis, referencing the symptoms found. It must be easily understandable by a non-medical person.
7.  **Symptoms & Bounding Boxes:** For each distinct symptom or abnormality found, create a tight-fitting bounding box. The coordinates (x, y, width, height) must be percentages of the image dimensions. For each symptom, also identify the most likely \`anatomicalLayer\` it appears on (e.g., 'Conjunctiva', 'Sclera', 'Cornea').
8.  **Associated Symptoms:** If a disease is suspected, list common symptoms associated with that condition (e.g., "Blurry vision", "Itching", "Sensitivity to light"). This should be a general list, not just what's in the image.
9.  **Treatment Information:** Briefly describe common, general treatment approaches for the suspected condition. Frame this as informational only. Emphasize that a doctor must be consulted for actual treatment plans. For healthy eyes, use 'N/A'.
10. **Confidence Score:** Provide a confidence score (0-100) for your assessment of the primary diagnosis. A higher score indicates greater certainty. For a healthy eye, the score should be 100.
11. **Next Steps:** Crucially, always recommend that the user consult a qualified healthcare professional (like an ophthalmologist) for a definitive diagnosis and treatment, regardless of your findings.
12. **Healthy Eye:** If no abnormalities are found, set \`isHealthy\` to true, \`primaryDiagnosis\` to 'None', provide a reassuring summary, and leave arrays for symptoms and diagnoses empty.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        imagePart,
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
    },
  });
  
  const text = response.text.trim();
  const result: AnalysisResult = JSON.parse(text);
  return result;
};