import type { AspectRatio, ImageModelInfo } from "./types";
import { ImageStudioMark } from "./ImageStudioMark";

type ImageHeaderProps = {
  activeModel?: ImageModelInfo;
  aspectRatio: AspectRatio;
};

export function ImageHeader({ activeModel, aspectRatio }: ImageHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#202020] px-5">
      <div className="flex items-center gap-3">
        <ImageStudioMark size="sm" />

        <div>
          <h2 className="text-sm font-black">استودیوی تصویر راستینو</h2>
          <p className="text-xs r-muted">
            ساخت تصویر، پرامپت حرفه‌ای، برندکیت و خروجی آماده استفاده
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <span className="r-pill rounded-xl px-3 py-2 text-xs font-bold">
          {activeModel?.name || "GPT Image 2"}
        </span>

        <span className="r-pill rounded-xl px-3 py-2 text-xs font-bold">
          {aspectRatio}
        </span>
      </div>
    </header>
  );
}
