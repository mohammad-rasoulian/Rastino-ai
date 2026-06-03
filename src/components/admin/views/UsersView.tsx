"use client";

import { useState } from "react";
import type { AdminUser } from "../admin-types";
import { formatAdminDate } from "../admin-utils";

type UsersViewProps = {
  users: AdminUser[];
  onUserUpdated: () => void;
};

export function UsersView({ users, onUserUpdated }: UsersViewProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function updateUser(user: AdminUser, field: string, value: string) {
    const confirmed = window.confirm(
      `مطمئنی می‌خوای ${field} این کاربر رو تغییر بدی؟`
    );

    if (!confirmed) return;

    setUpdatingUserId(user.id);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "ویرایش کاربر ناموفق بود.");
        return;
      }

      await onUserUpdated();
    } finally {
      setUpdatingUserId(null);
    }
  }

  if (users.length === 0) {
    return <div className="admin-card text-sm r-muted">هنوز کاربری وجود ندارد.</div>;
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <section key={user.id} className="admin-card">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {user.mobile || user.email || "کاربر بدون شناسه"}
              </p>

              <p className="mt-1 text-xs r-muted" dir="ltr">
                {user.id}
              </p>

              <p className="mt-1 text-[11px] r-muted">
                عضویت: {formatAdminDate(user.createdAt)}
              </p>
            </div>

            <span className="admin-badge">
              {user.role} / {user.plan} / {user.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="admin-mini-stat">
              <span>چت</span>
              <b>{user._count.chats}</b>
            </div>

            <div className="admin-mini-stat">
              <span>پیام</span>
              <b>{user._count.messages}</b>
            </div>

            <div className="admin-mini-stat">
              <span>مصرف</span>
              <b>{user._count.usageLogs}</b>
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <select
              value={user.role}
              disabled={updatingUserId === user.id}
              onChange={(event) => updateUser(user, "role", event.target.value)}
              className="r-input rounded-2xl p-3 text-xs outline-none"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>

            <select
              value={user.plan}
              disabled={updatingUserId === user.id}
              onChange={(event) => updateUser(user, "plan", event.target.value)}
              className="r-input rounded-2xl p-3 text-xs outline-none"
            >
              <option value="free">free</option>
              <option value="plus">plus</option>
              <option value="pro">pro</option>
            </select>

            <select
              value={user.status}
              disabled={updatingUserId === user.id}
              onChange={(event) => updateUser(user, "status", event.target.value)}
              className="r-input rounded-2xl p-3 text-xs outline-none"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="blocked">blocked</option>
              <option value="suspended">suspended</option>
            </select>
          </div>

          <div className="mt-3 rounded-2xl border border-[#242424] bg-[#111] p-3 text-xs leading-6 r-muted">
            کیف پول: {user.wallet?.balance || 0} {user.wallet?.currency || "IRR"}
          </div>
        </section>
      ))}
    </div>
  );
}
