
# Shellie AI Architecture Documentation

## Overview
Shellie is a kid-friendly AI Emotional Support Turtle designed to provide a safe, empathetic space for children to express their feelings. 

## Tech Stack
- **Frontend**: React (v19) with Tailwind CSS.
- **AI Orchestration**: Google Gemini 2.5 Flash Native Audio Preview.
- **Audio Processing**: Raw PCM streaming (16kHz in / 24kHz out) via Web Audio API.
- **Safety**: Real-time keyword monitoring and immediate teacher reporting.

## Key Architectural Decisions

### 1. Multimodal Native Audio
We bypass traditional Speech-to-Text (STT) and Text-to-Speech (TTS) pipelines. By connecting directly to Gemini's native audio modality, we achieve:
- **Low Latency**: Responses feel human and instantaneous.
- **Emotional Prosody**: The AI can hear tone and respond with appropriate warmth.

### 2. Modular Component Design
Every visual element is isolated:
- `TurtleAvatar`: Handles real-time SVG animation and canvas-based audio visualization.
- `TeacherDashboard`: Manages reporting and class-wide emotional health metrics.
- `App`: Serves as the primary state controller and AI session manager.

### 3. Safety Service
Located in `services/safetyService.ts`, this pure-logic layer separates safety monitoring from UI logic. It facilitates unit testing without requiring a DOM or AI connection.

### 4. Interactive Termination
The app supports natural language termination (e.g., "Bye Shellie"). This is handled by intercepting input transcriptions and triggering the `stopConversation` cleanup routine.

## Data Flow
1. **User Audio** -> `ScriptProcessorNode` -> PCM Blob -> Gemini Live API.
2. **AI Audio** -> Base64 -> PCM Decode -> `AudioBufferSourceNode` -> Speakers.
3. **Transcription** -> Real-time display & Safety Service analysis.
