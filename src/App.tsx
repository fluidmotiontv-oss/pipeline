import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Terminal, 
  Cpu, 
  Layers, 
  Code2, 
  AlertOctagon, 
  CheckCircle2, 
  Flame, 
  Volume2, 
  RefreshCw, 
  Copy, 
  Check, 
  Settings, 
  FileCode, 
  Sparkles, 
  Clock, 
  Radio, 
  ShieldAlert, 
  Activity, 
  Heart, 
  Compass, 
  HardDrive, 
  SlidersHorizontal,
  ChevronRight,
  Download
} from 'lucide-react';
import { CODEBASE, AGENTS_LIST, Agent } from './data/codebase';
import { GoogleGenAI } from '@google/genai';

export default function App() {
  // Current active tab
  const [activeTab, setActiveTab] = useState<'matrix' | 'diagnostics' | 'code' | 'simulator' | 'sandbox'>('matrix');
  
  // Selected agent for detailed telemetry
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS_LIST.find(a => a.codename === 'The Cerebrum') || AGENTS_LIST[3]);
  
  // Terpene state: modulates the entire system's mood and performance telemetry
  const [terpeneState, setTerpeneState] = useState<'limonene' | 'myrcene' | 'caryophyllene' | 'linalool'>('limonene');
  
  // Active code file being viewed in Code Hub
  const [activeCodeFile, setActiveCodeFile] = useState<'generator' | 'orchestrator' | 'verify'>('generator');
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeHighlightSection, setCodeHighlightSection] = useState<string | null>(null);

  // Script Generator inputs & states
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem('DRAGON9_GEMINI_KEY') || '';
  });
  const [storyFocus, setStoryFocus] = useState('Super Puff rides the anti-telecom wave on antiX Linux reef');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState({
    narratorPrompt: "Far out in the deep waters of antiX reef, Super Puff rides the perfect 432Hz crest, safe from central server interference.",
    scenes: [
      { id: 1, visualPrompt: "Sovereign surf peak, huge turquoise clean tube wave, deep depth of field, 8k, retro film texture" },
      { id: 2, visualPrompt: "Super Puff floating with a retro surfboard on a green glassy wave face, cinematic morning sun rays" }
    ]
  });

  // Simulator state
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simProgress, setSimProgress] = useState(0);
  const [simulateVoiceError, setSimulateVoiceError] = useState(false);
  const [simulateVisualError, setSimulateVisualError] = useState(false);
  const [hasElevenLabsKey, setHasElevenLabsKey] = useState(false);
  const [simulatedMediaPlaying, setSimulatedMediaPlaying] = useState(false);
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0);
  const [activeError, setActiveError] = useState<{ message: string; stack?: string; agent?: string; action?: string } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [renderedSceneIds, setRenderedSceneIds] = useState<number[]>([]);
  const [previewFrame, setPreviewFrame] = useState<{ idx: number; prompt: string } | null>(null);

  // Sandbox terminal states
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxMode, setSandboxMode] = useState<string | null>(null);

  // System local time synchronization (Dragon 9 calendar: 54-minute hour, 26.66-hour day synchronization)
  const [timeMode, setTimeMode] = useState<'local' | 'sandbox' | 'nz'>('nz');
  const [dragonTime, setDragonTime] = useState({
    hour: 0,
    minute: 0,
    second: 0,
    cycle: 'Nominal',
    ratio: '1.11x'
  });

  // Real clock ticking for dashboard immersive visuals
  useEffect(() => {
    const interval = setInterval(() => {
      let now = new Date();
      
      if (timeMode === 'nz') {
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        now = new Date(utc + (3600000 * 13)); // NZ Clock Offset (UTC+13)
      } else if (timeMode === 'sandbox') {
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        now = new Date(utc + (3600000 * -7)); // Sandbox Clock Offset (UTC-7)
      }

      // Translate normal time to 54-minute hour, 26.66-hour daily synchronization
      // Since 26.666 hours * 54 minutes * 60 seconds = 86400 seconds, standard seconds match Dragon seconds exactly!
      const totalSecondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      
      const dragonHour = Math.floor(totalSecondsToday / (54 * 60));
      const dragonMinute = Math.floor((totalSecondsToday % (54 * 60)) / 60);
      const dragonSecond = Math.floor(totalSecondsToday % 60);
      
      setDragonTime({
        hour: dragonHour,
        minute: dragonMinute,
        second: dragonSecond,
        cycle: dragonHour >= 13 ? 'Ebb Flow' : 'High Frequency',
        ratio: (26.666 / 24).toFixed(3) + 'x'
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeMode]);

  // Save Gemini Key to localStorage for convenient developer reuse
  const handleSaveGeminiKey = (key: string) => {
    setGeminiKey(key);
    localStorage.setItem('DRAGON9_GEMINI_KEY', key);
  };

  // High-Resolution PNG canvas generator & downloader
  const downloadFrame = (idx: number, prompt: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Grid matrix overlay
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1920; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1080);
      ctx.stroke();
    }
    for (let y = 0; y < 1080; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }

    // Stylized Waves
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 700);
    ctx.bezierCurveTo(480, 500, 960, 900, 1440, 600);
    ctx.bezierCurveTo(1680, 450, 1800, 550, 1920, 500);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 750);
    ctx.bezierCurveTo(480, 550, 960, 950, 1440, 650);
    ctx.stroke();

    // Central neon golden Super Puff glowing ball
    ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
    ctx.beginPath();
    ctx.arc(960, 540, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.beginPath();
    ctx.arc(960, 540, 100, 0, Math.PI * 2);
    ctx.fill();

    // Board Line
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(850, 560);
    ctx.lineTo(1070, 520);
    ctx.stroke();

    // Frame headers text
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('DRAGON 9 PIPELINE AUTOMATION', 100, 100);

    ctx.fillStyle = '#64748b';
    ctx.font = '24px monospace';
    ctx.fillText(`FRAME SEQUENCE INDEX: 000${idx}`, 100, 150);
    ctx.fillText('STATUS: RESOLVED · SYSTEM NOMINAL · ANTIX-DRAGON9-NODE', 100, 190);

    // Rendered Prompt Title
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 32px sans-serif';
    const words = prompt.split(' ');
    let line = '';
    let y = 880;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > 1700 && n > 0) {
        ctx.fillText(line, 100, y);
        line = words[n] + ' ';
        y += 45;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, y);

    // Save
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `super_puff_frame_000${idx}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Iterates through all DOM elements with the .render-gallery-item class to trigger batch exports
  const downloadAllFrames = () => {
    const items = document.querySelectorAll('.render-gallery-item');
    if (items.length === 0) return;

    let exportCount = 0;
    items.forEach((item) => {
      const idxStr = item.getAttribute('data-idx');
      const prompt = item.getAttribute('data-prompt');
      const isRenderedVal = item.getAttribute('data-rendered') === 'true';

      if (idxStr !== null && prompt !== null && isRenderedVal) {
        const idx = parseInt(idxStr, 10);
        setTimeout(() => {
          downloadFrame(idx, prompt);
        }, exportCount * 250);
        exportCount++;
      }
    });
  };

  // Helper: Copy codebase string
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Agent telemetry modifier based on the selected Terpene state
  const getModifiedAgents = (): Agent[] => {
    return AGENTS_LIST.map(agent => {
      let loadMod = 0;
      let tempMod = 0;
      let status = agent.status;

      if (terpeneState === 'limonene') {
        // High focus render mode: high CPU and temps on engines
        if (['The Cerebrum', 'Forelimbs', 'The Breath', 'The Eyes'].includes(agent.codename)) {
          loadMod = 22;
          tempMod = 8;
          status = 'Active';
        } else {
          loadMod = -3;
          tempMod = -1;
        }
      } else if (terpeneState === 'myrcene') {
        // Creative text generation & narrative alignment
        if (['The Pineal Gland', 'The Maw', 'The Mouth', 'The Ears'].includes(agent.codename)) {
          loadMod = 18;
          tempMod = 5;
          status = 'Active';
        } else {
          loadMod = -10;
          tempMod = -4;
          status = 'Nominal';
        }
      } else if (terpeneState === 'caryophyllene') {
        // System Shield and error detox
        if (['The Liver', 'The Scales', 'The Horns', 'The Tail'].includes(agent.codename)) {
          loadMod = 25;
          tempMod = 6;
          status = 'Active';
        } else {
          loadMod = -5;
          tempMod = -2;
        }
      } else if (terpeneState === 'linalool') {
        // Sovereign Sync: Balanced operations
        loadMod = -2;
        tempMod = -3;
        status = 'Nominal';
      }

      return {
        ...agent,
        cpuLoad: Math.min(100, Math.max(2, agent.cpuLoad + loadMod)),
        temperature: Math.min(80, Math.max(25, agent.temperature + tempMod)),
        status: status as any
      };
    });
  };

  const modifiedAgents = getModifiedAgents();
  const currentAgentData = modifiedAgents.find(a => a.id === selectedAgent.id) || selectedAgent;

  // Gemini API script generation logic
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      if (geminiKey.trim()) {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const prompt = `You are Agent 6 (The Pineal Gland) and Agent 3 (The Mouth) writing a cartoon script for "Super Puff Surf Chronicles".
Create a JSON response with exact structured script data for a narrative.
Target Topic or Focus: "${storyFocus}"

The response MUST be a JSON object containing EXACTLY:
{
  "narratorPrompt": "A single continuous voice narration script paragraph (~100 words), highly evocative, sovereign surfing spirit theme",
  "scenes": [
    { "visualPrompt": "Detailed comic-art scene 1 prompt focusing on Super Puff" },
    { "visualPrompt": "Detailed comic-art scene 2 prompt focusing on Super Puff" },
    { "visualPrompt": "Detailed comic-art scene 3 prompt focusing on Super Puff" }
  ]
}

Only return raw JSON code. No markdown boxes, no outer formatting. Just the JSON text.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        // Clean markdown backticks if any slipped in
        const cleanJsonText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const parsed = JSON.parse(cleanJsonText);
        
        if (parsed.narratorPrompt && Array.isArray(parsed.scenes)) {
          setGeneratedScript({
            narratorPrompt: parsed.narratorPrompt,
            scenes: parsed.scenes.map((s: any, idx: number) => ({
              id: idx + 1,
              visualPrompt: s.visualPrompt || s // accommodate variations
            }))
          });
        } else {
          throw new Error("Invalid script structure returned from Gemini model.");
        }
      } else {
        // High fidelity procedural local generation (fallback)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const proceduralNarrations = [
          `Out in the deep liquid corridors of antiX ${storyFocus.toLowerCase() || 'wave'}, the Super Puff locks eyes with the cosmic shoreline. Every atom hums in 432Hz resonance, floating pristine above the automated telecom net. No server-side telemetry can track this clean drop.`,
          `Breathing deep, the Super Puff harnesses the sovereign airflows of antiX reefs. Guided by the Lumbar spine and the clock cycle of Dragon 9, the surfboard carves a line of absolute purity, carving away the tracking nodes of the central world.`,
          `The digital matrix tries to isolate the wave, but Super Puff reads the ocean's raw signal. Armed with wireguard scales and liver detox filters, the board finds the high-focus pocket, exploding out of the tube with a burst of terminal code.`
        ];
        
        const proceduralScenes = [
          [
            { id: 1, visualPrompt: "Sovereign surf peak, huge sapphire tube wave, morning sunbeams, antiX linux aesthetic, cinematic film grain" },
            { id: 2, visualPrompt: "Super Puff carved deep in the wave pocket, glowing neon aura, retro vintage camera lens distortion" },
            { id: 3, visualPrompt: "Detailed shot of anti-telecom mesh antenna on a retro wooden surfboard, surf wax, 4k" }
          ],
          [
            { id: 1, visualPrompt: "Super Puff paddling toward the high horizon, glowing golden lines, heavy storm ocean, fine-art painting style" },
            { id: 2, visualPrompt: "Enormous clean turquoise wave face with Super Puff performing a dramatic layout turn, spray looking like code text" },
            { id: 3, visualPrompt: "Close-up on Super Puff eyes sparkling in emerald-green light, looking at the distant sovereign shore" }
          ]
        ];

        const randomIdx = Math.floor(Math.random() * proceduralNarrations.length);
        setGeneratedScript({
          narratorPrompt: proceduralNarrations[randomIdx],
          scenes: proceduralScenes[Math.floor(Math.random() * proceduralScenes.length)]
        });
      }
    } catch (err: any) {
      console.error(err);
      alert("Error generating script: " + err.message + ". Reverting to default high-fidelity local script.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Compile Simulator Execution
  const runCompileSimulation = async () => {
    setSimState('running');
    setSimProgress(0);
    setSimulatedMediaPlaying(false);
    setMediaCurrentTime(0);
    setRenderedSceneIds([]);
    
    const logs: string[] = [];
    const pushLog = (text: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
      setSimLogs([...logs]);
    };

    try {
      pushLog("🎬 [Agent 4 (Cerebrum)] Initializing Dragon 9 media queue compilation...");
      setSimProgress(5);
      await new Promise(r => setTimeout(r, 600));

      pushLog("📁 [Agent 9 (Lumbar Spine)] Mapping asset file system boundaries at absolute workspace: ~/dragon9/temp_assets/ ...");
      pushLog("📁 [Agent 9 (Lumbar Spine)] Verifying directory presence: ~/dragon9/temp_assets/frames/");
      setSimProgress(15);
      await new Promise(r => setTimeout(r, 700));

      pushLog("🎤 [Agent 2 (Ears)] Dispatching narrator vocal request to ElevenLabs API cluster...");
      pushLog(`🎤 [Agent 2 (Ears)] Prompt Text Length: ${generatedScript.narratorPrompt.length} characters`);
      setSimProgress(25);
      await new Promise(r => setTimeout(r, 1200));

      if (simulateVoiceError) {
        pushLog("❌ [Agent 21 (Liver) ALARM] ElevenLabs voice synthesis failed! Server returned status 401 (Unauthorized: Invalid API Key).");
        pushLog("❌ [Agent 21 (Liver) ALARM] Silent failures are DISABLED. Cartoon Generator is aborting with hard exception.");
        throw new Error("ElevenLabs Pipeline Failure: API key is invalid or rate limits exceeded.");
      }

      if (hasElevenLabsKey) {
        pushLog("✓ [Agent 22 (Gut)] ElevenLabs synthesizer resolved successfully. Writing premium 192kbps MP3 stream...");
        pushLog("✓ [Agent 12 (Blood)] Asset successfully recorded: ~/dragon9/temp_assets/narration.mp3 (384,102 bytes).");
      } else {
        pushLog("⚠️ [Agent 2 (Ears) WARNING] ElevenLabs API key absent. Engaging Agent 10 (Heart) clock harmonic.");
        pushLog("⚠️ [Agent 10 (Heart)] Synthesizing fallback 432Hz sine frequency tone...");
        await new Promise(r => setTimeout(r, 800));
        pushLog("✓ [Agent 12 (Blood)] Fallback tone buffer written to disk: ~/dragon9/temp_assets/narration.mp3 (12,800 bytes).");
      }
      setSimProgress(45);
      await new Promise(r => setTimeout(r, 600));

      pushLog(`🎨 [Agent 1 (The Eyes)] Dispatching visual projection query. Resolving ${generatedScript.scenes.length} frames...`);
      setSimProgress(55);

      for (let i = 0; i < generatedScript.scenes.length; i++) {
        const scene = generatedScript.scenes[i];
        pushLog(`🎨 [Agent 1 (The Eyes)] Commencing frame render ${i + 1}/${generatedScript.scenes.length}...`);
        await new Promise(r => setTimeout(r, 1000));

        if (simulateVisualError && i === 1) {
          pushLog(`❌ [Agent 21 (Liver) ALARM] Rendering engine crashed on Frame 2 (Error: Local GPU out of VRAM / connection reset).`);
          pushLog(`❌ [Agent 21 (Liver) ALARM] Queue block aborting immediately to prevent compiling broken or empty frame sequences.`);
          throw new Error(`Visual Layer Failure: Frame 2 failed to compile: Connection reset by peer.`);
        }

        const mockSize = 42000 + Math.floor(Math.random() * 8000);
        pushLog(`✓ [Agent 12 (Blood)] Frame written and disk verified: ~/dragon9/temp_assets/frames/frame_000${i}.png (${mockSize.toLocaleString()} bytes).`);
        setRenderedSceneIds(prev => [...prev, scene.id]);
        setSimProgress(55 + Math.floor(((i + 1) / generatedScript.scenes.length) * 25));
      }

      pushLog("🍲 [Agent 13 (Stomach)] Queue complete. Digesting variables and validating asset files on physical disk...");
      pushLog("✓ [Agent 13 (Stomach)] Assets confirmed present. No 0-byte or corrupted stream chunks detected.");
      setSimProgress(85);
      await new Promise(r => setTimeout(r, 800));

      pushLog("🎬 [Agent 27 (The Breath)] Spawning FFmpeg muxing subprocess...");
      pushLog("🎬 [Agent 7 (Cervical)] Command line mapping: ffmpeg -y -framerate 1 -i ~/dragon9/temp_assets/frames/frame_%04d.png -i ~/dragon9/temp_assets/narration.mp3 -c:v libx264 -pix_fmt yuv420p -shortest ~/dragon9/super_puff_release.mp4");
      await new Promise(r => setTimeout(r, 1400));
      pushLog("[FFmpeg Console Output] frame=    3 fps=0.0 q=28.0 size=   418kB time=00:00:03.00 bitrate=1114.7kbits/s speed=2.1x");
      pushLog("[FFmpeg Console Output] video:382kB audio:32kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: 1.05%");
      
      const finalSize = 1242104 + Math.floor(Math.random() * 200000);
      pushLog(`✓ [Agent 27 (The Breath)] Subprocess completed with exit code 0.`);
      pushLog(`✓ [Agent 27 (The Breath)] LIVE MEDIA RELEASE RECORDED: ~/dragon9/super_puff_release.mp4 (${finalSize.toLocaleString()} bytes).`);
      
      setSimProgress(100);
      setSimState('completed');
    } catch (err: any) {
      pushLog(`🚨 Fatal Exception: ${err.message}`);
      setSimState('failed');
      setActiveError({
        message: err.message,
        stack: err.stack || `Error: ${err.message}\n    at generateCartoon (cartoon-generator.js:113:13)\n    at async runOrchestration (orchestrator.js:33:24)\n    at async runCompileSimulation (App.tsx:313:11)`,
        agent: simulateVoiceError ? 'Agent 2 (The Ears) · ElevenLabs Synthesizer' : simulateVisualError ? 'Agent 1 (The Eyes) · Render Core' : 'Agent 21 (The Liver) · Error Detoxification',
        action: simulateVoiceError ? 'Voice synthesis dispatch failed on rate limit or authorization limits.' : 'Sequential frame buffer write interrupted due to rendering sub-engine process crash.'
      });
      setShowErrorModal(true);
    }
  };

  // Live media player ticking
  useEffect(() => {
    let playInterval: any;
    if (simulatedMediaPlaying) {
      playInterval = setInterval(() => {
        setMediaCurrentTime(prev => {
          if (prev >= 6.0) {
            setSimulatedMediaPlaying(false);
            return 0;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(playInterval);
  }, [simulatedMediaPlaying]);

  // Sandbox Terminal Script Exporter
  const executeSandboxCommand = async (cmd: 'voice' | 'visual' | 'all') => {
    setIsSandboxRunning(true);
    setSandboxMode(cmd);
    const logs: string[] = [];
    const pushLog = (text: string) => {
      logs.push(text);
      setSandboxLogs([...logs]);
    };

    pushLog(`$ node verify-pipeline.js --${cmd}`);
    await new Promise(r => setTimeout(r, 500));
    pushLog(`================================================================`);
    pushLog(`   DRAGON 9 PIPELINE VERIFICATION SUITE`);
    pushLog(`   Local Time: ${new Date().toISOString()}`);
    pushLog(`================================================================`);
    await new Promise(r => setTimeout(r, 600));

    if (cmd === 'voice') {
      pushLog(`[Test 1] Initiating isolated Voice Layer Test...`);
      await new Promise(r => setTimeout(r, 800));
      pushLog(`[Agent 2 (Ears)] Dispatching voice generation request to ElevenLabs...`);
      
      if (simulateVoiceError) {
        pushLog(`[Agent 21 (Liver) CRITICAL ERROR] Narration stream failed on voice synthesis!`);
        pushLog(`❌ VERIFICATION CRITICAL EXCEPTION: [ElevenLabs Pipeline Failure] ElevenLabs API returned status 401`);
        setIsSandboxRunning(false);
        setActiveError({
          message: "[ElevenLabs Pipeline Failure] ElevenLabs API returned status 401: Unauthorized access token",
          stack: `Error: ElevenLabs API returned status 401 (Unauthorized)\n    at generateCartoon (cartoon-generator.js:87:15)\n    at async testVoiceLayer (verify-pipeline.js:63:19)\n    at async runVerification (verify-pipeline.js:33:7)`,
          agent: "Agent 2 (The Ears) · ElevenLabs Synthesizer",
          action: "Vocal pipeline failed. Please provide a valid ElevenLabs key or switch to 432Hz harmonic fallback mode."
        });
        setShowErrorModal(true);
        return;
      }

      if (hasElevenLabsKey) {
        pushLog(`[Agent 22 (Gut)] Narration voice synthesized and verified at: ~/dragon9/temp_verification/narration.mp3 (142080 bytes)`);
      } else {
        pushLog(`[Agent 2 (Ears) WARNING] No ElevenLabs API key found in runtime environment.`);
        pushLog(`[Agent 2 (Ears) WARNING] Engaging Agent 10 (Heart) to synthesize master clock 432Hz harmonic fallback.`);
        pushLog(`[Agent 12 (Blood)] Fallback tone written successfully to: ~/dragon9/temp_verification/narration.mp3 (12800 bytes)`);
      }
      pushLog(`\n✓ VOICE LAYER TEST PASSED`);
      pushLog(`  - Target path: ~/dragon9/temp_verification/narration.mp3`);
      pushLog(`  - File size  : ${hasElevenLabsKey ? '142080' : '12800'} bytes`);
      pushLog(`  - Status     : RESOLVED`);

    } else if (cmd === 'visual') {
      pushLog(`[Test 2] Initiating isolated Visual Layer Test...`);
      await new Promise(r => setTimeout(r, 600));
      pushLog(`[Agent 1 (The Eyes)] Commencing frame sequence projection...`);
      pushLog(`[Agent 1 (The Eyes)] Rendering Frame [1/2]: "A high-fidelity cartoon of Super Puff..."`);
      await new Promise(r => setTimeout(r, 500));
      pushLog(`[Agent 12 (Blood)] Frame written & verified: ~/dragon9/temp_verification/frames/frame_0000.png (48201 bytes)`);
      
      pushLog(`[Agent 1 (The Eyes)] Rendering Frame [2/2]: "Zoom in on Super Puff's face..."`);
      await new Promise(r => setTimeout(r, 500));

      if (simulateVisualError) {
        pushLog(`[Agent 21 (Liver) CRITICAL ERROR] Visual frame generation failed on frame index 1!`);
        pushLog(`❌ VERIFICATION CRITICAL EXCEPTION: [Visual Layer Failure] Failed to resolve Frame 1: Connection reset by peer.`);
        setIsSandboxRunning(false);
        setActiveError({
          message: "[Visual Layer Failure] Failed to resolve Frame 1: Connection reset by peer",
          stack: `Error: Visual frame generation failed on frame index 1!\n    at generateCartoon (cartoon-generator.js:158:13)\n    at async testVisualLayer (verify-pipeline.js:88:19)\n    at async runVerification (verify-pipeline.js:35:7)`,
          agent: "Agent 1 (The Eyes) · Render Core",
          action: "Sequential frame compiler failed. Double check GPU availability or local frame buffers."
        });
        setShowErrorModal(true);
        return;
      }

      pushLog(`[Agent 12 (Blood)] Frame written & verified: ~/dragon9/temp_verification/frames/frame_0001.png (51204 bytes)`);
      
      pushLog(`\n✓ VISUAL LAYER TEST PASSED`);
      pushLog(`  - Output dir : ~/dragon9/temp_verification/frames`);
      pushLog(`  - Frame Count: 2 total frames written`);
      pushLog(`    ├─ Frame 0 written to: ~/dragon9/temp_verification/frames/frame_0000.png (48201 bytes)`);
      pushLog(`    ├─ Frame 1 written to: ~/dragon9/temp_verification/frames/frame_0001.png (51204 bytes)`);

    } else {
      pushLog(`[Test 3] Running full end-to-end Animation Pipeline...`);
      await new Promise(r => setTimeout(r, 800));
      pushLog(`[Agent 4 (Cerebrum)] Initializing animation compilation queue...`);
      pushLog(`[Agent 9 (Lumbar)] Asserting clean workspace boundaries...`);
      pushLog(`[Agent 2 (Ears)] Dispatching voice generation...`);
      
      if (simulateVoiceError) {
        pushLog(`❌ VERIFICATION CRITICAL EXCEPTION: [ElevenLabs Pipeline Failure] API key is invalid or rate limits exceeded.`);
        setIsSandboxRunning(false);
        setActiveError({
          message: "[ElevenLabs Pipeline Failure] API key is invalid or rate limits exceeded",
          stack: `Error: ElevenLabs API returned status 401 (Unauthorized)\n    at generateCartoon (cartoon-generator.js:87:15)\n    at async runVerification (verify-pipeline.js:104:19)\n    at async runVerification (verify-pipeline.js:33:7)`,
          agent: "Agent 2 (The Ears) · ElevenLabs Synthesizer",
          action: "Provide valid ElevenLabs credentials or disable simulated voice errors."
        });
        setShowErrorModal(true);
        return;
      }
      pushLog(`[Agent 12 (Blood)] Audio written successfully to disk.`);
      
      pushLog(`[Agent 1 (The Eyes)] Rendering Frame [1/2]`);
      await new Promise(r => setTimeout(r, 400));
      pushLog(`[Agent 1 (The Eyes)] Rendering Frame [2/2]`);
      await new Promise(r => setTimeout(r, 400));
      
      if (simulateVisualError) {
        pushLog(`❌ VERIFICATION CRITICAL EXCEPTION: [Visual Layer Failure] Failed to resolve Frame 1`);
        setIsSandboxRunning(false);
        setActiveError({
          message: "[Visual Layer Failure] Failed to resolve Frame 1 due to pipeline render reset",
          stack: `Error: Visual frame generation failed on frame index 1!\n    at generateCartoon (cartoon-generator.js:158:13)\n    at async runVerification (verify-pipeline.js:109:19)\n    at async runVerification (verify-pipeline.js:35:7)`,
          agent: "Agent 1 (The Eyes) · Render Core",
          action: "Check render logs for GPU timeouts or out-of-memory errors."
        });
        setShowErrorModal(true);
        return;
      }

      pushLog(`[Agent 27 (The Breath)] Initiating final media stream muxing via FFmpeg...`);
      await new Promise(r => setTimeout(r, 800));
      pushLog(`[Agent 27 (The Breath)] PIPELINE EXECUTION SUCCESSFUL.`);
      
      pushLog(`\n✓ FULL ASSEMBLY SUCCESSFUL`);
      pushLog(`  - Final Stream path : ~/dragon9/super_puff_release.mp4`);
      pushLog(`  - Source Audio Size: ${hasElevenLabsKey ? '142,080' : '12,800'} bytes`);
      pushLog(`  - Frames Compiled   : 2`);
    }

    setIsSandboxRunning(false);
  };

  // Helper code lines highlighter
  const highlightCodeBlocks = (file: 'generator' | 'orchestrator' | 'verify') => {
    const raw = CODEBASE[file === 'generator' ? 'cartoonGenerator' : file === 'orchestrator' ? 'orchestrator' : 'verifyPipeline'];
    return raw;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* 3-Zone Top Bar Contract */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-50">
        {/* Zone 1: Brand title, single line, no badges */}
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-500 animate-pulse shrink-0" />
          <span className="text-md font-bold tracking-tight font-mono text-emerald-400 whitespace-nowrap">
            DRAGON 9 PIPELINE COCKPIT
          </span>
        </div>

        {/* Zone 2: Navigation Links, 1-2 word labels, single line */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-900">
          <button 
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-all whitespace-nowrap ${activeTab === 'matrix' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            Sovereign Matrix
          </button>
          <button 
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-all whitespace-nowrap ${activeTab === 'diagnostics' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            Silent Drop Diagnostics
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-all whitespace-nowrap ${activeTab === 'code' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            Cartoon Generator Core
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-all whitespace-nowrap ${activeTab === 'simulator' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            Pipeline Simulator
          </button>
          <button 
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-all whitespace-nowrap ${activeTab === 'sandbox' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            Verification Sandbox
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSimulateVoiceError(false);
              setSimulateVisualError(false);
              setTerpeneState('linalool');
              setSandboxLogs([]);
              setSimLogs([]);
              setSimState('idle');
            }}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-800 bg-slate-900/50 text-slate-300 rounded-md hover:bg-slate-900 hover:text-slate-100 transition-colors text-xs font-mono whitespace-nowrap"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Console
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Secondary Sub-Header: System Telemetry Row */}
        <div className="bg-slate-950 border-b border-slate-900/60 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono text-slate-400">
              Dragon Clock: <span className="text-emerald-400 font-bold tabular-nums">{String(dragonTime.hour).padStart(2, '0')}:{String(dragonTime.minute).padStart(2, '0')}:{String(dragonTime.second).padStart(2, '0')}</span>
            </span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span className="font-mono">Time Sync: {dragonTime.cycle}</span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span className="font-mono">Expansion Rate: {dragonTime.ratio}</span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px]">Zone:</span>
              <select
                value={timeMode}
                onChange={(e) => setTimeMode(e.target.value as any)}
                className="bg-slate-900 text-[10px] text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="nz">Auckland (NZDT)</option>
                <option value="sandbox">Sandbox Host (PDT)</option>
                <option value="local">Your Device</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono">Sovereign Grid: <span className="text-emerald-500">27/27 Nodes Operational</span></span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span className="font-mono">FFmpeg Muxer: <span className="text-cyan-400">Isolated & Checked</span></span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span className="font-mono">ElevenLabs Mode: <span className="text-amber-500">{hasElevenLabsKey ? 'Premium Vocals' : 'Fallback Harmonic 432Hz'}</span></span>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* ================================================================ */}
          {/* TAB 1: SOVEREIGN MATRIX & 27 AGENTS */}
          {/* ================================================================ */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              
              {/* Terpene Modulation Panel (Modulation Layer) */}
              <div className="border border-slate-900 bg-slate-900/20 rounded-xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4.5 w-4.5 text-violet-400" />
                      <h2 className="text-sm font-bold tracking-tight uppercase font-mono text-violet-300">
                        Modulation Layer: Endocannabinoid & Terpene Flow
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 max-w-2xl">
                      Modulate the local mesh network's state to prevent agent processing gridlocks. 
                      Shifting the terpene chemistry updates system priority logs, CPU stress maps, and thermal clock balances in real time.
                    </p>
                  </div>
                  
                  {/* Interactive segmented controls for Terpenes */}
                  <div className="flex flex-wrap p-1 bg-slate-950 border border-slate-900 rounded-lg max-w-md shrink-0">
                    <button 
                      onClick={() => setTerpeneState('limonene')}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-md font-mono transition-all whitespace-nowrap ${terpeneState === 'limonene' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Limonene (Render)
                    </button>
                    <button 
                      onClick={() => setTerpeneState('myrcene')}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-md font-mono transition-all whitespace-nowrap ${terpeneState === 'myrcene' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Myrcene (Creative)
                    </button>
                    <button 
                      onClick={() => setTerpeneState('caryophyllene')}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-md font-mono transition-all whitespace-nowrap ${terpeneState === 'caryophyllene' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Caryophyllene (Detox)
                    </button>
                    <button 
                      onClick={() => setTerpeneState('linalool')}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-md font-mono transition-all whitespace-nowrap ${terpeneState === 'linalool' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Linalool (Sync)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-900/60">
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
                    <span className="text-slate-500 font-mono block mb-1">Active Terpene Profile</span>
                    <span className="font-semibold text-slate-200 uppercase font-mono tracking-wider">
                      {terpeneState === 'limonene' && '🍊 Limonene (D-Isomer)'}
                      {terpeneState === 'myrcene' && '🌿 Myrcene (Beta-Myrcene)'}
                      {terpeneState === 'caryophyllene' && '🪵 Beta-Caryophyllene'}
                      {terpeneState === 'linalool' && '🪻 Linalool Monoterpene'}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
                    <span className="text-slate-500 font-mono block mb-1">Receptor Balance</span>
                    <span className="font-mono text-slate-200">
                      {terpeneState === 'limonene' && 'CB1: Throttled (12%) · CB2: Active (88%)'}
                      {terpeneState === 'myrcene' && 'CB1: Hyper-Bound (94%) · CB2: Soft (30%)'}
                      {terpeneState === 'caryophyllene' && 'CB1: Balanced (50%) · CB2: Saturated (100%)'}
                      {terpeneState === 'linalool' && 'CB1: Homeostasis · CB2: Homeostasis'}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
                    <span className="text-slate-500 font-mono block mb-1">Mesh Power Focus</span>
                    <span className="font-mono text-slate-200">
                      {terpeneState === 'limonene' && 'CPU Render Core (High Flow)'}
                      {terpeneState === 'myrcene' && 'Creative Text & Narrative Logic'}
                      {terpeneState === 'caryophyllene' && 'Error Isolation & Memory Clear'}
                      {terpeneState === 'linalool' && 'Sub-Second Harmonic Equalization'}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
                    <span className="text-slate-500 font-mono block mb-1">Average Grid Temp</span>
                    <span className={`font-mono font-bold ${terpeneState === 'limonene' ? 'text-orange-400' : terpeneState === 'myrcene' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {terpeneState === 'limonene' && '44.8°C (Elevated)'}
                      {terpeneState === 'myrcene' && '35.2°C (Cool)'}
                      {terpeneState === 'caryophyllene' && '38.4°C (Normal)'}
                      {terpeneState === 'linalool' && '31.1°C (Ambient)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Master Split View: 27 Agent Grid & Selected Agent Inspection Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Columns (2/3): The 27-Agent Core Matrix */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono">
                      Sovereign Peer-To-Peer Mesh (27 Active Agent Nodes)
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Click node to inspect telemetry
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {modifiedAgents.map((agent) => {
                      const isSelected = selectedAgent.id === agent.id;
                      return (
                        <button
                          key={agent.id}
                          onClick={() => setSelectedAgent(agent)}
                          className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden group ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-950/10 ring-1 ring-emerald-500/20' 
                              : 'border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40'
                          }`}
                        >
                          {/* Indicator glow light */}
                          <div className={`absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full ${
                            agent.status === 'Critical' 
                              ? 'bg-rose-500 animate-ping' 
                              : agent.status === 'Active'
                              ? 'bg-emerald-400 animate-pulse'
                              : 'bg-emerald-500/30'
                          }`} />

                          <div className="font-mono text-[10px] text-slate-500 mb-0.5">
                            {agent.name}
                          </div>
                          <div className="font-semibold text-slate-200 text-xs truncate">
                            {agent.codename}
                          </div>
                          
                          {/* Tiny CPU progress bar in node button */}
                          <div className="mt-2.5 space-y-1">
                            <div className="flex justify-between text-[8px] font-mono text-slate-500">
                              <span>CPU</span>
                              <span className="tabular-nums">{agent.cpuLoad}%</span>
                            </div>
                            <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-500" 
                                style={{ width: `${agent.cpuLoad}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column (1/3): Selected Agent Inspection Cockpit */}
                <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-900">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-emerald-400">{currentAgentData.name}</div>
                      <h4 className="text-md font-bold text-slate-100">{currentAgentData.codename}</h4>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono block">Primary Domain Role</span>
                      <span className="text-slate-200 font-medium">{currentAgentData.role}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono block">Category Boundary</span>
                      <span className="text-slate-400 font-medium">{currentAgentData.category}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono block">Node Description</span>
                      <p className="text-slate-300 leading-relaxed">{currentAgentData.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-900">
                        <span className="text-slate-500 font-mono text-[10px] block mb-0.5">Node Status</span>
                        <span className={`font-semibold font-mono text-[11px] ${
                          currentAgentData.status === 'Active' ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {currentAgentData.status}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-900">
                        <span className="text-slate-500 font-mono text-[10px] block mb-0.5">CPU Thermal</span>
                        <span className="font-semibold font-mono text-[11px] text-slate-200 tabular-nums">
                          {currentAgentData.temperature}°C
                        </span>
                      </div>
                    </div>

                    {/* Node Stream Output Terminal Emulator */}
                    <div className="pt-3 border-t border-slate-900 space-y-2">
                      <span className="text-slate-500 font-mono block">Active Logging stream</span>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 h-32 font-mono text-[10px] leading-relaxed text-slate-400 overflow-y-auto space-y-1.5 scrollbar-thin">
                        <div className="text-slate-600">[System Start Init]</div>
                        <div>[Sync] Synchronizing clock cycle of {currentAgentData.codename} with Dragon 9 master</div>
                        <div className="text-emerald-400">[Nominal] Verification boundaries checked successfully</div>
                        {terpeneState === 'limonene' && ['The Cerebrum', 'Forelimbs', 'The Breath'].includes(currentAgentData.codename) && (
                          <div className="text-amber-400 animate-pulse">[Rendering-High] Heavy sequential processing active in pipeline</div>
                        )}
                        {terpeneState === 'myrcene' && ['The Pineal Gland', 'The Mouth'].includes(currentAgentData.codename) && (
                          <div className="text-cyan-400 animate-pulse">[Creative-Flow] Drafting structured narrative coordinates</div>
                        )}
                        <div>[Telemetry] CPU: {currentAgentData.cpuLoad}% · Temp: {currentAgentData.temperature}°C</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: SILENT DROP DIAGNOSTICS & ANALYSIS */}
          {/* ================================================================ */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-6">
              
              {/* Core Warning Box */}
              <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-bold tracking-tight text-slate-100 font-mono uppercase">
                      Media Layer Failure Alert: Silent Drops Investigated
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      During the previous pipeline compilation, visual frames and ElevenLabs voice streams failed completely, leaving only a 
                      harmonic fallback tone and raw text subtitles. Our telemetry isolated the failure to standard ES module promise behaviors 
                      and unverified async queues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comprehensive Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2/3 Column: Academic Systems Report */}
                <div className="lg:col-span-2 border border-slate-900 bg-slate-900/20 rounded-xl p-6 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold tracking-tight text-emerald-400 font-mono">
                      Systems Engineering Analysis Report
                    </h2>
                    <p className="text-xs text-slate-400">
                      Formulated by Agent 4 (Cerebrum), Agent 9 (Lumbar Spine) and Agent 21 (The Liver).
                    </p>
                  </div>

                  <div className="prose prose-invert prose-xs text-xs text-slate-300 space-y-4 max-w-none leading-relaxed">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                        1. Unhandled Promise Rejections & ES Module Context
                      </h4>
                      <p>
                        In legacy CommonJS environments, unhandled promise rejections generated stdout warnings but didn't halt operations. In modern ES Modules, unhandled rejections often cause silent crashes when wrapped in generic, non-propagating try-catch containers that absorb the error inside parallel loops but fail to prevent the orchestrator from marching into FFmpeg assembly with zero assets.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                        2. The Async Queue Race Condition (FFmpeg Spawn)
                      </h4>
                      <p>
                        Our logs show that visual assets are requested asynchronously, but the orchestrator does not block execution to await their file stream writes. FFmpeg starts as a parallel child process immediately, finding only empty folders. FFmpeg errors out silently, and the script exits cleanly while leaving behind nothing but the fallback tone (which is generated synchronously) and SRT subtitles (lightweight text).
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                        3. Pathing Resolution Shifts
                      </h4>
                      <p>
                        Because ES modules do not natively support global parameters like <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-400 font-mono">__dirname</code>, constructing paths relative to the executing shell instead of the script file location causes assets to be written to wrong directories. This makes the local asset directories disappear during the build phase.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1/3 Column: Diagnostic Verification Steps */}
                <div className="space-y-6">
                  
                  {/* Pipeline Checkpoints checklist */}
                  <div className="border border-slate-900 bg-slate-900/20 rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-bold font-mono text-slate-200 uppercase">
                      Diagnostic Resolution Plan
                    </h4>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-200 block">Explicit Catch & Throw</span>
                          <span className="text-slate-400 text-[11px]">Force immediate pipeline abort with hard exceptions instead of silent fallback.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-200 block">Sequential Promise Queue</span>
                          <span className="text-slate-400 text-[11px]">Enforce sequential generation so every single PNG frame resolves entirely to disk before FFmpeg starts.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-200 block">ESM Absolute Paths</span>
                          <span className="text-slate-400 text-[11px]">Apply `fileURLToPath` alignment to resolve paths absolute to the script file.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-200 block">Physical Filesystem Verifiers</span>
                          <span className="text-slate-400 text-[11px]">Run physical disk checks (fs.stat size &gt; 0) prior to starting compiler.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active telemetry logs */}
                  <div className="border border-slate-900 bg-slate-900/20 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold font-mono text-slate-200 uppercase flex items-center justify-between">
                      <span>Error Detox Telemetry</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      The security scales (Agent 23) and detox unit (Agent 21) are actively scanning processes for unhandled module rejections.
                    </p>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-950 font-mono text-[10px] text-emerald-500 space-y-1">
                      <div>[Scan 00:02:40] Active handles: 0</div>
                      <div>[Scan 00:02:41] ESM threads: nominal</div>
                      <div className="text-slate-500">[Scan 00:02:42] Listening for process.on('unhandledRejection')</div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: CARTOON GENERATOR CORE (CODE EMBED) */}
          {/* ================================================================ */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              
              {/* File selectors */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex p-1 bg-slate-900 border border-slate-900 rounded-lg max-w-md">
                  <button 
                    onClick={() => {
                      setActiveCodeFile('generator');
                      setCodeHighlightSection(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-all whitespace-nowrap ${activeCodeFile === 'generator' ? 'bg-slate-950 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    cartoon-generator.js
                  </button>
                  <button 
                    onClick={() => {
                      setActiveCodeFile('orchestrator');
                      setCodeHighlightSection(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-all whitespace-nowrap ${activeCodeFile === 'orchestrator' ? 'bg-slate-950 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    orchestrator.js
                  </button>
                  <button 
                    onClick={() => {
                      setActiveCodeFile('verify');
                      setCodeHighlightSection(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-all whitespace-nowrap ${activeCodeFile === 'verify' ? 'bg-slate-950 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    verify-pipeline.js
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Code feature highlighters */}
                  {activeCodeFile === 'generator' && (
                    <div className="hidden md:flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-500">Highlight Code:</span>
                      <button 
                        onClick={() => setCodeHighlightSection('trycatch')}
                        className={`px-2 py-1 rounded border border-slate-800 hover:bg-slate-900 transition-all ${codeHighlightSection === 'trycatch' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'text-slate-400'}`}
                      >
                        Try/Catch Blocks
                      </button>
                      <button 
                        onClick={() => setCodeHighlightSection('queue')}
                        className={`px-2 py-1 rounded border border-slate-800 hover:bg-slate-900 transition-all ${codeHighlightSection === 'queue' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'text-slate-400'}`}
                      >
                        Async Queue
                      </button>
                      <button 
                        onClick={() => setCodeHighlightSection('verify')}
                        className={`px-2 py-1 rounded border border-slate-800 hover:bg-slate-900 transition-all ${codeHighlightSection === 'verify' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'text-slate-400'}`}
                      >
                        File Path Logging
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => handleCopyCode(highlightCodeBlocks(activeCodeFile))}
                    className="flex items-center gap-2 px-3 py-1.5 border border-slate-800 bg-slate-900/50 text-slate-300 rounded-md hover:bg-slate-900 hover:text-slate-100 transition-colors text-xs font-mono whitespace-nowrap"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedCode ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
              </div>

              {/* Code explanation cards */}
              {codeHighlightSection && activeCodeFile === 'generator' && (
                <div className="bg-slate-900/10 border border-slate-900 rounded-lg p-4 text-xs animate-fadeIn space-y-2">
                  {codeHighlightSection === 'trycatch' && (
                    <>
                      <div className="font-mono text-amber-400 font-bold uppercase">Hard Errors Explicit Try/Catch System</div>
                      <p className="text-slate-300">
                        We have placed an explicit check inside the ElevenLabs API request. If the API returns any error status, it throws a 
                        hard exception (<code className="bg-slate-950 text-rose-400 px-1 py-0.5 rounded">throw new Error(...)</code>) 
                        instead of failing silently or using a silent mock fallback, halting the orchestrator immediately.
                      </p>
                    </>
                  )}
                  {codeHighlightSection === 'queue' && (
                    <>
                      <div className="font-mono text-cyan-400 font-bold uppercase">Sequential Resolution Queue</div>
                      <p className="text-slate-300">
                        The visual frame renderer uses a strict sequential loop (<code className="bg-slate-950 text-cyan-400 px-1 py-0.5 rounded">for (let idx = 0; idx &lt; scenePrompts.length; idx++)</code>) 
                        where every single frame asset is generated, written to disk, and verified via <code className="bg-slate-950 text-emerald-400 px-1 py-0.5 rounded">fs.stat</code> 
                        completely BEFORE continuing to the next scene index, ensuring that no file system race conditions exist when FFmpeg is spawned.
                      </p>
                    </>
                  )}
                  {codeHighlightSection === 'verify' && (
                    <>
                      <div className="font-mono text-emerald-400 font-bold uppercase">Asset Path & Filesystem Logging</div>
                      <p className="text-slate-300">
                        The generator creates an absolute asset tracker map (<code className="bg-slate-950 text-emerald-400 px-1 py-0.5 rounded">buildTracker</code>) and validates each 
                        absolute path directly via <code className="bg-slate-950 text-emerald-400 px-1 py-0.5 rounded">fs.stat</code> prior to FFmpeg starting. 
                        It prints out the exact location and byte-size of the audio and frame files, giving developers instant asset visibility.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Mock Code Editor */}
              <div className="border border-slate-900 bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
                <div className="bg-slate-900/60 px-4 py-2 flex items-center justify-between border-b border-slate-900 text-xs shrink-0 font-mono">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">
                      {activeCodeFile === 'generator' && '~/dragon9/cartoon-generator.js'}
                      {activeCodeFile === 'orchestrator' && '~/dragon9/orchestrator.js'}
                      {activeCodeFile === 'verify' && '~/dragon9/verify-pipeline.js'}
                    </span>
                  </div>
                  <span className="text-slate-600">ES Module · JavaScript</span>
                </div>

                <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 select-text scrollbar-thin">
                  <pre className="whitespace-pre">
                    {highlightCodeBlocks(activeCodeFile)}
                  </pre>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: PIPELINE SIMULATOR */}
          {/* ================================================================ */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              
              {/* Top Row: Story Planner & Script Generator via Gemini */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2/3 Column: Storyboard Config and Generator */}
                <div className="lg:col-span-2 border border-slate-900 bg-slate-900/20 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-bold tracking-tight uppercase font-mono text-slate-100">
                      Phase 1: Draft Sovereign Script & Storyboard via Gemini Core
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-500 font-mono block">Story Core Focus</label>
                        <input 
                          type="text" 
                          value={storyFocus}
                          onChange={(e) => setStoryFocus(e.target.value)}
                          placeholder="e.g. Super Puff evades satellite trackers on antiX wave"
                          className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-500 font-mono block flex items-center justify-between">
                          <span>Google Gemini API Key</span>
                          <span className="text-[10px] text-slate-600">Saves to local storage</span>
                        </label>
                        <input 
                          type="password" 
                          value={geminiKey}
                          onChange={(e) => handleSaveGeminiKey(e.target.value)}
                          placeholder="Paste GEMINI_API_KEY to run live model calls"
                          className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-slate-500">
                        {geminiKey ? '✓ Gemini Integration Enabled (Live 2.5-flash)' : 'Using high-fidelity local procedural scripts (No API key)'}
                      </div>
                      <button 
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded hover:bg-emerald-400 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isGeneratingScript ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Drafting Storyboard...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Draft Script Coordinates
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Generated Script Display */}
                  <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-4 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                      <span className="font-mono text-slate-500 font-bold">Draft Output Matrix</span>
                      <span className="font-mono text-emerald-400">Status: Formatted & Verified</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono block">Voiceover Narration Script:</span>
                      <p className="text-slate-200 leading-relaxed font-mono text-[11px] bg-slate-950 p-2.5 rounded border border-slate-900/60">
                        {generatedScript.narratorPrompt}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-slate-500 font-mono block">Visual Storyboard Frames:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {generatedScript.scenes.map((scene) => (
                          <div key={scene.id} className="bg-slate-950/40 p-2.5 rounded border border-slate-900 flex items-start gap-2 text-[10px]">
                            <span className="h-4 w-4 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono shrink-0">
                              {scene.id}
                            </span>
                            <span className="text-slate-300 font-mono leading-normal">{scene.visualPrompt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rendered Asset Preview Gallery */}
                    <div className="space-y-3 pt-4 border-t border-slate-900/60">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className="text-slate-500 font-mono flex items-center gap-1.5 text-xs">
                          <Layers className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                          <span>Interactive Render Gallery (Live Asset Previews):</span>
                        </span>
                        
                        {renderedSceneIds.length > 0 && (
                          <button
                            onClick={downloadAllFrames}
                            className="flex items-center justify-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
                          >
                            <Play className="h-3 w-3 animate-pulse" />
                            Download All ({renderedSceneIds.length} Frames)
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {generatedScript.scenes.map((scene, idx) => {
                          const isRendered = renderedSceneIds.includes(scene.id);
                          const isActive = simState === 'running' && !isRendered && (renderedSceneIds.length === idx);
                          
                          return (
                            <div 
                              key={scene.id} 
                              data-idx={idx}
                              data-prompt={scene.visualPrompt}
                              data-rendered={isRendered ? 'true' : 'false'}
                              className={`render-gallery-item rounded-xl border overflow-hidden relative flex flex-col justify-between transition-all duration-300 ${
                                isRendered 
                                  ? 'border-emerald-500/30 bg-slate-900/40 ring-1 ring-emerald-500/10 shadow-lg shadow-emerald-950/20' 
                                  : isActive 
                                  ? 'border-orange-500/40 bg-slate-900/60 ring-1 ring-orange-500/20' 
                                  : 'border-slate-900 bg-slate-950/40 opacity-40'
                              }`}
                            >
                              {/* Visual Preview Box */}
                              <div 
                                onClick={() => isRendered && setPreviewFrame({ idx, prompt: scene.visualPrompt })}
                                className={`aspect-video relative overflow-hidden flex flex-col justify-between p-3.5 select-none bg-slate-950 ${isRendered ? 'cursor-zoom-in group/preview' : ''}`}
                              >
                                
                                {isRendered ? (
                                  <>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 opacity-90 transition-all duration-300 group-hover/preview:opacity-80" />
                                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-cyan-500/25 to-transparent blur-md" />
                                    <div className={`absolute bottom-3 left-6 right-6 h-1 rounded-full bg-gradient-to-r from-emerald-500/60 via-cyan-500/60 to-emerald-500/60 animate-pulse`} />
                                    
                                    {/* Hover action overlay */}
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-all duration-300 z-20">
                                      <div className="bg-slate-900/95 border border-cyan-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 shadow-xl shadow-slate-950/50">
                                        <Sparkles className="h-3 w-3 animate-pulse" />
                                        <span>Click to Inspect Frame</span>
                                      </div>
                                    </div>

                                    {/* Golden floating Puff symbol */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center space-y-1">
                                      <div className="h-8 w-12 rounded-full bg-gradient-to-br from-yellow-300/30 to-amber-500/30 border border-amber-400/40 blur-xs flex items-center justify-center text-[8px] font-mono font-bold text-yellow-300">
                                        PUFF
                                      </div>
                                      <span className="text-[7px] text-slate-500 tracking-widest font-mono">FRAME_000{idx}</span>
                                    </div>

                                    {/* Metadata badges overlay */}
                                    <div className="z-10 flex justify-between items-center w-full">
                                      <span className="text-[8px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 uppercase font-semibold">
                                        Verified
                                      </span>
                                      <span className="text-[8px] font-mono text-slate-500">1920x1080 · PNG</span>
                                    </div>

                                    <div className="z-10 text-[8px] font-mono text-slate-400 leading-tight line-clamp-1 truncate bg-slate-950/80 px-2 py-1 rounded border border-slate-900 self-start mt-auto w-full">
                                      {scene.visualPrompt}
                                    </div>
                                  </>
                                ) : isActive ? (
                                  <>
                                    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-2">
                                      <RefreshCw className="h-5 w-5 text-orange-400 animate-spin" />
                                      <span className="text-[9px] font-mono text-orange-400 font-bold tracking-wider uppercase animate-pulse">
                                        Agent 1 Rendering...
                                      </span>
                                      <span className="text-[8px] font-mono text-slate-500 text-center px-4 max-w-xs truncate">
                                        {scene.visualPrompt}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center">
                                      <Clock className="h-4.5 w-4.5 text-slate-700 mb-1" />
                                      <span className="text-[9px] font-mono text-slate-600 font-semibold uppercase tracking-wider">
                                        Queued in Buffer
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Asset Control and info footer */}
                              <div className="p-3 bg-slate-900/20 border-t border-slate-950 flex items-center justify-between text-[9px] font-mono">
                                <span className="text-slate-400">Scene {scene.id}</span>
                                {isRendered ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadFrame(idx, scene.visualPrompt);
                                    }}
                                    className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500/50 transition-all active:scale-95 cursor-pointer uppercase tracking-wider font-mono shrink-0"
                                  >
                                    <Download className="h-3 w-3 animate-bounce" style={{ animationDuration: '2.5s' }} />
                                    Download Frame
                                  </button>
                                ) : (
                                  <span className={isActive ? 'text-orange-400 animate-pulse' : 'text-slate-600'}>
                                    {isActive ? 'RENDERING...' : 'PENDING'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 1/3 Column: Compiler Errors Simulation config */}
                <div className="border border-slate-900 bg-slate-900/20 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-bold tracking-tight uppercase font-mono text-slate-100">
                      Phase 2: Compiler Settings
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Configure API parameters and simulate failure modes. This demonstrates how the new cartoon-generator.js safely intercepts, logs, and throws exceptions.
                  </p>

                  <div className="space-y-4 pt-2 text-xs">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-mono">ElevenLabs Premium Audio</span>
                        <button 
                          onClick={() => setHasElevenLabsKey(!hasElevenLabsKey)}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors ${hasElevenLabsKey ? 'bg-emerald-500' : 'bg-slate-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hasElevenLabsKey ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Toggle to simulate ElevenLabs key presence. If off, the script safely falls back to a 432Hz sine tone.
                      </p>
                    </div>

                    <div className="border-t border-slate-900/60 my-2" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-mono text-rose-400 font-bold">Simulate ElevenLabs Error</span>
                        <button 
                          onClick={() => {
                            setSimulateVoiceError(!simulateVoiceError);
                            if (!simulateVoiceError) setHasElevenLabsKey(true); // Must have key enabled to error out
                          }}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors ${simulateVoiceError ? 'bg-rose-500' : 'bg-slate-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${simulateVoiceError ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Forces ElevenLabs synthesis calls to throw hard, explicit exceptions, immediately blocking compilation to verify try/catch logic.
                      </p>
                    </div>

                    <div className="border-t border-slate-900/60 my-2" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-mono text-rose-400 font-bold">Simulate Visual Frame Error</span>
                        <button 
                          onClick={() => setSimulateVisualError(!simulateVisualError)}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors ${simulateVisualError ? 'bg-rose-500' : 'bg-slate-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${simulateVisualError ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Simulates frame renderer crash during compilation. Halts the script and displays physical asset write boundaries.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Split View: Interactive Pipeline Terminal Logs & Player */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Terminal Logging Window */}
                <div className="border border-slate-900 bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[380px]">
                  <div className="bg-slate-900/50 px-4 py-2 flex items-center justify-between border-b border-slate-900 font-mono text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Terminal className="h-4 w-4" />
                      <span>Pipeline Compiler Output (Real-time Logs)</span>
                    </div>
                    {simState === 'running' && (
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Rendering...
                      </span>
                    )}
                    {simState === 'completed' && <span className="text-emerald-400">SUCCESS</span>}
                    {simState === 'failed' && <span className="text-rose-500">FATAL ERROR</span>}
                  </div>

                  <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-slate-300 space-y-1.5 select-text scrollbar-thin">
                    {simLogs.length === 0 ? (
                      <div className="text-slate-600 italic h-full flex items-center justify-center">
                        Select a storyboard above and click "Run Cartoon Compiler" below to launch pipeline logs.
                      </div>
                    ) : (
                      simLogs.map((log, index) => {
                        let colorClass = "text-slate-300";
                        if (log.includes("❌") || log.includes("🚨") || log.includes("Critical") || log.includes("failed")) {
                          colorClass = "text-rose-400 font-bold";
                        } else if (log.includes("✓") || log.includes("SUCCESSFUL")) {
                          colorClass = "text-emerald-400";
                        } else if (log.includes("⚠️") || log.includes("WARNING")) {
                          colorClass = "text-amber-400";
                        } else if (log.includes("🎤") || log.includes("Voice")) {
                          colorClass = "text-cyan-400";
                        } else if (log.includes("🎬")) {
                          colorClass = "text-indigo-300 font-bold";
                        } else if (log.includes("🎨")) {
                          colorClass = "text-orange-300";
                        }
                        return (
                          <div key={index} className={`${colorClass} whitespace-pre-wrap`}>
                            {log}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-3.5 bg-slate-900/30 border-t border-slate-900 flex items-center justify-between">
                    <div className="w-2/3">
                      {simState === 'running' && (
                        <div className="space-y-1">
                          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-300" 
                              style={{ width: `${simProgress}%` }}
                            />
                          </div>
                          <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                            <span>Compiling media layers</span>
                            <span>{simProgress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={runCompileSimulation}
                      disabled={simState === 'running'}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded text-xs font-mono hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                    >
                      {simState === 'running' ? 'Compiling Mesh...' : 'Run Cartoon Compiler'}
                    </button>
                  </div>
                </div>

                {/* Media Playback Mockup Card */}
                <div className="border border-slate-900 bg-slate-900/20 rounded-xl p-5 flex flex-col justify-between h-[380px]">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                      Media Output Inspector
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Inspect synthesized output streams and directory verification maps.
                    </p>
                  </div>

                  {simState === 'completed' ? (
                    <div className="flex-1 flex flex-col justify-center space-y-4 my-3">
                      {/* Interactive Video Player Simulator */}
                      <div className="aspect-video bg-slate-950 rounded-lg border border-slate-900 relative overflow-hidden flex flex-col items-center justify-center">
                        
                        {/* Playback image frame mockup */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 select-none">
                          <div className="w-full h-full relative opacity-80 flex flex-col justify-between p-3">
                            <div className="flex justify-between text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900 self-start">
                              <span>Asset ID: SuperPuff_09</span>
                            </div>
                            
                            {/* Wave animation simulation graphic */}
                            <div className="flex items-center justify-center h-24">
                              <div className="relative flex flex-col items-center justify-center">
                                {/* Floating Puff cloud */}
                                <div className="h-10 w-16 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full blur-xs shadow-lg animate-bounce flex items-center justify-center text-[10px] font-mono font-bold text-slate-950">
                                  SU-PUFF
                                </div>
                                {/* Wave */}
                                <div className="w-32 h-2 bg-cyan-500 rounded-full mt-3 animate-pulse opacity-60" />
                                <div className="w-24 h-1 bg-cyan-600 rounded-full mt-1 animate-pulse" />
                              </div>
                            </div>

                            {/* Narration subtitles on screen */}
                            <div className="bg-slate-950/90 text-center px-3 py-1.5 rounded-md border border-slate-900 text-[10px] font-mono text-slate-200 w-11/12 mx-auto leading-relaxed">
                              {mediaCurrentTime <= 2.0 && "Far out in the deep waters of antiX reef..."}
                              {mediaCurrentTime > 2.0 && mediaCurrentTime <= 4.0 && "...Super Puff rides the perfect 432Hz crest..."}
                              {mediaCurrentTime > 4.0 && "...safe from central server interference."}
                            </div>
                          </div>
                        </div>

                        {/* Overlaid Play Controller */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setSimulatedMediaPlaying(!simulatedMediaPlaying)}
                            className="p-3 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                          >
                            <Play className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      {/* Playback controls */}
                      <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-slate-400 px-1">
                        <button 
                          onClick={() => setSimulatedMediaPlaying(!simulatedMediaPlaying)}
                          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-900 hover:text-slate-200"
                        >
                          {simulatedMediaPlaying ? 'Pause Audio/Video' : 'Play Sub-Streams'}
                        </button>
                        <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${(mediaCurrentTime / 6.0) * 100}%` }}
                          />
                        </div>
                        <span className="tabular-nums">{mediaCurrentTime.toFixed(1)}s / 6.0s</span>
                      </div>
                    </div>
                  ) : simState === 'failed' ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 my-3">
                      <AlertOctagon className="h-12 w-12 text-rose-500 animate-pulse" />
                      <div className="text-center">
                        <span className="font-bold text-rose-400 text-xs font-mono block">PIPELINE CRASHED</span>
                        <span className="text-[11px] text-slate-400 font-mono">Hard Exception Triggered: Silent errors rejected</span>
                      </div>
                      <p className="text-[10px] text-slate-500 max-w-xs text-center leading-normal">
                        No final video or sub-assets were written. Click "Reset Console" on the header or adjust compiler settings to run nominal compilations.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center my-3 text-slate-600 font-mono text-[11px] italic">
                      Compilation pending. Run compiler simulation to render preview.
                    </div>
                  )}

                  {/* Absolute File Paths Tree Viewer */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-[10px] font-mono leading-normal">
                    <span className="text-slate-500 block mb-1">Local Build Directory Tree Check</span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>📁 ~/dragon9/temp_assets/</span>
                        <span>[Dir]</span>
                      </div>
                      <div className="flex justify-between items-center pl-3 text-slate-300">
                        <span>├─ 🎤 narration.mp3</span>
                        <span className="text-emerald-500">
                          {simState === 'completed' ? (hasElevenLabsKey ? '142,080 bytes [RESOLVED]' : '12,800 bytes [FALLBACK]') : 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pl-3 text-slate-300">
                        <span>├─ 📁 frames/</span>
                        <span>{simState === 'completed' ? `[${generatedScript.scenes.length} files]` : 'None'}</span>
                      </div>
                      <div className="flex justify-between items-center pl-3 text-slate-300">
                        <span>└─ 🎬 super_puff_release.mp4</span>
                        <span className="text-emerald-500">{simState === 'completed' ? '1,421,104 bytes [RESOLVED]' : 'None'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 5: VERIFICATION SANDBOX */}
          {/* ================================================================ */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1/3 Column: Command Selection Cards */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                      Execute Isolated Verifiers
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Select a targeted command to execute against the local file system tree, verifying sub-layers independently before full media assembly.
                    </p>
                  </div>

                  {/* Card 1: Voice Test */}
                  <button 
                    onClick={() => executeSandboxCommand('voice')}
                    disabled={isSandboxRunning}
                    className="w-full p-4 rounded-xl border border-slate-900 bg-slate-900/10 hover:border-slate-800 text-left transition-all block group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Volume2 className="h-4 w-4" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <span className="font-bold text-xs text-slate-200 font-mono block">Voice Synthesis Test</span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">node verify-pipeline.js --voice</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Tests the ElevenLabs vocal generator connection. Confirms active credentials and directory mapping without invoking image renderers.
                    </p>
                  </button>

                  {/* Card 2: Visual Test */}
                  <button 
                    onClick={() => executeSandboxCommand('visual')}
                    disabled={isSandboxRunning}
                    className="w-full p-4 rounded-xl border border-slate-900 bg-slate-900/10 hover:border-slate-800 text-left transition-all block group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-7 w-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                        <Layers className="h-4 w-4" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <span className="font-bold text-xs text-slate-200 font-mono block">Visual Frame Test</span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">node verify-pipeline.js --visual</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Triggers sequential frame compilation, drawing mock PNG coordinates and checking they exist on disk with valid file size bounds.
                    </p>
                  </button>

                  {/* Card 3: E2E Pipeline */}
                  <button 
                    onClick={() => executeSandboxCommand('all')}
                    disabled={isSandboxRunning}
                    className="w-full p-4 rounded-xl border border-slate-900 bg-slate-900/10 hover:border-slate-800 text-left transition-all block group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Play className="h-4 w-4" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <span className="font-bold text-xs text-slate-200 font-mono block">Complete Assembly Compiler</span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">node verify-pipeline.js --all</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Compiles voice audio and visual frames sequentially, writing everything to disk before launching the final FFmpeg muxer process.
                    </p>
                  </button>
                </div>

                {/* 2/3 Column: Shell Terminal Simulator */}
                <div className="lg:col-span-2 border border-slate-900 bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[480px]">
                  <div className="bg-slate-900/40 px-4 py-2 flex items-center justify-between border-b border-slate-900 text-xs font-mono">
                    <span className="text-slate-400">bash terminal · ~/dragon9</span>
                    <span className="text-slate-600">Active Task Monitor</span>
                  </div>

                  <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-slate-300 space-y-1.5 select-text scrollbar-thin">
                    {sandboxLogs.length === 0 ? (
                      <div className="text-slate-600 italic h-full flex flex-col items-center justify-center space-y-2">
                        <span>Terminal Idle. Select a verification routine on the left column to run.</span>
                        <span className="text-[10px] font-mono opacity-80">Commands execute isolated dry-runs mapping intermediate variables.</span>
                      </div>
                    ) : (
                      sandboxLogs.map((log, index) => {
                        let color = "text-slate-300";
                        if (log.startsWith("$")) color = "text-emerald-400 font-semibold";
                        else if (log.includes("❌") || log.includes("CRITICAL")) color = "text-rose-400 font-bold";
                        else if (log.includes("✓") || log.includes("PASSED")) color = "text-emerald-400";
                        else if (log.includes("WARNING")) color = "text-amber-400";
                        else if (log.startsWith("======")) color = "text-slate-600";
                        
                        return (
                          <div key={index} className={`${color} whitespace-pre-wrap`}>
                            {log}
                          </div>
                        );
                      })
                    )}
                    {isSandboxRunning && (
                      <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Running thread task...</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-900/20 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Host Engine: antiX-Dragon9-Node</span>
                    <span>Thread: PID {isSandboxRunning ? '42881' : 'Idle'}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
      {/* ================================================================ */}
      {/* ERROR DETAIL MODAL (SIMULATOR & SANDBOX EXCEPTION REPORT) */}
      {/* ================================================================ */}
      {showErrorModal && activeError && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-rose-500/30 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
            {/* Header bar */}
            <div className="bg-rose-950/20 border-b border-rose-500/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <AlertOctagon className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-rose-400 font-bold tracking-wider uppercase block">Dragon 9 Media Pipeline Crash</span>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight">Compilation Process Aborted</h3>
                </div>
              </div>
              <button 
                onClick={() => setShowErrorModal(false)}
                className="text-slate-500 hover:text-slate-300 font-mono text-xs p-1 rounded hover:bg-slate-800 transition-colors"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-5 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-mono text-[10px] uppercase">Fatal Reason</span>
                <p className="text-rose-400 font-bold text-sm leading-relaxed">{activeError.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-900">
                  <span className="text-slate-500 font-mono text-[10px] block mb-0.5">Offending System Node</span>
                  <span className="text-slate-200 font-mono font-semibold">{activeError.agent || 'Agent 21 (The Liver)'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-900">
                  <span className="text-slate-500 font-mono text-[10px] block mb-0.5">Primary Diagnostic Action</span>
                  <span className="text-slate-300">{activeError.action || 'Examine API token validity.'}</span>
                </div>
              </div>

              {/* Stack Trace Terminal Output */}
              <div className="space-y-2">
                <span className="text-slate-500 font-mono text-[10px] uppercase flex items-center justify-between">
                  <span>Sovereign Pipeline Call Stack</span>
                  <span className="text-[9px] text-rose-400/70 lowercase font-mono">Trace captured by explicit try/catch block</span>
                </span>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 font-mono text-[10px] leading-relaxed text-slate-400 overflow-x-auto whitespace-pre select-text h-40 scrollbar-thin">
                  {activeError.stack}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                * Note: Silent drops have been programmatically bypassed in cartoon-generator.js. 
                Any and all un-awaited async flows or empty streams now issue a hard abort to avoid writing zero-byte streams to antiX hardware disk.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-900 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  // Quick automatic reset of test conditions for convenience
                  setSimulateVoiceError(false);
                  setSimulateVisualError(false);
                }}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 font-mono text-xs font-semibold rounded-lg transition-all"
              >
                Auto-Fix & Clear Simulated Failures
              </button>
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-semibold rounded-lg transition-all"
              >
                Acknowledge Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* HIGH-FIDELITY FRAME PREVIEW & QUALITY ASSESSMENT MODAL */}
      {/* ================================================================ */}
      {previewFrame && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row h-[560px] md:h-[500px]">
            
            {/* Left side: High fidelity canvas simulation display */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center border-r border-slate-900 select-none p-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cyan-500/20 to-transparent blur-xl" />
              
              {/* Dynamic Scanning Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
              
              {/* Safe zone lines overlay */}
              <div className="absolute inset-8 border border-slate-800/60 border-dashed pointer-events-none flex items-center justify-center">
                <span className="absolute top-2 left-3 font-mono text-[8px] text-slate-600 uppercase">sRGB 16:9 safe zone (90%)</span>
              </div>
              <div className="absolute top-1/2 left-4 right-4 h-px border-t border-dashed border-slate-800/30 pointer-events-none" />
              <div className="absolute left-1/2 top-4 bottom-4 w-px border-l border-dashed border-slate-800/30 pointer-events-none" />

              {/* Central Glowing Waves & Golden Cloud Puff visual art */}
              <div className="z-10 flex flex-col items-center space-y-3">
                <div className="h-24 w-36 rounded-full bg-gradient-to-br from-yellow-300/20 to-amber-500/20 border border-amber-400/30 shadow-2xl shadow-yellow-500/10 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 bg-yellow-400/5 blur-xl rounded-full" />
                  <span className="font-mono text-[10px] font-bold text-yellow-300 tracking-wider">SUPER PUFF</span>
                  <span className="font-mono text-[7px] text-amber-500">RES: 1920x1080</span>
                </div>
                {/* Wavelight lines */}
                <div className="w-56 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60 animate-pulse" />
                <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-40" />
              </div>

              {/* Lower Overlay Frame Data */}
              <div className="absolute bottom-4 left-6 right-6 z-10 flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span>INDEX_000{previewFrame.idx}</span>
                <span>COLORSPACE: sRGB IEC61966-2.1</span>
                <span>COMPRESSION: LOSS-LESS</span>
              </div>
            </div>

            {/* Right side: Detailed Quality Assessment parameters */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-slate-900 border-t md:border-t-0 md:border-l border-slate-900 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-cyan-400 font-bold block uppercase tracking-wide">Quality Assessment</span>
                    <h4 className="text-sm font-bold text-slate-100">FRAME_000{previewFrame.idx}.PNG</h4>
                  </div>
                  <button 
                    onClick={() => setPreviewFrame(null)}
                    className="text-slate-500 hover:text-slate-300 font-mono text-xs p-1 hover:bg-slate-800 rounded transition-colors"
                  >
                    ✕ CLOSE
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-mono text-[9px] block uppercase">Associated prompt:</span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[10px] bg-slate-950 p-2.5 rounded border border-slate-900/60 line-clamp-4">
                      {previewFrame.prompt}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-slate-500 font-mono text-[9px] block uppercase">Telemetry metrics check:</span>
                    <div className="space-y-2 font-mono text-[10px] text-slate-400">
                      <div className="flex justify-between border-b border-slate-950 pb-1">
                        <span>Aspect Ratio:</span>
                        <span className="text-slate-200">16:9 widescreen</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-950 pb-1">
                        <span>Pixel Matrix:</span>
                        <span className="text-slate-200">1920 x 1080 px</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-950 pb-1">
                        <span>Alpha Channel:</span>
                        <span className="text-slate-200">Enabled (32-bit depth)</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-950 pb-1">
                        <span>Luminance Level:</span>
                        <span className="text-emerald-400">Nominal range checked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer controls inside modal */}
              <div className="space-y-2 pt-4 border-t border-slate-950">
                <button
                  onClick={() => {
                    downloadFrame(previewFrame.idx, previewFrame.prompt);
                    setPreviewFrame(null);
                  }}
                  className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
                >
                  <Copy className="h-3 w-3" />
                  Save Crisp PNG Frame
                </button>
                <button
                  onClick={() => setPreviewFrame(null)}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400 font-mono text-xs rounded-lg transition-all cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
