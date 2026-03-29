/**
 * Vertex AI RAG API Endpoint
 *
 * This API route securely handles Google Cloud credentials on the server side.
 * The frontend should call this endpoint instead of calling Vertex AI directly.
 *
 * Security:
 * - Credentials are loaded from environment variable GOOGLE_APPLICATION_CREDENTIALS
 * - Service account JSON is in .gitignore and never committed to GitHub
 * - API only accepts POST requests with valid JSON body
 */

import { GoogleAuth } from 'google-auth-library';
import { z } from 'zod';
import 'dotenv/config';

// RAG Configuration from environment or defaults
const CONFIG = {
  projectId: process.env.VERTEX_PROJECT_ID || 'my-project-482605',
  location: process.env.VERTEX_LOCATION || 'europe-west1',
  corpusId: process.env.VERTEX_RAG_CORPUS_ID || '4611686018427387904',
  apiEndpoint: 'europe-west1-aiplatform.googleapis.com',
};

// Request validation schema
const RagRequestSchema = z.object({
  text: z.string().min(1),
  category: z.enum(['fertilizer', 'disaster', 'seed', 'soil']),
  postType: z.enum(['report', 'question', 'tip']),
  imageUrl: z.string().optional(),
});

export interface SourceDocument {
  title: string;
  uri?: string;
  excerpt: string;
  relevanceScore: number;
}

export interface RagResponse {
  answer: string;
  confidence: number;
  sources: SourceDocument[];
}

// Auth instance (cached)
let authInstance: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (!authInstance) {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credentialsPath) {
      console.log('Loading credentials from:', credentialsPath);
    }

    authInstance = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      // Let the library natively read the file specified in process.env.GOOGLE_APPLICATION_CREDENTIALS
      // Alternatively, we explicitly set keyFilename if the path is provided
      keyFilename: credentialsPath,
    });
  }
  return authInstance;
}

/**
 * Retrieve documents from RAG corpus
 */
async function retrieveFromRag(queryText: string): Promise<SourceDocument[]> {
  try {
    const auth = getAuth();
    const client = await auth.getClient();

    const url = `https://${CONFIG.apiEndpoint}/v1/projects/${CONFIG.projectId}/locations/${CONFIG.location}/ragCorpora/${CONFIG.corpusId}:query`;

    const requestBody = {
      query: queryText,
      topK: 5,
      similarityTopK: 3,
      vectorDistanceThreshold: 0.7,
    };

    const response = await client.request({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
    });

    const data = response.data as any;
    const documents: SourceDocument[] = [];

    if (data.retrievalResults && Array.isArray(data.retrievalResults)) {
      for (const result of data.retrievalResults) {
        if (result.ragChunk) {
          documents.push({
            title: result.ragChunk.dataStoreDocument?.title || 'Unknown',
            uri: result.ragChunk.dataStoreDocument?.uri,
            excerpt: result.ragChunk.content || '',
            relevanceScore: result.ragChunk.relevanceScore || 0,
          });
        }
      }
    }

    return documents;
  } catch (error) {
    console.error('RAG retrieval error:', error);
    return [];
  }
}

/**
 * Generate response using Gemini with retrieved context
 */
async function generateResponse(
  queryText: string,
  category: string,
  postType: string,
  documents: SourceDocument[]
): Promise<string> {
  try {
    const auth = getAuth();
    const client = await auth.getClient();

    const url = `https://${CONFIG.apiEndpoint}/v1/projects/${CONFIG.projectId}/locations/${CONFIG.location}/publishers/google/models/gemini-2.0-flash-001:generateContent`;

    const contextText = documents
      .map((doc, i) => `[Source ${i + 1}]: ${doc.excerpt}`)
      .join('\n\n');

    const categoryLabels: Record<string, string> = {
      fertilizer: 'ဓာတ်မြေဩဇာ',
      disaster: 'ဘေးအန္တရာယ်',
      seed: 'မျိုးစေ့',
      soil: 'မြေဆီလွှာ',
    };

    const postTypeLabels: Record<string, string> = {
      report: 'အစီရင်ခံ',
      question: 'မေးခွန်း',
      tip: 'အကြံပြုချက်',
    };

    const prompt = `
You are an agricultural expert assistant for Myanmar farmers.
Respond ONLY in Burmese language.

CONTEXT FROM KNOWLEDGE BASE:
${contextText || "No specific context retrieved. Use your general agricultural knowledge."}

USER QUERY:
- Category: ${categoryLabels[category]} (${category})
- Type: ${postTypeLabels[postType]} (${postType})
- Question: ${queryText}

INSTRUCTIONS:
1. Provide practical, actionable advice based on the retrieved context
2. If context is relevant, mention it in your response
3. If context is not relevant, use your general agricultural knowledge
4. Be encouraging and supportive
5. Consider local Myanmar farming context
6. Keep response concise but helpful (3-5 paragraphs max)

RESPONSE FORMAT:
- Start with a friendly greeting
- Provide specific recommendations
- End with encouragement

Respond in Burmese:
`.trim();

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    const response = await client.request({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
    });

    const data = response.data as any;
    const candidates = data.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    return candidates[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}

/**
 * Fallback responses when RAG/Gemini fails
 */
function getFallbackResponse(category: string): string {
  const fallbackResponses: Record<string, string> = {
    fertilizer: `မင်္ဂလာပါခင်ဗျာ။ ဓာတ်မြေဩဇာဆိုင်ရာ မေးခွန်းအတွက် ကျေးဇူးတင်ပါတယ်။

အထွက်နှုန်းကောင်းမွန်စေရန် အောက်ပါအချက်များကို လိုက်နာဆောင်ရွက်နိုင်ပါတယ် -

၁။ မြေဆီလွှာ စစ်ဆေးချက်အရ လိုအပ်သော ဓာတ်မြေဩဇာကိုသာ အသုံးပြုပါ
၂။ NPK အချိုးအစား မျှတစွာ အသုံးပြုပါ
၃။ သဘာဝ မြေဩဇာများကိုပါ တွဲဖက်အသုံးပြုပါ

ပိုမိုတိကျသော အကြံဉာဏ်ရရှိရန် ဒေသဆိုင်ရာ စိုက်ပျိုးရေး ဦးစီးဌာနနှင့် တိုင်ပင်ဆွေးနွေးနိုင်ပါတယ်။`,

    disaster: `မင်္ဂလာပါခင်ဗျာ။ ဘေးအန္တရာယ်ဆိုင်ရာ အစီရင်ခံစာအတွက် ကျေးဇူးတင်ပါတယ်။

အရေးပေါ် ဆောင်ရွက်ရမည့် အချက်များ -

၁။ လုံခြုံရာသို့ ဦးစွာရွှေ့ပြောင်းပါ
၂။ နစ်နာမှုကို မှတ်တမ်းတင်ပါ (ဓာတ်ပုံရိုက်ပါ)
၃။ ဒေသဆိုင်ရာ အာဏာပိုင်များကို အကြောင်းကြားပါ
၄။ အကူအညီလိုအပ်ပါက စိုက်ပျိုးရေး ဦးစီးဌာနကို ဆက်သွယ်ပါ

ဘေးကင်းပါစေခင်ဗျာ။`,

    seed: `မင်္ဂလာပါခင်ဗျာ။ မျိုးစေ့ဆိုင်ရာ မေးခွန်းအတွက် ကျေးဇူးတင်ပါတယ်။

ကောင်းမွန်သော မျိုးစေ့ရွေးချယ်နည်း -

၁။ အသားအရည်ကောင်းပြီး ပျက်စီးမှုကင်းစင်သော မျိုးစေ့ကို ရွေးပါ
၂။ သန့်ရှင်းပြီး ခြောက်သွေ့သော မျိုးစေ့ဖြစ်ပါစေ
၃။ သင့်ဒေသနှင့် ကိုက်ညီသော မျိုးကွဲကို ရွေးချယ်ပါ
၄။ အာမခံချက်ရှိသော မျိုးစေ့ဆိုင်မှ ဝယ်ယူပါ

ပိုမိုအသေးစိတ် သိရှိလိုပါက ဒေသဆိုင်ရာ စိုက်ပျိုးရေး ရုံးကို ဆက်သွယ်မေးမြန်းနိုင်ပါတယ်။`,

    soil: `မင်္ဂလာပါခင်ဗျာ။ မြေဆီလွှာဆိုင်ရာ မေးခွန်းအတွက် ကျေးဇူးတင်ပါတယ်။

မြေဆီလွှာ ကျန်းမာရေး ကောင်းမွန်စေရန် -

၁။ မြေဆီလွှာ စစ်ဆေးမှု ပြုလုပ်ပါ
၂။ သဘာဝ မြေဩဇာများ ထည့်သွင်းပါ
၃။ သီးနှံလှည့်လည် စိုက်ပျိုးပါ
၄။ မြေထိန်းသိမ်းရေး နည်းလမ်းများ ကျင့်သုံးပါ

ပိုမိုတိကျသော အကြံဉာဏ်အတွက် စိုက်ပျိုးရေး ပညာရှင်နှင့် တိုင်ပင်ဆွေးနွေးနိုင်ပါတယ်။`,
  };

  return fallbackResponses[category] || fallbackResponses.fertilizer;
}

/**
 * POST handler for RAG queries
 */
export async function POST(request: Request) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validated = RagRequestSchema.parse(body);

    // Step 1: Retrieve from RAG corpus
    const documents = await retrieveFromRag(validated.text);
    console.log(`[DEBUG] Retrieved ${documents.length} documents from RAG corpus`);
    if (documents.length > 0) {
      console.log(`[DEBUG] Top document: ${documents[0].title} (Score: ${documents[0].relevanceScore})`);
    }

    // Step 2: Generate response
    const answer = await generateResponse(
      validated.text,
      validated.category,
      validated.postType,
      documents
    );

    // Calculate confidence
    const avgRelevance = documents.length > 0
      ? documents.reduce((sum, doc) => sum + doc.relevanceScore, 0) / documents.length
      : 0.5;

    const response: RagResponse = {
      answer,
      confidence: Math.round(avgRelevance * 100),
      sources: documents,
    };

    return Response.json(response);
  } catch (error) {
    console.error('RAG API error:', error);

    // Return fallback response
    const body = await request.json().catch(() => ({ category: 'fertilizer' }));

    return Response.json({
      answer: getFallbackResponse(body.category || 'fertilizer'),
      confidence: 50,
      sources: [],
      isFallback: true,
    });
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Vertex AI RAG API is running',
    config: {
      projectId: CONFIG.projectId,
      location: CONFIG.location,
    },
  });
}
