import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import path from "path";

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "XrExE9yKIg1WjnnlVkGX";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// ------------ UTIL FUNCTIONS --------------
const execCommand = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) =>
      err ? reject(stderr || stdout) : resolve(stdout)
    );
  });

// Convert ElevenLabs WAV → PCM WAV (for Rhubarb)
const convertToPCM = async (file) => {
  const pcm = file.replace(".wav", "_pcm.wav");
  console.log(`🔊 Converting to PCM: ${file}`);
  await execCommand(
    `ffmpeg -y -i ${file} -ar 16000 -ac 1 -c:a pcm_s16le ${pcm}`
  );
  console.log(`✅ PCM created: ${pcm}`);
  return pcm;
};

const ensureAudio = async (fileKey, text) => {
  const wav = `audios/${fileKey}.wav`;
  const json = `audios/${fileKey}.json`;

  const exists = async (file) =>
    !!(await fs
      .access(file)
      .then(() => true)
      .catch(() => false));

  if (!(await exists(wav))) {
    console.log(`🎤 Generating TTS: ${fileKey}`);
    await voice.textToSpeech(elevenLabsApiKey, voiceID, wav, text);
  }

  if (!(await exists(json))) {
    console.log(`👄 Generating lipsync JSON: ${fileKey}`);
    const pcm = await convertToPCM(wav);
    const rhubarbPath = path.join(
      "bin",
      process.platform === "win32" ? "rhubarb.exe" : "rhubarb"
    );
    await execCommand(`${rhubarbPath} -f json -o ${json} ${pcm} -r phonetic`);
    console.log(`✅ Lipsync file created: ${json}`);
  }
};

const readJsonTranscript = async (file) => {
  try {
    const data = await fs.readFile(file, "utf8");
    console.log(`📄 Loaded lip sync file: ${file}`);
    return JSON.parse(data);
  } catch {
    console.log(`⚠️ No lip sync JSON found: ${file}`);
    return null;
  }
};

const audioBase64 = async (file) => {
  try {
    return (await fs.readFile(file)).toString("base64");
  } catch {
    return null;
  }
};

// ----------- PREDEFINED MESSAGES ------------
const introMessages = [
  {
    key: "intro_0",
    text: "Welcome! I'm here to help you practice English conversation, improve fluency, and build real-world speaking confidence. Relax and speak naturally — I’ll guide you as if we’re chatting in real life. Let’s begin!",
  },
];

const apiMessages = [
  {
    key: "api_0",
    text: "It seems the voice system isn't ready yet — no worries! Just connect your ElevenLabs key and we’ll continue learning together!",
  },
];

// ------------- ROUTES -------------
app.get("/", (_, res) => res.send("English AI Tutor Backend ✅"));

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // ---- NO USER TEXT → send intro ----
  if (!userMessage) {
    console.log("👋 Sending intro message...");
    for (const m of introMessages) await ensureAudio(m.key, m.text);

    return res.send({
      messages: await Promise.all(
        introMessages.map(async ({ key, text }) => ({
          text,
          audio: await audioBase64(`audios/${key}.wav`),
          lipsync: await readJsonTranscript(`audios/${key}.json`),
          facialExpression: "smile",
          animation: "Talking_1",
        }))
      ),
    });
  }

  // ---- NO ELEVENLABS KEY ----
  if (!elevenLabsApiKey) {
    console.log("❌ No ElevenLabs key — playing offline system messages");
    for (const m of apiMessages) await ensureAudio(m.key, m.text);

    return res.send({
      messages: await Promise.all(
        apiMessages.map(async ({ key, text }) => ({
          text,
          audio: await audioBase64(`audios/${key}.wav`),
          lipsync: await readJsonTranscript(`audios/${key}.json`),
          facialExpression: "default",
          animation: "Talking_1",
        }))
      ),
    });
  }

  // ---- AI Chat (Ollama) ----
  console.log("🤖 Using local Ollama...");

  const prompt = `
You are an English conversation practice partner.
Reply ONLY with a JSON array "messages".
You MUST reply ONLY in strict JSON (no markdown, no prose).
Output exactly this structure:
[
{
  "text": "...",
  "facialExpression": "one of ['smile', 'surprised', 'default']",
  "animation": "one of ['Talking_0', 'Talking_1', 'Talking_2', 'Idle']"
}
  ...
]
Rules:
- Respond naturally and contextually to the user.
- Choose expressions logically:
    "smile" → for greetings, positivity, encouragement.
    "surprised" → for unexpected, exciting, or reactive moments.
    "default" → for calm, neutral explanations.
- Choose animations logically:
    "Talking_0" → short/calm replies.
    "Talking_1" → long/enthusiastic/normal conversation.
    "Talking_2" → thinking explanations.
    "Idle" → pauses or acknowledgments.
- DO NOT include text outside the JSON.
- DO NOT invent new facial expressions or animations.
- Use double quotes only.
- Do not add comments or explanations.
- Never include additional keys or narrative text.
- If you can't decide, default to:
  { "facialExpression": "default", "animation": "Talking_1" }
User: ${userMessage}
`;

  let responses = "";

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemma3:4b", prompt }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }

    console.log("🟣 Raw Ollama text:\n", fullText);
    const lines = fullText.split("\n").filter((l) => l.trim().startsWith("{"));
    responses = lines.map((l) => JSON.parse(l).response || "").join("");
    console.log("🟢 Extracted model text:\n", responses);
  } catch (err) {
    console.error("❌ Ollama error:", err);
    return res.send({
      messages: [
        {
          text: "Connection issue — please try again!",
          facialExpression: "default",
          animation: "Talking_1",
        },
      ],
    });
  }

  // ---- Parse and normalize ----
  let messages;
  let jsonString = responses.trim();
  const jsonMatch = jsonString.match(/(\[[\s\S]*?])/);
  if (jsonMatch) jsonString = jsonMatch[0];
  console.log("📦 JSON extracted:", jsonString);

  try {
    // --- Clean up messy model text ---
    jsonString = jsonString
      // remove lines starting with non-JSON keys (like ferrari_courses:)
      .replace(/^[^{\[]*ferrari_courses.*$/gm, "")
      // remove any trailing commas before closing braces/brackets
      .replace(/,(\s*[}\]])/g, "$1")
      // replace single quotes with double quotes if any
      .replace(/'/g, '"')
      // remove unquoted keys accidentally generated
      .replace(/(\w+):/g, '"$1":')
      // remove any stray text before/after valid JSON
      .replace(/^[^{\[]+/, "")
      .replace(/[^}\]]+$/, "");

    messages = JSON.parse(jsonString);
    console.log("✅ Parsed JSON messages:", messages);
  } catch (err) {
    console.error("❌ JSON parse failed:", err.message);
    console.log("🧹 Attempting fallback parse repair...");

    // Try to extract all "text": "..." lines
    const fallbackMatches = [...responses.matchAll(/"text"\s*:\s*"([^"]+)"/g)];
    if (fallbackMatches.length) {
      messages = fallbackMatches.map((m) => ({
        text: m[1],
        facialExpression: "default",
        animation: "Talking_1",
      }));
    } else {
      messages = [
        {
          text: "Sorry, could you rephrase that?",
          facialExpression: "default",
          animation: "Talking_1",
        },
      ];
    }
  }

  if (!Array.isArray(messages)) messages = [messages];

  const validExpressions = ["smile", "surprised", "default"];
  const validAnimations = ["Talking_0", "Talking_1", "Talking_2", "Idle"];

  // Clean and validate each message
  messages = messages.map((m) => {
    if (m.text && typeof m.text === "object") m = { ...m, ...m.text };
    if (!m.text && m.textinb) m.text = m.textinb;
    if (typeof m.text !== "string") m.text = "Sorry, could you rephrase that?";

    if (!validExpressions.includes(m.facialExpression))
      m.facialExpression = "default";
    if (!validAnimations.includes(m.animation)) m.animation = "Talking_1";

    return m;
  });

  // ---- Generate lip-sync + audio ----
  for (let i = 0; i < messages.length; i++) {
    const text = messages[i]?.text?.trim?.();
    if (!text) continue;

    const wav = `audios/message_${i}.wav`;
    const json = `audios/message_${i}.json`;

    console.log(`🎤 TTS for reply #${i}:`, text);
    await voice.textToSpeech(elevenLabsApiKey, voiceID, wav, text);

    const pcm = await convertToPCM(wav);
    const rhubarbPath = path.join(
      "bin",
      process.platform === "win32" ? "rhubarb.exe" : "rhubarb"
    );
    await execCommand(`${rhubarbPath} -f json -o ${json} ${pcm} -r phonetic`);

    messages[i].audio = await audioBase64(wav);
    messages[i].lipsync = await readJsonTranscript(json);
  }

  res.send({ messages });
});

// ------------ START SERVER ------------
app.listen(port, () =>
  console.log(`✅ English AI Tutor running on port ${port}`)
);
