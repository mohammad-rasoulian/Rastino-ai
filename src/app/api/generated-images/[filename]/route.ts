import { serveGeneratedImage } from "@/lib/images/serve-generated-image";

type RouteContext = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { filename } = await context.params;

  return serveGeneratedImage(filename);
}
