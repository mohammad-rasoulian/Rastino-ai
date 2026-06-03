type BrandLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "h-9 w-9 rounded-2xl",
  md: "h-14 w-14 rounded-3xl",
  lg: "h-20 w-20 rounded-[2rem]",
  xl: "h-24 w-24 rounded-[2.2rem]",
};

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  return (
    <div
      className={`${sizes[size]} overflow-hidden bg-black shadow-[0_24px_90px_rgba(255,255,255,0.08)] ${className}`}
    >
      <img
        src="/brand/rastino-logo.png"
        alt="Rastino"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
