import type { AdminChat } from "../admin-types";
import {
  formatAdminDate,
  getUserDisplayName,
  shortAdminText,
} from "../admin-utils";

type ChatsViewProps = {
  chats: AdminChat[];
};

export function ChatsView({ chats }: ChatsViewProps) {
  if (chats.length === 0) {
    return <div className="admin-card text-sm r-muted">هنوز چتی وجود ندارد.</div>;
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <section key={chat.id} className="admin-card">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{chat.title}</p>

              <p className="mt-1 text-xs r-muted">
                {chat.type} / {chat.status} / {chat._count.messages} پیام
              </p>

              <p className="mt-1 text-[11px] r-muted">
                {formatAdminDate(chat.createdAt)}
              </p>
            </div>

            <span className="admin-badge">
              {getUserDisplayName(chat.user)}
            </span>
          </div>

          {chat.messages.length === 0 ? (
            <p className="text-xs r-muted">این چت هنوز پیامی ندارد.</p>
          ) : (
            <div className="space-y-2">
              {chat.messages.map((message) => (
                <div key={message.id} className="admin-message-preview">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-black">{message.role}</span>

                    <span className="text-[11px] r-muted">
                      {formatAdminDate(message.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs leading-6 r-muted">
                    {shortAdminText(message.content)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
