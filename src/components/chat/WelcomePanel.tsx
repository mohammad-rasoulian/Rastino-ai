"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

type WelcomePanelProps = {
  onSuggestionSelect: (value: string) => void;
};

type SiteContentResponse = {
  content?: Record<
    string,
    {
      value: string;
    }
  >;
};

const defaultContent = {
  title: "امروز چی یاد بگیریم؟",
  description:
    "از راستینو بپرس؛ حل مسئله، خلاصه‌سازی، ساخت نمونه‌سؤال و کمک هوشمند را یک‌جا تجربه کن.",
  suggestions: [
    "یک تمرین ریاضی رو مرحله‌به‌مرحله حل کن",
    "این متن موضوع رو خلاصه و فلش‌کارت کن",
    "برای این موضوع چند ایده کاربردی بده",
    "یک برنامه کاری ساده برای امروز بچین",
  ],
};

export function WelcomePanel({ onSuggestionSelect }: WelcomePanelProps) {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const storedName = window.localStorage.getItem("rastino_display_name") || "";
    setDisplayName(storedName.trim());
  }, []);

  const readyTitle = displayName ? `من آماده‌ام ${displayName}!` : "من آماده‌ام!";

  const [description, setDescription] = useState(defaultContent.description);
  const [suggestions, setSuggestions] = useState(defaultContent.suggestions);

  useEffect(() => {
    loadSiteContent();
  }, []);

  async function loadSiteContent() {
    try {
      const res = await fetch("/api/site-content", {
        credentials: "include",
      });

      const data = (await res.json()) as SiteContentResponse;
      const content = data.content || {};

      setDescription(
        content["home.hero.description"]?.value || defaultContent.description
      );

      setSuggestions([
        content["home.suggestion.1"]?.value || defaultContent.suggestions[0],
        content["home.suggestion.2"]?.value || defaultContent.suggestions[1],
        content["home.suggestion.3"]?.value || defaultContent.suggestions[2],
        content["home.suggestion.4"]?.value || defaultContent.suggestions[3],
      ]);
    } catch {
      setDescription(defaultContent.description);
      setSuggestions(defaultContent.suggestions);
    }
  }

  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">

      <div className="mb-5">
        <BrandLogo size="lg" />
      </div>

      <h1 className="text-3xl font-black md:text-4xl">{readyTitle}</h1>

      <p className="mt-3 max-w-xl text-sm leading-7 r-muted">
        {description}
      </p>

      <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {suggestions.map((item) => (
          <button
            key={item}
            onClick={() => onSuggestionSelect(item)}
            className="r-surface-2 r-hover rounded-2xl p-4 text-right text-sm leading-7"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
