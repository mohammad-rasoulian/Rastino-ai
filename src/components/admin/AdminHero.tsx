export function AdminHero() {
  return (
    <section className="admin-hero-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs r-muted">Rastino Command Center</p>
          <h3 className="mt-1 text-2xl font-black">مرکز فرمان راستینو</h3>
          <p className="mt-3 text-sm leading-7 r-muted">
            کاربران، چت‌ها، پلن‌ها، پرامپت‌ها، امنیت، سلامت سیستم و متن‌های سایت را از اینجا کنترل کن.
          </p>
        </div>

        <span className="rounded-2xl border border-[#2a2a2a] bg-[#111] px-3 py-2 text-xs font-black text-zinc-300">
          ADMIN
        </span>
      </div>
    </section>
  );
}
