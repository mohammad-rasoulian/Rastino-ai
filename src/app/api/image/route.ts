export async function POST() {
  return Response.json(
    {
      error: "این مسیر قدیمی است. از /api/images/generate استفاده کنید.",
      code: "LEGACY_ROUTE_DISABLED",
    },
    { status: 410 }
  );
}
