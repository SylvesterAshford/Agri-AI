import { queryRagCorpus } from './vertexRagAI';

async function testRag() {
  console.log('Starting RAG test...');
  try {
    const result = await queryRagCorpus({
      text: 'အရွက်တွေဝါနေပါတယ် အကူအညီပေးပါ။', // "Leaves are turning yellow, please help."
      category: 'fertilizer',
      postType: 'question',
      imageBase64: 'fake-base64-image-string'
    });
    
    console.log('--- RAG Test Result (With Image) ---');
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
