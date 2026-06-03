type ImageStudioMarkProps = {
  size?: "sm" | "md" | "lg";
};

export function ImageStudioMark({ size = "md" }: ImageStudioMarkProps) {
  return (
    <div className={`image-studio-mark image-studio-mark-${size}`}>
      <div className="image-studio-mark-glow" />

      <div className="image-studio-mark-frame">
        <div className="image-studio-mark-lens">
          <span className="image-studio-mark-shutter image-studio-mark-shutter-1" />
          <span className="image-studio-mark-shutter image-studio-mark-shutter-2" />
          <span className="image-studio-mark-shutter image-studio-mark-shutter-3" />
          <span className="image-studio-mark-core" />
        </div>

        <span className="image-studio-mark-spark image-studio-mark-spark-1" />
        <span className="image-studio-mark-spark image-studio-mark-spark-2" />
      </div>
    </div>
  );
}
