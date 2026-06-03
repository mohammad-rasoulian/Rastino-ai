import type { Overview } from "../admin-types";
import { formatAdminDate } from "../admin-utils";

type OverviewViewProps = {
  overview: Overview;
};

export function OverviewView({ overview }: OverviewViewProps) {
  const stats = [
    ["کاربران", overview.usersCount],
    ["چت‌ها", overview.chatsCount],
    ["پیام‌ها", overview.messagesCount],
    ["چت تصویری", overview.imageChatsCount],
    ["پلن‌ها", overview.plansCount],
    ["پرامپت‌ها", overview.promptsCount],
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="admin-stat-card">
            <p className="text-xs r-muted">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <section className="admin-card">
        <p className="mb-3 text-sm font-black">آخرین کاربران</p>

        {overview.recentUsers.length === 0 ? (
          <p className="text-sm r-muted">هنوز کاربری ثبت نشده.</p>
        ) : (
          <div className="space-y-2">
            {overview.recentUsers.map((user) => (
              <div key={user.id} className="admin-row">
                <div>
                  <p className="text-sm font-bold">
                    {user.mobile || user.email || "بدون شناسه"}
                  </p>
                  <p className="mt-1 text-xs r-muted">
                    {user.role} / {user.plan} / {user.status}
                  </p>
                </div>

                <p className="text-[11px] r-muted">
                  {formatAdminDate(user.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card">
        <p className="mb-3 text-sm font-black">آخرین چت‌ها</p>

        {overview.recentChats.length === 0 ? (
          <p className="text-sm r-muted">هنوز چتی ساخته نشده.</p>
        ) : (
          <div className="space-y-2">
            {overview.recentChats.map((chat) => (
              <div key={chat.id} className="admin-row">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{chat.title}</p>
                  <p className="mt-1 text-xs r-muted">
                    {chat.type} / {chat._count.messages} پیام
                  </p>
                </div>

                <p className="text-[11px] r-muted">
                  {formatAdminDate(chat.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
