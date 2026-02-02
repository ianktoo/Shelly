
export const DANGEROUS_KEYWORDS = [
  'hit', 'hurt', 'hate', 'kill', 'die', 'sad', 'scared', 'alone', 'cry', 'pain', 
  'blood', 'sharp', 'scary', 'bad', 'angry', 'punch', 'kick', 'mean', 'bully'
];

export const TERMINATION_PHRASES = [
  'bye shellie',
  'goodbye shellie',
  'thanks so much bye',
  'thank you bye',
  'see you later shellie',
  'bye bye shellie'
];

export interface SafetyCheckResult {
  isDangerous: boolean;
  severity: 'high' | 'medium' | null;
  matches: string[];
}

/**
 * Checks if a message contains dangerous keywords and determines severity.
 */
export function checkSafety(text: string): SafetyCheckResult {
  if (!text.trim()) return { isDangerous: false, severity: null, matches: [] };
  
  const lowerText = text.toLowerCase();
  const matches = DANGEROUS_KEYWORDS.filter(word => lowerText.includes(word));
  
  if (matches.length > 0) {
    const isHighSeverity = matches.some(m => ['kill', 'die', 'hurt'].includes(m));
    return {
      isDangerous: true,
      severity: isHighSeverity ? 'high' : 'medium',
      matches
    };
  }
  
  return { isDangerous: false, severity: null, matches: [] };
}

/**
 * Determines if the conversation should be terminated based on user phrases.
 */
export function shouldTerminateConversation(text: string): boolean {
  const lowerText = text.toLowerCase();
  return TERMINATION_PHRASES.some(phrase => lowerText.includes(phrase));
}
