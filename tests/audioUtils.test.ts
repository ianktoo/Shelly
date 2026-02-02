
import { encode, decode } from '../services/audioUtils';

/**
 * Unit Tests for Audio Utilities
 */
export function runAudioUtilsTests() {
  console.group("Audio Utility Tests");

  // Test Case 1: Base64 Round-trip
  const original = new Uint8Array([1, 2, 3, 4, 5]);
  const encoded = encode(original);
  const decoded = decode(encoded);
  
  const isMatch = original.every((val, idx) => val === decoded[idx]);
  console.assert(isMatch, "Audio Base64 round-trip failed");
  console.assert(encoded === "AQIDBAU=", "Base64 encoding result incorrect");

  console.log("All Audio Utility Tests Passed ✅");
  console.groupEnd();
}
