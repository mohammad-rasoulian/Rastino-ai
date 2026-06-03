import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "راستینو",
    short_name: "راستینو",
    description:
      "دستیار هوشمند فارسی برای چت، نوشتن، تحلیل، کدنویسی و تولید تصویر.",
    start_url: "/",
    display: "standalone",
    background_color: "#070707",
    theme_color: "#070707",
    lang: "fa-IR",
    dir: "rtl",
    icons: [
      {
        src: "/brand/rastino-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
