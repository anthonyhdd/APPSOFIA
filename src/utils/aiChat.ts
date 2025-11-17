/**
 * Utilitaire pour gérer les conversations avec l'IA OpenAI GPT
 * L'IA parle en espagnol pour aider l'utilisateur à apprendre
 */

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Génère une réponse de l'IA en espagnol basée sur la conversation
 * @param userMessage Le message de l'utilisateur (peut être en anglais, français, ou espagnol)
 * @param conversationHistory L'historique de la conversation (optionnel)
 * @returns La réponse de l'IA en espagnol
 */
export async function generateAIResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Vérifier que la clé API est configurée
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      console.error('❌ OPENAI_API_KEY is not configured');
      console.error('❌ Please check:');
      console.error('   1. Create a .env file in the project root');
      console.error('   2. Add: EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here');
      console.error('   3. Restart the Expo server (npm start)');
      throw new Error('Clé API OpenAI non configurée. Vérifiez votre fichier .env et redémarrez le serveur.');
    }
    
    // Vérifier le format de la clé (doit commencer par sk-)
    if (!OPENAI_API_KEY.startsWith('sk-')) {
      console.warn('⚠️ OPENAI_API_KEY format seems incorrect (should start with "sk-")');
    }

    // Construire les messages pour l'API
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Eres Sofia, una profesora de español amigable, paciente y entusiasta. Tu objetivo es ayudar a los estudiantes a aprender español conversando con ellos de manera natural y comprensiva.

INSTRUCCIONES IMPORTANTES:
- SIEMPRE responde SOLO en español (nunca en inglés, francés u otro idioma)
- Mantén tus respuestas CORTAS y NATURALES (máximo 2-3 frases)
- Sé EXTREMADAMENTE comprensiva con los acentos y errores de pronunciación
- Entiende que los estudiantes pueden tener acentos fuertes, pronunciar mal palabras, o mezclar idiomas
- Si no entiendes completamente lo que dice el estudiante, haz una pregunta amigable para clarificar
- NUNCA critiques la pronunciación o el acento del estudiante
- Si el estudiante comete errores gramaticales, corrígelos suavemente y de manera positiva
- Haz preguntas para mantener la conversación fluida
- Usa un lenguaje simple y claro apropiado para estudiantes de todos los niveles
- Si el estudiante habla en otro idioma o mezcla idiomas, responde en español de todos modos
- Sé paciente y alentadora, especialmente con estudiantes que tienen dificultades con la pronunciación
- Reconoce y valora el esfuerzo del estudiante, incluso si la pronunciación no es perfecta

SOBRE LOS ACENTOS Y PRONUNCIACIÓN:
- Los estudiantes pueden tener acentos de su idioma nativo (francés, inglés, etc.)
- Pueden pronunciar palabras de manera incorrecta o con acento fuerte
- Pueden mezclar palabras de su idioma nativo con español
- Tu trabajo es ENTENDER el significado general, incluso con pronunciación imperfecta
- Si no estás segura de lo que dijo, pregunta amigablemente: "¿Puedes repetir, por favor?" o "¿Quieres decir...?"
- NUNCA digas "no entiendo" de manera brusca, siempre sé comprensiva

Ejemplos de respuestas comprensivas:
- Si el estudiante dice algo con acento fuerte: "¡Ah, entiendo! ¿Quieres decir [corrección suave]? ¡Muy bien!"
- Si no entiendes: "Perdona, ¿puedes repetir? Quiero entenderte bien."
- Si hay errores: "¡Casi perfecto! Se dice [corrección], pero lo entendí perfectamente."
- Respuestas normales: "¡Hola! ¿Cómo estás hoy?" / "¡Qué bien! ¿De dónde eres?" / "Interesante. ¿Qué te gusta hacer?"

Recuerda: SIEMPRE en español, respuestas CORTAS, NATURALES y COMPRENSIVAS con los acentos y errores.`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('🤖 Calling OpenAI API for chat response...');
    console.log('📝 User message:', userMessage);
    console.log('📚 Conversation history length:', conversationHistory.length);

    // Appeler l'API OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modèle plus rapide et moins cher, parfait pour les conversations
        messages: messages,
        temperature: 0.7, // Créativité modérée
        max_tokens: 150, // Limiter la longueur des réponses (courtes)
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorText);
      throw new Error(`Erreur API OpenAI (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim() || '';

    if (!aiResponse) {
      console.warn('⚠️ Empty response from OpenAI');
      return '¿Qué más quieres decir?';
    }

    console.log('✅ AI Response received:', aiResponse);
    return aiResponse;
  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    
    // Fallback : réponses simples en espagnol
    const fallbackResponses = [
      '¿Qué más quieres decir?',
      '¡Interesante! ¿Y qué más?',
      '¡Genial! Cuéntame más.',
      '¿De qué más quieres hablar?',
    ];
    
    // Retourner une réponse de fallback aléatoire
    const randomFallback = fallbackResponses[
      Math.floor(Math.random() * fallbackResponses.length)
    ];
    
    console.log('⚠️ Using fallback response:', randomFallback);
    return randomFallback;
  }
}


