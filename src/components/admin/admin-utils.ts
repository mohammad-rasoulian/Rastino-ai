export function formatAdminDate(value: string) {
  return new Date(value).toLocaleString("fa-IR");
}

export function shortAdminText(value: string, max = 90) {
  if (!value) return "";
  if (value.length <= max) return value;

  return `${value.slice(0, max)}...`;
}

export function getUserDisplayName(user?: {
  mobile?: string | null;
  email?: string | null;
} | null) {
  return user?.mobile || user?.email || "بدون کاربر";
}
