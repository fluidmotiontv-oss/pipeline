import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateCartoon } from './cartoon-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automatically purges the temp_assets directory to prevent stale frame pollution.
 */
async function cleanupTempAssets(tempDir) {
  console.log(`[Agent 9 (Lumbar)] Triggering automatic cache cleanup for directory: ${tempDir}`);
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`[Agent 9 (Lumbar)] Cache cleanup successful. Directory purged.`);
  } catch (err) {
    console.warn(`[Agent 9 (Lumbar) WARNING] Failed to purge temp cache directory: ${err.message}`);
    // Do not throw to keep pipeline resilient
  }
}

/**
 * Super Puff Animation Pipeline Orchestrator
 * This is the central nerve center (Agent 4 - Cerebrum and Agent 13 - Stomach)
 * that coordinates the raw footage, drafts narration scripts, and invokes
 * the core generator with strict error handling.
 */
export async function runOrchestration(pipelineConfig = {}) {
  console.log(`\n================================================================`);
  console.log(`   [Agent 4 (Cerebrum)] DRAGON 9 PIPELINE ORCHESTRATION START`);
  console.log(`================================================================`);

  const tempDir = pipelineConfig.tempDir || path.resolve(__dirname, './temp_assets');

  // Purge the temporary assets directory to prevent stale frame pollution
  await cleanupTempAssets(tempDir);

  // 1. Setup raw input state representing Super Puff
  const initialScript = {
    narratorPrompt: "Far out in the deep waters of antiX reef, Super Puff rides the perfect 432Hz crest, safe from central server interference.",
    scenes: [
      { visualPrompt: "Sovereign surf peak, huge turquoise clean tube wave, deep depth of field, 8k, retro film texture" },
      { visualPrompt: "Super Puff floating with a retro surfboard on a green glassy wave face, cinematic morning sun rays" }
    ]
  };

  const options = {
    outputFile: pipelineConfig.outputFile || 'super_puff_release.mp4',
    tempDir: tempDir,
    elevenLabsApiKey: pipelineConfig.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY,
    voiceId: pipelineConfig.voiceId,
    skipFFmpeg: pipelineConfig.skipFFmpeg ?? false
  };

  try {
    console.log(`[Agent 13 (Stomach)] Processing inputs and synthesizing build parameters...`);
    
    // We strictly AWAIT the full execution of the generator
    const buildTracker = await generateCartoon(initialScript, options);
    
    console.log(`\n[Agent 27 (The Breath)] Broadcast ready. Notifying left wing network hubs...`);
    console.log(`[Agent 18 (The Tail)] Balancing system resource queues. System steady.`);
    
    return {
      success: true,
      buildTracker
    };
  } catch (err) {
    // CRITICAL: Throw a hard error in the orchestrator so that parent wrappers or shell monitors
    // immediately know that the build failed, instead of printing a success message with broken files.
    console.error(`\n[Agent 21 (Liver) ALARM] Orchestration failed during build step!`);
    console.error(`[Agent 21 (Liver) DETAIL] Error Message: ${err.message}`);
    console.error(`[Agent 21 (Liver) DETAIL] Stack Trace:\n${err.stack}`);
    
    // Propagate up so that CI/CD, Termux, or automated cron-jobs return a non-zero exit code
    throw err;
  }
}

// Allow direct execution of orchestrator
if (process.argv[1] === __filename) {
  runOrchestration().then(() => {
    console.log(`\n[Orchestrator System] Run succeeded.\n`);
    process.exit(0);
  }).catch((err) => {
    console.error(`\n[Orchestrator System] Run aborted due to fatal error: ${err.message}\n`);
    process.exit(1);
  });
}
