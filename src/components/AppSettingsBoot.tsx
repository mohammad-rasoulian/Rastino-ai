"use client";

import { useEffect } from "react";
import { applyAppSettings, loadAppSettings } from "@/lib/app-settings";

export function AppSettingsBoot() {
  useEffect(() => {
    function syncSettings() {
      applyAppSettings(loadAppSettings());
    }

    syncSettings();

    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", syncSettings);

    return () => media.removeEventListener("change", syncSettings);
  }, []);

  return null;
}
