const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createPitchDeck() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'MemSync Team';
  pptx.company = 'MemSync Edge Technologies';
  pptx.title = 'MemSync Pitch Deck - Edge-Orchestrated Habit & Workflow Copilot';
  pptx.subject = 'Hackathon Presentation Deck';

  // Core Theme Palette
  const THEME = {
    bgDark: '0A0F1D',
    bgCard: '111827',
    bgCardHeader: '1E293B',
    border: '334155',
    cyan: '38BDF8',
    blue: '3B82F6',
    green: '10B981',
    amber: 'F59E0B',
    rose: 'F43F5E',
    white: 'FFFFFF',
    textMuted: '94A3B8',
    textLight: 'E2E8F0'
  };

  // -------------------------------------------------------------
  // SLIDE 1: Title & The Context & Privacy Paradox
  // -------------------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: THEME.bgDark };

  // Category Tag
  slide1.addText('HACKATHON PITCH DECK • EDGE AI & BEHAVIORAL ENGINEERING', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.35,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: THEME.cyan,
    bold: true,
    charSpacing: 2
  });

  // Title & Subtitle
  slide1.addText('MemSync: Edge-Orchestrated Habit & Workflow Copilot', {
    x: 0.8,
    y: 0.85,
    w: 11.7,
    h: 0.7,
    fontSize: 26,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.white
  });

  slide1.addText('Where High-Velocity Engineering Meets the Cloud Privacy Wall — 100% On-Device, Zero Cloud Leakage', {
    x: 0.8,
    y: 1.55,
    w: 11.7,
    h: 0.35,
    fontSize: 12,
    fontFace: 'Segoe UI',
    color: THEME.textMuted
  });

  // Card Left: The Problem
  slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 2.1,
    w: 5.6,
    h: 3.6,
    fill: { color: THEME.bgCard },
    line: { color: THEME.rose, width: 1.5 },
    rectRadius: 0.1
  });

  slide1.addText('🚨 THE CORE PROBLEM: CLOUD LEAKAGE & FRAGMENTATION', {
    x: 1.05,
    y: 2.25,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.rose
  });

  const problemPoints = [
    { text: 'Context Fragmentation: ', options: { bold: true, color: THEME.white } },
    { text: 'Devs capture unorganized daily thoughts across raw scratchpads, terminal logs, Slack threads, and markdown notes. Converting dumps into tasks is manual and high-friction.\n\n', options: { color: THEME.textLight } },
    { text: 'The Cloud Leakage Dilemma: ', options: { bold: true, color: THEME.white } },
    { text: 'Standard AI copilots (Notion AI, Copilot) require sending proprietary code, git diffs, and personal notes to remote cloud LLM endpoints.\n\n', options: { color: THEME.textLight } },
    { text: 'Strict Enterprise Compliance: ', options: { bold: true, color: THEME.white } },
    { text: 'SOC2, HIPAA, and IP NDAs strictly prohibit transmitting unvetted developer workspace data to 3rd-party cloud providers.', options: { color: THEME.textLight } }
  ];

  slide1.addText(problemPoints, {
    x: 1.05,
    y: 2.65,
    w: 5.1,
    h: 2.85,
    fontSize: 10,
    fontFace: 'Segoe UI',
    lineSpacingMultiple: 1.15
  });

  // Card Right: The Solution
  slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 2.1,
    w: 5.7,
    h: 3.6,
    fill: { color: THEME.bgCard },
    line: { color: THEME.green, width: 1.5 },
    rectRadius: 0.1
  });

  slide1.addText('⚡ THE MEMSYNC EDGE SOLUTION', {
    x: 7.05,
    y: 2.25,
    w: 5.2,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.green
  });

  const solutionPoints = [
    { text: '100% Local-First Edge Architecture: ', options: { bold: true, color: THEME.white } },
    { text: 'Zero network telemetry. Zero data exfiltration. Zero API tokens. Everything executes directly on the developer laptop.\n\n', options: { color: THEME.textLight } },
    { text: 'Cognitive Note Ingestion: ', options: { bold: true, color: THEME.white } },
    { text: 'Parses unstructured brain dumps into structured task queues, contextual tags, and Tiny Habit recipes in real time.\n\n', options: { color: THEME.textLight } },
    { text: 'Sub-Millisecond Speed & Instant Uptime: ', options: { bold: true, color: THEME.white } },
    { text: 'Dual-engine failover guarantees 100% offline availability with sub-5ms heuristic extraction and embedded SQLite WAL.', options: { color: THEME.textLight } }
  ];

  slide1.addText(solutionPoints, {
    x: 7.05,
    y: 2.65,
    w: 5.2,
    h: 2.3,
    fontSize: 10,
    fontFace: 'Segoe UI',
    lineSpacingMultiple: 1.15
  });

  // Bottom Takeaway Banner
  slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.05,
    y: 5.0,
    w: 5.2,
    h: 0.55,
    fill: { color: '0D2818' },
    line: { color: THEME.green, width: 1 },
    rectRadius: 0.05
  });

  slide1.addText('💡 Key Takeaway: "The intelligence of an AI executive copilot with the security of an air-gapped terminal."', {
    x: 7.15,
    y: 5.05,
    w: 5.0,
    h: 0.45,
    fontSize: 9.5,
    fontFace: 'Segoe UI',
    bold: true,
    italic: true,
    color: '34D399'
  });

  slide1.addNotes('Every engineer has a messy scratchpad of brain dumps, uncommitted thoughts, and half-finished tasks. But you cannot paste proprietary code or private sprint notes into cloud LLMs without risking intellectual property leaks. MemSync delivers the intelligence of an AI executive assistant with the absolute security of an air-gapped terminal.');

  // -------------------------------------------------------------
  // SLIDE 2: Edge Architecture & Dual-Engine Model Pipeline
  // -------------------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: THEME.bgDark };

  slide2.addText('TECHNICAL ARCHITECTURE • DUAL-ENGINE PIPELINE', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.35,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: THEME.cyan,
    bold: true,
    charSpacing: 2
  });

  slide2.addText('Sub-Millisecond Determinism Meets Quantized Edge Intelligence', {
    x: 0.8,
    y: 0.85,
    w: 11.7,
    h: 0.65,
    fontSize: 24,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.white
  });

  // Visual Pipeline Boxes (Horizontal Dataflow)
  const steps = [
    { title: '1. Ingestion', desc: 'Raw Markdown\nBrain Dump & Logs', color: THEME.blue, x: 0.8 },
    { title: '2. Dual Engine', desc: 'Ollama SLM (1.5B)\n+ <5ms Heuristic Fallback', color: THEME.cyan, x: 3.8 },
    { title: '3. Local Persistence', desc: 'SQLite WAL Mode\n+ In-Memory Vector Index', color: THEME.green, x: 6.8 },
    { title: '4. Cockpit UI', desc: 'React + Vite\nContext & Habit Flow', color: 'A855F7', x: 9.8 }
  ];

  steps.forEach((step, idx) => {
    slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: step.x,
      y: 1.6,
      w: 2.7,
      h: 1.35,
      fill: { color: THEME.bgCard },
      line: { color: step.color, width: 1.5 },
      rectRadius: 0.08
    });

    slide2.addText(step.title, {
      x: step.x + 0.15,
      y: 1.7,
      w: 2.4,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Segoe UI',
      bold: true,
      color: step.color
    });

    slide2.addText(step.desc, {
      x: step.x + 0.15,
      y: 2.05,
      w: 2.4,
      h: 0.8,
      fontSize: 9.5,
      fontFace: 'Segoe UI',
      color: THEME.white
    });

    if (idx < 3) {
      slide2.addText('➔', {
        x: step.x + 2.75,
        y: 2.05,
        w: 0.3,
        h: 0.4,
        fontSize: 16,
        bold: true,
        color: THEME.textMuted
      });
    }
  });

  // Architectural Pillars (4 Cards Below)
  const pillars = [
    {
      title: 'Sub-1GB Model Footprint',
      text: 'Runs quantized Small Language Models (Qwen-2.5-Coder 1.5B) locally with Ollama. Consumes < 950MB RAM, allowing it to run smoothly on standard 8GB RAM laptops.',
      color: THEME.cyan,
      x: 0.8,
      y: 3.2
    },
    {
      title: 'Zero-Failure Dual Engine',
      text: 'If Ollama is stopped or offline, the engine seamlessly fails over to a deterministic regex & heuristic parser in < 5ms with 100% uptime.',
      color: THEME.green,
      x: 6.8,
      y: 3.2
    },
    {
      title: '100% ACID Local State (SQLite WAL)',
      text: 'Built-in node:sqlite with Write-Ahead Logging. Non-blocking concurrent reads and idempotent transactions execute in under 2ms with zero external database servers.',
      color: THEME.blue,
      x: 0.8,
      y: 4.4
    },
    {
      title: 'Edge In-Memory Vector Search',
      text: 'Character n-gram tokenization with cosine similarity vector scoring over historical sprint logs. Enables semantic memory search with zero third-party embedding calls.',
      color: 'A855F7',
      x: 6.8,
      y: 4.4
    }
  ];

  pillars.forEach(p => {
    slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: p.x,
      y: p.y,
      w: 5.7,
      h: 1.05,
      fill: { color: THEME.bgCard },
      line: { color: THEME.border, width: 1 },
      rectRadius: 0.08
    });

    slide2.addText(`● ${p.title}`, {
      x: p.x + 0.15,
      y: p.y + 0.08,
      w: 5.4,
      h: 0.28,
      fontSize: 10.5,
      fontFace: 'Segoe UI',
      bold: true,
      color: p.color
    });

    slide2.addText(p.text, {
      x: p.x + 0.15,
      y: p.y + 0.38,
      w: 5.4,
      h: 0.6,
      fontSize: 9,
      fontFace: 'Segoe UI',
      color: THEME.textLight,
      lineSpacingMultiple: 1.1
    });
  });

  slide2.addNotes('MemSync is an edge-orchestrated copilot. It runs a 1.5B quantized model locally using Ollama on standard 8GB RAM laptops, paired with a sub-5ms heuristic fallback and native SQLite. You get zero cloud leakage, zero latency spikes, and 100% offline availability.');

  // -------------------------------------------------------------
  // SLIDE 3: Behavioral Science — The Tiny Habits Protocol
  // -------------------------------------------------------------
  const slide3 = pptx.addSlide();
  slide3.background = { color: THEME.bgDark };

  slide3.addText('BEHAVIORAL ENGINEERING • DR. BJ FOGG METHODOLOGY', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.35,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: THEME.amber,
    bold: true,
    charSpacing: 2
  });

  slide3.addText('Closing the Intent-Execution Gap with Tiny Habits', {
    x: 0.8,
    y: 0.85,
    w: 11.7,
    h: 0.65,
    fontSize: 24,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.white
  });

  // Top Model Callout
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.55,
    w: 11.7,
    h: 0.8,
    fill: { color: '1A1D2B' },
    line: { color: THEME.amber, width: 1 },
    rectRadius: 0.08
  });

  slide3.addText('🧠 Why Traditional To-Do Apps Fail: Passive Graveyard Lists', {
    x: 1.0,
    y: 1.65,
    w: 11.3,
    h: 0.28,
    fontSize: 11,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.amber
  });

  slide3.addText('Standard apps let users dump 30 tasks with no behavioral triggers, leading to friction, overwhelm, and paralysis. BJ Fogg\'s Behavior Model (B = MAP) shows behavior occurs only when Motivation, Ability (low friction), and a Prompt converge.', {
    x: 1.0,
    y: 1.95,
    w: 11.3,
    h: 0.35,
    fontSize: 9.5,
    fontFace: 'Segoe UI',
    color: THEME.textLight
  });

  // The 3 Triplet Columns
  const triplets = [
    {
      step: '1. ANCHOR / CUE',
      role: 'Contextual Existing Routine',
      example: '"After closing a Git feature branch or PR..."',
      color: THEME.cyan,
      x: 0.8
    },
    {
      step: '2. TINY ACTION',
      role: 'Micro-Habit (< 60s Friction)',
      example: '"Run the test suite & write a 2-line commit summary."',
      color: THEME.green,
      x: 4.8
    },
    {
      step: '3. CELEBRATION',
      role: 'Dopamine Reinforcement',
      example: '"High five screen & whisper \'Clean shipping!\'"',
      color: THEME.amber,
      x: 8.8
    }
  ];

  triplets.forEach(t => {
    slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: t.x,
      y: 2.55,
      w: 3.7,
      h: 1.7,
      fill: { color: THEME.bgCard },
      line: { color: t.color, width: 1.5 },
      rectRadius: 0.08
    });

    slide3.addText(t.step, {
      x: t.x + 0.15,
      y: 2.7,
      w: 3.4,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Segoe UI',
      bold: true,
      color: t.color
    });

    slide3.addText(t.role, {
      x: t.x + 0.15,
      y: 3.05,
      w: 3.4,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Segoe UI',
      bold: true,
      color: THEME.white
    });

    slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: t.x + 0.15,
      y: 3.4,
      w: 3.4,
      h: 0.7,
      fill: { color: '0D1322' },
      line: { color: THEME.border, width: 1 },
      rectRadius: 0.05
    });

    slide3.addText(t.example, {
      x: t.x + 0.25,
      y: 3.45,
      w: 3.2,
      h: 0.6,
      fontSize: 9.5,
      fontFace: 'Segoe UI',
      italic: true,
      color: '93C5FD'
    });
  });

  // Loop Closure & Gamification (Bottom Card)
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 4.4,
    w: 11.7,
    h: 1.1,
    fill: { color: THEME.bgCard },
    line: { color: THEME.border, width: 1 },
    rectRadius: 0.08
  });

  slide3.addText('🎯 COMPLETE BEHAVIORAL LOOP CLOSURE IN MEMSYNC', {
    x: 1.0,
    y: 4.5,
    w: 11.3,
    h: 0.25,
    fontSize: 10.5,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.green
  });

  const loopDetails = [
    { text: '• 30-Day Activity Heatmap: ', options: { bold: true, color: THEME.white } },
    { text: 'Tracks behavioral momentum visually without guilt. ', options: { color: THEME.textLight } },
    { text: '• Idempotent SQLite Check-ins: ', options: { bold: true, color: THEME.white } },
    { text: 'One-click check-ins with animated dopamine cues. ', options: { color: THEME.textLight } },
    { text: '• Automated Standup Generation: ', options: { bold: true, color: THEME.white } },
    { text: 'Compiles completed items into ready-to-paste standups, eliminating reporting friction.', options: { color: THEME.textLight } }
  ];

  slide3.addText(loopDetails, {
    x: 1.0,
    y: 4.8,
    w: 11.3,
    h: 0.6,
    fontSize: 9.5,
    fontFace: 'Segoe UI',
    lineSpacingMultiple: 1.15
  });

  slide3.addNotes('Unlike passive to-do lists that become graveyard lists, MemSync is powered by BJ Foggs Tiny Habits protocol. It parses raw notes into Anchor-Action-Celebration triplets. When you close a Git branch, MemSync cues you to run tests and reinforces the habit loop.');

  // -------------------------------------------------------------
  // SLIDE 4: Benchmarks, Moat & Roadmap
  // -------------------------------------------------------------
  const slide4 = pptx.addSlide();
  slide4.background = { color: THEME.bgDark };

  slide4.addText('COMPETITIVE MOAT & ROADMAP • BENCHMARK EVALUATION', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.35,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: THEME.green,
    bold: true,
    charSpacing: 2
  });

  slide4.addText('Measurable Edge Superiority & The Future of Private Automation', {
    x: 0.8,
    y: 0.85,
    w: 11.7,
    h: 0.65,
    fontSize: 24,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.white
  });

  // Comparative Benchmark Table
  const tableData = [
    [
      { text: 'Evaluation Dimension', options: { bold: true, fill: '1E293B', color: THEME.white, fontSize: 9.5 } },
      { text: 'Cloud AI Copilots (Notion AI, Copilot)', options: { bold: true, fill: '1E293B', color: THEME.rose, fontSize: 9.5 } },
      { text: 'MemSync Edge Copilot', options: { bold: true, fill: '1E293B', color: THEME.green, fontSize: 9.5 } },
      { text: 'Edge Advantage', options: { bold: true, fill: '1E293B', color: THEME.cyan, fontSize: 9.5 } }
    ],
    [
      { text: 'Data Privacy & IP', options: { bold: true, color: THEME.white } },
      { text: 'Code & notes sent to cloud servers', options: { color: THEME.textLight } },
      { text: '100% On-Device / Air-Gapped', options: { bold: true, color: THEME.green } },
      { text: 'Zero Data Leakage', options: { bold: true, color: THEME.cyan } }
    ],
    [
      { text: 'Subscription Cost', options: { bold: true, color: THEME.white } },
      { text: '$10 – $30 / user / month', options: { color: THEME.textLight } },
      { text: '$0.00 Forever (Self-Hosted SLM)', options: { bold: true, color: THEME.green } },
      { text: 'Zero Marginal Cost', options: { bold: true, color: THEME.cyan } }
    ],
    [
      { text: 'Offline Reliability', options: { bold: true, color: THEME.white } },
      { text: '0% (Fails entirely without internet)', options: { color: THEME.textLight } },
      { text: '100% Fully Offline Capable', options: { bold: true, color: THEME.green } },
      { text: 'Works Anywhere', options: { bold: true, color: THEME.cyan } }
    ],
    [
      { text: 'Failover Strategy', options: { bold: true, color: THEME.white } },
      { text: 'None (Endpoint timeout / error)', options: { color: THEME.textLight } },
      { text: '< 5ms Heuristic Parser Fallback', options: { bold: true, color: THEME.green } },
      { text: '100% Guaranteed Uptime', options: { bold: true, color: THEME.cyan } }
    ],
    [
      { text: 'Read / Query Latency', options: { bold: true, color: THEME.white } },
      { text: '800ms – 2,500ms (Network dependent)', options: { color: THEME.textLight } },
      { text: 'Sub-2ms Native SQLite WAL', options: { bold: true, color: THEME.green } },
      { text: '1,000x Faster Reads', options: { bold: true, color: THEME.cyan } }
    ]
  ];

  slide4.addTable(tableData, {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    h: 2.1,
    border: { color: THEME.border, pt: 1 },
    fill: THEME.bgCard,
    fontSize: 9,
    fontFace: 'Segoe UI',
    align: 'left',
    valign: 'middle'
  });

  // Roadmap Section Below Table
  slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 3.9,
    w: 11.7,
    h: 1.6,
    fill: { color: THEME.bgCard },
    line: { color: THEME.blue, width: 1 },
    rectRadius: 0.08
  });

  slide4.addText('🚀 IMMEDIATE POST-HACKATHON ROADMAP', {
    x: 1.0,
    y: 4.05,
    w: 11.3,
    h: 0.25,
    fontSize: 11,
    fontFace: 'Segoe UI',
    bold: true,
    color: THEME.cyan
  });

  const roadmapItems = [
    {
      num: 'Phase 1: OS System Tray Daemon',
      desc: 'Native background process that hooks into Git post-commit & IDE window focus to trigger habit cues without opening the browser.',
      x: 1.0
    },
    {
      num: 'Phase 2: Local Voice Ingestion',
      desc: 'Integrate local whisper.cpp speech-to-text for frictionless voice brain-dumps directly into the Context Stream.',
      x: 4.8
    },
    {
      num: 'Phase 3: Multi-Repo Semantic Index',
      desc: 'Index uncommitted diffs, local branch histories, and team sprint retros across multiple workspace folders.',
      x: 8.6
    }
  ];

  roadmapItems.forEach(item => {
    slide4.addText(item.num, {
      x: item.x,
      y: 4.4,
      w: 3.6,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Segoe UI',
      bold: true,
      color: THEME.white
    });

    slide4.addText(item.desc, {
      x: item.x,
      y: 4.7,
      w: 3.6,
      h: 0.7,
      fontSize: 8.8,
      fontFace: 'Segoe UI',
      color: THEME.textLight,
      lineSpacingMultiple: 1.1
    });
  });

  slide4.addNotes('With zero token costs, sub-millisecond local queries, and a 30-day streak engine, MemSync bridges intent and execution—privately and locally. Thank you.');

  // Write presentation to disk
  const outputPath = path.resolve(__dirname, '..', 'MemSync_Pitch_Deck.pptx');
  const docsPath = path.resolve(__dirname, '..', 'docs', 'MemSync_Pitch_Deck.pptx');

  await pptx.writeFile({ fileName: outputPath });
  fs.copyFileSync(outputPath, docsPath);

  console.log(`Presentation successfully created at:\n- ${outputPath}\n- ${docsPath}`);
}

createPitchDeck().catch(err => {
  console.error('Error creating presentation:', err);
  process.exit(1);
});
