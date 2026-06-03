import type { AdminSystem } from "../admin-types";

type SystemHealthViewProps = {
  system: AdminSystem;
};

function formatUptime(value?: number) {
  if (!value) return "نامشخص";

  const minutes = Math.floor(value / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours} ساعت و ${minutes % 60} دقیقه`;
  return `${minutes} دقیقه`;
}

export function SystemHealthView({ system }: SystemHealthViewProps) {
  return (
    <div className="space-y-4">
      <section className="admin-hero-card">
        <p className="text-xs r-muted">System Health</p>
        <h3 className="mt-1 text-2xl font-black">
          وضعیت زنده زیرساخت راستینو
        </h3>
        <p className="mt-3 text-sm leading-7 r-muted">
          دیتابیس، envها، uptime و شمارنده‌های اصلی سیستم را از اینجا ببین.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="admin-stat-card">
          <p className="text-xs r-muted">وضعیت</p>
          <p className="mt-1 text-xl font-black">
            {system.ok ? "سالم" : "مشکل‌دار"}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs r-muted">دیتابیس</p>
          <p className="mt-1 text-xl font-black">{system.database}</p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs r-muted">Uptime</p>
          <p className="mt-1 text-xl font-black">{formatUptime(system.uptime)}</p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs r-muted">Response</p>
          <p className="mt-1 text-xl font-black">{system.responseTimeMs}ms</p>
        </div>
      </div>

      {system.counts && (
        <section className="admin-card">
          <p className="mb-3 text-sm font-black">شمارنده‌های سیستم</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(system.counts).map(([key, value]) => (
              <div key={key} className="admin-mini-stat">
                <span>{key}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="admin-card">
        <p className="mb-3 text-sm font-black">Environment</p>

        <div className="space-y-2">
          {(system.env || []).map((item) => (
            <div key={item.name} className="admin-row">
              <span dir="ltr" className="text-xs font-black">
                {item.name}
              </span>

              <span
                className={`admin-badge ${
                  item.configured ? "" : "text-red-300"
                }`}
              >
                {item.configured ? "تنظیم شده" : "خالی"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
