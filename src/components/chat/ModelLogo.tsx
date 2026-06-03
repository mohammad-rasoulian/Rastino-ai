type ModelLogoProps = {
  model?: string | null;
  size?: "sm" | "md" | "lg";
};

type ModelLogoItem = {
  name: string;
  src: string;
  fallback: string;
  bg: string;
};

const providerLogos: Record<string, ModelLogoItem> = {
  openai: {
    name: "OpenAI",
    src: "/brand/model-logos/openai.svg",
    fallback: "AI",
    bg: "model-logo-bg-openai",
  },
  google: {
    name: "Google",
    src: "/brand/model-logos/google.svg",
    fallback: "G",
    bg: "model-logo-bg-google",
  },
  gemini: {
    name: "Gemini",
    src: "/brand/model-logos/gemini.svg",
    fallback: "✦",
    bg: "model-logo-bg-gemini",
  },
  anthropic: {
    name: "Anthropic",
    src: "/brand/model-logos/anthropic.svg",
    fallback: "A",
    bg: "model-logo-bg-anthropic",
  },
  claude: {
    name: "Claude",
    src: "/brand/model-logos/claude.svg",
    fallback: "C",
    bg: "model-logo-bg-claude",
  },
  deepseek: {
    name: "DeepSeek",
    src: "/brand/model-logos/deepseek.svg",
    fallback: "D",
    bg: "model-logo-bg-deepseek",
  },
  qwen: {
    name: "Qwen",
    src: "/brand/model-logos/qwen.svg",
    fallback: "Q",
    bg: "model-logo-bg-qwen",
  },
  gapgpt: {
    name: "GapGPT",
    src: "/brand/model-logos/gapgpt.svg",
    fallback: "G",
    bg: "model-logo-bg-gapgpt",
  },
  grok: {
    name: "Grok",
    src: "/brand/model-logos/grok.svg",
    fallback: "𝕏",
    bg: "model-logo-bg-grok",
  },
  xai: {
    name: "xAI",
    src: "/brand/model-logos/xai.svg",
    fallback: "𝕏",
    bg: "model-logo-bg-grok",
  },
};

const unknownLogo: ModelLogoItem = {
  name: "AI Model",
  src: "",
  fallback: "AI",
  bg: "model-logo-bg-unknown",
};

function getProviderKey(model?: string | null) {
  const value = String(model || "").toLowerCase();

  if (value.includes("gapgpt")) return "gapgpt";
  if (value.includes("qwen")) return "qwen";
  if (value.includes("gemini")) return "gemini";
  if (value.includes("gemma")) return "google";
  if (value.includes("claude")) return "claude";
  if (value.includes("anthropic")) return "anthropic";
  if (value.includes("deepseek")) return "deepseek";
  if (value.includes("grok")) return "grok";
  if (value.includes("xai") || value.includes("x-ai")) return "xai";
  if (value.includes("gpt") || value.includes("openai") || value.includes("o3")) {
    return "openai";
  }

  return "unknown";
}

export function ModelLogo({ model, size = "sm" }: ModelLogoProps) {
  const providerKey = getProviderKey(model);
  const logo = providerLogos[providerKey] || unknownLogo;

  return (
    <span
      className={`model-logo-real model-logo-real-${size} ${logo.bg}`}
      title={logo.name}
      aria-label={logo.name}
      data-fallback={logo.fallback}
    >
      {logo.src && (
        <img
          src={logo.src}
          alt={`${logo.name} logo`}
          className="model-logo-real-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}
