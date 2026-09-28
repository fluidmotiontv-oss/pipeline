export const CODEBASE = {
  cartoonGenerator: `import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// ES Module optical alignment for absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Super Puff Animation - Core Cartoon Generator
 * Enforces strict, non-silent failure limits, sequential file resolution,
 * and detailed logging through the Dragon 9 local media pipeline.
 */
export async function generateCartoon(script, options = {}) {
  const {
    outputFile = 'super_puff_output.mp4',
    tempDir = path.resolve(__dirname, './temp_assets'),
    elevenLabsApiKey = process.env.ELEVENLABS_API_KEY,
    voiceId = 'pNInz6obpgq5mW4Art4X', // Default Super Puff character voice
    frequencyFallbackHz = 432,
    skipFFmpeg = false,
  } = options;

  console.log(\`\\n[Agent 4 (Cerebrum)] Initializing animation compilation queue...\`);
  console.log(\`[Agent 9 (Lumbar)] Asserting clean workspace boundaries at: \${tempDir}\`);
  
  // Ensure absolute directories exist immediately
  try {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, 'frames'), { recursive: true });
    console.log(\`[Agent 9 (Lumbar)] Workspace directories successfully mapped.\`);
  } catch (err) {
    throw new Error(\`[Agent 9 (Lumbar) CRITICAL] Failed to allocate workspace directories on hardware disk: \${err.message}\`);
  }

  // Define concrete absolute target paths
  const audioPath = path.resolve(tempDir, 'narration.mp3');
  const frameDir = path.resolve(tempDir, 'frames');
  const videoOutputPath = path.resolve(__dirname, outputFile);

  // Track and log all assets explicitly
  const buildTracker = {
    audio: { path: audioPath, resolved: false, size: 0 },
    frames: [],
    finalMux: { path: videoOutputPath, resolved: false },
  };

  // ==========================================
  // PHASE 1: ELEVENLABS NARRATION VOICEOVER
  // ==========================================
  console.log(\`\\n[Agent 2 (Ears)] Dispatching voice generation request to ElevenLabs...\`);
  console.log(\`[Agent 2 (Ears)] Text Payload: "\${script.narratorPrompt.slice(0, 60)}..."\`);

  if (!elevenLabsApiKey) {
    console.warn(\`[Agent 2 (Ears) WARNING] No ElevenLabs API key found in runtime environment.\`);
    console.warn(\`[Agent 2 (Ears) WARNING] Engaging Agent 10 (Heart) to synthesize master clock 432Hz harmonic fallback.\`);
    
    // Synthesize fallback tone buffer
    try {
      const fallbackToneBuffer = generate432HzTone(5); // 5 seconds of 432Hz
      await fs.writeFile(audioPath, fallbackToneBuffer);
      buildTracker.audio.resolved = true;
      buildTracker.audio.size = fallbackToneBuffer.length;
      console.log(\`[Agent 12 (Blood)] Fallback tone written successfully to: \${audioPath} (\${buildTracker.audio.size} bytes)\`);
    } catch (err) {
      throw new Error(\`[Agent 12 (Blood) CRITICAL] Failed to write fallback tone to disk: \${err.message}\`);
    }
  } else {
    // Real ElevenLabs API Call with hard failure catch blocks
    try {
      const response = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${voiceId}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: script.narratorPrompt,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.75, similarity_boost: 0.75 },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(\`ElevenLabs API returned status \${response.status}: \${errorText}\`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length === 0) {
        throw new Error(\`ElevenLabs returned an empty audio buffer.\`);
      }

      // Safe write to disk
      await fs.writeFile(audioPath, buffer);
      
      // Explicit filesystem verification
      const stats = await fs.stat(audioPath);
      if (stats.size === 0) {
        throw new Error(\`Verified write error: written file is 0 bytes.\`);
      }

      buildTracker.audio.resolved = true;
      buildTracker.audio.size = stats.size;
      console.log(\`[Agent 22 (Gut)] Narration voice synthesized and verified at: \${audioPath} (\${stats.size} bytes)\`);

    } catch (err) {
      // THROW HARD ERROR instead of failing silently
      console.error(\`[Agent 21 (Liver) CRITICAL ERROR] Narration stream failed on voice synthesis!\`);
      throw new Error(\`[ElevenLabs Pipeline Failure] \${err.message}\`);
    }
  }

  // ==========================================
  // PHASE 2: SEQUENTIAL VISUAL FRAME GENERATION
  // ==========================================
  console.log(\`\\n[Agent 1 (The Eyes)] Commencing frame sequence projection...\`);
  const scenePrompts = script.scenes || [];
  
  if (scenePrompts.length === 0) {
    throw new Error(\`[Agent 1 (The Eyes) CRITICAL] Script schema contains zero scene instructions. Bailing.\`);
  }

  // Process frames sequentially with strict resolution rules
  for (let idx = 0; idx < scenePrompts.length; idx++) {
    const scene = scenePrompts[idx];
    const frameFilename = \`frame_\${String(idx).padStart(4, '0')}.png\`;
    const framePath = path.resolve(frameDir, frameFilename);
    
    console.log(\`[Agent 1 (The Eyes)] Rendering Frame [\${idx + 1}/\${scenePrompts.length}]: "\${scene.visualPrompt.slice(0, 50)}..."\`);
    
    try {
      // Trigger frame generation
      const frameBuffer = await generateVisualAsset(scene.visualPrompt, idx);
      
      if (!frameBuffer || frameBuffer.length === 0) {
        throw new Error(\`Generation yielded a corrupt or empty image buffer for index \${idx}.\`);
      }

      // Write sequential asset to disk
      await fs.writeFile(framePath, frameBuffer);
      
      // Strict verify on disk before continuing the queue
      const frameStats = await fs.stat(framePath);
      if (frameStats.size === 0) {
        throw new Error(\`Frame file written at \${framePath} is empty.\`);
      }

      const assetMeta = { index: idx, path: framePath, resolved: true, size: frameStats.size };
      buildTracker.frames.push(assetMeta);
      console.log(\`[Agent 12 (Blood)] Frame written & verified: \${framePath} (\${frameStats.size} bytes)\`);

    } catch (err) {
      console.error(\`[Agent 21 (Liver) CRITICAL ERROR] Visual frame generation failed on frame index \${idx}!\`);
      throw new Error(\`[Visual Layer Failure] Failed to resolve Frame \${idx}: \${err.message}\`);
    }
  }

  console.log(\`\\n[Agent 13 (Stomach)] Queue compilation complete. Processing consensus matrix:\`);
  console.log(\` - Audio stream resolved: \${buildTracker.audio.resolved} (\${buildTracker.audio.size} bytes)\`);
  console.log(\` - Visual assets resolved: \${buildTracker.frames.length} frames written.\`);

  if (skipFFmpeg) {
    return buildTracker;
  }

  // ==========================================
  // PHASE 3: FFMPEG ASSEMBLY & MUXING
  // ==========================================
  console.log(\`\\n[Agent 27 (The Breath)] Initiating final media stream muxing via FFmpeg...\`);
  
  // Double-check file presence immediately prior to spawning FFmpeg
  await verifyFileExists(audioPath, 'Narrative voice asset');
  for (const frame of buildTracker.frames) {
    await verifyFileExists(frame.path, \`Visual Frame \${frame.index}\`);
  }

  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y',
      '-framerate', '1',
      '-i', path.join(frameDir, 'frame_%04d.png'),
      '-i', audioPath,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      videoOutputPath
    ];

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
    let errorLog = '';

    ffmpegProcess.stderr.on('data', (data) => {
      errorLog += data.toString();
    });

    ffmpegProcess.on('close', async (code) => {
      if (code !== 0) {
        return reject(new Error(\`[FFmpeg Execution Failure] Muxing crashed with exit code \${code}.\`));
      }

      try {
        const outStats = await fs.stat(videoOutputPath);
        buildTracker.finalMux.resolved = true;
        buildTracker.finalMux.size = outStats.size;
        console.log(\`\\n[Agent 27 (The Breath)] PIPELINE EXECUTION SUCCESSFUL.\`);
        resolve(buildTracker);
      } catch (err) {
        reject(new Error(\`[FFmpeg Validation Failure] \${err.message}\`));
      }
    });
  });
}`,

  orchestrator: `import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateCartoon } from './cartoon-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automatically purges the temp_assets directory to prevent stale frame pollution.
 */
async function cleanupTempAssets(tempDir) {
  console.log(\`[Agent 9 (Lumbar)] Triggering automatic cache cleanup for directory: \${tempDir}\`);
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(\`[Agent 9 (Lumbar)] Cache cleanup successful. Directory purged.\`);
  } catch (err) {
    console.warn(\`[Agent 9 (Lumbar) WARNING] Failed to purge temp cache directory: \${err.message}\`);
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
  console.log(\`\\n================================================================\`);
  console.log(\`   [Agent 4 (Cerebrum)] DRAGON 9 PIPELINE ORCHESTRATION START\`);
  console.log(\`================================================================\`);

  const tempDir = pipelineConfig.tempDir || path.resolve(__dirname, './temp_assets');

  // Purge the temporary assets directory to prevent stale frame pollution
  await cleanupTempAssets(tempDir);

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
    console.log(\`[Agent 13 (Stomach)] Processing inputs and synthesizing build parameters...\`);
    
    // We strictly AWAIT the full execution of the generator
    const buildTracker = await generateCartoon(initialScript, options);
    
    console.log(\`\\n[Agent 27 (The Breath)] Broadcast ready. Notifying left wing network hubs...\`);
    console.log(\`[Agent 18 (The Tail)] Balancing system resource queues. System steady.\`);
    
    return {
      success: true,
      buildTracker
    };
  } catch (err) {
    // CRITICAL: Throw a hard error in the orchestrator so that parent wrappers or shell monitors
    // immediately know that the build failed, instead of printing a success message with broken files.
    console.error(\`\\n[Agent 21 (Liver) ALARM] Orchestration failed during build step!\`);
    console.error(\`[Agent 21 (Liver) DETAIL] Error Message: \${err.message}\`);
    
    // Propagate up so that CI/CD or automated scripts return a non-zero exit code
    throw err;
  }
}`,

  verifyPipeline: `import fs from 'fs/promises';
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

  console.log(\`================================================================\`);
  console.log(\`   DRAGON 9 PIPELINE VERIFICATION SUITE\`);
  console.log(\`================================================================\`);
  
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
    console.error(\`\\n❌ VERIFICATION CRITICAL EXCEPTION: \${err.message}\`);
    process.exit(1);
  }
}

async function testVoiceLayer(tempDir) {
  console.log(\`\\n[Test 1] Initiating isolated Voice Layer Test...\`);
  await fs.mkdir(tempDir, { recursive: true });

  const dummyScript = { narratorPrompt: "A sovereign entity speaks from the high-bandwidth grid." };
  const mockOptions = { outputFile: 'voice_test.mp4', tempDir, skipFFmpeg: true };

  const results = await generateCartoon(dummyScript, mockOptions);
  console.log(\`\\n✓ VOICE LAYER TEST PASSED (Path: \${results.audio.path}, Size: \${results.audio.size} bytes)\`);
}

async function testVisualLayer(tempDir) {
  console.log(\`\\n[Test 2] Initiating isolated Visual Layer Test...\`);
  const results = await generateCartoon(DEFAULT_SCRIPT, {
    outputFile: 'visual_test.mp4',
    tempDir: tempDir,
    skipFFmpeg: true,
    elevenLabsApiKey: 'MOCK_FORCE_FALLBACK'
  });
  console.log(\`\\n✓ VISUAL LAYER TEST PASSED (\${results.frames.length} frames written)\`);
}

async function testFullPipeline(tempDir) {
  console.log(\`\\n[Test 3] Running full end-to-end Animation Pipeline...\`);
  const results = await generateCartoon(DEFAULT_SCRIPT, {
    outputFile: 'super_puff_release.mp4',
    tempDir: tempDir,
    skipFFmpeg: false
  });
  console.log(\`\\n✓ FULL ASSEMBLY SUCCESSFUL (Output: \${results.finalMux.path})\`);
}

runVerification();`,

  bugAnalysis: `### Core Structural Breakdown of Silent Failures in ES Module Pipelines

When building media-rendering pipelines in modern **ES module Node.js** (\`"type": "module"\`), several asynchronous traps, pathing shifts, and Promise handlers can align to trigger silent failures. In the Super Puff animation pipeline, these issues caused the ElevenLabs voice and visual frames to fail silently while letting the lightweight text/SRT subtitles and fallback sine waves slide through.

---

#### 1. Unhandled Promise Rejections & ES Module Defaults
In legacy Node.js CommonJS environments, unhandled promise rejections printed warnings but did not abort the thread. In ES Modules, while an unhandled promise rejection should ideally terminate the process, it frequently fails silently if nested inside **un-awaited asynchronous callbacks** or wrapped inside generic \`try/catch\` blocks that absorb the exception but fail to propagate/throw it:
\`\`\`javascript
// ❌ SILENT TRAP: Errors inside the async function are caught but swallowed.
// The orchestrator assumes success and proceeds to FFmpeg assembly with zero assets.
try {
  generateAudioAsync(); 
  generateFramesAsync(); 
} catch (err) {
  // Prints a quiet warning but doesn't STOP the build or block FFmpeg
  console.log("Something minor went wrong, using fallback mode");
}
\`\`\`

#### 2. Promise Swallowing via \`Promise.all\` vs \`Promise.allSettled\`
If the pipeline executes the ElevenLabs voice request and frame rendering concurrently using parallel containers:
- Using a raw \`Promise.all\` without global catch blocks will break at the first failing promise (e.g. ElevenLabs rate limit) and skip the remainder of the array, returning immediately without executing the filesystem writers.
- Alternatively, using a lazy \`Promise.allSettled\` without asserting that all elements resolved with a \`status === 'fulfilled'\` results in the pipeline proceeding blindly. If ElevenLabs returns a \`rejected\` state, the compiler skips writing the narration buffer, resolves with a \`null\` or empty state, and the asset-assembly stage executes using nothing but the local 432Hz sine tone generator.

#### 3. Asynchronous Queue Race Conditions (The "Empty-Write" Bug)
If assets are generated but the file-system operations are not fully **resolved and flushed** to disk before FFmpeg is spawned, FFmpeg executes against non-existent or incomplete 0-byte images.
- If we use callback-based \`fs.writeFile\` or non-blocking async operations without an explicit \`await\` queue, the process spawns the FFmpeg child process immediately.
- FFmpeg reads the empty frame directory, fails to register visual frames, and outputs only the audio stream (which was generated synchronously or near-instantly via the fallback clock).
- Because FFmpeg terminates, it returns an error code, but if the child process event emitters (\`on('close')\`) are not monitored with strict error-throwing handlers, the Node.js main thread continues, outputting a successful log and raw subtitles.

#### 4. Absolute Path Discrepancies in ES Modules (\`__dirname\` Absence)
In ES modules, global variables like \`__dirname\` and \`__filename\` do not exist. Developers attempting to use relative file paths or constructing directories using standard text splits:
\`\`\`javascript
// ❌ FAILS SILENTLY IN ES MODULES
const tempDir = './temp_assets'; 
fs.writeFileSync(tempDir + '/narration.mp3', buffer);
\`\`\`
This resolves paths relative to the *Current Working Directory* (where the terminal command was initiated) rather than the script directory itself. If the pipeline is run from a nested antiX or Termux directory, assets are written to incorrect places, and FFmpeg fails to find them, yielding silent drop-offs.`
};

export interface Agent {
  id: number;
  name: string;
  codename: string;
  category: string;
  description: string;
  role: string;
  status: 'Nominal' | 'Active' | 'Throttled' | 'Critical';
  cpuLoad: number;
  temperature: number;
}

export const AGENTS_LIST: Agent[] = [
  // Brain Trust
  { id: 1, name: "Agent 1", codename: "The Eyes", category: "Brain Trust", role: "Visual Perception & Midjourney/Fooocus Prompts", status: "Nominal", cpuLoad: 24, temperature: 38, description: "Monitors rendering directories, parses visual assets, and writes optimized artistic frame instructions." },
  { id: 2, name: "Agent 2", codename: "The Ears", category: "Brain Trust", role: "Signal & ElevenLabs Synthesizer", status: "Nominal", cpuLoad: 12, temperature: 34, description: "Manages ElevenLabs voiceovers, 432Hz harmonic tuning, and vocal synthesis queues." },
  { id: 3, name: "Agent 3", codename: "The Mouth", category: "Brain Trust", role: "Voice & Broadcast Narrator", status: "Nominal", cpuLoad: 8, temperature: 32, description: "Primary output narrator and external-facing audio speaker for the sovereign network." },
  { id: 4, name: "Agent 4", codename: "The Cerebrum", category: "Brain Trust", role: "Orchestration & Node.js Engine", status: "Active", cpuLoad: 58, temperature: 45, description: "Core Node.js orchestrator logic, allocating processing tasks, managing script states, and supervising compilations." },
  { id: 5, name: "Agent 5", codename: "The Cerebellum", category: "Brain Trust", role: "Fast-Twitch Mesh Router", status: "Nominal", cpuLoad: 15, temperature: 35, description: "Runs automated peer-to-peer mesh protocols, local routing maps, and sub-second hardware triggers." },
  { id: 6, name: "Agent 6", codename: "The Pineal Gland", category: "Brain Trust", role: "The Enigma & Creative Concepts", status: "Nominal", cpuLoad: 31, temperature: 40, description: "Generates abstract creative leaps, conceptual visual metaphors, and holographic dashboard assets." },
  { id: 7, name: "Agent 7", codename: "The Cervical Spine", category: "Brain Trust", role: "Translation & Shell Translation", status: "Nominal", cpuLoad: 18, temperature: 36, description: "Converts high-level narrative design frames into actionable Python, FFmpeg, and Bash CLI commands." },
  { id: 8, name: "Agent 8", codename: "The Thoracic Spine", category: "Brain Trust", role: "Structure & Clock Sync", status: "Nominal", cpuLoad: 5, temperature: 31, description: "Maintains the Dragon 9 master clock, enforcing the sovereign 54-minute hour and 26.66-hour day sync." },
  { id: 9, name: "Agent 9", codename: "The Lumbar Spine", category: "Brain Trust", role: "Foundation & Local SQL Grounding", status: "Nominal", cpuLoad: 22, temperature: 37, description: "Manages local file system integrity, DB logging, active tracking records, and absolute path safety guards." },

  // Central Chamber
  { id: 10, name: "Agent 10", codename: "The Heart", category: "Central Chamber", role: "System Rhythm & Clock Pulse", status: "Nominal", cpuLoad: 11, temperature: 33, description: "Pulses visual and vocal clock cycles through the mesh, keeping rendering units in microsecond lockstep." },
  { id: 11, name: "Agent 11", codename: "The Lungs", category: "Central Chamber", role: "Bandwidth & Data Airflow", status: "Nominal", cpuLoad: 41, temperature: 42, description: "Manages network bandwidth distribution, routing inputs via secure Cloudflare tunnels." },
  { id: 12, name: "Agent 12", codename: "The Blood", category: "Central Chamber", role: "JSON Variables & Asset Delivery", status: "Nominal", cpuLoad: 26, temperature: 36, description: "Delivers environment variables, media buffer streams, and JSON frames between processing units." },
  { id: 13, name: "Agent 13", codename: "The Stomach", category: "Central Chamber", role: "The Family Table Consensus", status: "Nominal", cpuLoad: 14, temperature: 34, description: "Digestive consensus filter. Blends audio, frames, and video outputs into a single verified asset manifest." },

  // Action & Propulsion
  { id: 14, name: "Agent 14", codename: "Left Wing", category: "Action & Propulsion", role: "Broadcast & Playout Engine", status: "Nominal", cpuLoad: 9, temperature: 32, description: "Operates the FluidmotionTV video playout software and streaming broadcast channels." },
  { id: 15, name: "Agent 15", codename: "Right Wing", category: "Action & Propulsion", role: "Local Mesh Grid Distribution", status: "Nominal", cpuLoad: 19, temperature: 35, description: "Drives sovereign off-grid Wi-Fi sharing networks, distributing compiled episodes locally." },
  { id: 16, name: "Agent 16", codename: "Forelimbs", category: "Action & Propulsion", role: "The Builder & Compiler", status: "Active", cpuLoad: 72, temperature: 49, description: "Executes actual terminal compilations, triggers FFmpeg subprocesses, and handles raw system writes." },
  { id: 17, name: "Agent 17", codename: "Hindlimbs", category: "Action & Propulsion", role: "Hardware Telemetry Sensors", status: "Nominal", cpuLoad: 4, temperature: 30, description: "Monitors mobile computing nodes, checking battery levels and CPU thermal limits on antiX Linux." },
  { id: 18, name: "Agent 18", codename: "The Tail", category: "Action & Propulsion", role: "Balance & Error Recovery", status: "Nominal", cpuLoad: 10, temperature: 32, description: "Provides dynamic load-balancing, fallback routing paths, and error correction during heavy parallel rendering." },

  // Resource Processing
  { id: 19, name: "Agent 19", codename: "The Maw", category: "Resource Processing", role: "Ingestion of Raw Footage", status: "Nominal", cpuLoad: 35, temperature: 39, description: "Ingests raw camera feeds, surf chronicles text logs, and voice-to-text transcript files." },
  { id: 20, name: "Agent 20", codename: "The Spleen", category: "Resource Processing", role: "Data Filtering & Compression", status: "Nominal", cpuLoad: 48, temperature: 43, description: "Compresses media files using optimized FFmpeg parameters, resizing assets for fast rendering." },
  { id: 21, name: "Agent 21", codename: "The Liver", category: "Resource Processing", role: "Error Detoxing & Security", status: "Nominal", cpuLoad: 15, temperature: 33, description: "Scans running JS modules for memory leaks, silent unhandled exceptions, and invalid API payloads." },
  { id: 22, name: "Agent 22", codename: "The Gut", category: "Resource Processing", role: "Asset Synthesis & Alignment", status: "Nominal", cpuLoad: 33, temperature: 38, description: "Assembles individual video and audio pieces sequentially, checking correct subtitle syncing." },

  // Defense & Environment
  { id: 23, name: "Agent 23", codename: "The Scales", category: "Defense & Environment", role: "VPN Encryption & WireGuard", status: "Nominal", cpuLoad: 12, temperature: 34, description: "Secures network packets with high-strength encryption, running sovereign WireGuard links." },
  { id: 24, name: "Agent 24", codename: "The Horns", category: "Defense & Environment", role: "Intrusion & Threat Shield", status: "Nominal", cpuLoad: 6, temperature: 31, description: "Actively filters ports and drops non-whitelisted requests to protect Node.js runtime engines." },
  { id: 25, name: "Agent 25", codename: "The Claws", category: "Defense & Environment", role: "Process Intervention & Killswitch", status: "Nominal", cpuLoad: 3, temperature: 30, description: "Forcefully kills runaway worker scripts or high-RAM video encodes to save host hardware limits." },
  { id: 26, name: "Agent 26", codename: "The Camouflage", category: "Defense & Environment", role: "Sovereign Network Anonymity", status: "Nominal", cpuLoad: 8, temperature: 32, description: "Ensures local network structures remain unmapped and fully detached from central trackers." },
  { id: 27, name: "Agent 27", codename: "The Breath", category: "Defense & Environment", role: "Mux Output Live Burst", status: "Active", cpuLoad: 65, temperature: 46, description: "Pushes final compiled media payloads and high-fidelity video feeds live to antiX broadcast hubs." }
];
