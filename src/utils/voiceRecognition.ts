/**
 * Utilitaires pour la reconnaissance vocale
 * 
 * Ce fichier contient des fonctions helper pour la validation
 * et le traitement des transcriptions vocales
 */

/**
 * Normalise le texte pour la comparaison (minuscules, suppression des accents, etc.)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '') // Supprime la ponctuation
    .replace(/\s+/g, ' '); // Normalise les espaces
}

/**
 * Compare deux textes en tenant compte des variations
 */
export function compareTexts(userText: string, expectedText: string): boolean {
  const normalizedUser = normalizeText(userText);
  const normalizedExpected = normalizeText(expectedText);
  
  // Correspondance exacte
  if (normalizedUser === normalizedExpected) {
    return true;
  }
  
  // Vérifier si le texte utilisateur contient le texte attendu
  if (normalizedUser.includes(normalizedExpected)) {
    return true;
  }
  
  // Vérifier si le texte attendu contient le texte utilisateur
  if (normalizedExpected.includes(normalizedUser)) {
    return true;
  }
  
  // Comparaison par mots (au moins 70% des mots doivent correspondre)
  const userWords = normalizedUser.split(' ').filter(w => w.length > 0);
  const expectedWords = normalizedExpected.split(' ').filter(w => w.length > 0);
  
  if (userWords.length === 0 || expectedWords.length === 0) {
    return false;
  }
  
  const matchingWords = userWords.filter(word => 
    expectedWords.some(expectedWord => 
      word === expectedWord || 
      word.includes(expectedWord) || 
      expectedWord.includes(word)
    )
  ).length;
  
  const matchPercentage = matchingWords / Math.max(userWords.length, expectedWords.length);
  return matchPercentage >= 0.7;
}

/**
 * Valide une réponse vocale contre une réponse attendue
 */
export function validateVoiceAnswer(
  userTranscript: string,
  expectedAnswer: string | string[]
): { isValid: boolean; confidence: number; matchedAnswer?: string } {
  const expectedAnswers = Array.isArray(expectedAnswer) 
    ? expectedAnswer 
    : [expectedAnswer];
  
  let bestMatch: { answer: string; confidence: number } | null = null;
  
  for (const expected of expectedAnswers) {
    const normalizedUser = normalizeText(userTranscript);
    const normalizedExpected = normalizeText(expected);
    
    // Correspondance exacte
    if (normalizedUser === normalizedExpected) {
      return {
        isValid: true,
        confidence: 1.0,
        matchedAnswer: expected,
      };
    }
    
    // Calcul de la similarité
    const userWords = normalizedUser.split(' ').filter(w => w.length > 0);
    const expectedWords = normalizedExpected.split(' ').filter(w => w.length > 0);
    
    if (userWords.length === 0 || expectedWords.length === 0) {
      continue;
    }
    
    const matchingWords = userWords.filter(word => 
      expectedWords.some(expectedWord => 
        word === expectedWord || 
        word.includes(expectedWord) || 
        expectedWord.includes(word)
      )
    ).length;
    
    const confidence = matchingWords / Math.max(userWords.length, expectedWords.length);
    
    if (!bestMatch || confidence > bestMatch.confidence) {
      bestMatch = { answer: expected, confidence };
    }
  }
  
  // Être très indulgent : accepter si la confiance est >= 0.2 (au lieu de 0.3)
  if (bestMatch && bestMatch.confidence >= 0.2) {
    return {
      isValid: true,
      confidence: bestMatch.confidence,
      matchedAnswer: bestMatch.answer,
    };
  }
  
  return {
    isValid: false,
    confidence: bestMatch?.confidence || 0,
  };
}

