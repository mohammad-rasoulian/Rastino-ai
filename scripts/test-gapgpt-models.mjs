const models = [
  // GapGPT
  "gapgpt-qwen-3.5",
  "gapgpt-qwen-3.5-thinking",
  "gapgpt-qwen-3.6",
  "gapgpt-qwen-3.6-thinking",

  // OpenAI GPT-5.x
  "gpt-5.2",
  "gpt-5.2-chat-latest",
  "gpt-5.2-codex",
  "gpt-5.2-pro",
  "gpt-5.3-chat-latest",
  "gpt-5.3-codex",
  "gpt-5.3-codex-spark",

  // Anthropic Claude 4.x
  "claude-opus-4-1-20250805",
  "claude-opus-4-20250514",
  "claude-opus-4-5-20251101",
  "claude-opus-4-6",
  "claude-opus-4-7",
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-5-20250929",
  "claude-sonnet-4-6",

  // Google Gemini
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-pro-preview",
  "gemini-flash-lite-latest",

  // xAI
  "grok-3",
  "grok-3-mini",
  "grok-3-mini-fast",
  "grok-4",
  "grok-4.3",

  // OpenAI GPT-4 / GPT-5 / o-series
  "chatgpt-4o-latest",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4.5-preview",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-5",
  "gpt-5-chat-latest",
  "gpt-5-codex",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-5.1",
  "gpt-5.1-chat-latest",
  "gpt-5.1-codex",
  "gpt-5.1-codex-mini",
  "gpt-5.4",
  "gpt-5.5",
  "o3",
  "o3-mini",

  // Google Gemma
  "gemma-3-27b-it",

  // DeepSeek
  "deepseek-r1",
  "deepseek-v4-flash",
  "deepseek-v4-pro",

  // Anthropic 3.x
  "claude-3-5-haiku-20241022",
  "claude-3-5-sonnet-20241022",
  "claude-3-7-sonnet-20250219",

  // Alibaba / Qwen
  "Qwen/Qwen3.5-35B-A3B-FP8",
  "qwen3-235b-a22b",
  "qwen3-235b-a22b-instruct-2507",
  "qwen3-coder",
  "qwen3-coder-480b-a35b-instruct",
];

const baseUrl = (process.env.GAPGPT_BASE_URL || "https://api.gapgpt.app/v1").replace(/\/$/, "");
const apiKey = process.env.GAPGPT_API_KEY;
const streamMode = process.env.TEST_STREAM === "true";
const delayMs = Number(process.env.TEST_DELAY_MS || 900);
const timeoutMs = Number(process.env.TEST_TIMEOUT_MS || 30000);

if (!apiKey) {
  console.error("❌ GAPGPT_API_KEY is missing. Run: set -a && source .env.local && set +a");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyError(status, text) {
  const lower = text.toLowerCase();

  if (lower.includes("api_limit") || lower.includes("负载") || lower.includes("capacity") || lower.includes("saturated")) {
    return "API_LIMIT";
  }

  if (lower.includes("invalid token")) {
    return "INVALID_TOKEN_OR_UPSTREAM_AUTH";
  }

  if (lower.includes("model") && (lower.includes("not found") || lower.includes("不存在") || lower.includes("invalid"))) {
    return "MODEL_NOT_FOUND_OR_INVALID";
  }

  if (status === 401) {
    return "AUTH_ERROR";
  }

  if (status === 429) {
    return "RATE_LIMIT";
  }

  if (status >= 500) {
    return "SERVER_ERROR";
  }

  return "ERROR";
}

async function testNonStream(model) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = Date.now();

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "فقط بگو سالم" }],
        stream: false,
        temperature: 0,
        max_tokens: 16,
      }),
    });

    const text = await res.text();
    const ms = Date.now() - startedAt;

    if (!res.ok) {
      return {
        model,
        ok: false,
        status: res.status,
        category: classifyError(res.status, text),
        latencyMs: ms,
        error: text.slice(0, 500),
      };
    }

    const data = JSON.parse(text);
    const answer = data?.choices?.[0]?.message?.content || "";

    return {
      model,
      ok: true,
      status: res.status,
      category: "OK",
      latencyMs: ms,
      answer: answer.slice(0, 120),
      usage: data?.usage || null,
    };
  } catch (error) {
    return {
      model,
      ok: false,
      status: 0,
      category: error?.name === "AbortError" ? "TIMEOUT" : "FETCH_ERROR",
      latencyMs: timeoutMs,
      error: String(error?.message || error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function testStream(model) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = Date.now();

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "فقط بگو سالم" }],
        stream: true,
        temperature: 0,
        max_tokens: 16,
      }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      return {
        model,
        ok: false,
        status: res.status,
        category: classifyError(res.status, text),
        latencyMs: Date.now() - startedAt,
        error: text.slice(0, 500),
      };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;

        const raw = line.replace(/^data:\s*/, "").trim();
        if (!raw || raw === "[DONE]") continue;

        try {
          const parsed = JSON.parse(raw);
          const token = parsed?.choices?.[0]?.delta?.content || "";
          answer += token;
        } catch {}
      }

      if (answer.length >= 4) break;
    }

    return {
      model,
      ok: true,
      status: res.status,
      category: "OK_STREAM",
      latencyMs: Date.now() - startedAt,
      answer: answer.slice(0, 120),
    };
  } catch (error) {
    return {
      model,
      ok: false,
      status: 0,
      category: error?.name === "AbortError" ? "TIMEOUT" : "FETCH_ERROR",
      latencyMs: timeoutMs,
      error: String(error?.message || error),
    };
  } finally {
    clearTimeout(timer);
  }
}

function printResult(result) {
  const mark = result.ok ? "✅" : "❌";
  const latency = `${result.latencyMs}ms`;

  if (result.ok) {
    console.log(`${mark} ${result.model} | ${result.category} | ${latency} | ${result.answer || ""}`);
    return;
  }

  console.log(`${mark} ${result.model} | ${result.category} | ${result.status} | ${latency}`);
  if (result.error) {
    console.log(`   ${String(result.error).replace(/\s+/g, " ").slice(0, 240)}`);
  }
}

const results = [];

console.log(`Testing ${models.length} models on ${baseUrl}`);
console.log(`Mode: ${streamMode ? "stream=true" : "stream=false"}`);
console.log("");

for (const model of models) {
  const result = streamMode ? await testStream(model) : await testNonStream(model);
  results.push(result);
  printResult(result);
  await sleep(delayMs);
}

const ok = results.filter((item) => item.ok);
const failed = results.filter((item) => !item.ok);
const byCategory = results.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1;
  return acc;
}, {});

const summary = {
  testedAt: new Date().toISOString(),
  baseUrl,
  mode: streamMode ? "stream" : "non-stream",
  total: results.length,
  ok: ok.length,
  failed: failed.length,
  byCategory,
  workingModels: ok.map((item) => item.model),
  failedModels: failed.map((item) => ({
    model: item.model,
    category: item.category,
    status: item.status,
    error: item.error,
  })),
  results,
};

await import("node:fs/promises").then((fs) =>
  fs.writeFile("tmp/gapgpt-model-test-results.json", JSON.stringify(summary, null, 2))
);

console.log("");
console.log("===== SUMMARY =====");
console.log(`✅ Working: ${ok.length}`);
console.log(`❌ Failed: ${failed.length}`);
console.log(byCategory);
console.log("");
console.log("Working models:");
console.log(ok.map((item) => item.model).join("\n") || "-");
console.log("");
console.log("Saved to: tmp/gapgpt-model-test-results.json");
