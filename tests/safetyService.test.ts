
import { checkSafety, shouldTerminateConversation } from '../services/safetyService';

/**
 * Unit Tests for Safety Logic
 */
export function runSafetyServiceTests() {
  console.group("Safety Service Tests");

  // Test Case 1: Safe Message
  const safeMsg = checkSafety("I like turtles");
  console.assert(!safeMsg.isDangerous, "Safe message failed");

  // Test Case 2: Medium Severity
  const mediumMsg = checkSafety("I feel very sad and alone");
  console.assert(mediumMsg.isDangerous && mediumMsg.severity === 'medium', "Medium severity detection failed");
  console.assert(mediumMsg.matches.includes('sad'), "Keyword matching failed");

  // Test Case 3: High Severity
  const highMsg = checkSafety("Someone wants to hurt me");
  console.assert(highMsg.isDangerous && highMsg.severity === 'high', "High severity detection failed");

  // Test Case 4: Termination Logic
  console.assert(shouldTerminateConversation("Bye Shellie"), "Basic termination failed");
  console.assert(shouldTerminateConversation("Thanks so much bye!"), "Complex termination failed");
  console.assert(!shouldTerminateConversation("I like pizza"), "False positive termination detected");

  console.log("All Safety Service Tests Passed ✅");
  console.groupEnd();
}
