import type { AdminSecurity } from "../admin-types";
import { formatAdminDate, getUserDisplayName, shortAdminText } from "../admin-utils";

type SecurityCenterViewProps = {
  security: AdminSecurity;
};

export function SecurityCenterView({ security }: SecurityCenterViewProps) {
  const stats = [
    ["Session فعال", security.sessionsCount],
    ["Session منقضی", security.expiredSessionsCount],
    ["کاربر غیرفعال", security.inactiveUsersCount],
    ["OTP یک ساعت اخیر", security.otpLastHourCount],
  ];

  return (
    <div className="space-y-4">
      <section className="admin-hero-card">
        <p className="text-xs r-muted">Security Center</p>
        <h3 className="mt-1 text-2xl font-black">مرکز امنیت و عملیات حساس</h3>
        <p className="mt-3 text-sm leading-7 r-muted">
          لاگ عملیات مدیر، وضعیت sessionها و رفتارهای حساس را اینجا رصد کن.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="admin-stat-card">
            <p className="text-xs r-muted">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <section className="admin-card">
        <p className="mb-3 text-sm font-black">آخرین عملیات‌های ادمین</p>

        {security.adminActions.length === 0 ? (
          <p className="text-sm r-muted">هنوز عملیاتی ثبت نشده.</p>
        ) : (
          <div className="space-y-2">
            {security.adminActions.map((action) => (
              <div key={action.id} className="admin-message-preview">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-xs font-black">{action.action}</span>
                  <span className="text-[11px] r-muted">
                    {formatAdminDate(action.createdAt)}
                  </span>
                </div>

                <p className="text-xs leading-6 r-muted">
                  {shortAdminText(action.description || "بدون توضیح", 130)}
                </p>

                <p className="mt-1 text-[11px] r-muted">
                  مدیر: {getUserDisplayName(action.admin)} / هدف:{" "}
                  {action.targetType || "-"} {action.targetId || ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
