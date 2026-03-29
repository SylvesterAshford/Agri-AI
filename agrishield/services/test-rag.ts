import { queryRagCorpus } from './vertexRagAI';

async function testRag() {
  console.log('Starting RAG test...');
  try {
    const result = await queryRagCorpus({
      text: 'ပဲစိုက်ပျိုးရာတွင် အကောင်းဆုံး ဓာတ်မြေဩဇာက ဘာလဲ?', // "What is the best fertilizer for growing beans/groundnuts?"
      category: 'fertilizer',
      postType: 'question'
    });
    
    console.log('--- RAG Test Result ---');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.sources && result.sources.length === 0 && result.confidence === 50) {
      console.log('⚠️ Warning: Returned fallback response, RAG might have failed.');
    } else {
      console.log('✅ RAG feature appears to be working.');
    }
  } catch (error) {
    console.error('❌ Error testing RAG:', error);
  }
}

testRag();
