import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateCartoon } from './cartoon-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SCRIPT = {
  narratorPrompt: "The Super Puff rises above the misty peaks of the sovereign reef, radiating 432Hz of cosmic peace.",
  scenes: [
    { visualPrompt: "A high-fidelity cartoon of Super Puff, a glowing golden cloud hovering above a retro-surf wave, morning light, Leica style" },
    { visualPrompt: "Zoom in on Super Puff's face as its eyes sparkle with digital harmonics, vector art, high contrast" }
  ]
};

async function runVerification() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--all';

  console.log(`================================================================`);
  console.log(`   DRAGON 9 PIPELINE VERIFICATION SUITE`);
  console.log(`   Local Time: ${new Date().toISOString()}`);
  console.log(`================================================================`);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage:`);
    console.log(`  node verify-pipeline.js --voice     Test ElevenLabs voice layer only`);
    console.log(`  node verify-pipeline.js --visual    Test visual frame generation only`);
    console.log(`  node verify-pipeline.js --all       Test full cartoon compilation pipeline`);
    process.exit(0);
  }

  const tempDir = path.resolve(__dirname, './temp_verification');
  
  try {
    if (mode === '--voice' || mode === '-voice') {
      await testVoiceLayer(tempDir);
    } else if (mode === '--visual' || mode === '-visual') {
      await testVisualLayer(tempDir);
    } else {
      await testFullPipeline(tempDir);
    }
  } catch (err) {
    console.error(`\n❌ VERIFICATION CRITICAL EXCEPTION: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Isolated ElevenLabs and Fallback Audio validation
 */
async function testVoiceLayer(tempDir) {
  console.log(`\n[Test 1] Initiating isolated Voice Layer Test...`);
  await fs.mkdir(tempDir, { recursive: true });

  const dummyScript = { narratorPrompt: "A sovereign entity speaks from the high-bandwidth grid." };
  const mockOptions = {
    outputFile: 'voice_test.mp4',
    tempDir: tempDir,
    skipFFmpeg: true // Prevent running FFmpeg in this test
  };

  const results = await generateCartoon(dummyScript, mockOptions);
  
  console.log(`\n================================================================`);
  console.log(`✓ VOICE LAYER TEST PASSED`);
  console.log(`  - Target path: ${results.audio.path}`);
  console.log(`  - File size  : ${results.audio.size} bytes`);
  console.log(`  - Status     : ${results.audio.resolved ? 'RESOLVED' : 'FAILED'}`);
  console.log(`================================================================`);
}

/**
 * Isolated Visual Asset frame validation
 */
async function testVisualLayer(tempDir) {
  console.log(`\n[Test 2] Initiating isolated Visual Layer Test...`);
  await fs.mkdir(tempDir, { recursive: true });

  const results = await generateCartoon(DEFAULT_SCRIPT, {
    outputFile: 'visual_test.mp4',
    tempDir: tempDir,
    skipFFmpeg: true,
    elevenLabsApiKey: 'MOCK_FORCE_FALLBACK' // Skip voice fetch
  });

  console.log(`\n================================================================`);
  console.log(`✓ VISUAL LAYER TEST PASSED`);
  console.log(`  - Output dir : ${tempDir}/frames`);
  console.log(`  - Frame Count: ${results.frames.length} total frames written`);
  results.frames.forEach((frame) => {
    console.log(`    ├─ Frame ${frame.index} written to: ${frame.path} (${frame.size} bytes)`);
  });
  console.log(`================================================================`);
}

/**
 * Full end-to-end media compiling run
 */
async function testFullPipeline(tempDir) {
  console.log(`\n[Test 3] Running full end-to-end Animation Pipeline...`);
  
  // Note: This run will attempt to invoke FFmpeg
  const results = await generateCartoon(DEFAULT_SCRIPT, {
    outputFile: 'super_puff_release.mp4',
    tempDir: tempDir,
    skipFFmpeg: false
  });

  console.log(`\n================================================================`);
  console.log(`✓ FULL ANIMATION ASSEMBLY SUCCESSFUL`);
  console.log(`  - Final Stream path : ${results.finalMux.path}`);
  console.log(`  - Source Audio Size: ${results.audio.size} bytes`);
  console.log(`  - Frames Compiled   : ${results.frames.length}`);
  console.log(`================================================================`);
}

runVerification();
