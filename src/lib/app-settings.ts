export type ThemeMode = "dark" | "light" | "system";
export type TextSizeMode = "normal" | "large";
export type DensityMode = "comfortable" | "compact";
export type MotionMode = "on" | "reduced";

export type AppSettings = {
  theme: ThemeMode;
  textSize: TextSizeMode;
  density: DensityMode;
  motion: MotionMode;
};

const STORAGE_KEY = "rastino_app_settings";

export const defaultAppSettings: AppSettings = {
  theme: "dark",
  textSize: "normal",
  density: "comfortable",
  motion: "on",
};

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "dark" || value === "light" || value === "system";
}

function isTextSizeMode(value: unknown): value is TextSizeMode {
  return value === "normal" || value === "large";
}

function isDensityMode(value: unknown): value is DensityMode {
  return value === "comfortable" || value === "compact";
}

function isMotionMode(value: unknown): value is MotionMode {
  return value === "on" || value === "reduced";
}

export function resolveTheme(theme: ThemeMode) {
  if (theme !== "system") return theme;

  if (typeof window === "undefined") return "dark";

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") return defaultAppSettings;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppSettings;

    const parsed = JSON.parse(raw) as Partial<AppSettings>;

    return {
      theme: isThemeMode(parsed.theme) ? parsed.theme : defaultAppSettings.theme,
      textSize: isTextSizeMode(parsed.textSize)
        ? parsed.textSize
        : defaultAppSettings.textSize,
      density: isDensityMode(parsed.density)
        ? parsed.density
        : defaultAppSettings.density,
      motion: isMotionMode(parsed.motion)
        ? parsed.motion
        : defaultAppSettings.motion,
    };
  } catch {
    return defaultAppSettings;
  }
}

export function saveAppSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applyAppSettings(settings: AppSettings) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const resolvedTheme = resolveTheme(settings.theme);

  root.dataset.theme = resolvedTheme;
  root.dataset.themeMode = settings.theme;
  root.dataset.textSize = settings.textSize;
  root.dataset.density = settings.density;
  root.dataset.motion = settings.motion;
}
