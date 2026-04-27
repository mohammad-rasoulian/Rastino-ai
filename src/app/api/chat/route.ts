export async function POST(req: Request) {
  const { messages, model } = await req.json();

  const lastMessage = messages?.[messages.length - 1]?.content || "";

  return Response.json({
    content: `پاسخ آزمایشی راستینو ✅

مدل انتخاب‌شده: ${model}

پیام تو:
${lastMessage}

فعلاً OpenRouter وصل نیست. این پاسخ از بک‌اند داخلی پروژه برگشته تا مطمئن شویم مسیر Frontend → Backend درست کار می‌کند.`,
  });
}
