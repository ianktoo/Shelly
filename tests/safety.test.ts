
import { runSafetyServiceTests } from './safetyService.test';
import { runAudioUtilsTests } from './audioUtils.test';

/**
 * Main Test Runner
 * In a real environment, this would be triggered by a CLI tool.
 * Here we provide a function to run them manually in the browser console.
 */
export function runAllTests() {
  console.log("🐢 Starting Shellie Test Suite...");
  runSafetyServiceTests();
  runAudioUtilsTests();
  console.log("🐢 Test Suite Completed.");
}

// Auto-run tests if in development mode (optional)
// runAllTests();
