/**
 * Vertex AI RAG Service - Frontend Client
 *
 * This service calls the backend API route (/api/rag) which securely
 * handles Google Cloud credentials. Never call Vertex AI directly from frontend.
 */

export interface RagQuery {
  text: string;
  category: 'fertilizer' | 'disaster' | 'seed' | 'soil';
  postType: 'report' | 'question' | 'tip';
  imageUrl?: string;
}

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
  isFallback?: boolean;
}

/**
 * Query the RAG corpus via backend API
 */
export async function queryRagCorpus(query: RagQuery): Promise<RagResponse> {
  try {
    // Call our secure backend API
    const response = await fetch('/api/rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as RagResponse;
  } catch (error) {
    console.error('RAG Query error:', error);

    // Return fallback response
    return getFallbackResponse(query);
  }
}

/**
 * Fallback response when API fails
 */
function getFallbackResponse(query: RagQuery): RagResponse {
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

  return {
    answer: fallbackResponses[query.category] || fallbackResponses.fertilizer,
    confidence: 50,
    sources: [],
    isFallback: true,
  };
}
